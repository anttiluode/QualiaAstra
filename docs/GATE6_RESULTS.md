# Gate 6 — Can a noisy waveform carry evidence provenance?

**16 November 2026** · [Live interactive experiment](../gate6.html) · [Predeclared protocol](GATE6_PROTOCOL.md) · [Full 12-seed numerical receipt](../results/gate6_confirmation.json) · [Simulation engine](../gate6_engine.js) · [Mechanism tests](../tests/gate6.cjs)

## Verdict: engineered waveform provenance works — in a controlled synthetic world

**All six registered criteria passed in all 12 independent populations.** The receiver never gets a per-trial “real vs replay” Boolean flag. Instead it sees an incoming noisy 48-sample waveform associated with a signed B-like report, and infers whether that report probably came through the simulated fast/short or slow/damped pathway.

**But the simulator deliberately makes those two physical sources generate different pulse shapes, and calibration supplies known-source stimulation probes.** This is evidence for computational sufficiency *conditional on available source-discriminating physical signals*, not autonomous discovery of provenance from arbitrary waves or proof of how biological pyramidal neurons work.

## Confirmation

The protocol was committed before independent confirmation cases were inspected. The implementation and thresholds were selected using development seeds 17001–17006, which are not part of the following table. Twelve independent calibration seeds 760001–760012 supply 512 fully observed A/B/C episodes each and 320 known-source pulse probes *per origin per waveform condition*; each body is tested on 4096 different hidden-B/C episodes from seeds 860001–860012. Total 49,152 held-out cases across 12 independent models, **not** 49,152 independent models.

Relative squared error on the unknown signed **C**, where predicting zero gives error 1; lower is better.

| Test or comparator | Median C error ↓ |
|---|---:|
| Correct-source oracle, learned A/B/C relations | **0.73173** |
| **Untaged cable-waveform receiver** | **0.73365** |
| 60% cable + 40% spike analogue | 0.73493 |
| Spike-shape analogue alone | 0.73821 |
| Bayes-optimal receiver without any physical trace | 0.73887 |
| Energy-only source decoder | 0.73894 |
| Equalized signatures, recalibrated source decoder | 0.73905 |
| Every B-like report treated as a genuine sensor reading | 0.74217 |
| **Swapped origin-specific waveforms at test** | **0.75111** |

The signal benefit is modest **in the primary world-prediction score**: the cable decoder's median absolute error is about 0.0052 below the no-wave source-blind baseline, and about 0.0019 above the source-informed oracle. The point is not a spectacular new network performance improvement: the physical trace supplies the missing statistical information needed for proper belief updates.

Conditional on **z=A**, where both a real report and self-replay can produce exactly the same signed message, the median source classification accuracy was:
- **Fast/slow cable response: 93.5%.**
- **Subtle spike-shape analogue: 68.2%.**

This conditioned measurement prevents the model from taking undue credit for z≠A events, where the Markov replay generator makes origin trivial even with no physical trace. The spike analogue contains statistically detectable origin information, but its median C prediction error is barely better than blind and is not a strong world-model result. The combined waveform occupies a middle position.

### Registered checks

| Predeclared check | Passed populations | Interpretation |
|---|---:|---|
| Cable reduces signed-C MSE at least .0015 below no-wave optimal mixture | 12/12 | The waveform adds predictive evidence |
| Cable reduces signed-C MSE at least .0015 below calibrated energy-only control | 12/12 | It is waveform *shape*, not merely loudness |
| Equalized waveform MSE remains within .004 of the no-wave optimum | 12/12 | Erasing source-dependent shapes removes the advantage |
| Reversing the physical source mapping harms MSE by at least .006 | 12/12 | The learned decoder causally relies on source-dependent shape |
| Spike analogue >63% source accuracy on ambiguous z=A trials | 12/12 | Subtle kinetic differences are readable, not necessarily task-beneficial |
| Deterministic mechanism checks, including source/truth poison invariance and cut | 12/12 | No digital provenance leak in the decoder |

All comparisons use the same independent test-world variables A/B/C, reliability values, noisy-pulse nuisance generation and learnt Markov relations; only the physical signature or decoder input is changed.

## What is actually built

The world stays the **engineered** Markov chain from Gate 5: P(B=A)=P(C=B)=0.85. Training estimates rho_AB and rho_BC by full observation. B-like packet z is either an actual independent sensor sample of B at reliability p, or an internal replay z=A that contains no new B evidence. The simulator itself chooses the source.

For each waveform condition, calibration independently probes its two known input routes. A class-balanced linear discriminator learns a 48-sample shape template, corrects for signed packet polarity z, and estimates a projected shared variance. This produces a soft waveform likelihood ratio, rather than a hard boolean. The decoder combines the likelihood with a strong Bayesian prior over which report sources are plausible given A and z; the receiver propagates its resulting **held B belief** to C.

The live test inference function consumes only:
- A, actually observed.
- z, the signed B-like report.
- p, its nominal sensor reliability.
- trace, the 48-sample noisy physical response.

**Neither true origin nor B/C truth is read.** In fact, explicitly injecting poisoned provenance, path identifiers and hidden true B/C into the input object does not change the output. The known-origin oracle is a separate post-hoc scoring reference, not the physical decoder.

Each simulated clean pulse is an equal-energy difference-of-exponentials response with randomized onset jitter, amplitude modulation and Gaussian noise. Fast and slow kernels imitate a short versus long pathway; a separate subtle-kinetics family imitates potential state-dependent spike-shape differences. These are convenient mathematical impulse responses. They are **not** a physical cable equation, conductance-based neuron, experimentally fitted spike-shape code or accurate description of active dendritic propagation.

## Causal interventions that matter

**Equalized waveform:** actual and replay origins produce physically identical traces for the same sign and nuisance. Recalibrating an optimal shape template cannot recover absent information. Its error returns near origin-blind Bayes.

**Energy-only:** clean profiles have the same L2 power and their amplitude distributions match, so a decoder that sees only intensity performs like the source-blind model. This tests that shape, not total magnitude, is relevant.

**Swap after calibration:** source-specific physical signatures are exchanged while preserving signs, reliability and noise. The previously trained decoder mistakes the origin and C prediction error jumps to 0.751. Thus the gain actually depends on learned physical source mapping.

**B→C cut:** explicitly zeroing the downstream C expectation does not erase B's internal posterior. The architecture still distinguishes held predictive state from the outward residual/inference pathway, as in earlier gates.

## A different, unresolved problem: eight echoes of the same event

Waveform decoding can be good but imperfect; e.g. 93.5% source accuracy on ambiguous packets, not 100%. If an independent-evidence accumulator sees **eight copies of the same physical replay** and counts each likelihood as statistically independent, the resulting confidence may still drift or saturate. A packet's origin and a packet's **event identity** are two distinct variables.

Therefore this experiment does **NOT** solve replay-copy suppression, refractory timing or an actual physical latch. A future circuit should combine shape-based source inference with event identity, local clock protection or recurrent copy suppression, and test whether it retains sensitivity to new contradictory **real** evidence.

## Biophysical context: promising analogies, not confirmed mechanisms

- Martin-Burgos, Juavinett, Rivière, Hammonds & Voytek, *Action potential waveforms are state-dependent* (bioRxiv preprint 2026; https://doi.org/10.64898/2026.09.15.751814): waveform variability relates to drive and neural state. It does **not** show that a downstream cell can determine external-versus-imagined provenance from one axonal spike, or that dendritic filtering propagates intact through regenerating axonal spikes.
- Reviews of apical/basal segregation (e.g. https://pmc.ncbi.nlm.nih.gov/articles/PMC7299084/) discuss feedforward/feedback laminar organization. Its anatomy and computations are heterogeneous; assuming *basal always sensory, apical always imagination* is too strong.

The hidden source is statistically encoded in this simulator by DESIGN. That is an analogue source channel, not a mystical property extracted from silence.

## Next discriminating experiment

**Gate 7: self-origin versus event identity.** Generate multiple recurrent copies of the same physical waveform with independently perturbed nuisance and intervening genuine observations. Try local adaptation and phase-/clock-based duplicate suppression under matched memory and sensory costs. Crucially, a real new B observation must still reverse C if contradictory; blindly latching out all later inputs is a false success. Include equalized-shape controls and anomalous cases where physical signatures reverse after plasticity, forcing relearning.

## Reproduction

    node tests/gate6.cjs
    node tests/gate6_confirm.cjs
    NODE_PATH=/tmp/qualia-ui/node_modules node tests/gate6_browser.cjs

GitHub Actions runs these with all earlier Gates 1–5. Every seed, learned template, conditional source accuracy, signed-C metric and causal check is stored in [results/gate6_confirmation.json](../results/gate6_confirmation.json).
