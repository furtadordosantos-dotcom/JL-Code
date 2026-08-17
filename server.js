require('dotenv').config();
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const OpenAI = require('openai');
const { db, allowedTechnologies, createAccesses } = require('./database');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'troque-esta-chave-antes-de-publicar';
const isProduction = process.env.NODE_ENV === 'production';
const planData = { BETA: { price: 12990, original: 22990 }, PRO: { price: 19990, original: 35990 } };
const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
const mailer = process.env.SMTP_HOST ? nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:Number(process.env.SMTP_PORT)===465,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}}) : null;

app.use(express.json({ limit: '40kb' }));
app.use(cookieParser());
app.use('/private', (_req, res) => res.status(404).json({ error: 'Arquivo não público.' }));
app.use(express.static(__dirname, { index: 'index.html', dotfiles: 'deny' }));

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, plan: user.plan, paymentStatus: user.payment_status,
    allowedTechnologies: allowedTechnologies(user), planStartedAt: user.plan_started_at, planEndsAt: user.plan_ends_at };
}
function sign(user) { return jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: '7d' }); }
function setSession(res, user) { res.cookie('jlcode_session', sign(user), { httpOnly: true, sameSite: 'lax', secure: isProduction, maxAge: 7 * 86400000 }); }
function auth(req, res, next) {
  try { const token = req.cookies.jlcode_session; if (!token) throw Error(); req.userId = Number(jwt.verify(token, JWT_SECRET).sub); next(); }
  catch { res.status(401).json({ error: 'Faça login para continuar.' }); }
}
function currentUser(id) { return db.prepare('SELECT * FROM users WHERE id = ?').get(id); }
async function sendMail(to, subject, html) { if (!mailer) throw Error('SMTP não configurado'); return mailer.sendMail({from:process.env.EMAIL_FROM,to,subject,html}); }
function classifyTechnology(text) {
  const value = text.toLowerCase();
  if (/\b(css|flexbox|grid|stylesheet|estilo|estiliza)/.test(value)) return 'CSS';
  if (/\b(javascript|js\b|dom|array|função|funcao|variável|variavel|node\.js)/.test(value)) return 'JAVASCRIPT';
  return 'HTML';
}

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!String(name || '').trim() || !/^\S+@\S+\.\S+$/.test(normalizedEmail)) return res.status(400).json({ error: 'Informe nome e um e-mail válido.' });
  if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'A senha deve ter ao menos 8 caracteres.' });
  if (password !== confirmPassword) return res.status(400).json({ error: 'As senhas não coincidem.' });
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail)) return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
  const result = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(String(name).trim(), normalizedEmail, await bcrypt.hash(password, 12));
  const user = currentUser(result.lastInsertRowid), token = crypto.randomBytes(32).toString('hex');
  db.prepare('INSERT INTO email_verifications (user_id,token_hash,expires_at) VALUES (?,?,?)').run(user.id, crypto.createHash('sha256').update(token).digest('hex'), new Date(Date.now()+86400000).toISOString());
  try { await sendMail(user.email, 'Confirme seu cadastro — JL Code', `<p>Olá, ${user.name}.</p><p>Seu cadastro no JL Code foi criado com sucesso.</p><p><a href="${appUrl}/api/auth/verify-email?token=${token}">CONFIRMAR MEU E-MAIL</a></p><p>Se você não criou esta conta, ignore esta mensagem.<br>JL Code</p>`); }
  catch (error) {
    console.error('Resend - erro ao enviar confirmação de cadastro:', error.message);
    return res.status(502).json({ error: `Não foi possível enviar o e-mail de confirmação: ${error.message}` });
  }
  res.status(201).json({ message: 'Cadastro criado. Confirme seu e-mail antes de entrar.' });
});
app.get('/api/auth/verify-email', (req,res) => { const hash=crypto.createHash('sha256').update(String(req.query.token||'')).digest('hex'); const row=db.prepare("SELECT * FROM email_verifications WHERE token_hash=? AND used_at IS NULL AND expires_at>datetime('now')").get(hash); if(!row)return res.status(400).send('Link inválido ou expirado.'); db.prepare('UPDATE email_verifications SET used_at=CURRENT_TIMESTAMP WHERE id=?').run(row.id); res.redirect('/login.html?verified=1'); });
app.post('/api/auth/login', async (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(req.body?.email || '').trim().toLowerCase());
  if (!user || !(await bcrypt.compare(String(req.body?.password || ''), user.password_hash))) return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
  if (!db.prepare('SELECT id FROM email_verifications WHERE user_id=? AND used_at IS NOT NULL').get(user.id)) return res.status(403).json({ error: 'Confirme seu e-mail antes de entrar.' });
  setSession(res, user); res.json({ user: publicUser(user) });
});
app.post('/api/auth/logout', (req, res) => { res.clearCookie('jlcode_session'); res.status(204).end(); });
app.get('/api/auth/me', auth, (req, res) => res.json({ user: publicUser(currentUser(req.userId)) }));
app.post('/api/auth/resend-verification', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  const genericMessage = 'Se necessário, enviamos um novo e-mail de confirmação. Confira a caixa de entrada e o spam.';
  if (!user) return res.json({ message: genericMessage });
  const confirmed = db.prepare('SELECT id FROM email_verifications WHERE user_id = ? AND used_at IS NOT NULL').get(user.id);
  if (confirmed) return res.json({ message: 'Este e-mail já foi confirmado. Você já pode entrar.' });
  const token = crypto.randomBytes(32).toString('hex');
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  db.prepare('UPDATE email_verifications SET used_at = CURRENT_TIMESTAMP WHERE user_id = ? AND used_at IS NULL').run(user.id);
  db.prepare('INSERT INTO email_verifications (user_id,token_hash,expires_at) VALUES (?,?,?)').run(user.id, hash, new Date(Date.now() + 86400000).toISOString());
  try {
    await sendMail(user.email, 'Confirme seu cadastro — JL Code', `<p>Olá, ${user.name}.</p><p>Para confirmar seu endereço de e-mail e ativar sua conta, clique no botão abaixo:</p><p><a href="${appUrl}/api/auth/verify-email?token=${token}">CONFIRMAR MEU E-MAIL</a></p><p>O link expira em 24 horas e só pode ser usado uma vez.</p><p>JL Code</p>`);
    return res.json({ message: genericMessage });
  } catch (error) {
    console.error('Resend - erro ao reenviar confirmação:', error.message);
    return res.status(502).json({ error: `Não foi possível reenviar o e-mail: ${error.message}` });
  }
});
app.post('/api/auth/forgot-password', (req, res) => res.status(501).json({ error: 'A recuperação de senha exige configurar um serviço de e-mail antes da publicação.' }));

app.get('/api/plans', (_req, res) => res.json({ plans: db.prepare('SELECT * FROM plans ORDER BY id').all() }));
app.post('/api/payments', auth, (req, res) => {
  const plan = String(req.body?.plan || '').toUpperCase(); const method = String(req.body?.method || 'PIX').toUpperCase();
  if (!planData[plan] || !['PIX', 'CARD'].includes(method)) return res.status(400).json({ error: 'Plano ou método de pagamento inválido.' });
  const transactionId = `JL-${crypto.randomUUID()}`;
  db.prepare('INSERT INTO payments (user_id, plan_code, amount_cents, method, transaction_id) VALUES (?, ?, ?, ?, ?)').run(req.userId, plan, planData[plan].price, method, transactionId);
  res.status(201).json({ transactionId, status: 'PENDING', message: 'Pagamento registrado como pendente. A liberação ocorre após a confirmação do provedor.' });
});
app.post('/api/payments/:transactionId/confirm-demo', auth, (req, res) => {
  if (process.env.DEV_DEMO_MODE !== 'true') return res.status(403).json({ error: 'Confirmação de demonstração desativada.' });
  const payment = db.prepare('SELECT * FROM payments WHERE transaction_id = ? AND user_id = ?').get(req.params.transactionId, req.userId);
  if (!payment) return res.status(404).json({ error: 'Pagamento não encontrado.' });
  const now = new Date(); const end = new Date(now); end.setFullYear(end.getFullYear() + 1);
  const transaction = db.transaction(() => {
    db.prepare("UPDATE payments SET status = 'CONFIRMED' WHERE id = ?").run(payment.id);
    db.prepare("UPDATE users SET plan = ?, payment_status = 'CONFIRMED', plan_started_at = ?, plan_ends_at = ? WHERE id = ?").run(payment.plan_code, now.toISOString(), end.toISOString(), req.userId);
    createAccesses(req.userId, payment.plan_code);
  }); transaction(); const updated = currentUser(req.userId);
  sendMail(updated.email, `Pagamento confirmado — Plano ${payment.plan_code === 'BETA' ? 'Beta' : 'Pro'} JL Code`, `<p>Olá, ${updated.name}.</p><p>Seu pagamento foi confirmado e o Plano ${payment.plan_code} está ativo.</p><p>As apostilas e recursos correspondentes foram liberados.</p><p><a href="${appUrl}/aluno.html">ACESSAR ÁREA DO ALUNO</a></p>`).catch(error => console.error('E-mail de pagamento:', error.message));
  res.json({ user: publicUser(updated) });
});
app.get('/api/student', auth, (req, res) => {
  const user = currentUser(req.userId); const accesses = db.prepare('SELECT technology, status FROM accesses WHERE user_id = ?').all(req.userId);
  res.json({ user: publicUser(user), accesses });
});
function canAccessApostila(user, requiredPlan) { return user.payment_status === 'CONFIRMED' && (user.plan === 'PRO' || requiredPlan === 'BETA' && user.plan === 'BETA'); }
app.get('/api/apostilas', auth, (req, res) => {
  const user = currentUser(req.userId);
  const items = db.prepare(`SELECT a.slug,a.title,a.description,a.required_plan,c.name AS course,COALESCE(ua.progress_percent,0) AS progress_percent FROM apostilas a JOIN courses c ON c.id=a.course_id LEFT JOIN user_apostila_access ua ON ua.apostila_id=a.id AND ua.user_id=? ORDER BY a.id`).all(req.userId);
  res.json({ apostilas: items.map((item) => ({ ...item, allowed: canAccessApostila(user, item.required_plan) })) });
});
app.get('/api/apostilas/:slug/pdf', auth, (req, res) => {
  const user = currentUser(req.userId); const apostila = db.prepare('SELECT * FROM apostilas WHERE slug=?').get(req.params.slug);
  if (!apostila) return res.status(404).json({ error: 'Apostila não encontrada.' });
  if (!canAccessApostila(user, apostila.required_plan)) return res.status(403).json({ error: 'Esta apostila não está liberada para o seu plano.' });
  const file = path.join(__dirname, 'private', 'apostilas', apostila.private_filename);
  if (!require('fs').existsSync(file)) return res.status(503).json({ error: 'Material em preparação.' });
  db.prepare(`INSERT INTO user_apostila_access (user_id,apostila_id,progress_percent,last_opened_at) VALUES (?,?,5,CURRENT_TIMESTAMP) ON CONFLICT(user_id,apostila_id) DO UPDATE SET progress_percent=MAX(progress_percent,5),last_opened_at=CURRENT_TIMESTAMP`).run(user.id,apostila.id);
  res.set({ 'Content-Type':'application/pdf', 'Content-Disposition':'inline', 'X-Content-Type-Options':'nosniff', 'Cache-Control':'private, no-store', 'Content-Security-Policy':"sandbox; default-src 'none'" }); res.sendFile(file);
});

app.get('/api/ai/history', auth, (req, res) => res.json({ messages: db.prepare('SELECT message, response, created_at FROM ai_conversations WHERE user_id = ? ORDER BY id DESC LIMIT 30').all(req.userId).reverse() }));
app.post('/api/ai/chat', auth, async (req, res) => {
  const user = currentUser(req.userId); const message = String(req.body?.message || '').trim();
  if (!message || message.length > 4000) return res.status(400).json({ error: 'Envie uma pergunta de até 4.000 caracteres.' });
  const allowed = allowedTechnologies(user);
  if (!allowed.length) return res.status(403).json({ error: 'Seu acesso à IA Gabriela está bloqueado. Assine um plano com pagamento confirmado para liberar o acesso.' });
  const topic = classifyTechnology(message);
  if (!allowed.includes(topic)) return res.status(403).json({ error: `Seu Plano ${user.plan === 'BETA' ? 'Beta' : 'atual'} libera somente ${allowed.join(', ')}. ${topic} está disponível no Plano Pro.` });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'A IA ainda não foi configurada. Defina OPENAI_API_KEY no servidor.' });
  try {
    const history = db.prepare('SELECT message, response FROM ai_conversations WHERE user_id = ? ORDER BY id DESC LIMIT 8').all(user.id).reverse();
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const instructions = `Você é Gabriela, professora acolhedora da plataforma JL Code para iniciantes. O aluno possui plano ${user.plan} e só pode estudar: ${allowed.join(', ')}. Responda apenas dúvidas sobre essas tecnologias. Explique em português do Brasil, passo a passo, com exemplos curtos e seguros; incentive o raciocínio em vez de simplesmente entregar a solução. Se o assunto for diferente, explique educadamente que não está no plano.`;
    const input = [...history.flatMap((item) => [{ role: 'user', content: item.message }, { role: 'assistant', content: item.response }]), { role: 'user', content: message }];
    const response = await client.responses.create({ model: process.env.OPENAI_MODEL || 'gpt-5.6', instructions, input });
    const answer = response.output_text || 'Não consegui gerar uma resposta agora. Tente novamente.';
    db.prepare('INSERT INTO ai_conversations (user_id, message, response, user_plan) VALUES (?, ?, ?, ?)').run(user.id, message, answer, user.plan);
    res.json({ answer });
  } catch (error) { console.error('AI error:', error.message); res.status(502).json({ error: 'Não foi possível obter a resposta da IA agora. Tente novamente.' }); }
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.listen(PORT, () => console.log(`JL Code em http://localhost:${PORT}`));

async function sendMail(to, subject, html) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY não configurada');
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM || 'JL Code <onboarding@resend.dev>', to: [to], subject, html })
  });
  const result = await response.json();
  if (!response.ok || result.message) throw new Error(result.message || 'Resend recusou o envio');
  console.log('Resend aceitou o e-mail:', result.id); return result;
}
