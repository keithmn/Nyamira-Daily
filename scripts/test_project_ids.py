import importlib.util
import json
import unittest
from pathlib import Path

SCRIPT = Path(__file__).with_name('project-ids.py')
SPEC = importlib.util.spec_from_file_location('project_ids', SCRIPT)
project_ids = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(project_ids)


class ProjectIdTests(unittest.TestCase):
    def test_current_dataset_ids_are_preserved_without_alias_decisions(self):
        data_path = SCRIPT.parent.parent / 'src' / 'data' / 'wardspend.json'
        with data_path.open(encoding='utf-8') as source:
            projects = json.load(source)['projects']
        before = [project['projectId'] for project in projects]

        project_ids.assign_project_ids(projects, {})

        self.assertEqual([project['projectId'] for project in projects], before)
        biticha_ids = {
            project['projectId']
            for project in projects
            if 'Biticha Morera' in project['name']
        }
        self.assertIn('P-0493bd5', biticha_ids)
        self.assertIn('P-5ab05f9', biticha_ids)

    def test_existing_id_survives_a_name_change(self):
        records = [
            {'ward': 'rigoma', 'name': 'Construction of a dispensary', 'projectId': 'P-1234567'},
            {'ward': 'rigoma', 'name': 'Construction and completion of a dispensary', 'projectId': 'P-1234567'},
        ]

        project_ids.assign_project_ids(records, {})

        self.assertEqual([record['projectId'] for record in records], ['P-1234567', 'P-1234567'])

    def test_new_record_with_an_existing_identity_key_reuses_its_id(self):
        records = [
            {'ward': 'bokeira', 'name': 'Construction of Nyamusi Hospital', 'projectId': 'P-1234567'},
            {'ward': 'bokeira', 'name': 'Completion of Nyamusi Hospital'},
        ]

        project_ids.assign_project_ids(records, {})

        self.assertEqual(records[1]['projectId'], 'P-1234567')

    def test_reviewed_alias_requires_reason_source_and_existing_target_id(self):
        records = [
            {'ward': 'rigoma', 'name': 'Biticha Borehole upgrade', 'projectId': 'P-1234567'},
            {'ward': 'rigoma', 'name': 'Biticha water drilling'},
        ]
        alias_key = 'rigoma|biticha water drilling'
        aliases = {
            alias_key: {
                'projectId': 'P-1234567',
                'reason': 'Reviewed source confirms this is the same named work package.',
                'source': 'Official plan, section 2, p. 10',
            }
        }

        project_ids.assign_project_ids(records, aliases)

        self.assertEqual(records[1]['projectId'], 'P-1234567')

    def test_similar_work_packages_at_one_facility_remain_distinct(self):
        records = [
            {'ward': 'rigoma', 'name': 'Construction of Biticha Morera OPD phase 1'},
            {'ward': 'rigoma', 'name': 'Construction of Biticha Morera OPD phase 2'},
        ]

        project_ids.assign_project_ids(records, {})

        self.assertNotEqual(records[0]['projectId'], records[1]['projectId'])

    def test_alias_without_review_metadata_is_rejected(self):
        with self.assertRaisesRegex(ValueError, 'review reason'):
            project_ids.assign_project_ids(
                [{'ward': 'rigoma', 'name': 'Known project', 'projectId': 'P-1234567'}],
                {'rigoma|renamed project': {'projectId': 'P-1234567', 'source': 'p. 1'}},
            )

    def test_conflicting_existing_ids_for_one_identity_are_rejected(self):
        with self.assertRaisesRegex(ValueError, 'conflicting existing project IDs'):
            project_ids.assign_project_ids([
                {'ward': 'rigoma', 'name': 'Construction of a dispensary', 'projectId': 'P-1234567'},
                {'ward': 'rigoma', 'name': 'Completion of a dispensary', 'projectId': 'P-7654321'},
                {'ward': 'rigoma', 'name': 'A dispensary'},
            ], {})


if __name__ == '__main__':
    unittest.main()
