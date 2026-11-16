# QualiaAstra Gate 3 — Label-free predictive calibration: frozen confirmation protocol

Written **16 November 2026**, before the twelve-seed confirmation run. Gate 3 follows Astra's original NEXT.md roadmap and Gemini's proposal to replace explicit sign/relation calibration teachers with delayed sensory prediction error.

## Research question

Can a small **fixed-architecture** learner derive useful two-state representations of two raw interference sensors **without being given source signs or relation products during calibration**, and use only later observed B/C waveforms as local prediction-error targets to predict those waveforms when withheld in a new trial?

This is **self-supervised predictive training**, *not* unsupervised causal factor discovery. Observed future waveforms are real training targets, not test inputs. Geometry (A/B sensor, B/C sensor), order, bottleneck size K=2, branch connectivity, source roles and the functional form of chaining are supplied.

## Model frozen for confirmation

- Reuse Gate 2's deterministic world generator `Gate2.newCase` without changing its source, waveform, sample clock or noise.
- Gate 3 learner is shown ONLY `{raw, clue, future}` during training; original `signs` and `relation` fields are discarded. The future B/C waveforms are available after the prediction, mimicking delayed observations of the world.
- Each raw 48-sample sensor gets an independently learned two-prototype Euclidean K-means representation. The two cluster labels are arbitrary; no ground-truth label alignment occurs.
- The sign-like latent for each sensor is a smooth distance-difference readout. A fixed `tanh(clue)` input triggers the chain. Two-step products form internal B and C states. Two 48-sample predictive templates are learned from **local future-minus-prediction waveform errors**, using incremental normalized delta updates.
- At test only raw sensor traces and the clue enter `infer`. Test B/C waveforms and source signs are *evaluation-only*. No source labels from either training or test may be used by Gate 3's learner.
- The supervised Gate 2 model is re-fit separately using source labels as a **reference control**, not part of Gate 3 inference.

## Controls and metrics

The primary metric is **total squared error on both withheld B/C waveforms divided by zero-prediction squared error** on the same trial set (lower better). Since latent cluster labels can flip, we do **not** grade internal signs as though they were semantically named.

Controls:
1. **Cut A→B:** no B/C expectation; should return baseline error 1.
2. **Cut B→C:** B remains, C vanishes.
3. **Shuffle raw sensor pairs at test:** breaks case-specific relational evidence.
4. **Mispaired future targets during training:** fit otherwise identical learner with its delayed B/C recordings cyclically reassigned to different episodes. Tests whether predictive outcome alignment matters.
5. **Labelled Gate 2 control:** the previously implemented supervised Gaussian observation model trained with the same seed/sample budget.
6. **No clue:** global-sign ambiguity requires zero mean predictions. Reverse A→B flips both downstream waveforms and leaves A unchanged. Withheld target corruption must not change `infer`.

## Confirmation design, recorded in advance

Twelve independently trained populations:
- Calibration seeds `700101, 700102, ... 700112`; 256 trials per seed.
- Testing seeds `880101, 880102, ... 880112`; 512 cases per seed, separate from calibration.
- No hyperparameter or result-selection changes once these seeds are evaluated.

**Gate passes only if ALL hold:**
1. At least 10/12 systems yield learned relative waveform MSE **< 0.80**.
2. At least 10/12 have sensor-shuffled MSE at least **0.20 higher** than learned.
3. At least 10/12 have mispaired-future-training MSE at least **0.20 higher** than learned.
4. At least 10/12 are **within 0.10 absolute relative MSE** of the supervised Gate 2 baseline.
5. Cut A→B gives exactly zero remote prediction and no-clue gives zero remote prediction for all checked trials; reversing A→B flips B/C while leaving A unchanged.

Report all twelve paired measurements, medians, per-gate pass counts, and failures without selecting favorable seeds. The threshold values and architecture are *engineered development choices* based on earlier dev work; only the **new confirmation seeds** are held out from this protocol.

## Important limits

Even a pass does not establish neurons, dendrites, top-down feedback, automatically discovered source identities, qualia or biological predictive coding. It establishes only an **unlabelled-prototype / sensory-error** path to a predictive representation in the engineered Gate 2 world. The decoder, causal chain and K=2 bottlenecks are supplied, and an otherwise standard Gaussian supervised baseline is expected to match. The 'two fields' are separate model prediction vectors and observed future vectors, not interacting physical PDE fields. Learning uses future observations; this is not training with no target signal at all.

Original Gate 1 receipts and Gate 2 algorithms remain untouched.
