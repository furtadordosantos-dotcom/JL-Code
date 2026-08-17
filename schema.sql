PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  plan TEXT NOT NULL DEFAULT 'FREE' CHECK(plan IN ('FREE','BETA','PRO')),
  payment_status TEXT NOT NULL DEFAULT 'PENDING' CHECK(payment_status IN ('PENDING','CONFIRMED','EXPIRED','CANCELED')),
  plan_started_at TEXT,
  plan_ends_at TEXT
);

CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE CHECK(code IN ('BETA','PRO')),
  name TEXT NOT NULL,
  promotional_price_cents INTEGER NOT NULL,
  original_price_cents INTEGER NOT NULL,
  allowed_technologies TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS email_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  plan_code TEXT NOT NULL CHECK(plan_code IN ('BETA','PRO')),
  amount_cents INTEGER NOT NULL,
  method TEXT NOT NULL CHECK(method IN ('PIX','CARD')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','CONFIRMED','FAILED','CANCELED')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  transaction_id TEXT UNIQUE,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS accesses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  course TEXT NOT NULL,
  technology TEXT NOT NULL CHECK(technology IN ('HTML','CSS','JAVASCRIPT')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','BLOCKED','EXPIRED')),
  UNIQUE(user_id, technology),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_plan TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  required_plan TEXT NOT NULL CHECK(required_plan IN ('BETA','PRO'))
);
CREATE TABLE IF NOT EXISTS apostilas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  required_plan TEXT NOT NULL CHECK(required_plan IN ('BETA','PRO')),
  private_filename TEXT NOT NULL,
  FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS user_apostila_access (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  apostila_id INTEGER NOT NULL,
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK(progress_percent BETWEEN 0 AND 100),
  last_opened_at TEXT,
  UNIQUE(user_id, apostila_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(apostila_id) REFERENCES apostilas(id) ON DELETE CASCADE
);

INSERT OR IGNORE INTO plans (code, name, promotional_price_cents, original_price_cents, allowed_technologies)
VALUES ('BETA', 'Plano Beta', 12990, 22990, 'HTML'),
       ('PRO', 'Plano Pro', 19990, 35990, 'HTML,CSS,JAVASCRIPT');
INSERT OR IGNORE INTO courses (code,name,required_plan) VALUES ('HTML','HTML','BETA'),('CSS','CSS','PRO'),('JAVASCRIPT','JavaScript','PRO');
INSERT OR IGNORE INTO apostilas (course_id,slug,title,description,required_plan,private_filename) VALUES
 ((SELECT id FROM courses WHERE code='HTML'),'html-fundamentos','HTML do básico ao avançado','Estrutura, semântica, formulários, acessibilidade, exercícios e projetos.','BETA','html-fundamentos.pdf'),
 ((SELECT id FROM courses WHERE code='CSS'),'css-interface','CSS do básico ao avançado','Seletores, box model, Flexbox, Grid, responsividade e animações.','PRO','css-interface.pdf'),
 ((SELECT id FROM courses WHERE code='JAVASCRIPT'),'javascript-pratica','JavaScript do básico ao avançado','Lógica, DOM, eventos, APIs e projetos práticos.','PRO','javascript-pratica.pdf');
