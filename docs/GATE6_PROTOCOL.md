# Gate 6 preregistration — untagged wave signatures and the evidence/echo distinction

**16 November 2026.** Committed before the twelve independent confirmation seeds were run. Six exploratory development seeds 17001–17006 (test seeds offset by 1000) informed the implementation and thresholds; they are NOT confirmation results.

**Question:** Can the receiver in Gate 5 recover evidence provenance from one raw wave trace instead of a per-message source boolean? If two sources produce identical waveforms, does performance collapse toward the Bayes-optimal no-tag baseline?

## The two simulated physical hypotheses

1. **Cable/pathway analogue:** a short, fast response for a genuine external B observation, and a longer, slower damped response for internally replayed B. The receiver sees only the resulting **single 48-sample waveform**, not the compartment or path ID.
2. **Spike-shape analogue:** subtly different synthetic upstroke and repolarization kinetics. This is NOT a biophysical action potential model and is not fitted to experimental data.

A combined condition uses a **normalized 60% cable + 40% spike-shape** impulse. Clean source responses have the same Euclidean energy, and both sources have the same amplitude nuisance, random jitter of −1/0/+1 sample, and Gaussian noise. A shared sign z can be + or −, and the decoder must not use sign or energy differences as shortcuts.

**Important:** The simulator engineers source-dependent waveform signatures; that makes source statistically identifiable. An actual regenerated axonal action potential may not preserve its dendritic origin. Nor is biological feedforward always basal and feedback always apical. Martin-Burgos et al., *Action potential waveforms are state-dependent* (bioRxiv 2026, https://doi.org/10.64898/2026.09.15.751814 ) supports state-dependent waveform variation, not proof of a general sensory-versus-imagined physical origin code.

## Calibration and inference

Reuse Gate 5's signed Markov world: A is equiprobable ±1; B copies A with probability .85; C copies B with probability .85. From **512 fully observed A/B/C calibration episodes** estimate the signed correlations rho_AB and rho_BC. The chain topology, reliability parameter p, and correct Bayesian update algebra remain PROVIDED.

Next, stimulate each known isolated pathway in a controlled calibration session, with **320 waveform samples from ACTUAL and 320 from REPLAY per waveform condition**. The calibration source is therefore known. Learn balanced class templates and a projected shared variance; the decoder converts a 48-sample waveform into a physical source likelihood ratio. This is a CALIBRATION TEACHER, not spontaneous biological origin discovery.

At **test inference**, the physical decoder receives only {A, z, p, trace}, not provenance, hidden true B/C, or path identity. The truth is used exclusively to synthesize the trace and score held-out predictions. For comparison only, the upper-bound oracle receives ground-truth provenance after inference.

Given prior m=rho_AB*A and likelihood reliability k=2p−1, a true observation z yields m_actual=(m+k*z)/(1+m*k*z). A replay z=A gives no evidence, leaving m_replay=m. Bayes combines the learned waveform likelihood with the expected probabilities of a real versus replay report. The resulting soft posterior over physical origin mixes m_actual and m_replay into a held B expectation and propagates it through rho_BC to C.

When z≠A, REPLAY is impossible in this intentionally simple generator. Thus overall provenance classification is artificially easy; report **classification accuracy restricted to ambiguous z=A events** as the important check.

## Matched conditions

Use identical latent test cases, matched random nuisance and learned transition parameters for all conditions:

- Cable waveform source decoder.
- Synthetic spike-shape source decoder.
- 60% cable / 40% spike combined source decoder.
- **Equalized shape:** both sources generate EXACTLY the same waveform family. Recalibrate the decoder for this null control; there must be no source evidence.
- **Energy-only:** an identically trained decoder observing only total trace squared energy from the normal cable condition; checks for amplitude leakage.
- **Swap:** train on the normal cable signatures but reverse external/replay physical signature assignments at test; causal ablation.
- **Optimal origin-blind baseline:** use only A,z,p and the proper 50:50 mixture prior; no waveform source information.
- **Ground-truth provenance oracle:** source identity supplied as an upper bound in scoring, NOT a live input to the physical decoder.
- **Naive:** treat every B-like report as real, included for context.

Signed C relative squared error, normalized to zero-prediction error=1, is the **primary task metric**. C waveform visualizations are secondary synthetic overlays, NOT the primary measure.

## Frozen confirmation seeds and thresholds

Twelve separate calibration seeds **760001..760012**; each supplies 512 fully observed Markov calibration examples and 320 known-source calibration waveform probes PER CLASS per waveform condition. Twelve disjoint held-out test seeds **860001..860012**, 4096 cases each. No hyperparameters adjusted on these seeds.

The complete gate PASS requires all six registered checks:
1. Cable prediction error lower than the optimal origin-blind baseline by **≥ .0015** in **≥10/12** independent populations.
2. Cable prediction error lower than calibrated energy-only by **≥ .0015** in **≥10/12**.
3. Equalized physical waveform error within **.004** of origin-blind baseline in **≥10/12**.
4. Swapping cable source signatures after training makes error at least **.006** WORSE than the intact cable in **≥10/12**.
5. The independent spike-shape analog distinguishes real from replay by **≥63% classification accuracy** on ambiguous z=A trials alone in **≥10/12**. This is NOT a preregistered claim that its signed-C error improves.
6. Twelve of twelve models pass numerical mechanism checks: no source/ground-truth input leakage at test, physical waveform changes the posterior, B state preserved through a B→C cut, valid probabilities, and retained expected state on replay.

Report all conditions' medians, ambiguous-case classification accuracy and C scores, individual failures and seed counts. A negative result must be kept and published, not disguised by weaker controls.

## An unresolved repeat problem

A source-correlated waveform is a probabilistic cue, not a guaranteed origin label. A system may still count eight separate copies of the **same replay** as independent evidence, even if each copy looks apical. Preventing that requires event identity, refractory timing, contextual routing, or a further causal rule. Gate 6 does NOT claim to have solved replay-copy suppression or a physical neuron model; it isolates the value and fragility of waveform-derived provenance.

To reproduce: node tests/gate6.cjs, node tests/gate6_confirm.cjs, and the offline browser tests. Frozen receipt will be saved to results/gate6_confirmation.json.
