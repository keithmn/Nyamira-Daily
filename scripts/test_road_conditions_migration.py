import sqlite3
import unittest
from pathlib import Path


MIGRATIONS = Path(__file__).resolve().parents[1] / "migrations"

ACCEPT = """
    UPDATE road_condition_submissions
    SET status = 'accepted', reviewed_at = datetime('now'), reviewer = ?, review_note = ?,
        public_grade = ?, public_scope = ?, public_observed_on = ?, public_source_category = ?,
        public_source_ref = ?, public_evidence = ?
    WHERE id = ?
"""


class RoadConditionMigrationTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(":memory:")
        for name in ("0001_corrections.sql", "0002_facility_observations.sql", "0003_road_conditions.sql"):
            self.db.executescript((MIGRATIONS / name).read_text(encoding="utf-8"))

    def tearDown(self):
        self.db.close()

    def submit(self, submission_id, grade="poor"):
        self.db.execute(
            """
            INSERT INTO road_condition_submissions (id, road_id, grade, observed_on, source_category)
            VALUES (?, 'NYM-R0001', ?, '2026-10-20', 'resident')
            """,
            (submission_id, grade),
        )

    def accept_values(self, submission_id, evidence="unverified"):
        return ("editor@example.org", "Checked", "poor", "One visit", "2026-10-20", "resident",
                "Reader report reviewed by Nyamira Daily", evidence, submission_id)

    def test_reports_hold_no_contact_fields_and_grades_are_constrained(self):
        columns = {row[1] for row in self.db.execute("PRAGMA table_info(road_condition_submissions)")}
        for personal in ("email", "phone", "name", "ip", "ip_hash"):
            self.assertNotIn(personal, columns)
        self.submit("report-1")
        with self.assertRaises(sqlite3.IntegrityError):
            self.submit("report-2", grade="terrible")

    def test_checks_are_limited_to_three_and_published_wording_needs_a_status(self):
        self.submit("report-3")
        for position in (1, 2, 3):
            self.db.execute(
                "INSERT INTO road_condition_checks (submission_id, position, label, reported_status) VALUES (?, ?, 'Passable after rain', 'reported-no')",
                ("report-3", position),
            )
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                "INSERT INTO road_condition_checks (submission_id, position, label, reported_status) VALUES ('report-3', 4, 'Extra', 'unknown')"
            )
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("UPDATE road_condition_checks SET public_label = 'Passable after rain' WHERE position = 1")

    def test_acceptance_requires_complete_public_fields_and_reader_evidence_label(self):
        self.submit("report-4")
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("UPDATE road_condition_submissions SET status = 'accepted' WHERE id = 'report-4'")
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(ACCEPT, self.accept_values("report-4", evidence="audit"))
        self.db.execute(ACCEPT, self.accept_values("report-4"))

    def test_decision_event_is_recorded_once_and_checks_go_with_their_report(self):
        self.submit("report-5")
        self.db.execute(
            "INSERT INTO road_condition_checks (submission_id, position, label, reported_status) VALUES ('report-5', 1, 'Culvert blocked', 'reported-yes')"
        )
        self.db.execute(ACCEPT, self.accept_values("report-5"))
        self.db.execute("UPDATE road_condition_submissions SET status = 'rejected' WHERE id = 'report-5'")
        events = self.db.execute("SELECT event_type FROM road_condition_events WHERE submission_id = 'report-5'").fetchall()
        self.assertEqual(events, [("accepted",)])
        self.db.execute("DELETE FROM road_condition_submissions WHERE id = 'report-5'")
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM road_condition_checks").fetchone()[0], 0)


if __name__ == "__main__":
    unittest.main()
