PRAGMA foreign_keys = ON;

-- Road condition reports (decisions #57 and #59): a grade plus up to three checks in the
-- reporter's own words. Kept apart from correction and facility reports.
CREATE TABLE IF NOT EXISTS road_condition_submissions (
  id TEXT PRIMARY KEY,
  road_id TEXT NOT NULL CHECK (length(road_id) BETWEEN 1 AND 20),
  grade TEXT NOT NULL CHECK (grade IN ('good', 'fair', 'poor', 'impassable', 'unknown')),
  observed_on TEXT NOT NULL CHECK (length(observed_on) = 10),
  source_category TEXT NOT NULL CHECK (source_category IN ('resident', 'field-reporter')),
  details TEXT CHECK (details IS NULL OR length(details) <= 2000),
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT,
  reviewer TEXT,
  review_note TEXT,
  public_grade TEXT
    CHECK (public_grade IS NULL OR public_grade IN ('good', 'fair', 'poor', 'impassable', 'unknown')),
  public_scope TEXT,
  public_observed_on TEXT,
  public_source_category TEXT
    CHECK (public_source_category IS NULL OR public_source_category IN ('resident', 'field-reporter')),
  public_source_ref TEXT,
  public_evidence TEXT
    CHECK (public_evidence IS NULL OR public_evidence IN ('verified', 'unverified')),
  CHECK (
    status != 'accepted'
    OR (
      reviewed_at IS NOT NULL
      AND reviewer IS NOT NULL
      AND public_grade IS NOT NULL
      AND public_scope IS NOT NULL
      AND public_observed_on IS NOT NULL
      AND public_source_category IS NOT NULL
      AND public_source_ref IS NOT NULL
      AND public_evidence IS NOT NULL
    )
  )
);

CREATE INDEX IF NOT EXISTS road_condition_submissions_status_created
  ON road_condition_submissions (status, created_at DESC);

-- A check the editor leaves without public wording is not published.
CREATE TABLE IF NOT EXISTS road_condition_checks (
  submission_id TEXT NOT NULL REFERENCES road_condition_submissions(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 3),
  label TEXT NOT NULL CHECK (length(label) BETWEEN 2 AND 120),
  reported_status TEXT NOT NULL CHECK (reported_status IN ('reported-yes', 'reported-no', 'unknown')),
  public_label TEXT CHECK (public_label IS NULL OR length(public_label) BETWEEN 2 AND 120),
  public_status TEXT
    CHECK (public_status IS NULL OR public_status IN ('reported-yes', 'reported-no', 'unknown')),
  CHECK ((public_label IS NULL) = (public_status IS NULL)),
  PRIMARY KEY (submission_id, position)
);

CREATE TABLE IF NOT EXISTS road_condition_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL REFERENCES road_condition_submissions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('submitted', 'accepted', 'rejected')),
  actor TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS road_condition_events_submission_created
  ON road_condition_events (submission_id, created_at DESC);

CREATE TRIGGER IF NOT EXISTS road_condition_review_event
AFTER UPDATE OF status ON road_condition_submissions
WHEN OLD.status = 'pending' AND NEW.status IN ('accepted', 'rejected')
BEGIN
  INSERT INTO road_condition_events (submission_id, event_type, actor, note)
  VALUES (NEW.id, NEW.status, NEW.reviewer, NEW.review_note);
END;

CREATE TABLE IF NOT EXISTS road_condition_rate_limits (
  ip_hash TEXT PRIMARY KEY,
  window_started TEXT NOT NULL,
  submission_count INTEGER NOT NULL CHECK (submission_count >= 1)
);
