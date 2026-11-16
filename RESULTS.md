# Gate 1 result — coherent revision in a supplied generative model

16 November 2026. **All four fixed mechanism gates pass.** This is a constructed
Bayesian reference task, not evidence of subjective experience, an emergent
neural architecture or a novel inference method.

Protocol published in `dc8ffc6fab43b6bbb109df3c4bf7641866431f61`.
Benchmark code published in `0a9760b352878ae1bf4f3adeb4a2b758fcaad21b` before
confirmation. Code/protocol hashes are in the receipt. Later edits fix only the
viewer and documentation; the scientific source and receipt remain unchanged.

## Sample and results

Twelve independent calibration/test seeds, 256 labelled calibration examples
per seed, 512 balanced noisy test cases per seed (6,144 total). Repetitions within
a seed are not treated as independent trained systems. Intervals resample the
12 paired seedwise errors, 10,000 draws, fixed bootstrap seed 7301.

| Method | Remote relative MSE ↓ | Total-wave NRMSE ↓ |
|---|---:|---:|
| Shared messages | 0.17234 | 0.41317 |
| Disconnected | 1.00000 | 0.85082 |
| Cut A—B | 1.00000 | 0.85082 |
| Shuffled relationships | 1.81426 | 1.12615 |
| Exact Bayesian enumeration | 0.17234 | 0.41317 |
| True-source-sign oracle | 0.00054 | 0.02327 |

Error differences (control minus shared), paired 95% bootstrap intervals:

- Disconnected: **0.82766 [0.81442, 0.84251]**, an 82.8% relative reduction.
- Shuffled relationships: **1.64192 [1.60074, 1.67949]**, a 90.5% relative reduction.

Eight-world MAP accuracy is **94.01%**; source-sign accuracy **94.10%**. The model
is not always right: noisy local evidence sometimes selects the wrong global
sign. Mean posterior entropy changes from **1.0046 to 0.2263 bits**. The initial
uncertainty is principally the two global-sign alternatives.

## Gates and controls

| Fixed gate | Measurement | Decision |
|---|---|---|
| A: preserve global ambiguity | No-clue marginal means and flip-probability difference exactly zero | Pass |
| B: useful remote revision | >40% reduction against both controls, paired intervals positive; cut gives zero remote revision | Pass |
| C: exact Bayes correspondence | Largest marginal discrepancy 8.33e-16 | Pass |
| D: causal message role | Reverse flips B/C but not A; suppression removes remote mean; output-only deletion changes no remote contribution | Pass |

A, C and D are largely algebraic known-answer checks of an engineered mechanism.
B quantifies its utility on a task explicitly designed to require shared
relations. None is a comparative advantage over exact inference. The ordinary
solver uses the same learned model, evidence and decoder and ties exactly.

## What the result adds

It distinguishes three stages: an ambiguous shared model, local disambiguating
evidence, and accurate remote predictive revision. Interventions demonstrate
that a message's role includes its effects on other units' predictions. Merely
removing an output contribution does not reproduce those effects.

It does **not** show spontaneous coordination: topology and message equations
were supplied. It does **not** show continual memory or new-cause generalization:
all eight possible sign configurations were represented in labelled training.
It does **not** show a physical body reconstructing a wave: predictions are
decoded arrays in a learned generative model. The relational sensor is engineered,
not learned from a raw mixed waveform. It does **not** measure subjective experience.

## Review correction and verification

The first viewer mistakenly applied directed-message interventions to the
reference joint coupling. This preserved the marginal means in this special
chain but changed the displayed alternative worlds unjustifiably. The final
viewer keeps the exact evidence-only posterior separately and explicitly labelled.
Numerical experiment results were unaffected; the benchmark already used only
unintervened exact posteriors and separately recomputed message marginals.

An exact full numerical replay matched the original receipt, including trial
inputs/outputs. All 13 tests pass. Node verifies 101 cross-language inference
cases and a control-flow harness. Hosted Chromium subsequently passed offline/control/mobile-width checks with
no page errors. [CI run and screenshot artifact](https://github.com/anttiluode/QualiaAstra/actions/runs/43814686560).
Screenshots were captured but not manually visually reviewed.

[Compact receipt](results/confirmation.json) · [Complete compressed receipt](results/confirmation.json.gz).
