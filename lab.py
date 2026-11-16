"""A learned-likelihood, three-variable Bayesian reference mechanism.

World signs/topology are supplied. Sum-product is engineered, not learned.
No test target is accepted by infer(). The exact solver is an explicit control.
"""
from itertools import product
import numpy as np

STATES = np.array([-1., 1.])
WORLDS = np.array(list(product(STATES, repeat=3)))
EDGES = ((0, 1), (1, 0), (1, 2), (2, 1))


def world(seed):
    """Three finite causal traces. Independent source contributions add linearly."""
    rng = np.random.default_rng(seed + 900000)
    t = np.arange(64)
    waves = []
    for onset, freq in zip((4, 13, 23), (.10, .14, .18)):
        age = np.maximum(t - onset, 0)
        phase = rng.uniform(-.3, .3)
        wave = np.where(t >= onset, np.exp(-age/18)*np.sin(2*np.pi*freq*age + phase), 0.)
        waves.append(wave)
    return np.array(waves)


def train(seed):
    """Labelled calibration only; imposed sign symmetry prevents spurious priors."""
    rng = np.random.default_rng(seed)
    z = np.repeat(WORLDS, 32, axis=0)
    rng.shuffle(z)
    products = z[:, :2]*z[:, 1:]
    readings = products + rng.normal(0, .30, products.shape)
    local = z[:, 0] + rng.normal(0, .65, len(z))
    outputs = z @ world(seed) + rng.normal(0, .10, (len(z), 64))
    templates = np.linalg.lstsq(z, outputs, rcond=None)[0]
    rel_mu = np.mean(readings*products, axis=0)
    rel_sd = np.sqrt(np.mean((readings-products*rel_mu)**2, axis=0))
    local_mu = float(np.mean(local*z[:, 0]))
    local_sd = float(np.sqrt(np.mean((local-z[:, 0]*local_mu)**2)))
    return dict(seed=int(seed), templates=templates.tolist(), relation_mu=rel_mu.tolist(),
                relation_sd=rel_sd.tolist(), local_mu=local_mu, local_sd=local_sd,
                training_examples=256)


def _evidence(relations, clue):
    r = np.asarray(relations, dtype=float)
    single = r.ndim == 1
    if single:
        r = r[None, :]
    if r.ndim != 2 or r.shape[1] != 2 or not len(r) or not np.isfinite(r).all():
        raise ValueError('relations must be a finite pair or an N by 2 array')
    q = None if clue is None else np.asarray(clue, dtype=float)
    if q is not None:
        if q.ndim == 0:
            q = np.full(len(r), q)
        if q.shape != (len(r),) or not np.isfinite(q).all():
            raise ValueError('clue must be finite, scalar or length N')
    return r, q, single


def _lognorm(x):
    m = np.max(x, axis=-1, keepdims=True)
    return x - m - np.log(np.exp(x-m).sum(axis=-1, keepdims=True))


def _potentials(model, relations, clue):
    r, q, single = _evidence(relations, clue)
    mu = np.asarray(model['relation_mu']); sd = np.asarray(model['relation_sd'])
    if np.any(sd <= 0) or model['local_sd'] <= 0:
        raise ValueError('calibrated noise scales must be positive')
    pair_sign = STATES[:, None]*STATES[None, :]
    pair = -.5*((r[:, :, None, None] - mu[None, :, None, None]*pair_sign)
                / sd[None, :, None, None])**2
    unary = np.zeros((len(r), 3, 2))
    if q is not None:
        unary[:, 0] = -.5*((q[:, None]-model['local_mu']*STATES)/model['local_sd'])**2
    return pair, unary, single


def infer(model, relations, clue=None, *, cut=False, independent=False, intervention=None):
    """Two synchronous sum-product rounds on a chain; message replacement is causal.

    cut removes both A-B messages. intervention replaces A->B only, before its
    descendants recompute. No output templates or targets enter message inference.
    """
    if intervention not in (None, 'uniform', 'reverse'):
        raise ValueError('unknown message intervention')
    pair, unary, single = _potentials(model, relations, clue)
    n = len(unary)
    messages = {e: np.zeros((n, 2)) for e in EDGES}
    history = []
    for _ in range(2):
        updated = {}
        for src, dst in EDGES:
            incoming = unary[:, src].copy()
            for a, b in EDGES:
                if b == src and a != dst:
                    incoming += messages[a, b]
            factor = pair[:, min(src, dst)]
            if src > dst:
                factor = factor.transpose(0, 2, 1)
            terms = incoming[:, :, None]+factor
            peak = terms.max(axis=1)
            msg = _lognorm(peak + np.log(np.exp(terms-peak[:, None, :]).sum(axis=1)))
            if independent or (cut and {src, dst} == {0, 1}):
                msg = np.full((n, 2), -np.log(2))
            if (src, dst) == (0, 1):
                if intervention == 'uniform':
                    msg = np.full((n, 2), -np.log(2))
                elif intervention == 'reverse':
                    msg = msg[:, ::-1]
            updated[src, dst] = msg
        messages = updated
        history.append({f'{a}{b}': np.exp(v) for (a, b), v in messages.items()})
    belief = unary.copy()
    for (src, dst), msg in messages.items():
        belief[:, dst] += msg
    marginals = np.exp(_lognorm(belief))
    out = {'means': marginals @ STATES, 'marginals': marginals,
           'messages': {f'{a}{b}': np.exp(v) for (a, b), v in messages.items()},
           'rounds': history}
    if single:
        out['means'] = out['means'][0]; out['marginals'] = out['marginals'][0]
        out['messages'] = {k:v[0] for k,v in out['messages'].items()}
        out['rounds'] = [{k:v[0] for k,v in step.items()} for step in history]
    return out


def exact(model, relations, clue=None):
    """Independent eight-world enumeration, no message-passing calls."""
    r, q, single = _evidence(relations, clue)
    pairs = WORLDS[:, :2]*WORLDS[:, 1:]
    mu, sd = np.asarray(model['relation_mu']), np.asarray(model['relation_sd'])
    logp = -.5*np.sum(((r[:, None, :]-pairs*mu)/sd)**2, axis=-1)
    if q is not None:
        logp -= .5*((q[:, None]-model['local_mu']*WORLDS[:, 0])/model['local_sd'])**2
    logp = _lognorm(logp)
    p = np.exp(logp)
    out = dict(posterior=p, means=p @ WORLDS,
               entropy=-np.sum(p*logp, axis=-1)/np.log(2))
    return {k:v[0] for k,v in out.items()} if single else out


def source_predictions(model, means):
    """Individual contributions; zero mean is not a statement of zero variance."""
    return np.asarray(means)[..., :, None]*np.asarray(model['templates'])


def predict(model, means):
    return np.asarray(means) @ np.asarray(model['templates'])
