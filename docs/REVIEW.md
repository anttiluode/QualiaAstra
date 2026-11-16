# Verification and review record

16 November 2026.

- Existing repository contained LICENSE only. Work took place in a fresh clone
  on local `shared-prediction`, published to the user-authorized repository main.
- Protocol commit dc8ffc6 and code commit 0a9760b preceded confirmation results.
- Nine inference tests were observed failing before lab.py existed, then passing.
  Two benchmark tests and a cross-language test likewise failed before their
  implementations, then passed.
- Independent reviewer inspected protocol, inference, benchmark, controls and
  UI. No critical numerical defect or test-target leakage was found.
- Important review finding: the initial browser inferred a new joint model from
  directed-message overrides. Fixed by separating evidence-only reference
  posterior from intervened marginal beliefs; regression observed RED then GREEN.
- Review's three UI findings were treated as important to this experiment's
  interpretation: a disabled slider leaked the hidden clue; sequential LCG seeds
  biased early illustrative worlds; truth overlay used learned templates. All
  reproduced in a test-only DOM harness and fixed. Hidden slider is neutral;
  illustrative RNG mixes seeds; true templates only enter comparison rendering.
- No benchmark/protocol parameter changed after confirmation. Full raw replay
  is byte-equivalent after JSON parsing. Source hashes recorded in receipt.
- Final suite: 13 tests; includes 101 JS/Python inference cases, exact enumeration
  parity, ambiguity, intervention semantics and UI control flow.
- JavaScript syntax checks pass. Actual Chromium rendering could not be checked:
  bundled Playwright browser was absent; installed Chromium failed at sandboxed
  socket creation. No visual-QA or desktop/mobile-rendering success is claimed.

## Decisions and costs

* Small supplied generative model chosen over another adaptive wave rule: makes
  inference identifiable, but does not implement the biological/substrate vision.
* Signed relational sensors and labelled calibration supplied: yields a clean
  known-answer gate, but moves the hard representation-learning problem to the
  next gate. No autonomous discovery claim.
* Browser uses closed-form chain inference, Python uses messages: keeps the app
  compact; exact parity tests are required and pass.
* Directed interventions do not define a unique global posterior: viewer shows
  evidence reference separately. Its entropy must not be read as entropy of
  an arbitrarily intervened message system.

No scientific finding is deferred. Rendered browser validation remains open.
