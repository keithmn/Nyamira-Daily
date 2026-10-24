// Auditor-General opinions and findings (src/data/audit.json). Reported as the auditor wrote them,
// with the "Audit finding" label; never as proof of wrongdoing (docs/EDITORIAL_RULES.md).
import A from '../data/audit.json';
export const audit = A;
export const sources = Object.fromEntries(A.sources.map((s) => [s.id, s]));
export const years = ['2013/14', '2014/15', '2015/16', '2016/17', '2017/18', '2018/19', '2019/20', '2020/21', '2021/22', '2022/23', '2023/24', '2024/25'];
export const entities = ['County Executive', 'County Assembly'];
export const opinionText = {
  Unqualified: 'Clean: the accounts are fair',
  Qualified: 'Fair except for the problems listed',
  Adverse: 'Not fair: the problems are serious and widespread',
  Disclaimer: 'No opinion: the auditor could not get enough evidence',
};
export const opinionOf = (entity, fy) => A.opinions.find((o) => o.entity === entity && o.fy === fy);
export const findingsFor = (entity, fy) => A.findings.filter((f) => f.entity === entity && f.fy === fy).sort((a, b) => (b.amountKsh ?? 0) - (a.amountKsh ?? 0));
export const forWard = (slug) => A.findings.filter((f) => f.ward === slug).sort((a, b) => b.fy.localeCompare(a.fy));
