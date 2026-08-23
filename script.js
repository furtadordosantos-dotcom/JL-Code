const api = async (url, options = {}) => {
  let response;
  try {
    response = await fetch(url, { credentials: 'same-origin', headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Atualize a página e tente novamente.');
  }
  const raw = response.status === 204 ? '' : await response.text();
  let data = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch { /* resposta de infraestrutura sem JSON */ }
  if (!response.ok) throw new Error(data.error || `O servidor não respondeu corretamente (erro ${response.status}). Tente novamente em instantes.`);
  return data;
};
const money = (cents) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
document.querySelectorAll('.nav-toggle').forEach((button) => button.addEventListener('click', () => button.nextElementSibling.classList.toggle('open')));
document.querySelectorAll('#logout-link').forEach((link) => link.addEventListener('click', async (event) => { event.preventDefault(); await api('/api/auth/logout', { method: 'POST' }); location.href = 'index.html'; }));
async function loadNavigationUser() {
  const navigation = document.querySelector('.nav-links');
  if (!navigation) return;
  try {
    const { user } = await api('/api/auth/me');
    const name = user.name.split(' ')[0];
    if (!navigation.querySelector('.user-nav')) {
      const greeting = document.createElement('span');
      greeting.className = 'user-nav';
      greeting.textContent = `Olá, ${name}`;
      greeting.style.cssText = 'display:inline-flex;align-items:center;padding:8px 11px;border:1px solid #2b5a84;border-radius:999px;background:#0b213b;color:#dceeff;font-size:.85rem;white-space:nowrap';
      navigation.prepend(greeting);
    }
    if (!navigation.querySelector('[href="apostilas.html"]')) {
      const apostilas = document.createElement('a');
      apostilas.href = 'apostilas.html';
      apostilas.textContent = 'Apostilas';
      const exercicios = document.createElement('a');
      exercicios.href = 'exercicios.html';
      exercicios.textContent = 'Exercícios';
      navigation.prepend(exercicios);
      navigation.prepend(apostilas);
    }
    const loginLink = navigation.querySelector('a[href="login.html"]');
    const registerLink = navigation.querySelector('a[href="cadastro.html"]');
    if (loginLink) { loginLink.href = 'aluno.html'; loginLink.textContent = 'Minha área'; }
    if (registerLink) {
      registerLink.href = '#sair';
      registerLink.textContent = 'Sair';
      registerLink.addEventListener('click', async (event) => {
        event.preventDefault();
        await api('/api/auth/logout', { method: 'POST' });
        location.href = 'index.html';
      }, { once: true });
    }
  } catch { /* visitante permanece com os links públicos */ }
}
loadNavigationUser();

const feedback = (element, message, type = 'error') => { if (element) { element.textContent = message; element.className = `form-feedback ${type}`; } };
const loginForm = document.querySelector('#login-form');
if (loginForm) loginForm.addEventListener('submit', async (event) => { event.preventDefault(); const data = Object.fromEntries(new FormData(loginForm)); const area = document.querySelector('#form-feedback'); feedback(area, 'Entrando…', ''); try { await api('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }); location.href = 'aluno.html'; } catch (error) { feedback(area, error.message); } });
const registerForm = document.querySelector('#register-form');
if (registerForm) registerForm.addEventListener('submit', async (event) => { event.preventDefault(); const data = Object.fromEntries(new FormData(registerForm)); const area = document.querySelector('#form-feedback'); if (data.password !== data.confirmPassword) return feedback(area, 'As senhas não coincidem.'); feedback(area, 'Criando sua conta…', ''); try { const result=await api('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }); feedback(area,result.message,'success'); setTimeout(()=>{ location.href='login.html'; },1200); } catch (error) { feedback(area, error.message); } });
const forgotPasswordForm = document.querySelector('#forgot-password-form');
if (forgotPasswordForm) forgotPasswordForm.addEventListener('submit', async (event) => { event.preventDefault(); const area = document.querySelector('#form-feedback'); feedback(area, 'Enviando link seguro…', ''); try { const data = await api('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(forgotPasswordForm))) }); feedback(area, data.message, 'success'); } catch (error) { feedback(area, error.message); } });
const resetPasswordForm = document.querySelector('#reset-password-form');
if (resetPasswordForm) resetPasswordForm.addEventListener('submit', async (event) => { event.preventDefault(); const area = document.querySelector('#form-feedback'); const data = Object.fromEntries(new FormData(resetPasswordForm)); const token = new URLSearchParams(location.search).get('token'); if (!token) return feedback(area, 'Link de recuperação inválido. Solicite um novo e-mail.'); if (data.password !== data.confirmPassword) return feedback(area, 'As senhas não coincidem.'); feedback(area, 'Salvando nova senha…', ''); try { const result = await api('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ ...data, token }) }); feedback(area, result.message, 'success'); setTimeout(() => { location.href = 'login.html'; }, 1400); } catch (error) { feedback(area, error.message); } });
const resendVerification = document.querySelector('#resend-verification');
if (resendVerification) resendVerification.addEventListener('click', async () => {
  const area = document.querySelector('#form-feedback');
  const email = loginForm?.elements.email?.value.trim();
  if (!email) return feedback(area, 'Informe o seu e-mail para reenviar a confirmação.');
  feedback(area, 'Enviando e-mail de confirmação…', '');
  try {
    const data = await api('/api/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) });
    feedback(area, data.message, 'success');
  } catch (error) { feedback(area, error.message); }
});

let selectedPlan = null;
const plans = { BETA: { name: 'Plano Beta', price: 12990 }, PRO: { name: 'Plano Pro', price: 19990 } };
function selectPlan(plan) {
  selectedPlan = plan;
  const item = plans[plan];
  const planLabel = document.querySelector('#checkout-plan');
  const valueLabel = document.querySelector('#checkout-value');
  if (planLabel) planLabel.textContent = item.name;
  if (valueLabel) valueLabel.textContent = money(item.price);
  const message = document.querySelector('#payment-message');
  if (message) message.textContent = `${item.name} selecionado. Você poderá escolher Pix ou cartão no checkout seguro.`;
  document.querySelector('#pagamento')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
document.querySelectorAll('.select-plan').forEach((button) => button.addEventListener('click', () => selectPlan(button.dataset.plan)));
async function startInfinitePayCheckout(paymentMethod, button) {
  const notice = document.querySelector('#payment-notice');
  if (!selectedPlan) { notice.textContent = 'Escolha um plano antes de continuar.'; notice.className = 'payment-notice error'; return; }
  const checkoutButtons = [...document.querySelectorAll('[data-payment-method]')];
  checkoutButtons.forEach((item) => { item.disabled = true; });
  const label = paymentMethod === 'PIX' ? 'Pix' : 'cartão';
  notice.textContent = `Criando checkout seguro para pagamento com ${label}…`; notice.className = 'payment-notice';
  try {
    const result = await api('/api/payments/infinitepay/checkout', { method: 'POST', body: JSON.stringify({ plan: selectedPlan, paymentMethod }) });
    location.assign(result.checkoutUrl);
  } catch (error) {
    notice.textContent = error.message.includes('login') ? 'Faça login ou crie uma conta antes de assinar.' : error.message;
    notice.className = 'payment-notice error'; checkoutButtons.forEach((item) => { item.disabled = false; });
  }
}
document.querySelectorAll('[data-payment-method]').forEach((button) => button.addEventListener('click', () => startInfinitePayCheckout(button.dataset.paymentMethod, button)));

async function loadPaymentResult() {
  const title = document.querySelector('#payment-result-title');
  if (!title) return;
  const feedback = document.querySelector('#payment-result-feedback');
  const message = document.querySelector('#payment-result-message');
  const action = document.querySelector('#payment-result-action');
  const params = new URLSearchParams(location.search);
  const orderNsu = params.get('order_nsu');
  if (!orderNsu) { title.textContent = 'Pagamento não identificado'; message.textContent = 'Volte aos planos e inicie um novo checkout seguro.'; return; }
  try {
    if (params.get('transaction_nsu') && (params.get('slug') || params.get('invoice_slug'))) {
      await api('/api/payments/infinitepay/verify-return', { method: 'POST', body: JSON.stringify({ order_nsu: orderNsu, transaction_nsu: params.get('transaction_nsu'), slug: params.get('slug') || params.get('invoice_slug'), receipt_url: params.get('receipt_url') || '' }) });
    }
    const { order } = await api(`/api/payments/infinitepay/status?order_nsu=${encodeURIComponent(orderNsu)}`);
    if (order.status === 'PAID') { title.textContent = 'Pagamento confirmado!'; message.textContent = `Seu Plano ${order.plan_code === 'BETA' ? 'Beta' : 'Pro'} foi liberado por 15 dias.`; feedback.textContent = 'Seu acesso já está disponível.'; feedback.className = 'form-feedback success'; action.hidden = false; return; }
    title.textContent = 'Aguardando confirmação'; message.textContent = 'A InfinitePay ainda está confirmando o pagamento. Atualize esta página em instantes; o acesso será liberado automaticamente após a confirmação.';
  } catch (error) { title.textContent = 'Não foi possível confirmar agora'; message.textContent = error.message; }
}
loadPaymentResult();

async function loadFinalExam(){const status=document.querySelector('#exam-status');if(!status)return;try{const state=await api('/api/final-exam/status');if(state.certificate){status.innerHTML=`Certificado emitido: <a href="certificado.html">${state.certificate.certificate_code}</a> · <a href="validar-certificado.html?code=${encodeURIComponent(state.certificate.certificate_code)}">validar</a>`;return}if(!state.eligible){status.textContent=`Bloqueada. ${state.daysActive}/90 dias de acesso e ${state.confirmedPayments}/6 pagamentos confirmados.`;return}const data=await api('/api/final-exam/questions'), panel=document.querySelector('#exam-panel'), form=document.querySelector('#exam-form');status.textContent='Você cumpriu os requisitos. Responda às 50 questões para concluir.';document.querySelector('#exam-title').textContent='Prova Final - Programação Web Júnior';form.innerHTML=data.questions.map(q=>`<fieldset class="exam-question"><legend>${q.id+1}. [${q.technology}] ${q.question}</legend>${q.options.map((o,i)=>`<label><input required type="radio" name="q${q.id}" value="${i}"> ${o}</label>`).join('')}</fieldset>`).join('');panel.hidden=false;form.addEventListener('submit',async e=>{e.preventDefault();const answers=data.questions.map(q=>Number(new FormData(form).get(`q${q.id}`)));const result=await api('/api/final-exam/submit',{method:'POST',body:JSON.stringify({answers})});if(result.status==='PASSED'){status.innerHTML=`Aprovado com ${result.percentage}%! <a href="certificado.html">Abrir certificado</a>`;panel.hidden=true;return}status.textContent=`Resultado: ${result.percentage}%. São necessários 80%. Você pode tentar novamente quando estiver preparado.`;panel.hidden=true})}catch(e){status.textContent=e.message}}
loadFinalExam();
async function loadCertificate(){const status=document.querySelector('#certificate-status');if(!status)return;try{const state=await api('/api/final-exam/status');const c=state.certificate;if(!c){status.textContent='Você ainda não possui um certificado emitido.';return}const validation=`${location.origin}/validar-certificado.html?code=${encodeURIComponent(c.certificate_code)}`;document.querySelector('#certificate-name').textContent=state.user.name;document.querySelector('#certificate-meta').textContent=`Concluído em ${new Date(c.completed_at).toLocaleDateString('pt-BR')} · ${c.training_days} dias de formação · ${c.score_percent}% de aproveitamento`;document.querySelector('#certificate-code').textContent=`Código de validação: ${c.certificate_code}`;document.querySelector('#certificate-qr').src=`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(validation)}`;document.querySelector('#validate-certificate').href=validation;document.querySelector('#certificate-document').hidden=false;document.querySelector('#certificate-actions').hidden=false;status.textContent='Certificado emitido e protegido pela sua conta.';document.querySelector('#print-certificate').addEventListener('click',()=>window.print())}catch(e){status.textContent=e.message}}
loadCertificate();
async function loadAdminCertificates(){const form=document.querySelector('#admin-certificate-form');if(!form)return;const results=document.querySelector('#admin-certificate-results');async function search(){try{const q=document.querySelector('#admin-certificate-query').value;const {certificates}=await api(`/api/admin/certificates?q=${encodeURIComponent(q)}`);results.innerHTML=certificates.length?certificates.map(c=>`<article class="student-course"><span class="tag">${c.certificate_code}</span><h3>${c.name}</h3><p>${c.email}<br>${c.course_name} · ${c.score_percent}%<br>${new Date(c.completed_at).toLocaleDateString('pt-BR')}</p><a class="text-link" href="validar-certificado.html?code=${encodeURIComponent(c.certificate_code)}">Validar</a></article>`).join(''):'<p>Nenhum certificado encontrado.</p>'}catch(e){results.innerHTML=`<p class="form-feedback error">${e.message}</p>`}}form.addEventListener('submit',e=>{e.preventDefault();search()});search()}
loadAdminCertificates();
async function loadCertificateValidation(){const target=document.querySelector('#certificate-validation-content');if(!target)return;const code=new URLSearchParams(location.search).get('code');if(!code){target.textContent='Informe um código de certificado válido.';return}try{const {certificate:c}=await api(`/api/certificates/${encodeURIComponent(code)}`);document.querySelector('#certificate-validation-title').textContent='Certificado válido';target.innerHTML=`<strong>${c.name}</strong><br>${c.course} - ${c.level}<br>Conclusão: ${new Date(c.completedAt).toLocaleString('pt-BR')}<br>${c.trainingDays} dias de formação - ${c.scorePercent}%<br>Código: ${c.code}`;}catch(e){target.textContent=e.message}}
loadCertificateValidation();

async function loadStudent() { const greeting = document.querySelector('#student-greeting'); if (!greeting) return; try { const { user, accesses } = await api('/api/student'); greeting.textContent = `Olá, ${user.name.split(' ')[0]}!`; document.querySelector('#student-plan').textContent = user.plan === 'FREE' ? 'Sem plano' : `Plano ${user.plan === 'BETA' ? 'Beta' : 'Pro'}`; document.querySelector('#student-status').textContent = user.paymentStatus === 'CONFIRMED' ? 'Acesso liberado' : 'Aguardando pagamento'; const active = new Set(accesses.filter((a) => a.status === 'ACTIVE').map((a) => a.technology)); const container = document.querySelector('#student-courses'); container.innerHTML = ['HTML', 'CSS', 'JAVASCRIPT'].map((technology) => { const unlocked = active.has(technology); return `<article class="student-course ${unlocked ? '' : 'locked'}"><div class="course-icon">${unlocked ? '✓' : '🔒'}</div><h3>${technology === 'JAVASCRIPT' ? 'JavaScript' : technology}</h3><p>${unlocked ? 'Aulas, apostilas, exercícios e projetos disponíveis.' : technology === 'HTML' ? 'Assine um plano para liberar este curso.' : 'Disponível no Plano Pro.'}</p></article>`; }).join(''); } catch { location.href = 'login.html'; } }
loadStudent();
function addCertificationShortcut(){const resources=document.querySelector('.student-resources>div');if(!resources||document.querySelector('#certification-resource'))return;const card=document.createElement('article');card.id='certification-resource';card.innerHTML='★<h3><a href="prova-final.html">Prova e certificado</a></h3><p>Conquiste sua certificação ao concluir a trilha Pro.</p>';resources.append(card);const nav=document.querySelector('.nav-links');if(nav){const link=document.createElement('a');link.href='prova-final.html';link.textContent='Prova final';nav.insertBefore(link,nav.querySelector('#logout-link')||null)}}
addCertificationShortcut();

async function loadApostilas(){const list=document.querySelector('#apostilas-list');if(!list)return;try{const {apostilas}=await api('/api/apostilas');list.innerHTML=apostilas.map(a=>`<article class="student-course ${a.allowed?'':'locked'}"><span class="tag">${a.course} · ${a.required_plan}</span><h3>${a.title}</h3><p>${a.description}</p><p>Progresso: ${a.progress_percent}%</p>${a.allowed?`<a class="button button-small" href="visualizar-apostila.html?slug=${a.slug}">${a.progress_percent?'Continuar estudando':'Estudar agora'}</a>`:'<p>Conteúdo bloqueado pelo plano.</p>'}</article>`).join('')}catch{location.href='login.html'}}
loadApostilas();

const escapeCode = (value) => String(value).replace(/[&<>]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[char]));
async function loadExercises() {
  const list = document.querySelector('#exercises-list');
  if (!list) return;
  try {
    const { exercises, proAccess } = await api('/api/exercises');
    if (!proAccess) {
      list.innerHTML = '<article class="exercise-card locked"><span class="tag">RECURSO PRO</span><h2>Exercícios interativos exclusivos do Plano Pro</h2><p>O Plano Beta inclui a apostila de HTML para você praticar no seu próprio computador. Assine o Plano Pro para desbloquear todos os exercícios de HTML, CSS e JavaScript dentro da JL Code.</p><a class="button button-small" href="planos.html">Conhecer Plano Pro</a></article>';
      return;
    }
    list.innerHTML = exercises.map((exercise, index) => {
      if (!exercise.allowed) return `<article class="exercise-card locked"><span class="tag">${exercise.technology} · ${exercise.requiredPlan}</span><h2>${exercise.title}</h2><p>${exercise.requiredPlan === 'PRO' ? 'Disponível no Plano Pro.' : 'Assine um plano para liberar este exercício.'}</p></article>`;
      return `<article class="exercise-card"><span class="tag">${exercise.technology} · ${exercise.level}</span><h2>${index + 1}. ${exercise.title}</h2><p>${exercise.description}</p><div class="exercise-goal"><strong>Seu desafio</strong><span>${exercise.goal}</span></div><label class="exercise-editor-label" for="exercise-code-${exercise.id}">Escreva seu código</label><textarea class="exercise-editor" id="exercise-code-${exercise.id}" spellcheck="false">${escapeCode(exercise.starterCode)}</textarea><div class="exercise-actions"><button class="button button-small" type="button" data-run-exercise="${exercise.id}">Ver resultado</button><span class="exercise-status" id="exercise-status-${exercise.id}">Faça uma alteração e teste.</span></div><iframe title="Resultado do exercício ${index + 1}" sandbox="allow-scripts" class="exercise-preview" id="exercise-preview-${exercise.id}"></iframe></article>`;
    }).join('');
    document.querySelectorAll('[data-run-exercise]').forEach((button) => button.addEventListener('click', () => {
      const id = button.dataset.runExercise;
      const editor = document.querySelector(`#exercise-code-${id}`);
      const preview = document.querySelector(`#exercise-preview-${id}`);
      const status = document.querySelector(`#exercise-status-${id}`);
      preview.srcdoc = editor.value;
      status.textContent = 'Resultado atualizado. Continue praticando!';
    }));
  } catch (error) {
    list.innerHTML = `<p class="form-feedback error">${error.message}</p>`;
  }
}
loadExercises();

function addMessage(content, role, extra = '') { const messages = document.querySelector('#chat-messages'); if (!messages) return null; const item = document.createElement('div'); item.className = `message ${role} ${extra}`; item.textContent = content; messages.append(item); messages.scrollTop = messages.scrollHeight; return item; }
async function loadChat() { const status = document.querySelector('#ai-access-status'); if (!status) return; try { const { user } = await api('/api/auth/me'); if (user.paymentStatus !== 'CONFIRMED') { status.textContent = 'Acesso bloqueado: confirme um pagamento para usar a IA.'; return; } status.textContent = `Acesso liberado: ${user.allowedTechnologies.join(', ')}.`; const { messages } = await api('/api/ai/history'); const box = document.querySelector('#chat-messages'); box.innerHTML = ''; messages.forEach((item) => { addMessage(item.message, 'user'); addMessage(item.response, 'assistant'); }); if (!messages.length) addMessage('Olá! Sou a Gabriela. Em que posso ajudar hoje?', 'assistant'); } catch { status.textContent = 'Entre na sua conta para verificar seu acesso.'; } }
const chatForm = document.querySelector('#chat-form');
if (chatForm) { loadChat(); chatForm.addEventListener('submit', async (event) => { event.preventDefault(); const field = document.querySelector('#chat-text'); const message = field.value.trim(); if (!message) return; addMessage(message, 'user'); field.value = ''; const loading = addMessage('Gabriela está preparando uma explicação…', 'assistant', 'loading'); const button = document.querySelector('#send-message'); button.disabled = true; try { const { answer } = await api('/api/ai/chat', { method: 'POST', body: JSON.stringify({ message }) }); loading.remove(); addMessage(answer, 'assistant'); } catch (error) { loading.textContent = error.message; loading.classList.remove('loading'); } finally { button.disabled = false; } }); }
const clearChat = document.querySelector('#clear-chat'); if (clearChat) clearChat.addEventListener('click', () => { const messages = document.querySelector('#chat-messages'); messages.innerHTML = ''; addMessage('A conversa visual foi limpa. Seu histórico permanece salvo com segurança.', 'assistant'); });
