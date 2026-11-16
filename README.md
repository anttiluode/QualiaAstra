# QualiaAstra — a shared possible world

**One local clue changes what three units jointly expect. Cut a message, and the
remote prediction disappears. Reverse it, and the remote predictions reverse
together. Removing a waveform from the final drawing does neither.**

Antti Luode's research direction · OpenAI implementation · 16 November 2026.
The repository name was chosen by Antti for an independent companion to Claude's
version. This project tests a candidate **structure of shared prediction**;
it cannot detect subjective experience.

**[Open the source of the offline viewer](index.html)** ·
**[Results and limits](RESULTS.md)** · **[Fixed protocol](PROTOCOL.md)** ·
**[The idea](docs/IDEA.md)** · **[Next experiment](docs/NEXT.md)**

To use the viewer: **Code → Download ZIP**, extract it, then double-click
`index.html`. Keep the four `viewer*.js` files beside it. No server, installation,
GPU or network is needed. The GitHub file page itself displays source, not the app.

## Gate 2: learn relationships from raw sensor traces (development)

**[Open the Gate 2 offline/hosted lab](gate2.html)** · **[Protocol and limits](docs/GATE2.md)**

Gate 1 supplies noisy AB/BC relation measurements directly. Gate 2 instead presents
48-sample noisy interference sensor traces, calibrates their likelihoods on a
separate labelled set, and scores predicted B/C sensor recordings withheld at test.
The supplied three-node inference chain remains fixed, so this tests **supervised
observation learning**, not spontaneous world-factor discovery.

On one deterministic *development* seed (256 calibration and 512 test cases),
relative withheld-wave MSE was **0.574** for the learned model, **1.000** with
A→B cut, **1.483** with shuffled raw sensors, and **0.536** with true relation
labels given to an oracle control. These exploratory results were inspected
during implementation: no confirmation claim is made. See [Gate 2's
methods and caveats](docs/GATE2.md). All Gate 1 receipts remain unchanged.

## What to try

1. Start without revealing A. Two opposite worlds fit the relation sensors.
   The mean prediction is zero, but the alternative-world panel is not empty.
2. **Reveal local clue.** Evidence at A revises B and C, whose signed traces
   remain unseen. Move the evidence slider to see weak or misleading clues.
3. **Cut A—B.** A still responds; B and C lose access to the signed clue.
4. **Reverse only A → B.** A retains its own belief while B and C revise in
   the opposite direction. Coherent inference can be confidently wrong.
5. **Remove A from the rendered sum.** B/C beliefs do not change. This is
   additive output attribution, not a causal message intervention.

The alternatives and entropy always show the **unmodified evidence-only Bayesian
reference**. Directed message overrides define altered local beliefs but not a
unique new global posterior. The viewer keeps those objects separate. Its hidden
truth overlay is used only for comparison, never as predictor input.

## The actual experiment

Three hidden signed sources A,B,C generate three decaying wave traces. Initial
sensors reveal noisy relative signs AB and BC. This deliberately engineered
interferometric contrast can be written `((a+b)^2-(a-b)^2)/4 = ab`.
It cannot distinguish a world from its global sign reversal. A later noisy signed
reading at A can disambiguate the whole chain.

Labelled calibration learns waveform templates and observation likelihoods.
Three binary belief units perform two rounds of ordinary sum-product inference.
They predict B/C traces that are **withheld at test**. Source identities, the sign
alphabet, chain topology, symmetry and inference algorithm are supplied. Full
traces were available during training. This is a small learned generative-model
reference, **not** autonomous concept discovery or a spiking wave-body simulation.

## Frozen confirmation: 12 seeds, 6,144 cases

Protocol and complete benchmark source were published before the confirmation
run. No settings were adjusted after those results. Relative remote squared
waveform error uses zero prediction as 1; lower is better.

| Method | Remote error |
|---|---:|
| **Shared messages** | **0.1723** |
| Disconnected predictors | 1.0000 |
| A—B cut | 1.0000 |
| Relations shuffled between cases | 1.8143 |
| **Ordinary exact Bayesian enumeration** | **0.1723** |
| True signs supplied (decoder upper-bound control) | 0.00054 |

Shared messages reduce error **82.8%** versus disconnected predictors. All four
specified mechanism gates pass. Distributed inference agrees with exact Bayes
to **8.33×10⁻¹⁶**; it has **no demonstrated advantage over Bayes**. This is a
known-answer construction, with correspondence and intervention checks designed
to identify why it works. It is not an empirical validation of a consciousness
theory. The task deliberately requires relationships, so the disconnected
control's disadvantage is constructed and should not be sold as a general result.

[Full interpretation](RESULTS.md) · [summary and seedwise results](results/confirmation.json)
· [compressed raw receipt](results/confirmation.json.gz).

## Why “meaning by intervention” needs two measurements

For a fixed additive output, removing a summand reveals its contribution. In a
coupled system, removing a message can also change subsequent messages and
beliefs. Here `infer(..., intervention='reverse')` recomputes the downstream
consequences, while output removal only changes a drawing. The difference is the
point of the experiment. It measures **causal predictive role**, not intrinsic
semantics, a unique meaning assignment, or phenomenal experience.

Before the signed clue, symmetric alternatives average to zero. After the clue,
their weights shift. Thus a zero mean need not mean no internal possibilities.
The current model is a chain with no feedback loops: two message rounds are
exact; emergence of a recurrent consensus is not claimed.

## Run the numerical lab

Python 3.10+ and NumPy; CPU only. Node.js is also required for the complete
cross-language/UI-control test suite, but not for the benchmark or offline app.

```sh
python -m pip install -r requirements.txt
python -m unittest discover -s tests -v
python benchmark.py --output results/my_development.json
python benchmark.py --confirm --output results/my_confirmation.json
```

Runs refuse to overwrite an existing result path. The full batch took under a
second in this environment; hardware differs. The stored raw receipt includes
all calibration models, case inputs, shuffle indices, predictions, source hashes
and environment. To read it:

```python
import gzip, json
with gzip.open('results/confirmation.json.gz', 'rt') as f:
    receipt = json.load(f)
```

**Validation:** 13 tests pass, including distributed/exact inference parity,
ambiguity, directed interventions, browser/Python numerical parity and a minimal
DOM control-flow harness. Full confirmation replay matches the raw receipt
exactly. A fresh reviewer checked the mechanism and caught a joint-posterior UI
error, now corrected. **Hosted Chromium checks also passed:** offline loading, reveal/cut/reverse
controls, output removal, reference-posterior invariance, mobile width and reset,
with no page errors. [Successful CI and screenshots](https://github.com/anttiluode/QualiaAstra/actions/runs/43814686560).
Screenshots were captured but not manually visually reviewed in this session.
[Review record](docs/REVIEW.md).

## Relationship to the other projects

- [StateShapedPingRecall](https://github.com/anttiluode/StateShapedPingRecall):
  distinguishes waveform completion, cancellation and hidden-cause inference.
  Its fixed-firing linear decomposition is different from rerunning a closed
  body after timer removal. This repo copies none of its wave engine or results.
- [RoundAndRound](https://github.com/anttiluode/RoundAndRound): selectable learned
  operators and evidence-driven re-entry are the conceptual connection.
- [TATWATASW](https://github.com/anttiluode/TATWATASW) and
  [MusicalDelayLabyrinth](https://github.com/anttiluode/MusicalDelayLabyrinth):
  order-writing and timing precedents; no code inheritance claimed.
- [PerceptionLabNodes](https://github.com/anttiluode/PerceptionLabNodes) and
  [Genealogy](https://github.com/anttiluode/Genealogy): the wider archive.

MIT; existing repository license preserved.
