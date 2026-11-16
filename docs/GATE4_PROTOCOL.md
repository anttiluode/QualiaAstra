# Gate 4 protocol — Does residual-aware wiring beat delayed similarity?

16 November 2026. Gate 4 is **a new experiment**, not a redefinition of the already completed Gate 3. This document is committed before the independent-seed confirmation run.

## Question and explicit competing predictions

Can a system with no supplied A→B→C connections learn a two-edge predictive route from fully observed training waveforms, then reconstruct B and C at test when only A is available?

**Hypothesis H1:** delayed, cost-limited predictive learning can discover the route and improve remote predictions over a dead/disconnected baseline.

**Stronger, unproven hypothesis H2:** conditioning each new connection on the remaining prediction *residue* should beat the best delay-aware similarity/correlation controls. The five development seeds 4001..4005 already show a **tie**; a null result for H2 must be reported as such.

## Synthetic data and candidate wiring

Four named observable channels A, B, C and independent distractor D; 26 ticks. Signed damped oscillatory events are generated with A at tick 2, B at 7, C at 12 and distractor D at 7. B depends on A plus fresh innovation, C depends on B plus fresh innovation; D is independent. The latent coefficients and true source identities used to generate this world are **not supplied to wiring learners**.

Every directed source/destination pair except self has candidate conduction delays 1..12 ticks (12 directed pairs x 12 delays = **144 candidate cable routes**), including the shorter true two-hop route and the longer A→C shortcut. No topology mask, allowed-source list, or correct-delay index is passed to the learners.

Each candidate line applies the same explicitly **engineered** 3-tap causal filter (0.72, 0.20, 0.08) after its delay. This is only a damped-line *analogy*, not a physical cable solution. Each learner has the same **two-edge budget**. All selected methods receive matched least-squares signed-weight fitting; no one method gets an oracle weight.

## Five policies

- **Residual-aware:** greedily add the edge that reduces remaining destination prediction error, then jointly refit weights against that residual after each addition.
- **Signed delayed correlation:** rank exactly the same delay candidates by their signed squared correlation with each destination, without conditioning subsequent selection on already-chosen edges. Fit weights identically.
- **Unsigned coactivity:** rank the same delay candidates by magnitude coactivity, regardless of signal polarity; fit weights identically.
- **Oracle anatomy:** supply the two true links A→B and B→C, each at delay 5, then fit weights on the **same** training cases.
- **Disconnected/dead output:** no predictive edges. Evaluation reports its true B/C waveform error and the defined residue-threshold proxy; optionally forcing an output spike counter to zero is explicitly not a prediction success.

There is **no deliberately handicapped zero-delay-only Hebbian comparator** in the primary table. All three learned policies have the same delay bank and wiring budget.

## Training / evaluation and mechanism

Training sees the waveforms at all four channels. At test, only the entire A waveform is passed to the predictor; learned B must generate a held internal prediction that can be read to predict C. The model propagates **predicted state**, not the missing B's residual; hence a successfully predicted B can still inform C.

The externally scored residual is `world - predicted`. A thresholded-residual **spike proxy** is recorded as an interpretive secondary metric, not a simulated FadingHistorySpikeNode. Silence with disconnected inputs is not counted as success when prediction error remains high. The primary metric is relative B+C squared error divided by the zero-prediction error.

## Predeclared independent-seed check

Training seeds **740001..740012**, 160 episodes per seed; disjoint evaluation seeds **840001..840012**, 256 episodes each. No hyperparameters will be tuned on these seeds.

- Engineering capability is supported if ≥10/12 residual-aware learners select both true edge *pairs* (order immaterial) at delay 5 and obtain relative B+C MSE < 0.60 on held-out A-only replay.
- Report the mean and median relative errors for every policy, edge identities and delays for all 12 seeds, and the residual spike proxy.
- H2 counts as supported only if residual learning beats **both** delay-aware signed correlation and unsigned coactivity by at least 0.05 relative MSE in ≥10/12 seeds. If they tie, report **no demonstrated residual-specific advantage**.
- Oracle is a structural upper-bound reference under the same training and observation constraints, not a Bayes oracle.
- All-zero output should have relative error 1.0; cutting B→C in an otherwise learned chain should block the C prediction while preserving B.

## Boundaries

The channel identities, event generation, wave kernel, fixed delays, 3-tap cable, source times, access to all training waveforms, and model class are engineered. Learning occurs on observed full waveforms; test uses only A. Candidate routes are selected by global training-set scores rather than literal individual axon growth and local molecular guidance. Signed weights do not implement neurotransmitter physics. A separate demonstration of **locally grown biological-like branches** would still be needed.

This test does not claim qualia, spontaneous discovery of hidden source identities, a new neuronal learning law, or that minimization of spike count is universally equivalent to minimizing prediction error.
