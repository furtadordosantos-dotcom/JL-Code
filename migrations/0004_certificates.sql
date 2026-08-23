CREATE TABLE IF NOT EXISTS final_exam_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  answers_json TEXT NOT NULL,
  total_questions INTEGER NOT NULL DEFAULT 50,
  correct_answers INTEGER NOT NULL,
  percentage REAL NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('PASSED','FAILED')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, attempt_number)
);
CREATE TABLE IF NOT EXISTS certificates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  certificate_code TEXT NOT NULL UNIQUE,
  course_name TEXT NOT NULL DEFAULT 'PROGRAMAÇÃO WEB',
  level TEXT NOT NULL DEFAULT 'JÚNIOR PROFISSIONAL',
  completed_at TEXT NOT NULL,
  training_days INTEGER NOT NULL,
  score_percent REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'VALID',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_final_exam_attempts_user ON final_exam_attempts(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(certificate_code);
