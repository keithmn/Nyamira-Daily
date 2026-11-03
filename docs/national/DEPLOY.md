# Putting Kenya Budget Explained online

The national product is its own Cloudflare Pages project (decision #83), separate from Nyamira Daily, and built from the same repository. Until it has a name and a domain, it can run on a free `*.pages.dev` address. Nothing here is done by Claude Code: these steps need the founder's Cloudflare and GitHub accounts.

## 1. Create the project

In the Cloudflare dashboard, go to Workers & Pages, then Create, then Pages, then Connect to Git, and choose `keithmn/Nyamira-Daily`.

| Setting | Value |
|---|---|
| Project name | for example `kenya-budget-explained`, which gives `kenya-budget-explained.pages.dev` |
| Production branch | `main` |
| Framework preset | None |
| Root directory | `apps/national` |
| Build command | `cd ../.. && npm ci && npm run build:national` |
| Build output directory | `dist` |

The root directory has to be `apps/national`. That way Cloudflare deploys the national product's own `functions/` folder, and not the Nyamira Daily site's, which has forms the national product does not use.

## 2. Settings

Under Settings, then Variables and Secrets, for Production:

| Name | Value | Why |
|---|---|---|
| `NODE_VERSION` | `22.23.4` | the version in `.nvmrc` |
| `KBE_SITE_URL` | `https://kenya-budget-explained.pages.dev`, then the real domain later | canonical links, link previews and the embed code. A public build stops without it |

For preview deployments of other branches, set `KBE_PREVIEW_BUILD=1` instead. Those builds include the component library and tell search engines not to index them.

## 3. Check the first deployment

- The home page, a county page and `/data/` open.
- The response headers include `Content-Security-Policy` and `Strict-Transport-Security`. In Chrome, check them under Developer tools, then Network.
- A county page shared in WhatsApp shows its picture.

## 4. Rebuild every day

The site is static, so dates, countdowns and notices only move on when it is rebuilt (decision #103).

1. In the Pages project, go to Settings, then Builds, then Deploy hooks. Add a hook for `main` and copy its URL.
2. In GitHub, go to the repository's Settings, then Secrets and variables, then Actions. Add a secret named `KBE_DEPLOY_HOOK` holding that URL.

`.github/workflows/daily-rebuild.yml` calls the hook every day at 03:00 Nairobi time. Until the secret exists, it does nothing.

## 5. A domain, when there is a name

1. Buy the domain.
2. In the Pages project, go to Custom domains and add it.
3. Change `KBE_SITE_URL` to it and redeploy. The link previews and the embed code pick up the new address on their own; the pictures carry no address.

## 6. Corrections

Follow "Turn on corrections" in `docs/national/README.md`: a D1 database, a Turnstile widget, two secrets and the settings. Then put the review pages behind Cloudflare Access.

## 7. Protect `main`

In GitHub, go to Settings, then Branches. Add a rule for `main` that requires the "Quality checks" workflow to pass before merging (build brief 7.3).
