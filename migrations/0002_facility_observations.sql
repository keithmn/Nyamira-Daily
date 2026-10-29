PRAGMA foreign_keys = ON;

-- Facility observation reports are kept apart from general correction reports
-- (decision #49). One report covers one capability at one facility.
CREATE TABLE IF NOT EXISTS facility_observation_submissions (
  id TEXT PRIMARY KEY,
  facility_id TEXT NOT NULL CHECK (length(facility_id) BETWEEN 1 AND 40),
  capability TEXT NOT NULL CHECK (length(capability) BETWEEN 2 AND 120),
  reported_status TEXT NOT NULL
    CHECK (reported_status IN ('reported-available', 'reported-unavailable', 'unknown')),
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
  public_capability TEXT,
  public_status TEXT
    CHECK (public_status IS NULL OR public_status IN ('reported-available', 'reported-unavailable', 'unknown')),
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
      AND public_capability IS NOT NULL
      AND public_status IS NOT NULL
      AND public_scope IS NOT NULL
      AND public_observed_on IS NOT NULL
      AND public_source_category IS NOT NULL
      AND public_source_ref IS NOT NULL
      AND public_evidence IS NOT NULL
    )
  )
);

CREATE INDEX IF NOT EXISTS facility_observation_submissions_status_created
  ON facility_observation_submissions (status, created_at DESC);

CREATE TABLE IF NOT EXISTS facility_observation_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id TEXT NOT NULL REFERENCES facility_observation_submissions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('submitted', 'accepted', 'rejected')),
  actor TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS facility_observation_events_submission_created
  ON facility_observation_events (submission_id, created_at DESC);

CREATE TRIGGER IF NOT EXISTS facility_observation_review_event
AFTER UPDATE OF status ON facility_observation_submissions
WHEN OLD.status = 'pending' AND NEW.status IN ('accepted', 'rejected')
BEGIN
  INSERT INTO facility_observation_events (submission_id, event_type, actor, note)
  VALUES (NEW.id, NEW.status, NEW.reviewer, NEW.review_note);
END;

-- A separate limiter so facility reports and correction reports do not share
-- one hourly allowance.
CREATE TABLE IF NOT EXISTS facility_observation_rate_limits (
  ip_hash TEXT PRIMARY KEY,
  window_started TEXT NOT NULL,
  submission_count INTEGER NOT NULL CHECK (submission_count >= 1)
);
