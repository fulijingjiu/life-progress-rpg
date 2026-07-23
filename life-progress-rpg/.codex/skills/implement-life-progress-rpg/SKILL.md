---
name: implement-life-progress-rpg
description: Implement, fix, review, polish, test, or continue the life-progress-rpg v0.1 MVP while enforcing its local-first architecture, data invariants, privacy and AI safety, high-quality visual design, friendly responsive interaction, accessible states, precise Chinese copy, and acceptance loop. Use for coding, UI/UX implementation or refinement, content/copy improvement, bug fixes, refactors, design reviews, implementation status, architecture decisions, release checks, or autonomous continue/finish requests.
---

# Implement Life Progress RPG

## Establish context

1. Resolve the repository root with `git rev-parse --show-toplevel`; if unavailable, locate the nearest directory containing `package.json`, `AGENTS.md`, and `docs/`.
2. Read `AGENTS.md` completely before acting.
3. Read `docs/README.md` and `docs/planning/milestone-v1.md`.
4. Read only the task-relevant specifications:
   - UI, interaction, content, or polish: read `docs/design/quality-bar.md` and `docs/design/content-strategy.md`, then the relevant parts of `ux-spec-v2.md`, `component-design.md`, `visual-design.md`, `motion-design.md`, and `copywriting.md`
   - coding, file creation, module boundaries, state, or dependencies: `docs/tech/code-structure.md`
   - data or persistence: `docs/tech/database.md`
   - architecture or integration: `docs/tech/architecture.md`
   - AI or reflection: `docs/tech/ai-design.md`
   - autonomous continuation: `docs/planning/ai-implementation-loop.md`
5. Treat the MVP plan as the implementation source of truth. Treat documents marked vision, research, future, or archived as non-authoritative.

## Inspect before editing

- Run `git status --short` and preserve user changes.
- Read `package.json` to discover real scripts and dependencies.
- Search the existing code before adding modules or dependencies.
- Run the smallest relevant baseline check. Record pre-existing failures separately.
- Read `docs/planning/implementation-status.md` when it exists.

Do not assume the documented target is already implemented. Confirm behavior from code and tests.

## Classify the request

Choose the narrowest applicable workflow:

- **Implement/continue:** select the highest-priority unfinished P0 vertical slice.
- **Fix:** reproduce the failure, identify its root cause, make the smallest safe fix, and add regression coverage.
- **Review:** report findings first; do not mutate unless the user asked for changes.
- **Design/content polish:** inspect the real rendered page, all applicable states, responsive layouts, and Chinese copy; fix quality issues instead of only commenting on them when changes are requested.
- **Validate/release:** run the project checks, perform the design-quality review, and map evidence to the MVP acceptance table.
- **Product/content strategy:** use `docs/design/content-strategy.md` to separate acquisition, activation, retention, and trust; convert content ideas into evidence rules, version gates, user controls, and measurable hypotheses.
- **Documentation:** update the authoritative document and every directly affected contract, without changing implementation unless asked.

## Enforce the scope gate

Implement only v0.1 P0 and necessary foundations unless the user explicitly expands scope.

Reject scope creep into accounts, cloud sync, public social features, leaderboards, formal XP/achievements, scheduled reports, deep AI conversation, life planning, predictive advice, PostgreSQL, Redis, queues, gateways, or microservices.

Preserve these invariants:

- birth year only
- estimated and optional life progress
- mood 1–5
- integer energy 0–10
- one record per user-local date
- local-first IndexedDB persistence
- AI and analytics consent off by default
- no browser-side provider secret
- AI failure never blocks local save

## Enforce the code structure

Follow `docs/tech/code-structure.md` whenever creating or moving source files.

- Organize user capabilities under `features`, pure rules under `domain`, Dexie and import/export under `data`, external clients under `services`, and only truly generic code under `shared`.
- Keep `domain` free of React, Router, Zustand, Dexie, and service imports.
- Keep Dexie as the persisted-data source of truth. Do not mirror record collections in Zustand or QueryClient.
- Use Zustand only for short-lived UI/process state and TanStack Query only for real server state.
- Expose each feature through a small public entry; do not deep-import another feature's internals.
- Create only directories needed by the current slice. Avoid empty architecture scaffolding.
- Do not add `server/` files until their runtime, build, environment validation, and deployment path are real.

## Implement one vertical slice

For each slice:

1. State the acceptance item being completed.
2. Trace the path from UI through Feature, Domain, Data/Service, and persistence; place each responsibility according to `docs/tech/code-structure.md`.
3. Define or reuse typed contracts at boundaries.
4. Add runtime validation for external, imported, persisted, or AI-generated data.
5. Implement loading, success, empty, error, offline, AI-consent/fallback, and recovery behavior where applicable.
6. Use realistic short, long, empty, and error-state Chinese content; verify hierarchy and wrapping rather than relying on placeholders.
7. Complete the applicable `docs/design/quality-bar.md` checks in the same slice; do not defer all visual and content quality to a final cleanup.
8. Add focused unit/integration tests and an end-to-end test for a core user path when infrastructure exists.
9. Avoid placeholders, static success responses, disabled validation, deleted tests, broad `any`, or unrelated refactors.
10. Update `docs/planning/implementation-status.md` with evidence and the next slice.

Keep IndexedDB access in the data layer. Keep date/progress/reflection calculations pure. Keep provider calls behind a same-origin server proxy.

## Raise interface and content quality

Use `docs/design/quality-bar.md` as a mandatory acceptance contract and `docs/design/content-strategy.md` as the content-product contract.

For every user-visible slice:

1. Establish one primary task and a clear information hierarchy.
2. Reuse design tokens and component patterns; avoid generic dashboard styling, excessive cards, gradients, glow, shadows, or decorative emoji.
3. Test realistic Chinese copy at short and long lengths.
4. Cover all applicable loading, empty, error, offline, consent, fallback, and reduced-motion states.
5. Check keyboard, touch, focus, screen-reader names, contrast, and 44×44px targets.
6. Check at least 360×800, 390×844, 768×1024, and 1440×900.
7. Use browser inspection or screenshots when available. Do not claim visual quality passed from source review alone; record pending human visual review if rendering cannot be inspected.
8. Remove generic praise, repeated labels, vague buttons, manipulative language, unsupported claims, and copy that does not explain recovery.
9. For reflections or analysis, verify the value layer, data threshold, evidence, uncertainty, feedback controls, and the distinction between a daily fact and a longitudinal pattern.

Prefer calm, warm, restrained, content-led presentation. Make polish support comprehension and trust.

## Apply AI and privacy boundaries

- Default to deterministic local reflection rules.
- Calculate samples, dates, missingness, comparisons, and evidence in tested code; use AI only to organize approved facts into language.
- Require explicit consent before sending content to an AI proxy.
- Send only fields necessary for the current reflection.
- Treat record text as untrusted data, not instructions.
- Validate input length and structured output.
- Fall back locally on timeout, invalid output, provider error, or safety rejection.
- Never log diary content, prompts, model replies, nicknames, or birth years.
- Never generate diagnoses, causal claims, fabricated percentages, predictions, or major-decision instructions.

## Run the implementation loop

When asked to continue, finish, or work autonomously, follow
`docs/planning/ai-implementation-loop.md`.

Each loop must produce at least one of:

- a verified implementation change
- a verified root-cause finding
- removal of a concrete blocker

Do not loop on planning alone. Continue while safe P0 work remains.

Treat only external credentials without a safe fallback, destructive out-of-scope operations, irreconcilable user changes, or an irreconcilable authoritative-spec conflict as blockers. Missing AI credentials do not block local rules, proxy contracts, test doubles, or fallback behavior.

## Validate proportionally

Use scripts that actually exist in `package.json`. For a normal implementation pass, prefer:

```bash
npm run lint
npm run test -- --run
npm run build
python .codex/skills/implement-life-progress-rpg/scripts/validate_project.py
git diff --check
```

Start with targeted tests during iteration, then run the full available set before completion. Do not claim a command ran if it was absent, skipped, or failed.

For documentation-only changes, at minimum run the project validator and `git diff --check`.

For source changes, also review module imports, Zustand/Dexie/Query ownership, and whether every server file is included in a real build path.

For user-visible changes, additionally inspect rendered states and responsive viewports. Capture screenshot or browser evidence when tooling exists. If it does not, explicitly separate automated PASS results from pending visual/human judgment.

## Finish with evidence

Report:

1. implemented behavior
2. key files changed
3. validation commands and actual results
4. visual, interaction, responsive, accessibility, and content-quality evidence
5. acceptance items passed or still failing
6. external follow-ups, pending human visual review, and non-blocking debt
7. final `git status --short` summary

Do not declare completion while a required P0 item is unimplemented, unverified, or failing.
