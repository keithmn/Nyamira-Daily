import sqlite3
import unittest
from pathlib import Path


MIGRATIONS = Path(__file__).resolve().parents[1] / "migrations"

ACCEPT = """
    UPDATE facility_observation_submissions
    SET status = 'accepted', reviewed_at = datetime('now'), reviewer = ?, review_note = ?,
        public_capability = ?, public_status = ?, public_scope = ?, public_observed_on = ?,
        public_source_category = ?, public_source_ref = ?, public_evidence = ?
    WHERE id = ?
"""


class FacilityObservationMigrationTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(":memory:")
        for name in ("0001_corrections.sql", "0002_facility_observations.sql"):
            self.db.executescript((MIGRATIONS / name).read_text(encoding="utf-8"))

    def tearDown(self):
        self.db.close()

    def submit(self, submission_id):
        self.db.execute(
            """
            INSERT INTO facility_observation_submissions
              (id, facility_id, capability, reported_status, observed_on, source_category)
            VALUES (?, 'NYM-F0001', 'Outpatient clinic', 'reported-available', '2026-10-20', 'resident')
            """,
            (submission_id,),
        )

    def accept_values(self, submission_id, evidence="unverified"):
        return (
            "editor@example.org",
            "Checked",
            "Outpatient clinic",
            "reported-available",
            "One visit by a resident",
            "2026-10-20",
            "resident",
            "Reader report reviewed by Nyamira Daily",
            evidence,
            submission_id,
        )

    def test_reports_are_separate_from_corrections_and_hold_no_contact_fields(self):
        columns = {
            row[1] for row in self.db.execute("PRAGMA table_info(facility_observation_submissions)")
        }
        for personal in ("email", "phone", "name", "ip", "ip_hash"):
            self.assertNotIn(personal, columns)
        self.submit("report-1")
        self.assertEqual(self.db.execute("SELECT COUNT(*) FROM correction_submissions").fetchone()[0], 0)
        self.assertEqual(
            self.db.execute("SELECT status FROM facility_observation_submissions").fetchone()[0],
            "pending",
        )

    def test_reported_status_and_reporter_category_are_constrained(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                """
                INSERT INTO facility_observation_submissions
                  (id, facility_id, capability, reported_status, observed_on, source_category)
                VALUES ('bad', 'NYM-F0001', 'Clinic', 'no', '2026-10-20', 'resident')
                """
            )
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                """
                INSERT INTO facility_observation_submissions
                  (id, facility_id, capability, reported_status, observed_on, source_category)
                VALUES ('bad', 'NYM-F0001', 'Clinic', 'unknown', '2026-10-20', 'official')
                """
            )

    def test_acceptance_requires_complete_public_fields_and_reader_evidence_label(self):
        self.submit("report-2")
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                "UPDATE facility_observation_submissions SET status = 'accepted' WHERE id = ?",
                ("report-2",),
            )
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(ACCEPT, self.accept_values("report-2", evidence="official"))
        self.db.execute(ACCEPT, self.accept_values("report-2"))
        self.assertEqual(
            self.db.execute("SELECT status FROM facility_observation_submissions").fetchone()[0],
            "accepted",
        )

    def test_decision_event_is_recorded_once_and_deleted_with_its_report(self):
        self.submit("report-3")
        self.db.execute(ACCEPT, self.accept_values("report-3"))
        self.db.execute(
            "UPDATE facility_observation_submissions SET status = 'rejected', reviewer = ? WHERE id = ?",
            ("other@example.org", "report-3"),
        )
        events = self.db.execute(
            "SELECT event_type, actor FROM facility_observation_events WHERE submission_id = ?",
            ("report-3",),
        ).fetchall()
        self.assertEqual(events, [("accepted", "editor@example.org")])
        self.db.execute("DELETE FROM facility_observation_submissions WHERE id = ?", ("report-3",))
        self.assertEqual(
            self.db.execute("SELECT COUNT(*) FROM facility_observation_events").fetchone()[0],
            0,
        )


if __name__ == "__main__":
    unittest.main()
