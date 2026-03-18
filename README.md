# SPREAD by ONLYMATT

This repo is the new product foundation for `SPREAD by ONLYMATT`.

This README is meant to be the single source of truth when resuming work later.
It focuses on:
- what the product is
- what is already built
- what is intentionally unfinished
- what to do next, in order

## 1. Product Summary

SPREAD is not a classic profile page and not a classic marketplace.

It is a simple system built around:
- a public entry layer
- a personal owner space
- selective publication
- public circulation
- later: signals, relays, and owner-to-owner relationships

Core language:
- `Commons`: the public layer
- `Mesh`: the owner-only layer
- `Node`: the owner space
- `Vault`: private reserve
- `Spreads`: units that circulate
- `Spread Me`: owner publishes
- `Spread It`: others relay, signal, or respond

## 2. Product Decisions Already Made

These are the decisions that should be treated as stable unless there is a deliberate product change.

### 2.1 Roles

Keep it simple:
- `Owner`
- `Others`

Do not introduce more role complexity yet.

### 2.2 Space Model

The current mental model is:
- `Vault` = private reserve
- `Node` = owner’s live space
- `Spreads` = things that circulate from the Node

### 2.3 Visibility Model

At the moment, the working distinction is:
- `mesh` = black spread, owner-layer only
- `commons` = white spread, visible publicly

Flow:
- create spread in `mesh`
- click it in cabin
- turn it into `commons`

### 2.4 Visual Model

A Node has two faces:
- front = the vitrine
- back = the cabin

Public:
- video stays as the live surface
- photo-card acts as the identity anchor
- commons spreads visually belong to that photo-card

Owner:
- the owner is behind the vitrine
- the cabin controls what gets circulated

## 3. Current Stack

- Next.js 16
- TypeScript
- Tailwind CSS 4
- Prisma
- Turso / libSQL
- Vercel Blob for upload tests

## 4. Current Environment Variables

The app currently needs:

```env
TURSO_DATABASE_URL="libsql://..."
TURSO_AUTH_TOKEN="..."
BLOB_READ_WRITE_TOKEN="..."
```

Notes:
- `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are required for runtime DB access.
- `BLOB_READ_WRITE_TOKEN` is required for file upload tests.
- do not remove Turso vars when adding Blob

## 5. Local Setup

### 5.1 Install

```bash
npm install
```

### 5.2 Create local env

```bash
cp .env.example .env
```

Then fill in:

```env
TURSO_DATABASE_URL="libsql://..."
TURSO_AUTH_TOKEN="..."
BLOB_READ_WRITE_TOKEN="..."
```

### 5.3 Prisma local migration flow

Prisma is currently used with a local SQLite migration flow, then Turso at runtime.

Generate the client:

```bash
npm run prisma:generate
```

Create or update a local migration:

```bash
npx prisma migrate dev --name init
```

This creates SQL in:

```bash
prisma/migrations/<timestamp>_init/migration.sql
```

Apply that SQL to Turso manually:

```bash
turso db shell spreadbyonlymatt < ./prisma/migrations/<timestamp>_init/migration.sql
```

### 5.4 Run app

```bash
npm run dev
```

### 5.5 Build check

```bash
npm run build
```

## 6. Current Project Structure

### 6.1 Main pages

- `src/app/page.tsx`
- `src/app/commons/page.tsx`
- `src/app/enter/page.tsx`
- `src/app/node/[slug]/page.tsx`
- `src/app/owner/onboarding/page.tsx`
- `src/app/owner/node/[slug]/page.tsx`

### 6.2 Main components

- `src/components/site-shell.tsx`
- `src/components/enter-form.tsx`
- `src/components/owner-onboarding-form.tsx`
- `src/components/owner-cabin.tsx`
- `src/components/commons-spreads.tsx`

### 6.3 Main API routes

- `src/app/api/enter/route.ts`
- `src/app/api/nodes/route.ts`
- `src/app/api/nodes/[slug]/route.ts`
- `src/app/api/nodes/[slug]/signals/route.ts`
- `src/app/api/node-by-id/[nodeId]/vault/route.ts`
- `src/app/api/node-by-id/[nodeId]/spreads/route.ts`
- `src/app/api/spreads/[spreadId]/route.ts`
- `src/app/api/uploads/route.ts`

### 6.4 Data layer

- `prisma/schema.prisma`
- `src/lib/prisma.ts`
- `src/lib/utils.ts`

## 7. Current Data Model

Current Prisma models:
- `Owner`
- `Node`
- `VaultItem`
- `Spread`
- `EmailSession`
- `Signal`

Important current behavior:
- one owner = one node
- spreads have audience:
  - `mesh`
  - `commons`
- private reserve belongs in `VaultItem`
- anything in circulation belongs in `Spread`

## 8. Current Flows That Work

### 8.1 Enter flow

Page:
- `/enter`

Current behavior:
- local/dev flow
- no real email delivery
- acts as the bridge toward owner onboarding

### 8.2 Owner onboarding

Page:
- `/owner/onboarding?email=test@example.com`

Current behavior:
- create owner
- create node
- derive handle info from main link
- redirect to owner cabin

### 8.3 Owner cabin

Page:
- `/owner/node/[slug]`

Current behavior:
- left = vitrine
- right = cabin
- add spread with mini input + `+`
- new spread starts in `mesh`
- click spread to toggle `mesh <-> commons`
- dim/glow behavior exists
- upload file to Blob test flow exists from the Vault area
- uploaded file now lands in the `Vault`, not directly in `Spreads`
- Vault items are listed in the cabin
- each Vault item can be sent into the Node with `To Node`
- sending from Vault creates a new `mesh` spread linked to the Vault item

### 8.4 Public node

Page:
- `/node/[slug]`

Current behavior:
- public Commons-facing view
- shows video vitrine
- shows photo-card attached to Commons spreads
- shows Commons spreads only
- `Mesh` content is no longer shown publicly

## 9. Current UI Decisions Already Applied

These were already cleaned up and should not be reintroduced by accident.

### 9.1 Onboarding simplification

Removed:
- separate `main platform`
- separate `main username`

Those are now inferred from the main link.

### 9.2 Vitrine simplification

Removed from the main public-facing card:
- duplicated big name
- duplicated handle text
- bio in the vitrine

Kept:
- video
- photo-card
- single handle button linking to main link

### 9.3 Photo-card

The photo-card is important.

It now acts as:
- identity marker of the node
- visual anchor for Commons spreads
- future source point for spread circulation in the Mesh

### 9.4 Commons spreads interaction

Current direction:
- compact orbs at rest
- expand on hover/tap
- actions:
  - `Open`
  - `Copy`
  - `Spread It`

`Open` and `Copy` work.
`Spread It` is still visual only for now.

### 9.5 Motion polish

Recent polish already applied:
- smoother orb expansion/collapse
- softer motion timing
- black spreads in cabin calm down after a short highlighted state
- dimming is less abrupt

## 10. Known Limitations Right Now

These are expected and not bugs unless explicitly revisited.

### 10.1 Email auth is not real yet

- no actual magic link delivery
- no proper owner session model
- local flow is intentionally simplified

### 10.2 Vault is still minimal

Right now the Vault is mostly:
- upload-backed reserve
- listed inside the cabin
- able to send an item into the Node

It is not yet a full reserve workflow with:
- listing
- editing
- richer item creation beyond uploads
- editing
- removal / archiving
- structured conversion controls beyond `To Node`

### 10.3 Spread It is not wired end-to-end

It exists as product language and UI presence, but not as a full relay/signal system yet.

### 10.4 Public node still needs visual refinement

The current direction is good, but still rough in:
- spacing
- spread layout rhythm
- transitions
- relation between photo-card and spreads

### 10.5 Production should still be treated as prototype

Do not treat current production tests as final product validation.
The app is already useful for direction checks, but not stable enough to judge final UX.

## 11. Exact Next Moves

This is the most important section for resuming work later.

The next work should follow this order.

### 11.1 Finish the Vault properly

Goal:
- make Vault a real reserve, not just an upload corner

Do next:
- allow more than uploads:
  - add link to Vault
  - add note/proof item to Vault
- support editing Vault items
- support removal / archive
- refine how a Vault item becomes a spread
- keep clear distinction:
  - vault = private
  - spread = circulating

Why first:
- this completes the core product loop

### 11.2 Clarify spread state visually

Goal:
- make black vs white immediately understandable without extra text

Do next:
- refine black spread look in cabin
- refine white spread look in cabin
- make transitions clearer but still minimal

Why:
- this is the central interaction of the current MVP

### 11.3 Wire Spread It for real

Goal:
- let others relay or signal something from a public spread

Do next:
- define first MVP behavior for `Spread It`
- likely:
  - open a small sheet
  - ask for email
  - create a signal entry

Why:
- this is the first real “other side” action

### 11.4 Tighten public Node layout

Goal:
- make public Node feel intentional and silent

Do next:
- refine the relationship between:
  - video
  - photo-card
  - commons spreads
- keep text minimal
- keep motion subtle

### 11.5 Only after that: improve Commons home / Mesh visualization

Goal:
- show Nodes connected by lines / pulses / light

Important:
- do not jump back into this too early
- first complete the basic Node / Vault / Spread loop

## 12. Things To Avoid Right Now

To avoid getting mixed up again, do not add these yet:

- complex role system
- full payments
- full marketplace logic
- advanced calendar system
- heavy messaging system
- too many text explanations
- too many colors or too much glow
- full production auth

## 13. Working Principle

When resuming, remember this:

- keep it quiet
- keep it visual
- keep it simple
- avoid adding words when motion or structure can explain it

The current product is strongest when it feels like:
- a Node
- with a front and a back
- with a reserve
- and a few things that start to circulate

## 14. Quick Resume Checklist

When coming back later:

1. Run `npm run dev`
2. Open `/owner/node/[slug]`
3. Open `/node/[slug]`
4. Verify Turso env vars are still present
5. Verify Blob uploads still work
6. Continue only from section `11. Exact Next Moves`

## 15. Current Recommendation

If restarting from here, the single best next task is:

`Turn Vault into the real private reserve that can publish into Spreads cleanly.`
