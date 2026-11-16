import unittest
import numpy as np
try:
    import benchmark
except ImportError:
    benchmark = None


class BenchmarkTests(unittest.TestCase):
    def setUp(self):
        self.assertIsNotNone(benchmark, 'benchmark is not implemented')

    def test_interval_preserves_paired_differences(self):
        np.testing.assert_allclose(benchmark.interval([.2]*12), [.2, .2])

    def test_receipt_controls_have_same_cases_and_no_remote_cut_effect(self):
        result = benchmark.evaluate(2)
        self.assertEqual(result['cases'], 512)
        self.assertEqual(set(result['metrics']), {'shared', 'disconnected', 'cut', 'shuffled', 'exact', 'oracle'})
        self.assertLess(result['checks']['cut_remote_update'], 1e-12)
        self.assertLess(result['checks']['bayes_max_difference'], 1e-12)
        self.assertEqual(result, benchmark.evaluate(2))


if __name__ == '__main__':
    unittest.main()
