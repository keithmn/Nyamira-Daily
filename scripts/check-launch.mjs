// One-click check of the launch-prep changes (31 Oct 2026). Run from VS Code: Terminal > Run Task... >
// "npm: check:launch", or `npm run check:launch`. It switches to the work branch (creating it if needed),
// renormalises line endings after the .gitattributes change (staging only; nothing is committed or pushed),
// then runs the Node tests, the Python tests and a preview build. Everything is written to check-launch.log
// (ignored by Git) so the result can be read afterwards.
import { spawnSync } from 'node:child_process';
import { writeFileSync, appendFileSync, existsSync } from 'node:fs';

// Git may be installed without being on the Windows PATH (VS Code finds it anyway). Look in the usual places.
const gitCandidates = ['git', 'C:\\Program Files\\Git\\cmd\\git.exe', 'C:\\Program Files (x86)\\Git\\cmd\\git.exe',
  `${process.env.LOCALAPPDATA ?? ''}\\Programs\\Git\\cmd\\git.exe`];
const GIT = gitCandidates.find((g) => (g === 'git' ? spawnSync('git --version', { shell: true }).status === 0 : existsSync(g)));
const git = (args) => `"${GIT}" ${args}`;

const LOG = 'check-launch.log';
const BRANCH = 'feat/trust-and-launch-prep';
writeFileSync(LOG, `Nyamira Daily launch-prep check, ${new Date().toISOString()}\n`);
const results = [];

function run(title, command, env = {}) {
  appendFileSync(LOG, `\n===== ${title}: ${command}\n`);
  console.log(`\n== ${title}`);
  const r = spawnSync(command, { shell: true, encoding: 'utf8', env: { ...process.env, ...env }, maxBuffer: 64 * 1024 * 1024 });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  appendFileSync(LOG, out + `\n----- exit ${r.status}\n`);
  process.stdout.write(out.split('\n').slice(-15).join('\n') + '\n');
  results.push(`${r.status === 0 ? 'PASS' : 'FAIL'}  ${title} (exit ${r.status})`);
  return r.status;
}

if (GIT) {
  const current = spawnSync(git('rev-parse --abbrev-ref HEAD'), { shell: true, encoding: 'utf8' }).stdout.trim();
  if (current !== BRANCH) {
    if (run('Create branch', git(`checkout -b ${BRANCH}`)) !== 0) run('Switch branch', git(`checkout ${BRANCH}`));
  }
  run('Renormalise line endings (stage only)', git('add --renormalize -- . ":!check-launch.log"'));
  run('Changed files', git('status --short'));
} else results.push('SKIP  Git steps (Git not found; install Git for Windows)');
run('Node tests', 'npm test');
const py = spawnSync('python --version', { shell: true }).status === 0 ? 'python' : (spawnSync('py --version', { shell: true }).status === 0 ? 'py' : null);
if (py) run('Python tests', `${py} -m unittest discover -s scripts -p "test_*.py"`);
else results.push('SKIP  Python tests (Python not found)');
run('Preview build', 'npm run build', { ND_PREVIEW_BUILD: '1' });

const summary = `\n===== SUMMARY\n${results.join('\n')}\n`;
appendFileSync(LOG, summary + 'DONE\n');
console.log(summary + `Full log: ${LOG}`);
