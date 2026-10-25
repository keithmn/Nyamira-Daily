import importlib.util
import csv
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).with_name('build-projects-csv.py')
SPEC = importlib.util.spec_from_file_location('build_projects_csv', SCRIPT)
build_projects_csv = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(build_projects_csv)


class ProjectAmountCsvTests(unittest.TestCase):
    def test_explicit_zero_is_not_unavailable(self):
        self.assertEqual(build_projects_csv.amount_status('0'), 'reported_zero')
        self.assertEqual(build_projects_csv.amount_status('0.00'), 'reported_zero')

    def test_blank_amount_is_unavailable(self):
        self.assertEqual(build_projects_csv.amount_status(''), 'unavailable')
        self.assertEqual(build_projects_csv.amount_status('  '), 'unavailable')

    def test_positive_amount_is_reported(self):
        self.assertEqual(build_projects_csv.amount_status('250000.50'), 'reported_amount')

    def test_invalid_and_negative_amounts_fail(self):
        for amount in ('unknown', '-1', 'NaN'):
            with self.subTest(amount=amount):
                with self.assertRaises(ValueError):
                    build_projects_csv.amount_status(amount)

    def test_csv_export_keeps_zero_and_unavailable_distinct(self):
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / 'projects.csv'
            output = Path(directory) / 'projects-v2.csv'
            source.write_text('name,amount_ksh\nZero,0\nMissing,\nReported,12.50\n', encoding='utf-8')

            build_projects_csv.build(source, output)

            with output.open(newline='', encoding='utf-8') as exported:
                rows = list(csv.DictReader(exported))
            self.assertEqual(
                [row['amount_status'] for row in rows],
                ['reported_zero', 'unavailable', 'reported_amount'],
            )


if __name__ == '__main__':
    unittest.main()
