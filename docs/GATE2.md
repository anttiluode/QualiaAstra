# Gate 2 (development): learn relations from raw interference traces

[Open the offline Gate 2 site](../gate2.html) · [Original Gate 1](../index.html) · [Engine](../gate2_engine.js)

**Question.** Can a calibrated observation model turn raw partial sensor time series into evidence that lets a separate inference mechanism revise predictions of sensors withheld at test time? This follows [Astra's original roadmap](NEXT.md): first learn representation; later study mutually revising units and state-shaped communication.

This is a **bounded, supervised development experiment**, not a confirmation of the proposal. Gate 1 code, results and numerical receipts are unchanged.

## Observations and calibration

- Three independently sampled signed sources A, B, C generate two raw 48-sample interference traces: A/B and B/C. Each is noisy squared amplitude of an interfering pair, with nuisance gain and offset. The learner is **not supplied** products AB or BC at test.
- A separate noisy signed scalar clue from A arrives later; the viewer can hide or alter it.
- The two distinct sensor waveforms for B and C are withheld at test. They are used solely for evaluation and an optional truth overlay.
- **Calibration is supervised.** 256 independent labelled examples supply source signs and relation classes. The learner fits class-conditional raw waveform means, common per-sensor residual variance, clue likelihood and B/C sensor templates. It does not discover identities, topology or inference rules.
- Evaluation samples 512 separate seeded cases. Neither test labels nor withheld test waveforms enter learned inference.

## Mathematical rule

For each raw sensor trace x, calibration estimates Gaussian likelihoods P(x | relation = +1) and P(x | relation = -1), with a pooled variance over its time samples. The inference code receives the trace and computes an evidence log-likelihood ratio rather than being given the true pair-product.

Let ell_AB and ell_BC be those log odds, and ell_A the log odds from the clue. A supplied three-unit sum-product chain computes:

~~~text
m_A = tanh(ell_A / 2)
m_B = m_A * tanh(ell_AB / 2)
m_C = m_B * tanh(ell_BC / 2)
~~~

Then the predicted, previously withheld waveforms are m_B*T_B and m_C*T_C, where the templates were learned from calibration only. Without the clue, global sign reversal preserves both raw interference traces, so all signed expectations remain exactly zero.

## Mechanistic controls

The viewer lets you cut A→B, reverse A→B's message, disconnect both links and inspect ground truth only after electing to reveal it. The benchmark compares five conditions:

| Condition | What it tests |
|---|---|
| Learned raw-sensor model | Calibrated relation likelihoods from noisy sensor arrays |
| A→B cut | Remote predictions vanish although A still receives its clue |
| Disconnected | No relationship messages can propagate |
| Shuffled raw sensors | Independent other cases supply the raw relation observations |
| Relation-sign oracle | **Evaluation-only upper bound** given true relation labels; unlike learned inference, it receives test labels |

Error is squared error on both withheld sensor waveforms divided by the error of predicting zero. Lower is better; 1.0 means no gain over zero.

## Seeded development observation (not pre-registered)

Calibration seed 1401 (256 cases), evaluation seed 20261116 (512 cases):

| Method | Relative withheld-wave MSE |
|---|---:|
| Learned raw-sensor model | **0.574** |
| A→B cut | 1.000 |
| Disconnected | 1.000 |
| Shuffled raw sensors | 1.483 |
| Relation-sign oracle | 0.536 |

Learned B/C sign accuracies are 85.9% / 84.4%. These values were examined while building this gate. **They are not an independent or preregistered confirmation.** Re-running the interactive benchmark or the deterministic Node test reproduces the same development case. Different calibration seeds may give different results.

## Interpretation and unfinished work

The gate is a modest step beyond Gate 1: raw observation traces replace already-computed relation products at test. It does **not** show spontaneous token discovery, an independently learned causal factor graph, biological neurons or subjective experience. Topology, identities, binary sign vocabulary, training labels, observation model family and inference algebra remain supplied. The interference sensor construction was chosen to make relational information detectable.

Follow-up gates should separately test (1) latent factor learning without signed calibration teachers, (2) recurrent agreement among mutually listening units with interventions on recipient states, and (3) state-shaped packet communication under matched information bandwidth and energy. Any scientific confirmation should freeze protocol and code before sampling fresh evaluation seeds.

## Reproduce

Open gate2.html alongside gate2_engine.js locally. It needs no network, GPU, server or package installation.

~~~sh
node tests/gate2.cjs
# The GitHub CI also runs the Gate 2 browser smoke test with Playwright.
~~~

The original [Gate 1 experiment](../RESULTS.md) and its receipts remain independent of this exploratory extension.
