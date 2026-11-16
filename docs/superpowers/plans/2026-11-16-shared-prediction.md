# Shared prediction implementation plan

**Goal:** make the user's authorized QualiaAstra repository runnable and reviewable.
**Spec:** ../../IDEA.md and ../../../PROTOCOL.md (repository documents).
**Architecture:** learned symmetric likelihoods, three belief units, exact
enumeration control, seeded numerical receipt, standalone offline viewer.
**Stack:** Python 3.10+, NumPy; vanilla browser JavaScript, no server required.

## Constraints and review focus

No subjective-experience claim; no result retuning; no test truth enters inference;
signed ambiguity stays visible; message intervention must recompute descendants;
offline viewer equations must agree with Python. Existing LICENSE preserved.
Fresh clone is isolated from the user's work; branch shared-prediction used.

## Tasks

- [x] Write tests for ambiguity, exact inference parity, message cuts/reversal,
  decoder fitting, invalid inputs and output-removal distinction; observe RED.
- [x] Implement lab.py interfaces train(seed), infer(model, relations, clue,
  cut=False, intervention=None), exact(model, relations, clue), predict(model,
  marginals). Run full tests to GREEN.
- [x] Implement benchmark.py: fixed seeds, controls, seed bootstrap, source
  hashes, summary + raw per-seed measurements; publish protocol before full run.
- [x] Build index.html with ambiguity, local-clue, cut and reversed-message
  controls, alternatives, source traces and meaning-by-intervention panel.
  Export one frozen model; verify JavaScript/Python parity and browser behaviour.
- [x] Run frozen confirmation; report every gate and baseline. Write README,
  RESULTS.md and provenance. Run fresh final tests, independent review, publish.

## Execution record

User requested implementation in the named repo; proceed with the concrete scope
above. No modification of concurrent StateShapedPingRecall or QualiaClaude work.

Final verification: 13 tests pass; exact raw confirmation replay matches.
Review fixes and browser limitation documented in docs/REVIEW.md. GitHub browser
check is configured separately; completion is not assumed before CI succeeds.

Hosted Chromium verification completed successfully in run 43814686560; all
13 tests and offline/control/mobile checks passed. Screenshots archived.
