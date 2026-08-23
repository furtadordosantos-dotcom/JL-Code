import bcrypt from 'bcryptjs';
import { finalExamQuestions, publicQuestions } from './exam-catalog.js';

const plans = {
  BETA: { price: 12990, name: 'Plano Beta', description: 'Acesso ao Plano Beta JL Code por 15 dias' },
  PRO: { price: 19990, name: 'Plano Pro', description: 'Acesso ao Plano Pro JL Code por 15 dias' }
};
const INFINITEPAY_CHECKOUT_URL = 'https://api.checkout.infinitepay.io/links';
const INFINITEPAY_CHECK_URL = 'https://api.checkout.infinitepay.io/payment_check';
const PLAN_DURATION_MS = 15 * 24 * 60 * 60 * 1000;
const exerciseCatalog = [
  {id:'html-title',technology:'HTML',requiredPlan:'BETA',level:'Básico',title:'Meu primeiro título',description:'Aprenda a criar uma página com título e parágrafo.',goal:'Crie um h1 com seu nome e um p contando o que você quer aprender.',starterCode:'<h1>Olá, eu sou ...</h1>\n<p>Quero aprender programação.</p>'},
  {id:'html-links',technology:'HTML',requiredPlan:'BETA',level:'Básico',title:'Links e imagens',description:'Use uma imagem e um link de forma acessível.',goal:'Adicione uma imagem com alt e um link para um site que você gosta.',starterCode:'<h1>Meu site favorito</h1>\n<img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80" alt="Pessoa usando um notebook">\n<p><a href="https://developer.mozilla.org/pt-BR/">Aprender na MDN</a></p>'},
  {id:'html-form',technology:'HTML',requiredPlan:'BETA',level:'Intermediário',title:'Formulário de contato',description:'Pratique labels, inputs e botão de envio.',goal:'Crie campos para nome e e-mail; cada campo precisa ter um label.',starterCode:'<h1>Fale comigo</h1>\n<form>\n  <label>Nome <input type="text"></label><br>\n  <label>E-mail <input type="email"></label><br>\n  <button type="submit">Enviar</button>\n</form>'},
  {id:'html-semantic',technology:'HTML',requiredPlan:'BETA',level:'Intermediário',title:'Página semântica',description:'Organize um conteúdo usando header, main, article e footer.',goal:'Monte uma notícia curta sem usar div para todas as partes.',starterCode:'<header><h1>Jornal da JL Code</h1></header>\n<main>\n  <article><h2>Minha primeira notícia</h2><p>Escreva aqui.</p></article>\n</main>\n<footer>Feito por mim</footer>'},
  {id:'css-colors',technology:'CSS',requiredPlan:'PRO',level:'Básico',title:'Cores e tipografia',description:'Estilize uma apresentação usando CSS dentro da página.',goal:'Mude a cor do título, escolha uma fonte e dê espaço ao conteúdo.',starterCode:'<style>\n  h1 { color: #1769e0; }\n  p { font-family: Arial, sans-serif; }\n</style>\n<h1>Meu cartão</h1>\n<p>Eu estou aprendendo CSS.</p>'},
  {id:'css-flex',technology:'CSS',requiredPlan:'PRO',level:'Intermediário',title:'Layout com Flexbox',description:'Posicione cartões lado a lado e mantenha espaço entre eles.',goal:'Use display:flex e gap para organizar os três cartões.',starterCode:'<style>\n  .cards { display: flex; gap: 12px; }\n  .card { padding: 20px; background: #e7f1ff; border-radius: 10px; }\n</style>\n<div class="cards">\n  <div class="card">HTML</div><div class="card">CSS</div><div class="card">JavaScript</div>\n</div>'},
  {id:'css-responsive',technology:'CSS',requiredPlan:'PRO',level:'Avançado',title:'Cartão responsivo',description:'Use uma media query para adaptar um cartão ao celular.',goal:'No celular, diminua o tamanho do título e deixe o cartão ocupar a largura toda.',starterCode:'<style>\n  .box { max-width: 520px; padding: 24px; margin: 20px auto; background: #172b4d; color: white; border-radius: 12px; }\n  @media (max-width: 600px) {\n    .box { margin: 10px; }\n    h1 { font-size: 24px; }\n  }\n</style>\n<section class="box"><h1>Site responsivo</h1><p>Teste diminuindo a janela.</p></section>'},
  {id:'js-button',technology:'JAVASCRIPT',requiredPlan:'PRO',level:'Básico',title:'Botão interativo',description:'Faça uma página reagir a um clique.',goal:'Altere o texto do parágrafo quando a pessoa clicar no botão.',starterCode:'<button id="botao">Clique aqui</button>\n<p id="mensagem">Esperando o clique...</p>\n<script>\n  document.querySelector("#botao").addEventListener("click", () => {\n    document.querySelector("#mensagem").textContent = "Você conseguiu!";\n  });\n<\/script>'},
  {id:'js-list',technology:'JAVASCRIPT',requiredPlan:'PRO',level:'Intermediário',title:'Lista de tarefas',description:'Pratique arrays e criação de elementos no DOM.',goal:'Adicione mais uma tarefa ao array e veja-a aparecer na lista.',starterCode:'<ul id="lista"></ul>\n<script>\n  const tarefas = ["Estudar HTML", "Praticar CSS", "Aprender JavaScript"];\n  const lista = document.querySelector("#lista");\n  tarefas.forEach((tarefa) => {\n    const item = document.createElement("li");\n    item.textContent = tarefa;\n    lista.append(item);\n  });\n<\/script>'}
];
const professionalExerciseTracks=[
['html-accessibility','HTML','Acessibilidade auditável','Projete um formulário de inscrição acessível por teclado, com labels, mensagens de erro e foco previsível.','Crie formulário com campo obrigatório, aria-describedby e uma mensagem de erro que não dependa apenas de cor.'],
['html-portfolio','HTML','Portfólio semântico','Estruture uma página de portfólio pronta para recrutadores e leitores de tela.','Use header, nav, main, section, article e footer; adicione links de projeto com descrições claras.'],
['html-seo','HTML','SEO técnico','Modele uma página de artigo com metadados, hierarquia e conteúdo compartilhável.','Inclua title, meta description, imagem com alt e apenas um h1.'],
['css-dashboard','CSS','Dashboard responsivo','Construa um painel que organize métricas sem quebrar em celular.','Use Grid com áreas, clamp para espaçamento e uma media query mobile-first.'],
['css-design-system','CSS','Mini design system','Crie tokens reutilizáveis para cores, tipografia, espaçamento e estados.','Declare variáveis CSS e aplique-as em botão, cartão e formulário.'],
['css-layout','CSS','Layout editorial','Monte uma página editorial combinando Grid, Flexbox e conteúdo fluido.','Crie cabeçalho, coluna de leitura e barra lateral que vire uma coluna no celular.'],
['css-motion','CSS','Animação responsável','Adicione feedback visual sem prejudicar pessoas sensíveis a movimento.','Crie transição de card e respeite prefers-reduced-motion.'],
['css-theme','CSS','Tema claro e escuro','Implemente tema consistente usando variáveis e preferência do sistema.','Use prefers-color-scheme e garanta contraste em ambos os temas.'],
['js-api','JAVASCRIPT','Consumo robusto de API','Busque dados remotos, trate carregamento, erro e sucesso na interface.','Use fetch com try/catch e renderize um estado de carregamento acessível.'],
['js-state','JAVASCRIPT','Estado de interface','Construa uma lista filtrável sem duplicar elementos ou listeners.','Mantenha estado em objeto e renderize a tela a partir dele.'],
['js-form','JAVASCRIPT','Validação de formulário','Valide dados no navegador com mensagens úteis antes do envio.','Cheque formato, campos obrigatórios e mostre a mensagem perto do campo.'],
['js-storage','JAVASCRIPT','Persistência local','Salve preferências de estudo com LocalStorage e restaure ao recarregar.','Crie controle de tema ou progresso com JSON.stringify e JSON.parse.'],
['js-events','JAVASCRIPT','Delegação de eventos','Implemente uma lista dinâmica sem criar um listener para cada item.','Use um único listener no contêiner e identifique o item clicado.'],
['js-performance','JAVASCRIPT','Performance de busca','Construa campo de busca com debounce e resultado vazio.','Espere um curto intervalo antes de filtrar e evite renderizações desnecessárias.'],
['js-security','JAVASCRIPT','Renderização segura','Exiba conteúdo recebido sem usar innerHTML para dados externos.','Crie elementos com createElement e use textContent para dados do usuário.'],
['js-architecture','JAVASCRIPT','Módulo de componentes','Organize um componente de cartão com funções pequenas e testáveis.','Separe dados, renderização e eventos em funções diferentes.'],
['js-project-kanban','JAVASCRIPT','Projeto Kanban','Crie quadro com colunas, cartões e persistência local.','Permita adicionar cartão e mover status sem perder dados ao recarregar.'],
['js-project-catalog','JAVASCRIPT','Projeto catálogo','Crie catálogo com filtro, ordenação e estado vazio.','Use array de objetos, map/filter e mensagens de interface claras.']
];
exerciseCatalog.push(...professionalExerciseTracks.map(([id,technology,title,description,goal])=>({id,technology,requiredPlan:'PRO',level:'Profissional',title,description,goal,starterCode:technology==='HTML'?'<main>\n  <h1>Desafio JL Code</h1>\n</main>':technology==='CSS'?'<style>\n  :root { --brand: #1769e0; }\n</style>\n<main class="app">Comece aqui</main>':'<main><h1>Desafio JL Code</h1><div id="app"></div></main>\n<script>\n  const app = document.querySelector("#app");\n<\\/script>'})));
const json = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
const now = () => new Date().toISOString();
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const emailLayout = (content) => `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#07111f;font-family:Arial,Helvetica,sans-serif;color:#eaf3ff"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:28px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#0d1d33;border:1px solid #24476f;border-radius:18px;overflow:hidden"><tr><td align="center" style="padding:26px 24px 8px"><img src="https://jlcode.pages.dev/logo-jlcode.jpg" width="112" height="112" alt="JL Code" style="display:block;border-radius:56px;border:2px solid #2687ff"><h1 style="margin:16px 0 0;font-size:26px;color:#ffffff">JL Code</h1><p style="margin:6px 0 0;color:#66caff;font-weight:700;letter-spacing:1px;font-size:12px">CRIAR · APRENDER · EVOLUIR</p></td></tr><tr><td style="padding:22px 32px 34px;color:#dceaff;font-size:16px;line-height:1.6">${content}<p style="margin:28px 0 0;color:#9db2cc;font-size:13px">Se você não solicitou esta ação, pode ignorar este e-mail.</p></td></tr></table></td></tr></table></body></html>`;
function cookie(request, name) { return request.headers.get('cookie')?.split(';').map(x => x.trim()).find(x => x.startsWith(`${name}=`))?.slice(name.length + 1); }
function b64(data) { return btoa(String.fromCharCode(...new Uint8Array(data))).replaceAll('+','-').replaceAll('/','_').replaceAll('=',''); }
function ub64(value) { const raw = atob(value.replaceAll('-','+').replaceAll('_','/') + '==='.slice((value.length + 3) % 4)); return Uint8Array.from(raw, c => c.charCodeAt(0)); }
async function sha(value) { return b64(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))); }
async function key(secret) { return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name:'HMAC', hash:'SHA-256' }, false, ['sign','verify']); }
async function sessionToken(id, secret) { const header=btoa('{"alg":"HS256","typ":"JWT"}').replaceAll('=',''); const body=btoa(JSON.stringify({sub:id,exp:Math.floor(Date.now()/1000)+604800})).replaceAll('=',''); const data=`${header}.${body}`; return `${data}.${b64(await crypto.subtle.sign('HMAC', await key(secret), new TextEncoder().encode(data)))}`; }
async function session(request, env) { try { const value=cookie(request,'jlcode_session'); if(!value) return null; const [a,b,s]=value.split('.'); if(!a||!b||!s||!(await crypto.subtle.verify('HMAC',await key(env.JWT_SECRET),ub64(s),new TextEncoder().encode(`${a}.${b}`)))) return null; const payload=JSON.parse(new TextDecoder().decode(ub64(b))); return payload.exp > Date.now()/1000 ? Number(payload.sub) : null; } catch { return null; } }
const lifetimeProEmails = new Set(['julianolucas004@gmail.com']);
const revokedTestAccountEmails = new Set(['furtadordosantos@gmail.com']);
async function user(env,id) {
  let account=await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(id).first();
  if(!account) return account;
  if(revokedTestAccountEmails.has(String(account.email).toLowerCase()) && (account.plan!=='FREE'||account.payment_status!=='PENDING')) {
    await env.DB.batch([
      env.DB.prepare("UPDATE users SET plan='FREE', payment_status='PENDING', plan_started_at=NULL, plan_ends_at=NULL WHERE id=?").bind(account.id),
      env.DB.prepare("UPDATE accesses SET status='BLOCKED' WHERE user_id=?").bind(account.id)
    ]);
    return env.DB.prepare('SELECT * FROM users WHERE id=?').bind(id).first();
  }
  if(lifetimeProEmails.has(String(account.email).toLowerCase())) {
    if(account.plan!=='PRO'||account.payment_status!=='CONFIRMED'||account.plan_ends_at!==null) {
      await env.DB.batch([
        env.DB.prepare("UPDATE users SET plan='PRO', payment_status='CONFIRMED', plan_started_at=COALESCE(plan_started_at, ?), plan_ends_at=NULL WHERE id=?").bind(now(),account.id),
        ...['HTML','CSS','JAVASCRIPT'].map(t=>env.DB.prepare("INSERT INTO accesses (user_id,course,technology,status) VALUES (?,?,?,'ACTIVE') ON CONFLICT(user_id,technology) DO UPDATE SET status='ACTIVE'").bind(account.id,t,t))
      ]);
      account=await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(id).first();
    }
    return account;
  }
  if(account.payment_status==='CONFIRMED'&&account.plan_ends_at&&Date.parse(account.plan_ends_at)<=Date.now()) {
    await env.DB.batch([
      env.DB.prepare("UPDATE users SET plan='FREE', payment_status='EXPIRED' WHERE id=?").bind(account.id),
      env.DB.prepare("UPDATE accesses SET status='EXPIRED' WHERE user_id=?").bind(account.id)
    ]);
    account=await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(id).first();
  }
  return account;
}
function allowed(u) { return u.payment_status === 'CONFIRMED' ? u.plan === 'PRO' ? ['HTML','CSS','JAVASCRIPT'] : u.plan === 'BETA' ? ['HTML'] : [] : []; }
function isAdmin(u) { return String(u?.email || '').toLowerCase() === 'julianolucas004@gmail.com'; }
function publicUser(u) { return { id:u.id,name:u.name,email:u.email,plan:u.plan,paymentStatus:u.payment_status,allowedTechnologies:allowed(u),planStartedAt:u.plan_started_at,planEndsAt:u.plan_ends_at,isAdmin:isAdmin(u) }; }
async function mail(env,to,subject,html) { if(!env.BREVO_API_KEY || !env.EMAIL_FROM) throw Error('O envio de e-mail não está configurado.'); const r=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':env.BREVO_API_KEY,'content-type':'application/json','accept':'application/json'},body:JSON.stringify({sender:{name:'JL Code',email:env.EMAIL_FROM},to:[{email:to}],subject,htmlContent:html})}); const data=await r.json().catch(()=>({})); if(!r.ok) throw Error(data.message || data.code || 'O Brevo recusou o envio.'); }
async function requireUser(context) { const id=await session(context.request,context.env); if(!id) return null; return user(context.env,id); }
async function createVerification(env,u,origin) { await env.DB.prepare('DELETE FROM email_verifications WHERE user_id=? AND used_at IS NULL').bind(u.id).run(); const token=crypto.randomUUID()+crypto.randomUUID(); await env.DB.prepare('INSERT INTO email_verifications (user_id,token_hash,expires_at) VALUES (?,?,?)').bind(u.id,await sha(token),new Date(Date.now()+86400000).toISOString()).run(); const link=`${origin}/api/auth/verify-email?token=${encodeURIComponent(token)}`; await mail(env,u.email,'Confirme seu cadastro — JL Code',emailLayout(`<p>Olá, ${escapeHtml(u.name)}.</p><p>Seu cadastro foi criado com sucesso. Confirme seu e-mail para ativar a sua conta:</p><p style="text-align:center;margin:28px 0"><a href="${link}" style="display:inline-block;background:#2687ff;color:#ffffff;text-decoration:none;border-radius:9px;padding:13px 22px;font-weight:700">CONFIRMAR MEU E-MAIL</a></p><p style="font-size:13px;color:#9db2cc">Este link é válido por 24 horas. Use sempre o botão do e-mail mais recente.</p>`)); }
function topic(message) { const text=message.toLowerCase(); if(/\b(css|flexbox|grid|stylesheet|estilo)/.test(text)) return 'CSS'; if(/\b(javascript|js\b|dom|array|função|funcao|variável|variavel)/.test(text)) return 'JAVASCRIPT'; return 'HTML'; }

async function createPasswordReset(env,u,origin) {
  await env.DB.prepare('DELETE FROM password_reset_tokens WHERE user_id=? AND used_at IS NULL').bind(u.id).run();
  const token=crypto.randomUUID()+crypto.randomUUID();
  await env.DB.prepare('INSERT INTO password_reset_tokens (user_id,token_hash,expires_at) VALUES (?,?,?)').bind(u.id,await sha(token),new Date(Date.now()+3600000).toISOString()).run();
  await mail(env,u.email,'Redefina sua senha — JL Code',emailLayout(`<p>Olá, ${escapeHtml(u.name)}.</p><p>Recebemos um pedido para redefinir a senha da sua conta JL Code.</p><p style="text-align:center;margin:28px 0"><a href="${origin}/redefinir-senha.html?token=${encodeURIComponent(token)}" style="display:inline-block;background:#2687ff;color:#ffffff;text-decoration:none;border-radius:9px;padding:13px 22px;font-weight:700">REDEFINIR MINHA SENHA</a></p><p style="font-size:13px;color:#9db2cc">Este link expira em uma hora e pode ser usado uma única vez.</p>`));
}

function apiOrigin(env, url) { return String(env.APP_URL || url.origin).replace(/\/$/, ''); }
function infinitePayConfigured(env) { return Boolean(env.INFINITEPAY_HANDLE); }
async function infinitePayRequest(endpoint, payload) {
  const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify(payload)});
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw Error(data.message||data.error||'A InfinitePay não conseguiu criar ou confirmar o checkout.');
  return data;
}
async function activateInfinitePayOrder(env, order, payment) {
  if(order.status==='PAID') return order;
  if(!payment?.success||payment.paid!==true||Number(payment.amount)!==Number(order.amount_cents)) throw Error('A InfinitePay ainda não confirmou este pagamento com o valor correto.');
  const method=String(payment.capture_method||'').toLowerCase()==='credit_card'?'CARD':'PIX';
  const start=now(), end=new Date(Date.now()+PLAN_DURATION_MS).toISOString();
  const technologies=order.plan_code==='PRO'?['HTML','CSS','JAVASCRIPT']:['HTML'];
  const paid=await env.DB.prepare("UPDATE payment_orders SET status='PAID', transaction_nsu=?, invoice_slug=COALESCE(invoice_slug,?), receipt_url=?, capture_method=?, confirmed_at=?, expires_at=? WHERE id=? AND status='PENDING'")
    .bind(String(payment.transaction_nsu||order.transaction_nsu||''),String(payment.slug||payment.invoice_slug||order.invoice_slug||'')||null,String(payment.receipt_url||order.receipt_url||'')||null,String(payment.capture_method||order.capture_method||'')||null,now(),end,order.id).run();
  if(!paid.meta.changes) return env.DB.prepare('SELECT * FROM payment_orders WHERE id=?').bind(order.id).first();
  await env.DB.batch([
    env.DB.prepare("INSERT OR IGNORE INTO payments (user_id,plan_code,amount_cents,method,status,transaction_id) VALUES (?,?,?,?,?,?)").bind(order.user_id,order.plan_code,order.amount_cents,method,'CONFIRMED',String(payment.transaction_nsu||order.order_nsu)),
    env.DB.prepare("UPDATE users SET plan=?, payment_status='CONFIRMED', plan_started_at=?, plan_ends_at=? WHERE id=?").bind(order.plan_code,start,end,order.user_id),
    ...technologies.map(t=>env.DB.prepare("INSERT INTO accesses (user_id,course,technology,status) VALUES (?,?,?,'ACTIVE') ON CONFLICT(user_id,technology) DO UPDATE SET status='ACTIVE'").bind(order.user_id,t,t)),
    ...(order.plan_code==='BETA' ? ['CSS','JAVASCRIPT'].map(t=>env.DB.prepare("INSERT INTO accesses (user_id,course,technology,status) VALUES (?,?,?,'BLOCKED') ON CONFLICT(user_id,technology) DO UPDATE SET status='BLOCKED'").bind(order.user_id,t,t)) : [])
  ]);
  return env.DB.prepare('SELECT * FROM payment_orders WHERE id=?').bind(order.id).first();
}
async function verifyInfinitePayOrder(env, order, details) {
  if(order.status==='PAID') return order;
  const transaction_nsu=String(details.transaction_nsu||'').trim();
  const slug=String(details.slug||details.invoice_slug||order.invoice_slug||'').trim();
  if(!transaction_nsu||!slug) throw Error('Dados de confirmação do pagamento incompletos.');
  const payment=await infinitePayRequest(INFINITEPAY_CHECK_URL,{handle:env.INFINITEPAY_HANDLE,order_nsu:order.order_nsu,transaction_nsu,slug});
  return activateInfinitePayOrder(env,order,{...payment,transaction_nsu,slug,receipt_url:details.receipt_url||''});
}

export async function onRequest(context) {
  const { request, env } = context; const url=new URL(request.url); const path=url.pathname.replace(/^\/api\/?/,'').split('/').filter(Boolean); const method=request.method; const body=method==='GET'||method==='HEAD'?{}:await request.json().catch(()=>({}));
  const auth=async()=>{ const u=await requireUser(context); return u || json({error:'Faça login para continuar.'},401); };
  try {
    if(method==='POST'&&path.join('/')==='auth/forgot-password') {
      const email=String(body.email||'').trim().toLowerCase();
      if(!/^\S+@\S+\.\S+$/.test(email)) return json({error:'Informe um e-mail válido.'},400);
      const u=await env.DB.prepare('SELECT * FROM users WHERE email=?').bind(email).first();
      if(u) await createPasswordReset(env,u,env.APP_URL||url.origin);
      return json({message:'Se este e-mail estiver cadastrado, você receberá um link para redefinir a senha.'});
    }
    if(method==='POST'&&path.join('/')==='auth/reset-password') {
      const token=String(body.token||''), password=String(body.password||'');
      if(!token||password.length<8||password!==body.confirmPassword) return json({error:'Use uma senha de pelo menos 8 caracteres e confirme-a corretamente.'},400);
      const reset=await env.DB.prepare('SELECT * FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>?').bind(await sha(token),now()).first();
      if(!reset) return json({error:'Este link é inválido, já foi usado ou expirou.'},400);
      await env.DB.batch([
        env.DB.prepare('UPDATE users SET password_hash=? WHERE id=?').bind(await bcrypt.hash(password,12),reset.user_id),
        env.DB.prepare('UPDATE password_reset_tokens SET used_at=? WHERE id=?').bind(now(),reset.id)
      ]);
      return json({message:'Senha alterada com sucesso. Entre usando sua nova senha.'});
    }
    if(method==='POST'&&path.join('/')==='auth/register') { const name=String(body.name||'').trim(), email=String(body.email||'').trim().toLowerCase(), password=String(body.password||''); if(!name||!/^\S+@\S+\.\S+$/.test(email)||password.length<8||password!==body.confirmPassword) return json({error:'Revise nome, e-mail e senha (mínimo de 8 caracteres).'},400); if(await env.DB.prepare('SELECT id FROM users WHERE email=?').bind(email).first()) return json({error:'Este e-mail já está cadastrado.'},409); const result=await env.DB.prepare('INSERT INTO users (name,email,password_hash) VALUES (?,?,?)').bind(name,email,await bcrypt.hash(password,12)).run(); const u=await user(env,result.meta.last_row_id); try { await createVerification(env,u,env.APP_URL||url.origin); } catch(error) { return json({error:`Conta criada, mas o e-mail não pôde ser enviado: ${error.message}`},502); } return json({message:'Cadastro criado. Confirme seu e-mail antes de entrar.'},201); }
    if(method==='GET'&&path.join('/')==='auth/verify-email') { const row=await env.DB.prepare('SELECT * FROM email_verifications WHERE token_hash=? AND used_at IS NULL AND expires_at>?').bind(await sha(url.searchParams.get('token')||''),now()).first(); if(!row) return new Response('Link inválido ou expirado.',{status:400}); await env.DB.prepare('UPDATE email_verifications SET used_at=? WHERE id=?').bind(now(),row.id).run(); return Response.redirect(`${url.origin}/login.html?verified=1`,302); }
    if(method==='POST'&&path.join('/')==='auth/resend-verification') { const u=await env.DB.prepare('SELECT * FROM users WHERE email=?').bind(String(body.email||'').trim().toLowerCase()).first(); if(!u) return json({message:'Se necessário, enviamos um novo e-mail de confirmação.'}); const verified=await env.DB.prepare('SELECT id FROM email_verifications WHERE user_id=? AND used_at IS NOT NULL').bind(u.id).first(); if(verified) return json({message:'Este e-mail já foi confirmado. Você já pode entrar.'}); await createVerification(env,u,env.APP_URL||url.origin); return json({message:'E-mail de confirmação reenviado. Confira a caixa de entrada e o spam.'}); }
    if(method==='POST'&&path.join('/')==='auth/login') { const u=await env.DB.prepare('SELECT * FROM users WHERE email=?').bind(String(body.email||'').trim().toLowerCase()).first(); if(!u||!(await bcrypt.compare(String(body.password||''),u.password_hash))) return json({error:'E-mail ou senha inválidos.'},401); if(!await env.DB.prepare('SELECT id FROM email_verifications WHERE user_id=? AND used_at IS NOT NULL').bind(u.id).first()) return json({error:'Confirme seu e-mail antes de entrar.'},403); const account=await user(env,u.id); const secure=url.protocol==='https:'?'; Secure':''; return json({user:publicUser(account)},200,{'set-cookie':`jlcode_session=${await sessionToken(u.id,env.JWT_SECRET)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${secure}`}); }
    if(method==='POST'&&path.join('/')==='auth/logout') return new Response(null,{status:204,headers:{'set-cookie':'jlcode_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0'}});
    if(method==='POST'&&path.join('/')==='auth/forgot-password') return json({error:'A recuperação de senha será disponibilizada em breve.'},501);
    if(method==='GET'&&path.join('/')==='auth/me') { const u=await auth(); return u instanceof Response?u:json({user:publicUser(u)}); }
    if(method==='GET'&&path.join('/')==='plans') return json({plans:(await env.DB.prepare('SELECT * FROM plans ORDER BY id').all()).results});
    if(method==='POST'&&path.join('/')==='payments/infinitepay/checkout') {
      const u=await auth(); if(u instanceof Response)return u;
      const plan=String(body.plan||'').toUpperCase();
      const paymentMethod=String(body.paymentMethod||'').toUpperCase();
      if(!plans[plan]) return json({error:'Plano inválido.'},400);
      if(paymentMethod && !['PIX','CARD'].includes(paymentMethod)) return json({error:'Forma de pagamento inválida.'},400);
      if(!infinitePayConfigured(env)) return json({error:'O checkout da InfinitePay ainda não foi configurado.'},503);
      const origin=apiOrigin(env,url), orderNsu=`JL-${crypto.randomUUID()}`;
      await env.DB.prepare('INSERT INTO payment_orders (user_id,plan_code,amount_cents,order_nsu) VALUES (?,?,?,?)').bind(u.id,plan,plans[plan].price,orderNsu).run();
      try {
        const checkout=await infinitePayRequest(INFINITEPAY_CHECKOUT_URL,{
          handle:env.INFINITEPAY_HANDLE,
          order_nsu:orderNsu,
          redirect_url:`${origin}/pagamento-aprovado.html?order_nsu=${encodeURIComponent(orderNsu)}`,
          webhook_url:`${origin}/api/payments/infinitepay/webhook`,
          customer:{name:u.name,email:u.email},
          items:[{quantity:1,price:plans[plan].price,description:plans[plan].description}]
        });
        if(!checkout.url) throw Error('A InfinitePay não retornou o link de checkout.');
        await env.DB.prepare('UPDATE payment_orders SET checkout_url=?, invoice_slug=? WHERE order_nsu=?').bind(checkout.url,checkout.invoice_slug||checkout.slug||null,orderNsu).run();
        return json({checkoutUrl:checkout.url,orderNsu,plan,amountCents:plans[plan].price},201);
      } catch(error) {
        await env.DB.prepare("UPDATE payment_orders SET status='FAILED' WHERE order_nsu=? AND status='PENDING'").bind(orderNsu).run();
        throw error;
      }
    }
    if(method==='GET'&&path.join('/')==='payments/infinitepay/status') {
      const u=await auth(); if(u instanceof Response)return u;
      const orderNsu=String(url.searchParams.get('order_nsu')||'');
      const order=await env.DB.prepare('SELECT order_nsu,plan_code,amount_cents,status,receipt_url,expires_at FROM payment_orders WHERE order_nsu=? AND user_id=?').bind(orderNsu,u.id).first();
      if(!order)return json({error:'Pedido não encontrado.'},404);
      return json({order});
    }
    if(method==='POST'&&path.join('/')==='payments/infinitepay/verify-return') {
      const u=await auth(); if(u instanceof Response)return u;
      const order=await env.DB.prepare('SELECT * FROM payment_orders WHERE order_nsu=? AND user_id=?').bind(String(body.order_nsu||''),u.id).first();
      if(!order)return json({error:'Pedido não encontrado.'},404);
      if(order.status==='PAID') return json({order});
      const confirmed=await verifyInfinitePayOrder(env,order,body);
      return json({order:confirmed});
    }
    if(method==='POST'&&path.join('/')==='payments/infinitepay/webhook') {
      const order=await env.DB.prepare('SELECT * FROM payment_orders WHERE order_nsu=?').bind(String(body.order_nsu||'')).first();
      if(!order)return json({success:false,message:'Pedido não encontrado.'},400);
      try {
        const confirmed=await verifyInfinitePayOrder(env,order,body);
        if(confirmed.status!=='PAID') return json({success:false,message:'Pagamento ainda não confirmado.'},400);
        const account=await user(env,order.user_id);
        mail(env,account.email,`Pagamento confirmado — ${plans[order.plan_code].name} JL Code`,emailLayout(`<p>Olá, ${escapeHtml(account.name)}.</p><p>Seu pagamento foi confirmado. O ${plans[order.plan_code].name} está ativo por 15 dias.</p><p style="text-align:center;margin:28px 0"><a href="${apiOrigin(env,url)}/aluno.html" style="display:inline-block;background:#2687ff;color:#ffffff;text-decoration:none;border-radius:9px;padding:13px 22px;font-weight:700">ACESSAR ÁREA DO ALUNO</a></p>`)).catch(console.error);
        return json({success:true,message:null});
      } catch(error) { return json({success:false,message:error.message||'Não foi possível confirmar o pagamento.'},400); }
    }
    if(method==='GET'&&path.join('/')==='final-exam/status') { const u=await auth(); if(u instanceof Response)return u; const started=Date.parse(u.plan_started_at||u.created_at); const payments=(await env.DB.prepare("SELECT COUNT(*) count FROM payments WHERE user_id=? AND status='CONFIRMED'").bind(u.id).first()).count; const eligible=isAdmin(u)||(u.plan==='PRO'&&u.payment_status==='CONFIRMED'&&Date.now()-started>=90*86400000&&payments>=6); const certificate=await env.DB.prepare('SELECT certificate_code,status,score_percent,completed_at,training_days FROM certificates WHERE user_id=?').bind(u.id).first(); return json({eligible,daysActive:Math.max(0,Math.floor((Date.now()-started)/86400000)),confirmedPayments:payments,certificate,user:{name:u.name}}); }
    if(method==='GET'&&path.join('/')==='final-exam/questions') { const u=await auth(); if(u instanceof Response)return u; const started=Date.parse(u.plan_started_at||u.created_at), payments=(await env.DB.prepare("SELECT COUNT(*) count FROM payments WHERE user_id=? AND status='CONFIRMED'").bind(u.id).first()).count; if(!(isAdmin(u)||(u.plan==='PRO'&&u.payment_status==='CONFIRMED'&&Date.now()-started>=90*86400000&&payments>=6)))return json({error:'A Prova Final estará disponível após 90 dias de acesso Pro ativo e seis pagamentos confirmados.'},403); return json({questions:publicQuestions}); }
    if(method==='POST'&&path.join('/')==='final-exam/submit') { const u=await auth(); if(u instanceof Response)return u; const started=Date.parse(u.plan_started_at||u.created_at), payments=(await env.DB.prepare("SELECT COUNT(*) count FROM payments WHERE user_id=? AND status='CONFIRMED'").bind(u.id).first()).count; if(!(isAdmin(u)||(u.plan==='PRO'&&u.payment_status==='CONFIRMED'&&Date.now()-started>=90*86400000&&payments>=6)))return json({error:'Você ainda não cumpre os requisitos da prova.'},403); const answers=Array.isArray(body.answers)?body.answers:[]; if(answers.length!==50)return json({error:'Responda às 50 questões antes de finalizar.'},400); const correct=finalExamQuestions.reduce((n,q,i)=>n+(Number(answers[i])===q.answer?1:0),0), percent=correct*2, status=percent>=80?'PASSED':'FAILED'; const previous=(await env.DB.prepare('SELECT COUNT(*) count FROM final_exam_attempts WHERE user_id=?').bind(u.id).first()).count; await env.DB.prepare('INSERT INTO final_exam_attempts (user_id,attempt_number,answers_json,correct_answers,percentage,status) VALUES (?,?,?,?,?,?)').bind(u.id,previous+1,JSON.stringify(answers),correct,percent,status).run(); let certificate=null; if(status==='PASSED'){certificate=await env.DB.prepare('SELECT * FROM certificates WHERE user_id=?').bind(u.id).first(); if(!certificate){const code=`JLC-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${crypto.randomUUID().slice(0,8).toUpperCase()}`; await env.DB.prepare("INSERT INTO certificates (user_id,certificate_code,completed_at,training_days,score_percent) VALUES (?,?,?,?,?)").bind(u.id,code,now(),Math.floor((Date.now()-started)/86400000),percent).run(); certificate=await env.DB.prepare('SELECT * FROM certificates WHERE user_id=?').bind(u.id).first();}} return json({correct,percentage:percent,status,certificate}); }
    if(method==='GET'&&path[0]==='certificates'&&path[1]) { const c=await env.DB.prepare('SELECT c.*,u.name FROM certificates c JOIN users u ON u.id=c.user_id WHERE c.certificate_code=?').bind(path[1]).first(); if(!c||c.status!=='VALID')return json({error:'Certificado não encontrado.'},404); return json({certificate:{code:c.certificate_code,name:c.name,course:c.course_name,level:c.level,completedAt:c.completed_at,trainingDays:c.training_days,scorePercent:c.score_percent,status:c.status}}); }
    if(method==='GET'&&path.join('/')==='admin/certificates') { const u=await auth(); if(u instanceof Response)return u; if(!isAdmin(u))return json({error:'Acesso administrativo necessário.'},403); const search=String(url.searchParams.get('q')||'').trim(); const like=`%${search}%`; const rows=(await env.DB.prepare("SELECT c.certificate_code,c.course_name,c.level,c.completed_at,c.training_days,c.score_percent,c.status,u.name,u.email FROM certificates c JOIN users u ON u.id=c.user_id WHERE u.name LIKE ? OR u.email LIKE ? OR c.certificate_code LIKE ? ORDER BY c.created_at DESC LIMIT 100").bind(like,like,like).all()).results; return json({certificates:rows}); }
    if(method==='GET'&&path.join('/')==='student') { const u=await auth(); if(u instanceof Response)return u; return json({user:publicUser(u),accesses:(await env.DB.prepare('SELECT technology,status FROM accesses WHERE user_id=?').bind(u.id).all()).results}); }
    if(method==='GET'&&path.join('/')==='exercises') { const u=await auth(); if(u instanceof Response)return u; const proAccess=isAdmin(u)||(u.plan==='PRO'&&u.payment_status==='CONFIRMED'); return json({proAccess,exercises:proAccess?exerciseCatalog:[]}); }
    if(method==='GET'&&path[0]==='apostilas'&&path.length===1) { const u=await auth(); if(u instanceof Response)return u; const items=(await env.DB.prepare('SELECT a.slug,a.title,a.description,a.required_plan,c.name course,COALESCE(ua.progress_percent,0) progress_percent FROM apostilas a JOIN courses c ON c.id=a.course_id LEFT JOIN user_apostila_access ua ON ua.apostila_id=a.id AND ua.user_id=? ORDER BY a.id').bind(u.id).all()).results; return json({apostilas:items.map(x=>({...x,allowed:allowed(u).length>0&&(u.plan==='PRO'||x.required_plan==='BETA'&&u.plan==='BETA')}))}); }
    if(method==='GET'&&path[0]==='apostilas'&&path[2]==='pdf') { const u=await auth(); if(u instanceof Response)return u; const a=await env.DB.prepare('SELECT * FROM apostilas WHERE slug=?').bind(path[1]).first(); if(!a)return json({error:'Apostila não encontrada.'},404); if(!(isAdmin(u)||(u.plan==='PRO'&&u.payment_status==='CONFIRMED')||(u.plan==='BETA'&&u.payment_status==='CONFIRMED'&&a.required_plan==='BETA')))return json({error:'Esta apostila não está liberada para o seu plano.'},403); if(!env.APOSTILAS)return json({error:'O armazenamento privado das apostilas ainda não está conectado.'},503); const object=await env.APOSTILAS.get(`apostilas/${a.private_filename}`,{range:request.headers}); if(!object)return json({error:'Esta apostila ainda não foi enviada ao armazenamento privado.'},503); await env.DB.prepare('INSERT INTO user_apostila_access (user_id,apostila_id,progress_percent,last_opened_at) VALUES (?,?,5,?) ON CONFLICT(user_id,apostila_id) DO UPDATE SET progress_percent=MAX(progress_percent,5),last_opened_at=excluded.last_opened_at').bind(u.id,a.id,now()).run(); const headers=new Headers({'content-disposition':'inline','cache-control':'private, no-store, max-age=0','x-content-type-options':'nosniff','cross-origin-resource-policy':'same-origin','content-security-policy':"default-src 'none'; frame-ancestors 'self'",'permissions-policy':'clipboard-write=(), web-share=()','referrer-policy':'no-referrer'}); object.writeHttpMetadata(headers); headers.set('content-disposition','inline'); return new Response(object.body,{headers,status:object.range?206:200}); }
    if(method==='GET'&&path.join('/')==='ai/history') { const u=await auth(); if(u instanceof Response)return u; const results=(await env.DB.prepare('SELECT message,response,created_at FROM ai_conversations WHERE user_id=? ORDER BY id DESC LIMIT 30').bind(u.id).all()).results.reverse(); return json({messages:results}); }
    if(method==='POST'&&path.join('/')==='ai/chat') { const u=await auth(); if(u instanceof Response)return u; const message=String(body.message||'').trim(), permitted=allowed(u), t=topic(message); if(!message||message.length>4000)return json({error:'Envie uma pergunta de até 4.000 caracteres.'},400); if(!permitted.length)return json({error:'Seu acesso à IA Gabriela está bloqueado. Assine um plano para liberar o acesso.'},403); if(!permitted.includes(t))return json({error:`Seu plano libera somente ${permitted.join(', ')}.`},403); if(!env.AI)return json({error:'IA not configured.'},503); const history=(await env.DB.prepare('SELECT message,response FROM ai_conversations WHERE user_id=? ORDER BY id DESC LIMIT 8').bind(u.id).all()).results.reverse(); const messages=[{role:'system',content:`Você é Gabriela, professora de programação para iniciantes. Responda apenas sobre ${permitted.join(', ')}; ensine passo a passo em português.`},...history.flatMap(x=>[{role:'user',content:x.message},{role:'assistant',content:x.response}]),{role:'user',content:message}]; const data=await env.AI.run('@cf/meta/llama-3.2-3b-instruct',{messages,max_tokens:700,temperature:0.35}); const answer=String(data.response||data.result?.response||'I could not generate an answer now.'); await env.DB.prepare('INSERT INTO ai_conversations (user_id,message,response,user_plan) VALUES (?,?,?,?)').bind(u.id,message,answer,u.plan).run(); return json({answer}); }
    return json({error:'Rota não encontrada.'},404);
  } catch(error) { console.error(error); return json({error:error.message||'Erro interno.'},500); }
}
