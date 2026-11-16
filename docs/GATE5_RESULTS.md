# Gate 5 — Evidence versus Echo: twelve-seed confirmation

**16 November 2026** · [Live interactive lab](../gate5.html) · [Frozen protocol](GATE5_PROTOCOL.md) · [Complete numerical receipt](../results/gate5_confirmation.json) · [Engine](../gate5_engine.js) · [Successful CI run](https://github.com/anttiluode/QualiaAstra/actions/runs/43861394126)

## Verdict: PASS, with a precise limit

**A learner given the provenance of a message distinguishes genuine new sensory evidence from its own replay, and reconstructs the expected hidden C sign more accurately than either counting every replay or making the best possible prediction without provenance.** All predeclared criteria passed across 12 independent training/evaluation populations. Importantly, the model is explicitly given a reliable origin tag: no model here learns to identify physical observations from raw dendritic dynamics.

The result is a test of **evidence bookkeeping in a supplied Bayesian Markov chain**, not emergent qualia, physical wave cancellation, automatically learned information sources or a new mathematical law.

## Frozen evaluation

The [protocol](GATE5_PROTOCOL.md) was committed before the separate confirmation seeds were evaluated. Twelve calibration seeds **750001..750012** each supplied 512 fully observed A/B/C training episodes; twelve disjoint evaluation seeds **850001..850012** each supplied 4096 additional hidden-B/C episodes. That is 12 independently trained models with 49,152 held-out test episodes; do not misinterpret the latter count as 49,152 independent model seeds.

The learner estimated each transition correlation by averaging signed products from full observations during calibration. It was never given the true correlation 0.70 as a trained parameter, although the chain topology and Bayesian formulas were engineered.

Median signed-C relative squared error, normalized so predicting zero is **1.000**; lower is better:

| Policy | Median C error |
|---|---:|
| **Evidence-aware learner: receives genuine/replay tag** | **0.72277** |
| Exact provenance-aware Bayesian reference, true correlations | 0.72212 |
| **Optimal tag-blind Bayesian receiver** (knows 50:50 mode prior) | 0.72667 |
| Naive: count each B-like report as a genuine observation | 0.73208 |
| Shuffle independent provenance tags | 0.74386 |
| Ignore B; retain only A-based expectation | 0.75794 |
| Cut B→C message | 1.00000 |

The tag-blind comparator is Bayes-optimal under its restricted input information, not a deliberately faulty baseline. The evidence-aware model has **one additional input field**. Its improvement quantifies the value of that field in this engineered generator; it is not a claim of equal-input architectural superiority. Furthermore, the exact reference outperforms the learner only slightly because this model uses the correct supplied Bayesian algebra and only estimates two correlations. The result does not establish a general modeling advantage.

Frozen checks:

| Criterion (at least 10/12 unless noted) | Observed | Decision |
|---|---:|---|
| Within 0.020 error of exact known-correlation Bayes | 12/12 | Pass |
| Beat naive echo-as-evidence by 0.005 or more | **11/12** | Pass |
| Beat optimal origin-blind receiver by 0.001 or more | 12/12 | Pass |
| Scrambled origin tags degrade error by at least 0.010 | 12/12 | Pass |
| All specified mechanism invariants, required in 12/12 | 12/12 | Pass |

One training population, **seed 750011**, did not beat naive by the predeclared 0.005 margin, although it had a lower error. That exception is retained in the full receipt and has not been hidden or tuned away.

## Why identical reports can require different updates

All three world variables are ±1. A is known at test; B copies A with probability 0.85 and C copies B with probability 0.85. A B-like report z may be:

- **ACTUAL:** independent, genuine sensor evidence about B with reliability p.
- **REPLAY:** an internally generated message z=A, carrying no fresh information about B regardless of the apparent reliability p.

If the prior B expectation is m = rho1 * A and the measurement reliability factor is k = 2p−1, then a real report gives:

    E[B | A, real z] = (m + k*z) / (1 + m*k*z)

An internally generated replay leaves m untouched. The C expectation is rho2 times the resulting B expectation.

Consider the same positive A and z, with p = 0.95 and true rho1=rho2=0.7:

| Identical values A=+1, z=+1, p=.95 | Correct expected C |
|---|---:|
| Report is an imagined replay | +0.490 |
| Report is an independent real B measurement | about +0.687 |
| Source tag unavailable, known 50:50 real/replay mixture | between these values |

When z equals A, the *observable report has exactly the same signed value* in both conditions. Without additional provenance, no decoder can always infer its source from these inputs. The no-tag posterior explicitly marginalizes whether the report was real. When z differs from A, this specific replay generator can never produce the report, so the no-tag model correctly identifies it as a genuine observation. This limitation must be remembered in interpreting the task.

## Repeated self-replay, contradiction and causal interventions

- Replaying the same imagined z repeatedly **cannot create independent evidence**. The evidence-aware B and C expectations remain unchanged, while a naive repeated-likelihood mechanism gets increasingly certain.
- An actual highly reliable negative B report can reverse C despite a positive A, because genuine new evidence revises the downstream expectation. An imagined negative report does not; the model uses its source tag to avoid treating an internal counterfactual as outside data.
- Cutting B→C zeroes only C's outgoing prediction while preserving the computed B state. This is a causal information route, not a physical wave cancellation mechanism.
- Poisoning hidden test B/C truth and C waveform fields does not change the predictor's outputs.
- A held-out signed C waveform overlay is only an evaluation aid. The engine's core metric scores the signed hidden C event, **not** the raw C waveform as the primary test. There is also a secondary waveform-error calculation with a supplied synthetic template.

## Where the biological hypothesis stands

This gate strengthens a **specific information constraint** behind the earlier phrase "the damper is the token": a held prediction may be passed forward without counting it twice as evidence.

It does **not** show how neurons recognize a waveform as internal rather than external. A literal self-versus-world bit provided by the simulator is much easier than learning provenance from a real dendritic cable, distinct feedforward and feedback compartments, or a reliable source-addressing circuit. It does not prove that a physical dendrite implements Bayes or that silence is conscious state.

[QualiaClaude's matched-latch chain](https://github.com/anttiluode/QualiaClaude/tree/main/chain) addresses timing: later B observations can reset A's fading clock. Gate 5 instead isolates the **statistical dependency** of forwarded messages. They are complementary questions, and neither result by itself solves the other's physical mechanism.

## Next discriminating test

A follow-up should **withhold the external provenance tag** and supply only separable causal pathways (e.g. a real sensory/basal input stream versus a recurrent/apical prediction stream) with matched amplitude and delay. Let a circuit learn to gate its own replay without having the correct answer hand-labelled at inference, then remove or swap those pathways and measure whether it loses evidence accounting.

If physical and replay messages are intentionally made indistinguishable under every available observation, provenance recovery is information-theoretically impossible. A good test must distinguish an **information channel that makes origin identifiable** from a neuron that supposedly extracts information that does not exist.

## Reproduce

    node tests/gate5.cjs
    node tests/gate5_confirm.cjs
    NODE_PATH=/tmp/qualia-ui/node_modules node tests/gate5_browser.cjs

CI executes Gate 1 through Gate 5 invariants and the offline browser. The twelve-seed receipt is [results/gate5_confirmation.json](../results/gate5_confirmation.json), produced directly from the confirmation runner's GitHub Actions output.
