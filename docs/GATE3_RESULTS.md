# Gate 3 — Unlabelled raw-sensor learning from future sensory error

16 November 2026 · [Interactive lab](../gate3.html) · [Fixed protocol](GATE3_PROTOCOL.md) · [Complete 12-seed receipt](../results/gate3_confirmation.json) · [Engine](../gate3_engine.js) · [CI run](https://github.com/anttiluode/QualiaAstra/actions/runs/43832196581)

## Result

**All five Gate 3 engineering confirmation conditions passed on twelve previously unused training seeds.** The learner did not receive any source signs or relation-class labels during calibration. Instead, each sensor learned **two raw waveform prototypes without labels**; downstream B/C waveform prediction templates were then adjusted by their **local error against the later sensory observation**.

Relative squared reconstruction error for the two withheld B/C waveforms, normalized to a zero-prediction baseline of 1.000 (lower is better):

| Method/control | Median over 12 independent trained systems |
|---|---:|
| **Gate 3: unlabelled prototypes + sensory-error learning** | **0.5770** |
| Gate 2: labelled Gaussian learner, same seed/data budget | 0.5717 |
| Cut A→B | 1.0000 |
| Cut B→C | 0.7746 |
| Both messages cut | 1.0000 |
| Shuffled raw sensor readings at test | 1.4560 |
| Trained with future events wrongly paired | 1.0263 |

All 12 training populations used **256 calibration episodes** and **512 independently generated test episodes** (6,144 test cases total; the independent systems are the 12 trained populations, not 6,144 separate seeds). Training seeds 700101–700112 and test seeds 880101–880112 were recorded in the [fixed protocol](GATE3_PROTOCOL.md) before running them.

Gate result counts:

| Predeclared check | Result | Status |
|---|---:|---|
| Label-free relative error below 0.80 | 12/12 (required 10/12) | Pass |
| Test-time raw-sensor shuffling increases error by ≥0.20 | 12/12 (required 10/12) | Pass |
| Mispaired training future raises error by ≥0.20 | 12/12 (required 10/12) | Pass |
| Within 0.10 relative MSE of supervised Gate 2 model | 12/12 (required 10/12) | Pass |
| A→B cut removes remote prediction, no clue remains ambiguous, reverse flips downstream | Mechanism tests passed | Pass |

This is a **bounded result in an engineered synthetic world**. Matching the supervised model numerically does not imply statistical equivalence, and no novel advantage over ordinary Bayesian inference has been established.

## What is actually learned

The world generator emits two 48-sample interference traces and, later, two signed sensor waveforms at B and C. During training, the learner is passed objects shaped `{raw, clue, future}`. Source signs and pairwise relation labels are discarded before fitting. At test, its predictor receives only `raw` and `clue`; future target arrays are never supplied to `infer`.

1. For each raw sensor, a two-prototype K-means encoder finds two stable waveform categories from the raw observations. There are no preassigned category names or sign labels.
2. The encoder outputs a smooth signed prototype-distance value. The sign of this internal latent is arbitrary: relabelling the two prototypes reverses it. **One must not call a positive latent state "B is positive" without separately establishing its gauge.**
3. A clue at A enters a fixed two-hop arithmetic chain, producing internal B and C states. The A→B→C topology, two-state bottleneck and propagation rule are supplied rather than self-organized.
4. At training time, after future B/C sensory recordings arrive, each predicted waveform is compared to the observed waveform. A normalized incremental delta update changes only the corresponding downstream template; the raw-sensor encoders themselves were trained by unsupervised prototype reconstruction, not by this future loss.
5. At test time, the learned templates turn internal B/C states into predicted waveforms. Cutting A→B forces both to zero; cutting B→C leaves the B prediction but removes C.

These are **separate observed-world and predicted-world arrays**, not two simulated physical wave fields with propagation delays, dendritic cable equations, or autonomous spiking neurons.

## Why the controls matter

- With A→B cut, the downstream model has no signed reference; relative error is exactly 1.0.
- With B→C cut, B remains predictable while C returns to zero. The median 0.775 loss is intermediate, not a complete failure.
- Raw test-sensor shuffling produces predictions with the wrong relationships, making the outcome worse than simply predicting nothing (1.456).
- Misaligning future sensory recordings during training prevents reliable template formation (1.026). The useful decoder depends on *actual future consequences*, not just arbitrary label-free clusters.
- A labelled reference trained on the same world has median 0.572, versus Gate 3's 0.577. For this restricted task, externally specified sign labels are not necessary to obtain similar predictive quality.

## Relation to the larger vision

This establishes a smaller bridge between [QualiaAstra Gate 2](GATE2.md) and the predictive-field learning theme of [QualiaClaude](https://github.com/anttiluode/QualiaClaude): **unlabelled observations can organize a compressed state, and later sensory errors can assign predictive consequences to that state**. It does not demonstrate automatically discovered source identities, learned topology, multicircuit consensus, dendritic filtering, state-carrying action potentials, or qualia.

Gemini's proposed "dendritic sieve + apical gate + state-payload ping" is still a **hypothesis to test**, not an upgrade validated here. The next controlled gate should vary **one** of those mechanisms at a time against a matched simple learner, and should measure whether messages change each other's internal states rather than merely pass once down a supplied chain.

## Provenance and reproducibility

- Protocol was committed before test seeds were evaluated: see [protocol](GATE3_PROTOCOL.md).
- The confirmation runner is `node tests/gate3_confirm.cjs`; it reports all 12 seeds and gates, including failures if any. The full output was preserved in [gate3_confirmation.json](../results/gate3_confirmation.json).
- Numerical invariants and label-poisoning controls: `node tests/gate3.cjs`.
- Browser automation: `tests/gate3_browser.cjs`. The [CI run](https://github.com/anttiluode/QualiaAstra/actions/runs/43832196581) completed successfully, including the original Gate 1 and Gate 2 tests.
- Re-running the demo at other seeded training populations is exploratory; no online retraining occurs in held-out tests.

No subjective experience claim is made or implied.
