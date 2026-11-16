# Gate 4 — Learn the wiring, but don't claim a residual-rule advantage

**16 November 2026** · [Interactive lab](../gate4.html) · [Precommitted protocol](GATE4_PROTOCOL.md) · [Full 12-seed receipt](../results/gate4_confirmation.json) · [engine](../gate4_engine.js) · [tests](../tests/gate4.cjs)

## Verdict: H1 passes; H2 fails

**H1 (learn a useful delayed route without fixed links): PASS.** In twelve independently trained populations, the residual learner discovered **A→B and B→C**, each delayed five ticks, using just **two connections** selected from the candidate delay bank. A-only test replay produced nonzero internally predicted B, followed by an internally generated C. Cutting B→C preserved B and removed C.

**H2 (residual-based selection beats delay-aware correlation): FAIL.** With the same candidate delays, two-edge wiring budget, same observed training cases and same signed weight-fitting code, residual-greedy, delayed signed correlation, and unsigned coactivity selected **exactly the same two routes on all twelve seeds**. Their predictions tied the anatomy oracle to numerical precision. Thus this particular world is **not evidence for unique complementary-error wiring**, and Gemini's claim that correlation-based growth should fail is not supported here.

## Frozen confirmation

Protocol committed first at [GATE4_PROTOCOL.md](GATE4_PROTOCOL.md), using previously untested calibration seeds 740001..740012 (160 episodes each) and evaluation seeds 840001..840012 (256 episodes each). The engineering confirmation was then executed in GitHub Actions; [gate4_confirmation.json](../results/gate4_confirmation.json) includes the full per-seed models, routes, fitted signed weights, metrics and pass counts.

| Learning policy | Median B+C relative squared error ↓ | Routes selected |
|---|---:|---|
| **Residual-aware prediction-error growth** | **0.4641** | A→B, B→C |
| Signed delay-aware correlation | **0.4641** | A→B, B→C |
| Unsigned delayed coactivity | **0.4641** | A→B, B→C |
| Oracle correct route, fitted weights | **0.4641** | A→B, B→C |
| Disconnected / no predictive output | **1.0000** | None |

A median below 1.0 represents decreased waveform prediction error relative to zero prediction. The "oracle" knows the route and delay but still fits weights on the **same** limited noisy training examples—it is an anatomy oracle, not an exact Bayes oracle. The held-out test input includes only the A waveform; the B, C and distractor D world waveforms are hidden from the predictor.

| Precommitted check | Observed | Decision |
|---|---:|---|
| Correct two links/delays (minimum 10/12) | **12/12** | Pass |
| Relative error below 0.60 (minimum 10/12) | **12/12** | Pass |
| No predictive links produce zero-baseline error | **12/12** | Pass |
| Cutting B→C preserves B, zeroes C prediction | **12/12** | Pass |
| Residual beats both delayed comparison policies by ≥0.05 (minimum 10/12) | **0/12** | **Fail** |

No hyperparameters were tuned on the confirmation seeds, and an adverse comparison result was kept and published.

## What actually runs

The world is deliberately simple: four known observation channels A, B, C and unrelated D. Each trial contains noisy damped signed waveforms at fixed sites and times; B tends to follow A plus independent innovation, C follows B plus innovation, and D is a distractor.

Candidate wiring includes directed connections between all distinct nodes and delays 1 through 12 ticks. The simulation enumerates **144 physical candidate edges**; 36 predicting externally supplied source A are ineligible to receive budget because A is provided directly in test replay, so the learner chooses among **108 active candidate routes**. Both comparison learners use the same active choices and latency bank as the residual learner.

A candidate cable's output is an **engineered FIR damping approximation**:

~~~text
p_(i,d)(t) = 0.72*y_i(t-d) + 0.20*y_i(t-d-1) + 0.08*y_i(t-d-2)
~~~

The receiver's held state is its sum of weighted delayed predictions; the sensory residual, observed during training or scored during testing, is:

~~~text
held_j(t) = sum_i,d w_(ij,d) * p_(i,d)(t)
residue_j(t) = world_j(t) - held_j(t)
~~~

All learners get the **same signed least-squares weight refitting**. The distinction is only how links are selected: the residual method recomputes the remaining prediction error after each connection, signed Hebbian selection ranks unconditioned delayed signed correlation, and the coactivity learner ranks the magnitude of matched activity.

These are global, batch-scored connection proposals, *not* axons physically growing. The stable filter, fixed timestamps, known channel roles and an externally supplied candidate pool are engineering constraints.

## Why retained state matters

In test replay, real B and C input is absent. A selected A→B connection generates a predicted B waveform, and B→C reads **that predicted B state**, not B's real observation or its cancelled prediction error.

This is a concrete demonstration that a quiet soma-like residual need not erase a nonzero predictive state. A B→C cut keeps B's prediction and removes only C's. The experiment does not use an actual soma, dendrite, wave-carrying extracellular field or FadingHistorySpikeNode; it is a clean causal separation of internal prediction and residual.

A "surprise-spike" proxy counts \`|world-prediction| > 0.22\`. A disconnected output may transmit zero signals, but its physical prediction error remains at 1.0. **Spike suppression is not the same as successful predictive cancellation**, and minimizing transmitted spike count without an accuracy term can still produce a trivially inactive system.

## What we learned, and the honest next test

The system no longer receives A→B→C links: these are selected from an all-pairs delay bank and survive a strict edge budget. However, simple delay-aware correlations recover the same links, so a residual-specific mechanism has **not** been identified.

A useful next experiment must give the methods a reason to disagree: changing contexts, shared causes, competing redundant cues, local interventions, and changed training/test timing. In such settings, a rule that rewards **conditional reduction of future error** may or may not beat one that strengthens correlations. Register that contrast and include both causal and observational controls before new confirmation seeds.

Separate additional research questions remain: whether axons can learn this with **strictly local signals**, whether dendritic transfer kernels adapt instead of staying a fixed FIR, and whether a state-shaped ping adds information at matched transmission cost. None of the results say that neurons or experience work this way.

**Nothing here establishes qualia.**
