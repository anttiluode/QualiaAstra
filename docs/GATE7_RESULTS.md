# Gate 7 — Screen off the shortcut, but relay imagined B

**16 November 2026** · [Interactive viewer](../gate7.html) · [Protocol frozen before confirmation](GATE7_PROTOCOL.md) · [Full twelve-seed data](../results/gate7_confirmation.json) · [Source engine](../gate7_engine.js)

## Verdict: 7/7 registered checks in 12/12 populations

In Claude's [QualiaClaude/screen](https://github.com/anttiluode/QualiaClaude/tree/main/screen), a physically simulated wave-tip residual learner suppressed a redundant direct A→C axon when real B was present; its A-only C prediction subsequently vanished because the real B was no longer present.

Gate 7 takes the computational next step: **screen off A's direct C influence when real B exists during training, but use an internally reconstructed B when B is missing at test**. Gate 6's calibrated noisy waveform-source likelihood supplies a soft estimate of whether a B-like report is real or replayed, without a per-test source Boolean.

Crucially, this is **NOT Claude's wave engine wired to Gate 6**. It is a Bayesian/linear statistical surrogate with known A/B/C variables, known factor graph, complete observed training examples, conditional regression, and deliberately engineered waveform signatures. Its main value is validating an information architecture and the controls needed for a future physical experiment.

## Frozen twelve-population result

Training seeds 770001–770012, each 512 fully observed ABC episodes plus 320 known-stimulus source-wave probes per class in Gate 6 calibration. Separate test seeds 870001–870012, each 4096 held-out events. In total 12 independent trained models and 49,152 hidden-C test events.

Let x=E[A B], y=E[B C] and z=E[A C] over training events.

- **Residual / joint regression:** direct A weight w_A=(z−xy)/(1−x²), B weight w_B=y−xw_A.
- **Independent similarity / one-input fits:** w_A=z, w_B=y.

The standard joint ordinary least-squares (OLS) solution is **mathematically identical** to the conditional residual fit. Nothing in Gate 7 is a new regression algorithm or proof of a special biological learning process.

| Direct A→C influence metric | Residual / joint fit | Independent similarity fit |
|---|---:|---:|
| Median absolute learned weight | **0.0247** | **0.4961** |
| Residual/similarity ratio | **0.0497** | 1 |

The residual shortcut is near, not exactly, zero because each training population has finite data.

### Held-out C prediction score

Relative squared error on hidden signed C, with zero prediction = 1; lower is better.

| Comparator | Median error |
|---|---:|
| Exact source-aware Bayes with true transitions | **0.72519** |
| **Residual + imagined B + waveform-only source inference** | **0.72603** |
| Residual + oracle source identity (learned weights) | 0.72537 |
| Standard joint OLS + the same B relay | 0.72603 |
| Residual + Bayes-optimal no-wave source uncertainty | 0.73075 |
| Similarity, globally refitted amplitude gain | 0.73727 |
| A-only univariate shortcut | 0.75886 |
| Residual, with the imagined-B branch removed by inferred source probability | 0.83717 |
| Independent similarity + the same imagined-B relay | **0.95385** |
| Residual with source-specific waves swapped at test | 0.74043 |
| Residual with equalized source waveforms | 0.73098 |

**Important fairness context:** the uncalibrated similarity policy deliberately fits each source independently and sums both predictions. Thus its error is driven partly by uncorrected amplitude overshoot. A fair one-parameter global gain correction improves it greatly, to 0.737, and a fully conditioned regression exactly matches residual. Our result distinguishes **one-input-at-a-time uncorrected correlations** from conditional estimation; it does **not** show every Hebbian learning family is inferior.

The no-relay ablation similarly deliberately removes the B prediction that residual learning has made essential, so it performs especially poorly. The A-only shortcut is a stronger conventional baseline (0.759) and must be reported alongside the no-relay condition.

### Registered controls

| Condition | Passing independent populations |
|---|---:|
| Screen A direct weight but retain it for independent similarity | 12/12 |
| Restoring imagined B reduces replay-only error ≥0.06 vs no relay | 12/12 |
| Residual+relay reduces overall error ≥0.15 vs independent similarity | 12/12 |
| Physical waveform improves error ≥0.001 vs optimal no-wave inference | 12/12 |
| Swapping physical source signatures worsens error ≥0.006 | 12/12 |
| Equalizing source signatures returns within 0.004 of no-wave baseline | 12/12 |
| Held B state, downstream cut, contradictory-real-B reversal, hidden truth/source poisoning controls | 12/12 |

The thresholds were selected after exploratory development on seeds 17001–17006. The twelve confirmation populations were not inspected before the protocol was committed.

## Why the handoff matters

**During training:** B is real. Because the world is a Markov chain A→B→C, B screens off A. The joint regression suppresses a separate direct A→C prediction instead of reinforcing the same correlation twice.

**During an A-alone test:** the source detector sees a B-like packet with a slow replay waveform. Its Bayesian update does not treat this as new sensory evidence. Nonetheless its internal B state stays at E[B|A], approximately 0.7A. C then reads the held prediction with learned w_B≈0.7, yielding approximately 0.49A even though the direct A coefficient is near zero.

**When a real B event contradicts A:** the fast-path waveform raises the inferred probability of genuine observation. B's state is revised according to the reliability of the real report, and C can reverse sign. An A-only direct shortcut cannot do that.

**Cutting B→C:** only the weighted B contribution is removed. The B expectation is retained; any small direct A→C coefficient also remains. No readout is artificially forced to exactly zero.

**Source control:** Poisoning the physical decoder's test input with an explicit provenance field or ground-truth B/C does not alter outputs. The clearly labeled source oracle alone uses the generating source after scoring. Equalizing waveform shapes destroys the extra source information; swapping their meaning after calibration harms prediction.

## What this DOES NOT establish

- There are no simulated growing axons, physically shared wave-tip dendrites, somatic thresholds, synaptic homeostasis or physical FadingHistorySpikeNode clocks in this Gate 7 engine.
- B and A are already known candidate predictors; the Markov chain, correct Bayes formula and whole-world calibration targets are supplied. Global regression is not a strictly local rule.
- Source-signature inference is trained from stimulated pathways of *known source*. A biological axonal spike does not necessarily retain a reliable apical/basal source label.
- A self-generated echo might still be retransmitted many times; a waveform likelihood alone does not track whether several pings represent one event.
- Predictive success is not evidence of subjective experience (qualia).

## Best next experiment

Build the same three-way handoff in the **actual physical QualiaClaude clock-and-wave engine**: retain the learned screen-off C weights, add the imagined A→B relay, protect fading A clocks, and keep prediction separate from new evidence. Then test whether A-only restores the correct C waveform without physically introducing hidden B, whether a genuine contradictory B reverses C, and whether the same B echo repeated eight times spuriously re-triggers learning. Include a conventional delayed linear filter with equivalent resource budget, phase/clock-reset controls, and source-pathway swaps.

That experiment is **proposed**, not performed here.

To reproduce Gate 7, run the numerical, confirmation and offline browser tests:

    node tests/gate7.cjs
    node tests/gate7_confirm.cjs
    NODE_PATH=/tmp/qualia-ui/node_modules node tests/gate7_browser.cjs

The complete per-seed receipt includes conditional REPLAY, ACTUAL and contradictory REAL B cases in [results/gate7_confirmation.json](../results/gate7_confirmation.json).
