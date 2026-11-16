# Gate 7 preregistration — screen off A, but keep an imagined B available

16 November 2026. **This file is committed before evaluating independent 12-seed confirmation cases.** Exploration used model seeds 17001..17006 and separate test seeds offset by +10000. The criteria below were selected with those development results in view; don't treat them as unconditional preregistration of a novel physiological law.

## Motivation and precise question

Claude's [QualiaClaude/screen/](https://github.com/anttiluode/QualiaClaude/tree/main/screen) confirmed that with **real B available** during learning in a Markov chain A→B→C, a shared residual-driven branch nearly eliminates a redundant direct A→C prediction (A share ~0.011), whereas a correlation/similarity rule retains it (~0.445). However, after screening-off, Claude's physical screen body predicts very little of C with A alone because its B units listen to **real** B, not an imagined B. Its earlier chain/ body generated imagined B, but without screening-off it did not have this property.

Gate 7 joins these *algorithmic* mechanisms in a deliberately clean signed Markov task: learn two possible C predictors (real B and A) from training observations, screen out redundant A, then at test substitute an **internally predicted B** where no actual B has been observed. That B state reaches C without being mistaken for independent evidence, using the **Gate 6 waveform-derived source likelihood** instead of a digital origin tag.

This is NOT a port of Claude's physical FadingHistorySpikeNode/DampingReturnNode wave engine. Our body still uses engineered Markov inference, batch regression and waveform source templates. The purpose is to identify the needed information flow and failure conditions before attempting a literal physical-node integration.

## World and calibration

A,B,C are ±1 with A uniform, P(B=A)=.85 and P(C=B)=.85. Every training model observes 512 fully observed A/B/C episodes and estimates these moments directly:

- x=E[A B], y=E[B C], z=E[A C].
- **Conditional residual learner**: choose B as first predictor of C, then explain only C's residual by A; mathematically compute the joint two-variable least-squares solution
  w_A=(z−x*y)/(1−x²), w_B=y−x*w_A.
  This is the conventional normal-equations answer; it is an engineered **conditional least-squares / orthogonal-matching-pursuit analogue**, NOT an actual growing dendritic network.
- **Similarity learner**: both candidate axons independently fit C: w_A=z, w_B=y. Delays, signs, observations and all per-trial sensing are matched; it is not denied B's reliable input.
- **Independent global OLS**: duplicate the normal-equations solution as an algebraic equivalence control. We do not claim matching pursuit is superior to proper joint regression.
- **Gain-calibrated similarity**: multiply both similarity weights by one globally fitted gain that reduces training MSE on real A/B; checks whether simple gain compensation removes double counting.

In a second calibration, use Gate 6's 320 independently stimulated known-source waveform probes per source to learn 48-sample REAL-versus-REPLAY templates, and another 512 observed signed Markov trials to calibrate its A→B expectation. Calibration explicitly knows the stimulated pathway; **at test the receiver receives no origin/source flag**.

## Test and replay mechanics

Every held-out test world contains A, B, C, an observed signed message z, an apparent sensor reliability p and a physically sourced noisy 48-sample waveform. In the ACTUAL condition z is an independent noisy observation of B, in REPLAY z=A is an internally generated prediction, providing **zero independent evidence about B**. The simulator uses true origin only to generate the physical waveform and to score.

The physical receiver sees **only A, z, p and waveform**, estimates the probability the input was REAL and retains an internal B expectation:

    m_prior = rho_AB * A
    m_real = (m_prior + (2p−1)*z) / (1 + m_prior*(2p−1)*z)
    m_B = P(real | A,z,p,wave)*m_real + P(replay | ...)*m_prior

Then each C learner applies **its learned** weights:

    C_pred = w_B * m_B + w_A * A

Thus the residual learner can use the imagined B even while w_A≈0. It receives no true B at test. In a B→C cut, the direct A contribution remains (near zero for correctly screened models); C is not forced to exactly zero by an artificial target reset. This is an actual message removal in the engineered computation.

## Fair comparators and interventions

1. **Residual + inferred physical provenance + imagined-B relay** (primary).
2. **Similarity + identical physical provenance and imagined-B relay**; the only difference is learned C weights.
3. **Gain-calibrated similarity**; same two weights but a fitted global scale to control amplitude overshoot.
4. **Residual + no imagined-B relay**: the receiver can still estimate source probability from the waveform and use a *genuine* B update, but sets the *replayed predicted B* contribution to zero. Implement as P(real)*m_real + P(replay)*0, using the **learned soft source probability**, NOT hidden test provenance or a perfect missingness signal.
5. **Residual + optimal wave-blind B state**: no source waveform (Bayes-optimal given A,z,p and its learnt transitions).
6. **Residual + known-source oracle**: use true provenance **only in retrospective scoring**, with the same learned residual C weights.
7. **Exact Markov Bayes oracle**: true 0.70 transition correlations and known provenance, only for a lower bound on achievable C error.
8. **Source-swapped cable wave**: same learned residual weights and physical decoder, waveform origin templates exchanged at test.
9. **Source-equalized cable waves**: one shared waveform family for the two sources, with its OWN known-source calibration, testing if origin information disappears.
10. **Direct A-only shortcut**: univariate w_A=E[A C] used with A alone, a relevant baseline showing the price and role of the imagined B.

All models predict the SAME signed hidden C and are evaluated on the SAME cases; source-specific nuisance in the swapped/equalized conditions is matched to the ordinary waveform. No model gets C or B truth at inference; only retrospective oracle controls use the source identity. We will also report MSE separately for ACTUAL, REPLAY, and contradictory-real-B reports (z opposite A).

## Independent confirmation

Twelve population seeds **770001–770012**; each fits conditional/similarity weights from 512 full A/B/C episodes and calibrates Gate 6 source-wave templates using 320 isolated stimulus probes per class. Test seeds **870001–870012**, 4096 new hidden-world episodes each. Do not tune after running any of these.

Registered pass criteria:
1. **Screening-off learned**: |w_A(residual)|≤.15 and |w_A(similarity)|≥.35 in ≥10/12; the median residual |w_A| must be <1/3 of similarity.
2. **Restored absent-B prediction**: on REPLAY episodes, residual+relay has signed-C MSE at least **.06 below residual+no-relay** in ≥10/12.
3. **Redundant shortcut damages inference**: residual+relay MSE at least **.15 lower than uncalibrated similarity+relay** in ≥10/12. ALSO report globally gain-calibrated similarity, regardless of outcome.
4. **Source waveform matters**: residual+physical-wave MSE at least **.001** below residual+optimal wave-blind inference in ≥10/12; swapped signatures worsen by **.006** in ≥10/12; equalized signatures stay within **.004** of wave-blind baseline in ≥10/12.
5. **Causal mechanism controls**: all 12 models must have a nonzero held B state and near-zero A shortcut; B→C removal must preserve B and remove precisely w_B*m_B from C, and test B/C or provenance poisoning must not affect the live physical receiver. A strong contradictory REAL B observation (A=+1, z=−1, p=.95) must reverse the residual C prediction, while a normal replay of A=+1 must predict positive C.

A gate "PASS" requires every criterion including the grouped waveform controls; scientific failures will remain visible in the receipt.

## Claims we cannot make

This task **assumes and supplies** the causal variable identities, directed Markov factorization, correct likelihood equation, privileged first B candidate, future targets during training and a supervised known-source physical calibration. Our regression uses GLOBAL sufficient statistics, not local chemical growth. It is a clean architecture/identifiability demonstration, **not** spontaneous attentional wiring, dendritic biophysics, consciousness, or an empirical theory of what the apical/basal compartments do.

Claude's wave-clock results are not reproduced here. Event identity remains open: seeing eight replay waves with the same waveform is not equivalent to knowing they are one event. After successful integration, the next informative gate is repeated-event identity at matched waveform quality and cost.
