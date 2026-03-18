# CHANGELOG

This file is for short, chronological notes.
It is not meant to replace the README.

Use it to track:
- major product decisions
- important UI changes
- data model changes
- next checkpoints reached

## 2026-03-14

### Project foundation

- initialized `SPREAD by ONLYMATT` as a fresh Next.js app
- connected runtime database flow to Turso
- set Prisma as the current ORM/data model layer
- added Vercel Blob test upload support

### Product language fixed

- kept:
  - `Commons`
  - `Mesh`
  - `Node`
  - `Vault`
  - `Spreads`
  - `Spread Me`
  - `Spread It`

### Data model direction

- fixed current model around:
  - `Owner`
  - `Node`
  - `VaultItem`
  - `Spread`
  - `EmailSession`
  - `Signal`
- kept `1 owner = 1 node`
- kept spread audiences:
  - `mesh`
  - `commons`

### Working flows added

- `/enter`
- `/owner/onboarding`
- `/owner/node/[slug]`
- `/node/[slug]`

### Owner cabin

- built the `front/back` Node logic:
  - vitrine in front
  - cabin behind
- added spread creation from cabin
- added spread toggle:
  - black = `mesh`
  - white = `commons`

### Public node

- removed public display of `Mesh`
- kept public focus on:
  - video
  - photo-card
  - Commons spreads

### UI simplification

- removed duplicated identity text in vitrine
- removed extra onboarding fields for platform + username
- reduced public-facing vitrine to:
  - video
  - photo-card
  - one handle button

### Commons spreads

- turned public spreads into expandable orbs
- added actions:
  - `Open`
  - `Copy`
  - `Spread It` (visual only for now)

### Motion polish

- softened orb expansion/collapse
- softened dimming and glow
- made black spreads in cabin calm down after activation

### Vault now works as a reserve

- upload no longer creates a spread directly
- upload now creates a `VaultItem`
- Vault items are listed in the cabin
- each Vault item can be sent into the Node with `To Node`
- sending from Vault creates a linked `mesh` spread

### Documentation

- replaced the README with a detailed resume document
- added this changelog for future short notes

### Current next priority

- make `Vault` a real reserve that can publish into `Spreads` cleanly
