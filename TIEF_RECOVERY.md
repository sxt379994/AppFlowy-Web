# Tief AppFlowy Web source recovery

This fork preparation preserves modifications to
[AppFlowy Web](https://github.com/AppFlowy-IO/AppFlowy-Web). Its upstream source
base is `86feb976d320e3ced95b7acaff57009f4935fcbe` (0.18.5). Keep upstream's
LICENSE and notices intact. The user adopted this source ownership in the
[October 18 decision](https://github.com/sxt379994/context/blob/5f460b3ecaae4f290f28f5ec5b9b2a570388d948/decisions/2026-10-18-appflowy-customizations-upstream-forks.md).

## Source states

| Proposed branch | Recovered changes relative to the upstream base | Meaning |
| --- | --- | --- |
| `tief/upstream-0.18.5` | None | Pinned review base; keep distinct from upstream's moving main |
| `tief/recovered-mobile-20260929` | Six files | Mobile editing flag and existing access/lock checks |
| `tief/recovered-row-id-20261002` | Eighteen files, plus recovery documentation | Retained mobile baseline and deployed API row-ID compatibility repair |
| `tief/mobile-wip-recovery-20261023` | Forty-seven files, plus recovery documentation | Later unfinished mobile layout/navigation work, preserved separately |

The recovery branches are independent snapshots descended from the same upstream
base. Their eventual commit dates identify the recovery, not the historical build
date. Review custom changes against the pinned base; comparing these snapshots
against a newer upstream main would mix source recovery with an upgrade.

The original working checkout is preserved. Credentials, live-data fixtures,
runtime environment overrides, dependency directories and generated build output
are excluded from the custom publication. Upstream-tracked environment examples
retain their upstream bytes. The private live-data repair test remains local;
the synthetic parser, persistence, relation and sync tests are preserved.

## Deployed artifact evidence

On October 23, 2026 at 10:53:54 UTC, a read-only check of the running Web container
reported image ID
`sha256:a413a261c462260dd6593ba898355a06416635aee26ac7076e5f33a524517d70`.
All **1,370** retained static release files other than runtime-injected
`index.html` matched their running-container SHA-256 values. The retained release
source copy matches all **4,220** included source files in the source snapshot.
The verified publication commit will identify the recovered source tree; its hash
must be recorded on the actual recovery PR and AppFlowy story after publication.

This connects the retained build output to the observed image and preserves its
source snapshot. It does not establish a reproducible OCI digest or authenticated
browser acceptance. The unfinished mobile branch is not that deployed build.

The historical repair image layers the compiled output on a locally retained
runtime image using `docker/Dockerfile.id-repair`. It relies on
`appflowy-web-tief:0.18.5-tief.2`, historically verified as
`sha256:6b106b5bb2887ddff4d6ef6662bd8091aec77e667a1e9e3d2121c6068d9f6a63`.
That runtime image is not supplied by this source fork. Exact historical image
recovery still needs that verified runtime/archive and retained build output.
Do not pull an unrelated image under the same local tag or call a fresh build
byte-identical without verifying it.

## Build and validation

Use the repository's pinned pnpm version (10.9.0), the existing lockfile and a
supported Node version. The October 23 checks reused the installed dependency
tree whose package/lockfile bytes match this upstream base; no dependency update
or installation was performed.

```bash
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit --project tsconfig.web.json
APPFLOWY_WEB_VERSION=0.18.5-tief.3-row-id.1 pnpm run build
```

Build in a fresh checkout without private `.env` files or inherited Vite build
settings. The ordinary `docker/Dockerfile` can build a fresh source-based image;
its upstream runtime tags are mutable, so its digest is not the historical
deployment digest. Pin and review any future runtime update separately.

Recovered-release focused tests: six suites / **121 tests passed**; full Web
TypeScript checking and a fresh production Vite build passed. The build retained
the existing Browserslist-age and chunk-size warnings. The unfinished mobile copy
separately passed twelve suites / **138 tests** and full Web TypeScript checking. Required authenticated phone/PWA editing, locked/read-only
view behavior, UI-to-agent readback and visual acceptance remain open. Unit tests
do not release the unfinished mobile work.

The fresh build is not byte-identical to the retained output: both contain 1,371
files, with 1,189 identical name/hash pairs, 181 replaced hashed filenames and one
same-name difference. The fresh build used Node 26.8.2 and the unchanged installed
dependency lock. Keep this build result separate from the independently verified
retained files observed in the running container.

## Integration ownership and release boundary

[Tief Gateway](https://github.com/sxt379994/tief-gateway) owns the AI tools, native
document conversion and guarded project/task operations.
[Homelab](https://github.com/sxt379994/homelab) owns deployment and independent
backup tooling. AppFlowy remains the workspace data and authentication authority;
the Context repository retains decisions and project direction. Link code review
to the existing [AppFlowy board](https://work.tief.dev/app/16fbd1ce-1633-4677-8b3c-5bcb97b5ca95/67418d71-deea-4c27-9e2b-6c83f0c0f0fe)
story `appflowy:source:upstream-fork-provenance`.

Publication is still proposed: no fork, custom commit or PR has been created by
this recovery. Before publication, review exact source hashes and obtain the
required approval for the repository/visibility and selected source. Push only
the named recovery branches; publish no version tags and dispatch no image
workflow. Upstream image publishing responds to version tags/manual dispatch;
other upstream CI filters target main/develop/release branches. Do not enable
fork workflows or add deployment credentials as part of source recovery.

Keep the moving upstream main unchanged. Open draft recovery PRs against the
pinned review base, obtain independent review of their actual heads, then use the
separate deployment/owner-acceptance gates. Source publication alone changes no
production service or workspace record.
