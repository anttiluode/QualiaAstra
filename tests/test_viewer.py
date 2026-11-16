import json
from pathlib import Path
import subprocess
import unittest
import numpy as np
import lab


class ViewerParity(unittest.TestCase):
    def test_ui_controls_without_browser_layout(self):
        root = Path(__file__).resolve().parents[1]
        p = subprocess.run(['node','tests/viewer_dom.cjs'],cwd=root,text=True,capture_output=True)
        self.assertEqual(p.returncode,0,p.stdout+p.stderr)

    def test_browser_engine_matches_python_and_interventions(self):
        root = Path(__file__).resolve().parents[1]
        self.assertTrue((root/'viewer_engine.js').exists(), 'viewer inference engine missing')
        model = lab.train(2)
        rng = np.random.default_rng(17)
        cases = [dict(r=r.tolist(), q=float(q), mode=mode)
                 for r,q in zip(rng.normal(size=(20,2)),rng.normal(size=20))
                 for mode in ('shared','cut','reverse','uniform','independent')]
        cases += [dict(r=[1,-1],q=None,mode='shared')]
        script = "const e=require('./viewer_engine.js');let s='';process.stdin.on('data',c=>s+=c);process.stdin.on('end',()=>{let d=JSON.parse(s);console.log(JSON.stringify(d.cases.map(c=>e.infer(d.model,c.r,c.q,c.mode))));});"
        p = subprocess.run(['node','-e',script],cwd=root,input=json.dumps(dict(model=model,cases=cases)),text=True,capture_output=True,check=True)
        outputs = json.loads(p.stdout)
        for case, out in zip(cases,outputs):
            mode = case['mode']
            py = lab.infer(model,case['r'],case['q'],cut=mode=='cut',independent=mode=='independent',intervention=mode if mode in ('uniform','reverse') else None)
            np.testing.assert_allclose(out['means'],py['means'],atol=1e-12)
            self.assertIn('referencePosterior', out, 'Directed message edits do not define a new joint posterior')
            np.testing.assert_allclose(out['referencePosterior'],lab.exact(model,case['r'],case['q'])['posterior'],atol=1e-12)
            if mode=='shared':
                np.testing.assert_allclose(np.array(out['referencePosterior']) @ lab.WORLDS,out['means'],atol=1e-12)


if __name__=='__main__':
    unittest.main()
