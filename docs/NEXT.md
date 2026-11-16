# Next gate: make the representation earn its place

The current gate intentionally supplies variables, a relationship sensor, a
factor graph and the inference rule. Its result is a target behaviour and a
control instrument for the wave-body line, not a substitute for that line.

The most informative next experiment would hide the AB/BC products. Give the
system only partial raw sensor traces; learn an observation model using separate
calibration data, then ask whether one later local observation changes predictions
at sensors withheld during that trial. Keep an exact or strong conventional
inference baseline. Do not silently give the learner source identities, test
labels, clean world-only traces or a global clock.

Separate three questions in separate gates:

1. **Representation:** can local units obtain the relational evidence from raw
   observations? Score withheld-sensor predictions, not hidden-label decoding alone.
2. **Coordination:** do those units revise mutually dependent predictions when
   evidence changes? Cut messages, freeze recipient state, and separately remove
   rendered summands. Include actual new evidence versus self-generated replay.
3. **Communication:** once the same inference task works, do state-shaped packets
   improve it at matched bandwidth, timing, noise, memory and drive costs?

Adding all three together would obscure why a result changed. A packet-shape
benefit is not required for shared prediction, and a shared prediction is not
sufficient evidence of phenomenal experience. Contexts identical under all allowed
observations must remain ambiguous; no implementation can infer absent evidence.

For the existing damping bodies, distinguish a fixed-time linear contribution
map from causal removal: a timer's intervention can change other firing times.
The wave field may be linear conditional on events while the event-generating
closed loop is not. A learned prediction and its residual should also be measured
separately; low residual need not mean low representational activity.

## Progress note — 16 November 2026

The first, deliberately narrow part of the representation gate now has an offline
[Gate 2 development lab](../gate2.html) and [technical report](GATE2.md): relation
likelihoods are estimated from raw noisy interference traces, and predictions
are evaluated on withheld B/C sensor recordings. The independent test case uses
separate seeded trials. **Calibration still has supervised relation labels** and
the three-node topology is supplied. The harder unsupervised factor discovery
and mutual-consensus/feedback questions above remain unanswered.

The new lab is not a preregistered scientific confirmation. Gate 1's numerical
receipt, protocol and original results are unchanged.

## Gate 3 completed: removing source-sign labels (16 November 2026)

[Gate 3's live viewer](../gate3.html), [registered protocol](GATE3_PROTOCOL.md),
[scientific write-up](GATE3_RESULTS.md) and [12-seed receipt](../results/gate3_confirmation.json)
are published. Two-state raw-sensor prototypes learned without labels, while
later observed B/C waveforms drove local predictive-error learning. Median
relative withheld-wave MSE was 0.577 versus 0.572 for Gate 2 with sign labels;
all five predeclared engineering gates passed across twelve independent training
populations. The **K=2 latent size, topology, order and propagation algebra are
still supplied**. No physical wave propagation or dendrite is implemented.

Still open: learn graph topology and causal factors with no fixed A→B→C wiring;
make recipient populations mutually revise one another through recurrent
prediction/error exchanges; then isolate any benefit of state-shaped pings at
matched signal/energy budget, without treating predictive success as qualia.

## Gate 4 completed: wiring selection, without a residual-specific advantage

[Gate 4 interactive demo](../gate4.html) · [Protocol](GATE4_PROTOCOL.md) ·
[Report](GATE4_RESULTS.md) · [Full confirmation](../results/gate4_confirmation.json).

A deliberately narrow topology-learning test allowed a two-edge budget over
all-to-all candidate delayed links in a synthetic A/B/C/D world. All 12 held-out
populations learned A→B→C with both five-tick delays and reconstructed hidden B/C
waves at median relative error 0.464 versus disconnected error 1.0. Crucially,
**delay-aware signed Hebbian correlation and unsigned coactivity did exactly
as well**: the extra claim that residual-aware selection is uniquely beneficial
was **not supported (0/12)**. This is a useful negative result, not a defect to
hide by weakening the controls.

The next discriminating test should introduce interfering redundant causes,
interventions and shifting contexts, predeclaring what future-error learning adds
beyond delayed correlation. Physical cable adaptation, literal local axon
sprouting, continuous apical states and matched-cost state-shaped pings are still
open. Do not conflate absence of emitted spikes with absence of sensory error.

## Gate 5 completed: distinguish evidence from self-generated replay

[Live Gate 5 viewer](../gate5.html) · [Frozen protocol](GATE5_PROTOCOL.md) ·
[Results](GATE5_RESULTS.md) · [Full twelve-seed receipt](../results/gate5_confirmation.json).

A signed Markov A→B→C chain tests a new information-accounting issue. The
same signed B-like report can be real sensory evidence or internally generated
replay. Given an explicit trustworthy provenance flag, the learned model
correctly ignores self-replay as independent evidence while incorporating
genuine B readings. It reaches median relative C error 0.723 vs 0.727 for
a Bayes-optimal source-blind receiver, 0.732 for the naive replay counter and
0.722 for exact Bayes. All five precommitted checks passed over 12 independent
populations, though the naive margin reached only 11/12.

This is **not** a neural discovery: the model is provided the origin tag,
Markov chain and update algebra. The no-tag receiver is information limited,
not structurally inferior. The next important gate would remove the explicit
provenance bit and see whether segregated feedforward (world) and recurrent
(prediction) channels plus causal intervention can support reliable origin
attribution. If both conditions are observationally identical on *all*
available channels, nothing can distinguish them. Separately, Claude's
physical chain still has incomplete second-hop strength despite solving
clock resets; no result here makes that physical weakness disappear.

## Gate 6 completed: physical-source signatures, calibrated without a test tag

[Interactive Gate 6](../gate6.html) · [Frozen protocol](GATE6_PROTOCOL.md) ·
[Results with limits](GATE6_RESULTS.md) · [Complete 12-seed receipt](../results/gate6_confirmation.json).

A three-node Markov receiver now infers whether a signed B-like message came
from a genuine B observation or a model-generated replay by examining a
**synthetic 48-sample waveform**. It is **not given a provenance flag** with
the test packet. Nevertheless, source-specific physical waveform shapes
are built into the simulator and an isolated calibration procedure explicitly
indicates which pathway generated each known-source training pulse.

Across twelve independent trained/evaluated populations, all six registered
checks passed. Cable-shape C prediction error was 0.7337, compared to
0.7389 for an optimal receiver without waveform or source information and
0.7317 for the known-origin oracle. On trials where z=A, cable-based source
classification reached 93.5%; subtler state-dependent-spike-like shapes
yielded 68.2%. Matching source energies, equalizing their waveform shapes,
and swapping the shapes after calibration isolated the importance of the
source-specific response profile.

The gap is computationally real in this toy, **but its biological
interpretation is conditional**. There is no physical cable PDE,
conductance-based spike, autonomous provenance discovery, or neural
hallucination mechanism. The next fork is more demanding: duplicated
message identities under recurrent replay versus truly independent new
sensory events. A source signature does not itself tell a receiving
neuron that eight waves belong to one event. Test causal event/latch
mechanisms while retaining sensitivity to contradictory real evidence.

## Gate 7 completed: screening-off and imagined relay can coexist

[Interactive Gate 7](../gate7.html) · [Frozen protocol](GATE7_PROTOCOL.md) ·
[Full report](GATE7_RESULTS.md) · [12-population receipt](../results/gate7_confirmation.json).

Motivated by Claude's [QualiaClaude/screen/](https://github.com/anttiluode/QualiaClaude/tree/main/screen),
which confirmed near-total suppression of redundant A→C wave-field weights
when *real* B was available, but could not predict C from A alone after
suppressing that shortcut. In Gate 7's deliberately engineered linear
surrogate, A and B both compete as candidate predictors of C during training,
while test B can be **imagined from the A cue** when a physical-source
waveform indicates replay rather than fresh B evidence.

All seven registered tests passed across twelve independent calibrated
populations. Median absolute A→C weight fell to **0.025** for conditional
residual fitting versus **0.496** for independent similarity fitting.
With imagined B, relative C squared error was **0.726**, near exact
Bayes **0.725**; disabling the B prediction raised error to **0.837**,
and independently fitting both redundant paths gave **0.954**.
A global gain correction improves similarity to **0.737**, and
standard joint OLS exactly ties the residual method: conditional
regression is known mathematics, not a novel neural learning rule.

**The decisive missing integration is physical.** Gate 7 does not use
Claude's actual wave-field clocks or growing vines. Its Markov graph,
factor identities, Bayesian inference and full observational training
data are supplied; its waveform-source calibration uses known isolated
stimulation. A defensible next test should combine the *real* wave-tip
residual screening in Claude's engine with the imagined B path and
fade-clock latch, and compare with a conventional linear delayed
predictor under equal signal and wiring budget. Test contradictory
real B, duplicate internal replay, clock reset, and physical source
swap separately. Keep packet origin and repeated event identity
distinct; no current gate establishes qualia.
