# Tief mobile client boundary

This branch is a thin, mobile-focused fork of AppFlowy Web. It starts from the
exact source revision used by the private `work.tief.dev` deployment:
`86feb976d320e3ced95b7acaff57009f4935fcbe` (AppFlowy Web 0.18.5).

## Product boundary

- AppFlowy Cloud remains the sole owner of workspace, page, project, and task data.
- GoTrue remains the user authentication authority. Browser code never receives
  the Gateway service token or a Cloudflare service token.
- The existing AppFlowy sync, permissions, and collaboration paths remain intact.
- The fork changes mobile presentation and interaction only. It does not add a
  second task database or a second synchronization path.
- Obsidian and the context repository retain their existing roles; this client is
  only a mobile surface for AppFlowy work data.

## First slice: permission-safe mobile editing

Upstream AppFlowy Web forces all mobile views to read-only. This fork adds the
runtime setting `APPFLOWY_MOBILE_EDITING`. Its default is `false`, preserving
upstream behavior. When set to `true`, mobile views use the same lock and access
checks as desktop views.

Before the flag is enabled in production, validate at phone width that the owner
can create and update task rows, that locked views remain read-only, and that a
read-only shared view cannot be changed. The custom image and deployment change
are separate, reversible steps.

## Planned mobile UX slices

1. Make task and project grids comfortable at phone width, including touch-sized
   controls and a focused row-detail flow.
2. Add fast paths for Inbox, Tasks, Projects, and quick task capture without
   changing their AppFlowy object identities.
3. Add safe-area-aware PWA chrome and phone-sized visual regression coverage.
4. Build a digest-pinned image and replace only the `appflowy_web` service after
   the authenticated mobile flow passes against staging or an isolated build.

## Acceptance boundary

The fork is not production-ready merely because it compiles. Release requires an
authenticated phone-width flow that creates a disposable task, edits status and
priority, reloads it from the server, and removes it without affecting unrelated
workspace data.
