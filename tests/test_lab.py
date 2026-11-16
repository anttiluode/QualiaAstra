import unittest
import numpy as np
try:
    import lab
except ImportError:
    lab = None


class InferenceTests(unittest.TestCase):
    def setUp(self):
        self.assertIsNotNone(lab, 'The inference implementation does not exist yet')
        self.model = lab.train(1)

    def test_ambiguous_evidence_keeps_global_flip(self):
        out = lab.infer(self.model, [1, -1], None)
        np.testing.assert_allclose(out['means'], 0, atol=1e-12)
        joint = lab.exact(self.model, [1, -1], None)
        np.testing.assert_allclose(joint['posterior'], joint['posterior'][::-1], atol=1e-12)
        self.assertGreater(joint['entropy'], .99)
        self.assertLess(joint['entropy'], 1.05)

    def test_distributed_matches_independent_joint_enumeration(self):
        rng = np.random.default_rng(9)
        r, q = rng.normal(size=(60, 2)), rng.normal(size=60)
        a, b = lab.infer(self.model, r, q), lab.exact(self.model, r, q)
        np.testing.assert_allclose(a['means'], b['means'], atol=1e-12)

    def test_a_local_clue_reaches_remote_units(self):
        out = lab.infer(self.model, [1, -1], 1.0)
        self.assertGreater(out['means'][1], .9)
        self.assertLess(out['means'][2], -.9)

    def test_cut_blocks_remote_revision(self):
        out = lab.infer(self.model, [1, -1], 1.0, cut=True)
        self.assertGreater(out['means'][0], .9)
        np.testing.assert_allclose(out['means'][1:], 0, atol=1e-12)

    def test_message_reversal_changes_descendants_not_sender(self):
        normal = lab.infer(self.model, [.7, -.9], .8)
        flipped = lab.infer(self.model, [.7, -.9], .8, intervention='reverse')
        np.testing.assert_allclose(flipped['means'], normal['means'] * [1, -1, -1], atol=1e-12)

    def test_message_suppression_differs_from_output_removal(self):
        out = lab.infer(self.model, [1, 1], 1.0)
        source = lab.source_predictions(self.model, out['means'])
        removed = source.copy(); removed[0] = 0
        np.testing.assert_array_equal(removed[1:], source[1:])
        suppressed = lab.infer(self.model, [1, 1], 1.0, intervention='uniform')
        np.testing.assert_allclose(suppressed['means'][1:], 0, atol=1e-12)

    def test_training_is_reproducible_and_decoder_learns(self):
        again = lab.train(1)
        np.testing.assert_array_equal(again['templates'], self.model['templates'])
        truth = lab.world(1)
        self.assertLess(np.mean((np.array(self.model['templates'])-truth)**2), .001)

    def test_extreme_finite_inputs_do_not_create_nan(self):
        out = lab.infer(self.model, [100, -100], -100)
        self.assertTrue(np.isfinite(out['means']).all())
        np.testing.assert_allclose(np.abs(out['means']), 1, atol=1e-10)

    def test_invalid_evidence_is_rejected(self):
        for rel, clue in [([1], 1), ([np.nan, 0], 1), ([1, 0], np.inf)]:
            with self.assertRaises(ValueError):
                lab.infer(self.model, rel, clue)
        with self.assertRaises(ValueError):
            lab.infer(self.model, [1, 1], 1, intervention='typo')


if __name__ == '__main__':
    unittest.main()
