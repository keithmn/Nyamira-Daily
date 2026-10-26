PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS correction_submissions (
  id TEXT PRIMARY KEY,
  page_path TEXT NOT NULL CHECK (length(page_path) BETWEEN 1 AND 500),
  details TEXT NOT NULL CHECK (length(details) BETWEEN 10 AND 3000),
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT,
  reviewer TEXT,
  review_note TEXT,
  public_page TEXT,
  public_changed TEXT,
  public_reason TEXT,
  public_source TEXT,
  public_source_date TEXT,
  CHECK (
    status != 'accepted'
    OR (
      reviewed_at IS NOT NULL
      AND reviewer IS NOT NULL
      AND public_page IS NOT NULL
      AND public_changed IS NOT NULL
      AND public_reason IS NOT NULL
      AND public_source IS NOT NULL
      AND public_source_date IS NOT NULL
    )
  )
);

CREATE INDEX IF NOT EXISTS correction_submissions_status_created
  ON correction_submissions (status, created_at DESC);

CREATE TABLE IF NOT EXISTS correction_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL REFERENCES correction_submissions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('submitted', 'accepted', 'rejected')),
  actor TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS correction_events_submission_created
  ON correction_events (submission_id, created_at DESC);

CREATE TRIGGER IF NOT EXISTS correction_review_event
AFTER UPDATE OF status ON correction_submissions
WHEN OLD.status = 'pending' AND NEW.status IN ('accepted', 'rejected')
BEGIN
  INSERT INTO correction_events (submission_id, event_type, actor, note)
  VALUES (NEW.id, NEW.status, NEW.reviewer, NEW.review_note);
END;

CREATE TABLE IF NOT EXISTS correction_rate_limits (
  ip_hash TEXT PRIMARY KEY,
  window_started TEXT NOT NULL,
  submission_count INTEGER NOT NULL CHECK (submission_count >= 1)
);
