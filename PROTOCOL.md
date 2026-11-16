# Gate 1 — One clue, a shared revision

Fixed before the confirmation run, 16 November 2026. Author: OpenAI assistant,
for Antti Luode. QualiaAstra is the chosen project name, not a consciousness claim.

## Question and scope

Can evidence reaching one local unit change the predictions of other units in a
way that is accurate about withheld observations, because the units exchange
messages about a common hidden world? Can causal interventions distinguish that
from independent predictors whose outputs merely add together?

This is an engineered, learned-likelihood Bayesian mechanism check. It is NOT a
PerceptionLab wave-node port, a biological network, a discovery of consciousness,
or a new inference algorithm. The comparison with exact enumeration is expected
to TIE. What is tested is causal coordination, uncertainty and evidence routing.

## World and observations

Three hidden source signs A,B,C in {-1,+1} are sampled uniformly: eight worlds.
Each source drives its own decaying sinusoidal trace (64 samples). The combined
world is their sum. Sensor pair observations give AB and BC plus Gaussian noise
(SD 0.30); these can be constructed as an interferometric intensity difference:
((a+b)^2-(a-b)^2)/4 = ab. This deliberately supplied nonlinear sensor reveals
relative signs but cannot distinguish a world from its global sign reversal.

Initially there is NO signed local observation. Later one noisy observation of A
(SD 0.65) arrives. B and C traces, and the total waveform, are withheld at test.
All eight worlds, source identities, factor topology and sign alphabet are
supplied. No hidden-state discovery is claimed. Training observes labelled
source states and full noisy traces; "withheld" means unavailable at test, not
never observed during training.

## Learning and inference

Per training seed use 256 balanced examples (32 per world). Fit the three
waveform templates by least squares from signed source states to noisy combined
traces (sample noise SD 0.10). Fit relation sensor means/SD and A-sensor means/SD
from labelled calibration observations. Pool each positive/negative class with
its sign-reflected counterpart to impose known global sign symmetry explicitly.
No fitting on confirmation observations. Freeze all learned parameters.

Three binary belief units exchange ordinary sum-product messages along A-B-C.
Two synchronous rounds are sufficient. Messages to a neighbour exclude that
neighbour's incoming message (no double counting). Compare marginals against
independent enumeration of all eight worlds with the same learned likelihoods.
Mean prediction is the waveform template weighted by each source's expected
sign. Keep the joint posterior too: a zero mean under ambiguity is NOT a claim
that the world is silent. Posterior sample/alternative predictions stay visible.

## Controls, same training and test cases

1. Shared messages, intact learned relationships.
2. Disconnected units, no relation messages; same local clue and templates.
3. Cut A-B only; B and C cannot receive the signed clue.
4. Shuffled relation readings across test trials (same marginal distribution).
5. Exact joint Bayesian enumeration, same learned model and observations.
6. Sensor/world oracle (true signs), upper bound for decoder error, labelled.

Meaning-by-intervention: freeze observations and parameters, replace the A->B
message with uniform probability or with its two states reversed, then rerun
downstream messages. Compare B/C waveform predictions. Separately remove A's
wave contribution from the final sum WITHOUT reinference. These are different
operations: causal message influence versus additive output attribution.
An intervention may inject wrong evidence; a changed prediction is not proof
that it is more accurate. Do not call a timer's fixed-firing linear contribution
its full closed-loop causal effect.

## Confirmation, metrics and fixed gates

Development seeds 1,2 only. Confirmation training seeds 1001..1012; each has a
separate test seed 100001+training_seed with 512 balanced random-order cases.
Report each seed, aggregate means and paired bootstrap 95% intervals over the
12 independent training/test worlds (10,000 bootstrap draws, RNG 7301).

Primary error: average squared error of B and C reconstructed traces divided
by their true average squared trace energy (zero prediction = 1). Also report
total-wave NRMSE, eight-world MAP accuracy, source-sign accuracy, posterior
entropy and log score. Source signs near probability 0.5 are unresolved; never
silently treat an arbitrary argmax tie as a correct inference.

Gate A: no clue gives exactly 0.5 marginals (within 1e-10) and equal probability
to globally inverted worlds; no arbitrary certainty from identical evidence.
Gate B: shared remote error is at least 40% lower than disconnected AND shuffled
controls on the aggregate; paired seed bootstrap lower bounds for both error
differences exceed zero. Cut A-B leaves zero remote update within 1e-10.
Gate C: distributed versus exact marginal maximum error <1e-10; exact model is
the mandatory strong baseline, and a tie is expected rather than concealed.
Gate D: reversing the A->B message reverses both downstream expected signs
within 1e-10, without altering A's belief; suppressing that message removes
remote signed prediction. Removing only A's rendered contribution changes
neither B nor C's predictions. This gate tests causal role, not subjective meaning.

All gates are required for the limited claim "coherent shared revision works in
this constructed task." No threshold establishes qualia, intrinsic meaning,
open-ended generalization, embodied utility or an advantage over Bayes.

## Failure interpretation

Failure rejects this implementation or threshold on this task, not predictive
processing or a theory of experience. Passing remains a small known-answer
construction. Strong dependencies (supplied variables/topology, labelled
calibration, clean observation channels, limited eight-world catalogue) are
part of the result. New causes, ambiguous contexts and loops remain untested.
Unexpected/model-mismatched evidence can cause confident errors; certainty is
conditional on the supplied model. No benchmark result may be used to retune
this gate without a separately labelled follow-up.
