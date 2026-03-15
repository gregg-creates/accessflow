-- user_profiles
CREATE TABLE user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id),
  email         TEXT NOT NULL,
  full_name     TEXT,
  company_name  TEXT,
  plan          TEXT DEFAULT 'free',
  scan_credits  INT  DEFAULT 3,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- scans
CREATE TABLE scans (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID REFERENCES user_profiles(id),
  url                  TEXT NOT NULL,
  status               TEXT DEFAULT 'queued',
  error_reason         TEXT,
  pages_scanned        INT DEFAULT 0,
  pages_total          INT DEFAULT 0,
  risk_score           INT,
  violation_count      INT DEFAULT 0,
  critical_count       INT DEFAULT 0,
  serious_count        INT DEFAULT 0,
  pdf_link_count       INT DEFAULT 0,
  widget_count         INT DEFAULT 0,
  demand_letter_mode   BOOLEAN DEFAULT FALSE,
  prior_scan_id        UUID REFERENCES scans(id),
  report_json          JSONB,
  pdf_url              TEXT,
  email_captured       TEXT,
  job_started_at       TIMESTAMPTZ,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  completed_at         TIMESTAMPTZ
);

-- violations
CREATE TABLE violations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id           UUID REFERENCES scans(id) ON DELETE CASCADE,
  wcag_id           TEXT,
  wcag_criterion    TEXT,
  wcag_version      TEXT,
  impact            TEXT,
  legal_risk        TEXT,
  page_url          TEXT,
  element_html      TEXT,
  element_selector  TEXT,
  plain_english     TEXT,
  fix_instruction   TEXT,
  fix_code_snippet  TEXT,
  fix_difficulty    TEXT,
  effort_tier       TEXT,
  effort_hours_est  TEXT,
  litigation_likelihood TEXT,
  fix_urgency           TEXT,
  good_faith_note       TEXT,
  enrichment_status TEXT DEFAULT 'pending',
  axe_raw           JSONB,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- pdf_links
CREATE TABLE pdf_links (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id    UUID REFERENCES scans(id) ON DELETE CASCADE,
  page_url   TEXT,
  pdf_url    TEXT,
  link_text  TEXT,
  status     TEXT DEFAULT 'unverified',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- third_party_widgets
CREATE TABLE third_party_widgets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id      UUID REFERENCES scans(id) ON DELETE CASCADE,
  page_url     TEXT,
  widget_type  TEXT,
  src_domain   TEXT,
  element_html TEXT,
  note         TEXT,
  action       TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- leads
CREATE TABLE leads (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT NOT NULL UNIQUE,
  scan_id           UUID REFERENCES scans(id),
  source            TEXT,
  converted_to_user BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_own_scans ON scans FOR ALL USING (auth.uid() = user_id);

ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_own_violations ON violations FOR ALL
  USING (scan_id IN (SELECT id FROM scans WHERE user_id = auth.uid()));

ALTER TABLE pdf_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_own_pdf_links ON pdf_links FOR ALL
  USING (scan_id IN (SELECT id FROM scans WHERE user_id = auth.uid()));

ALTER TABLE third_party_widgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_own_widgets ON third_party_widgets FOR ALL
  USING (scan_id IN (SELECT id FROM scans WHERE user_id = auth.uid()));
