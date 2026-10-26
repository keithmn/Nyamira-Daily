import sqlite3
import unittest
from pathlib import Path


MIGRATION = Path(__file__).resolve().parents[1] / "migrations" / "0001_corrections.sql"


class CorrectionMigrationTests(unittest.TestCase):
    def setUp(self):
        self.db = sqlite3.connect(":memory:")
        self.db.executescript(MIGRATION.read_text(encoding="utf-8"))

    def tearDown(self):
        self.db.close()

    def test_pending_submission_is_stored_without_contact_fields(self):
        columns = {
            row[1] for row in self.db.execute("PRAGMA table_info(correction_submissions)")
        }
        self.assertNotIn("email", columns)
        self.assertNotIn("phone", columns)
        self.db.execute(
            "INSERT INTO correction_submissions (id, page_path, details) VALUES (?, ?, ?)",
            ("submission-1", "/data/health/", "The page may cite an older report."),
        )
        self.assertEqual(
            self.db.execute(
                "SELECT status FROM correction_submissions WHERE id = ?",
                ("submission-1",),
            ).fetchone()[0],
            "pending",
        )

    def test_accepted_submission_requires_complete_public_evidence(self):
        self.db.execute(
            "INSERT INTO correction_submissions (id, page_path, details) VALUES (?, ?, ?)",
            ("submission-2", "/data/health/", "Please check the source."),
        )
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                "UPDATE correction_submissions SET status = 'accepted' WHERE id = ?",
                ("submission-2",),
            )

    def test_decision_event_is_added_once_and_cannot_be_overwritten_silently(self):
        self.db.execute(
            "INSERT INTO correction_submissions (id, page_path, details) VALUES (?, ?, ?)",
            ("submission-3", "/data/health/", "The source date appears incorrect."),
        )
        self.db.execute(
            """
            UPDATE correction_submissions
            SET status = 'accepted', reviewed_at = datetime('now'), reviewer = ?,
                review_note = ?, public_page = ?, public_changed = ?, public_reason = ?,
                public_source = ?, public_source_date = ?
            WHERE id = ?
            """,
            (
                "editor@example.org",
                "Source checked",
                "/data/health/",
                "Corrected the source date",
                "Official report checked",
                "https://example.org/report.pdf",
                "2026-10-01",
                "submission-3",
            ),
        )
        self.db.execute(
            """
            UPDATE correction_submissions
            SET status = 'rejected', reviewer = ?, review_note = ?
            WHERE id = ?
            """,
            ("other@example.org", "Changed decision", "submission-3"),
        )
        events = self.db.execute(
            "SELECT event_type, actor FROM correction_events WHERE submission_id = ?",
            ("submission-3",),
        ).fetchall()
        self.assertEqual(events, [("accepted", "editor@example.org")])

    def test_foreign_keys_and_retention_deletion_cascade(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute(
                """
                INSERT INTO correction_events (submission_id, event_type, actor, note)
                VALUES (?, 'submitted', 'public', 'Received')
                """,
                ("missing",),
            )
        self.db.execute(
            "INSERT INTO correction_submissions (id, page_path, details) VALUES (?, ?, ?)",
            ("submission-4", "/data/health/", "Please verify this source."),
        )
        self.db.execute(
            """
            INSERT INTO correction_events (submission_id, event_type, actor, note)
            VALUES (?, 'submitted', 'public', 'Received')
            """,
            ("submission-4",),
        )
        self.db.execute(
            "DELETE FROM correction_submissions WHERE id = ?",
            ("submission-4",),
        )
        self.assertEqual(
            self.db.execute(
                "SELECT COUNT(*) FROM correction_events WHERE submission_id = ?",
                ("submission-4",),
            ).fetchone()[0],
            0,
        )


if __name__ == "__main__":
    unittest.main()
