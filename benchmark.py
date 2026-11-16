"""Frozen paired confirmation; no optimization of the precommitted thresholds."""
import argparse
import hashlib
import json
from pathlib import Path
import platform
import subprocess
import numpy as np
import lab

ROOT = Path(__file__).resolve().parent


def interval(differences):
    values = np.asarray(differences, dtype=float)
    rng = np.random.default_rng(7301)
    boot = values[rng.integers(0, len(values), (10000, len(values)))].mean(axis=1)
    return np.quantile(boot, [.025, .975]).tolist()


def evaluate(seed):
    model = lab.train(seed)
    rng = np.random.default_rng(100001 + seed)
    z = np.repeat(lab.WORLDS, 64, axis=0)
    rng.shuffle(z)
    r = z[:, :2]*z[:, 1:] + rng.normal(0, .3, (len(z), 2))
    clue = z[:, 0] + rng.normal(0, .65, len(z))
    unobserved = lab.world(seed)
    true_source = z[:, :, None]*unobserved
    true_wave = z @ unobserved
    shared = lab.infer(model, r, clue)
    exact = lab.exact(model, r, clue)
    ambiguous = lab.exact(model, r, None)
    before = lab.infer(model, r, None)
    cut = lab.infer(model, r, clue, cut=True)
    independent = lab.infer(model, r, clue, independent=True)
    perm = rng.permutation(len(r))
    shuffled = lab.infer(model, r[perm], clue)
    reverse = lab.infer(model, r, clue, intervention='reverse')
    uniform = lab.infer(model, r, clue, intervention='uniform')
    means = dict(shared=shared['means'], disconnected=independent['means'],
                 cut=cut['means'], shuffled=shuffled['means'], exact=exact['means'], oracle=z)
    metrics = {}
    remote_den = np.mean(true_source[:, 1:]**2)
    for name, m in means.items():
        sources = lab.source_predictions(model, m)
        signed_correct = (m*z > 1e-10).mean()  # unresolved is explicitly not correct
        metrics[name] = dict(remote_relative_mse=float(np.mean((sources[:, 1:]-true_source[:, 1:])**2)/remote_den),
                             total_wave_nrmse=float(np.sqrt(np.mean((sources.sum(axis=1)-true_wave)**2)/np.mean(true_wave**2))),
                             source_accuracy=float(signed_correct),
                             unresolved_fraction=float(np.mean(np.abs(m) <= 1e-10)))
    true_index = np.sum(((z+1)/2)*[4,2,1], axis=1).astype(int)
    p = exact['posterior']
    chosen = p.argmax(axis=1)
    # Avoid arbitrary tie-breaking: unresolved global MAP ties do not count.
    sorted_p = np.sort(p, axis=1)
    resolved = sorted_p[:, -1]-sorted_p[:, -2] > 1e-10
    joint = dict(map_accuracy=float(np.mean((chosen == true_index) & resolved)),
                 mean_entropy_bits=float(exact['entropy'].mean()),
                 before_entropy_bits=float(ambiguous['entropy'].mean()),
                 mean_negative_log_score=float(-np.log(np.maximum(p[np.arange(len(z)), true_index], 1e-300)).mean()))
    sources = lab.source_predictions(model, shared['means'])
    removed = sources.copy(); removed[:, 0] = 0
    checks = dict(ambiguity_max_mean=float(np.abs(before['means']).max()),
                  global_flip_p_difference=float(np.abs(ambiguous['posterior']-ambiguous['posterior'][:, ::-1]).max()),
                  cut_remote_update=float(np.abs(cut['means'][:, 1:]).max()),
                  bayes_max_difference=float(np.abs(shared['means']-exact['means']).max()),
                  reversal_max_difference=float(np.abs(reverse['means']-shared['means']*[1,-1,-1]).max()),
                  suppression_remote_mean=float(np.abs(uniform['means'][:, 1:]).max()),
                  output_removal_remote_change=float(np.abs(removed[:, 1:]-sources[:, 1:]).max()))
    # All observations/targets plus predictions retained: this is the raw receipt,
    # not merely aggregate evidence. No target enters either inference interface.
    trials = dict(signs=z.astype(int).tolist(), relations=r.tolist(), clue=clue.tolist(),
                  shuffled_trial_indices=perm.tolist(), means={k:v.tolist() for k,v in means.items()})
    return dict(seed=seed, test_seed=100001+seed, cases=len(z), metrics=metrics,
                joint=joint, checks=checks, model=model, trials=trials)


def summarize(rows):
    names = rows[0]['metrics']
    metrics = {name:{key:float(np.mean([r['metrics'][name][key] for r in rows]))
                     for key in rows[0]['metrics'][name]} for name in names}
    improvements = {}
    for control in ('disconnected', 'shuffled'):
        d = [r['metrics'][control]['remote_relative_mse']-r['metrics']['shared']['remote_relative_mse'] for r in rows]
        improvements[control] = dict(paired_error_difference=float(np.mean(d)), ci95=interval(d),
                                    relative_reduction=1-metrics['shared']['remote_relative_mse']/metrics[control]['remote_relative_mse'])
    checks = {k:max(r['checks'][k] for r in rows) for k in rows[0]['checks']}
    gates = dict(A=checks['ambiguity_max_mean']<1e-10 and checks['global_flip_p_difference']<1e-10,
                 B=all(v['relative_reduction']>=.4 and v['ci95'][0]>0 for v in improvements.values()) and checks['cut_remote_update']<1e-10,
                 C=checks['bayes_max_difference']<1e-10,
                 D=all(checks[k]<1e-10 for k in ('reversal_max_difference','suppression_remote_mean','output_removal_remote_change')))
    return dict(metrics=metrics, improvements=improvements, checks=checks, gates=gates,
                all_pass=all(gates.values()),
                joint={k:float(np.mean([r['joint'][k] for r in rows])) for k in rows[0]['joint']})


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--confirm', action='store_true')
    parser.add_argument('--output', default=None)
    args = parser.parse_args()
    seeds = list(range(1001, 1013)) if args.confirm else [1,2]
    output = Path(args.output or ROOT/'results'/('confirmation.json' if args.confirm else 'development.json'))
    if output.exists():
        raise SystemExit(f'Refusing to overwrite {output}; choose a new --output for a replay.')
    rows = [evaluate(s) for s in seeds]
    summary = summarize(rows)
    hashes = {p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in ('PROTOCOL.md','lab.py','benchmark.py')}
    commit = subprocess.run(['git','rev-parse','HEAD'], cwd=ROOT, capture_output=True, text=True)
    receipt = dict(label='confirmation' if args.confirm else 'development', seeds=seeds,
                   protocol='PROTOCOL.md', hashes=hashes, git_head=commit.stdout.strip(),
                   environment=dict(python=platform.python_version(), numpy=np.__version__),
                   summary=summary, results=rows)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(receipt, indent=2)+'\n')
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    main()
