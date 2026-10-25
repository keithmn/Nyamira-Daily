# Reliability revamp register

Updated 25 Oct 2026. Working branch: `fix/nd-01-project-status`; starting commit: `ad2fb018e2964ebe85114271bf333d74cfc1efc1`.

## Agreed direction so far

- Keep Nyamira Daily an independent public-information and data platform.
- Keep The Night Watch as a separate future newsroom; do not build it here.
- Preserve committed work and public project IDs/URLs. Do not invent facts, dates, source matches, contacts, owners, or operational status.
- Implement repository-supported reliability work in bounded, reviewable stages. Record requirements that need owner input or missing source material as blocked rather than pretending they are complete.

## Work ledger

| Item | Scope | State |
|---|---|---|
| ND-01, ND-06, ND-07, ND-14 | Project aggregation, identity safeguards, missing-vs-zero amounts, financial comparability | Implemented in local commit `ad2fb01`; visual review remains outstanding |
| ND-02 | Consistent opportunity deadline state across badges, counts, search, downloads; Nairobi timezone | Implemented; regression-tested and built-artifact counts agree |
| ND-03 | Validate production domain/configuration and prevent placeholder or preview builds | Fail-closed guard implemented; owner supplied `nyamiradaily.org`; configured local build passed; hosting/deployment unverified |
| ND-04 | Correction intake, accepted-correction record and transparent history | Accepted-correction log implemented; intake blocked on monitored destination/response role |
| ND-05 | Distinguish scheduled, confirmed-live, recorded and planned show states | Clock-triggered live claim removed; state distinctions implemented; current config is scheduled |
| ND-08 | Publication review/scheduling rules across pages, feeds, search and downloads | Central draft/scheduled filtering and CI test/build workflow implemented; repository review protection remains owner-dependent |
| ND-09, ND-13 | Requirements not available in the local audit/brief documents inspected so far | Blocked until source specification is supplied or found |
| ND-10 | Evidence-label meaning and provenance (what/how/when/by whom or role) | Metadata support and clear definitions implemented; historical claim metadata remains incomplete |
| ND-11 | Alert checked-at/version/dismissal behaviour and monitoring responsibility | Check times/versioned dismissal implemented; site owner and daily review cadence configured |
| ND-12 | Neutral community observations, explicit choices, uncertainty and review before publication | Neutral inputs and uncertainty-aware summaries implemented; intake remains disabled pending destination/reviewer |
| Cross-cutting checks | Dataset validation for dates, IDs, sources, missing values, publication, downloads and production configuration | Pending |
| Owner launch requirements | Production environment/hosting verification, contact destinations, correction and alert owners, Kiswahili review, emergency-number confirmation, example-draft disposition | Partly owner-dependent |
| Visual acceptance | Changed pages at ~390px/~1280px, light/dark, keyboard and overflow checks | Browser pages are not shared; awaiting owner verification |

## Open owner facts

- Monitored correction/reporting destination and the role/person responsible for response.
- Whether there is a functioning live stream; source for live confirmation and episode/recording links.
- Missing definitions for ND-09 and ND-13.
- Whether example drafts should be deleted or replaced and by whom.

## Owner interview amendments

- 25 Oct 2026: The owner has no monitored correction/community-report destination yet and no responsible response role. Keep outbound delivery disabled; do not present a submission as delivered. Revisit before enabling these services.
- 25 Oct 2026: The owner supplied `nyamiradaily.org` as the production domain. A configured local build succeeded with `ND_SITE_URL=https://nyamiradaily.org`; no DNS, hosting or deployment check was performed.
- 25 Oct 2026: The owner volunteered to check and update published alerts (“me”) daily. The configured responsible role is `Site owner` and review cadence is `daily`.

## Execution notes

Work should proceed item by item. Implement safe behaviour that does not depend on owner facts, keep unconfigured services disabled, and report blockers explicitly. Record tests and build results in `docs/BUILD_STATUS.md`; update `docs/STATUS.md` as work is completed.
