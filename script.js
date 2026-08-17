const api = async (url, options = {}) => {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  const data = response.status === 204 ? {} : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Não foi possível concluir esta ação.');
  return data;
};
const money = (cents) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
document.querySelectorAll('.nav-toggle').forEach((button) => button.addEventListener('click', () => button.nextElementSibling.classList.toggle('open')));
document.querySelectorAll('#logout-link').forEach((link) => link.addEventListener('click', async (event) => { event.preventDefault(); await api('/api/auth/logout', { method: 'POST' }); location.href = 'index.html'; }));

const feedback = (element, message, type = 'error') => { if (element) { element.textContent = message; element.className = `form-feedback ${type}`; } };
const loginForm = document.querySelector('#login-form');
if (loginForm) loginForm.addEventListener('submit', async (event) => { event.preventDefault(); const data = Object.fromEntries(new FormData(loginForm)); const area = document.querySelector('#form-feedback'); feedback(area, 'Entrando…', ''); try { await api('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }); location.href = 'aluno.html'; } catch (error) { feedback(area, error.message); } });
const registerForm = document.querySelector('#register-form');
if (registerForm) registerForm.addEventListener('submit', async (event) => { event.preventDefault(); const data = Object.fromEntries(new FormData(registerForm)); const area = document.querySelector('#form-feedback'); if (data.password !== data.confirmPassword) return feedback(area, 'As senhas não coincidem.'); feedback(area, 'Criando sua conta…', ''); try { await api('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }); location.href = 'planos.html'; } catch (error) { feedback(area, error.message); } });
const forgot = document.querySelector('#forgot-password');
if (forgot) forgot.addEventListener('click', async () => { const area = document.querySelector('#form-feedback'); try { await api('/api/auth/forgot-password', { method: 'POST' }); } catch (error) { feedback(area, error.message); } });
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

let selectedPlan = null; let lastPaymentId = null;
const plans = { BETA: { name: 'Plano Beta', price: 12990 }, PRO: { name: 'Plano Pro', price: 19990 } };
function selectPlan(plan) { selectedPlan = plan; const item = plans[plan]; document.querySelector('#pix-plan').textContent = item.name; document.querySelector('#card-plan').textContent = item.name; document.querySelector('#pix-value').textContent = money(item.price); document.querySelector('#card-value').textContent = money(item.price); document.querySelector('#payment-message').textContent = `${item.name} selecionado. Escolha Pix ou cartão para registrar seu pagamento.`; document.querySelector('#pagamento').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
document.querySelectorAll('.select-plan').forEach((button) => button.addEventListener('click', () => selectPlan(button.dataset.plan)));
const copyPix = document.querySelector('#copy-pix');
if (copyPix) copyPix.addEventListener('click', async () => { const key = document.querySelector('#pix-key').textContent.trim(); const notice = document.querySelector('#payment-notice'); try { await navigator.clipboard.writeText(key); notice.textContent = 'Chave Pix copiada com sucesso.'; notice.className = 'payment-notice success'; } catch { notice.textContent = 'Não foi possível copiar automaticamente. Verifique a permissão do navegador.'; notice.className = 'payment-notice error'; } });
async function createPayment(method) { const notice = document.querySelector('#payment-notice'); if (!selectedPlan) { notice.textContent = 'Escolha um plano antes de continuar.'; notice.className = 'payment-notice error'; return; } try { const result = await api('/api/payments', { method: 'POST', body: JSON.stringify({ plan: selectedPlan, method }) }); lastPaymentId = result.transactionId; notice.textContent = `${result.message} Código: ${result.transactionId}`; notice.className = 'payment-notice success'; } catch (error) { notice.textContent = error.message.includes('login') ? 'Faça login ou crie uma conta antes de assinar.' : error.message; notice.className = 'payment-notice error'; } }
if (copyPix) { const pixCard = copyPix.closest('.payment-card'); const payButton = document.createElement('button'); payButton.type = 'button'; payButton.className = 'button'; payButton.textContent = 'Registrar pagamento Pix'; payButton.addEventListener('click', () => createPayment('PIX')); pixCard.append(payButton); }
const cardForm = document.querySelector('#card-form'); if (cardForm) cardForm.addEventListener('submit', (event) => { event.preventDefault(); createPayment('CARD'); });

async function loadStudent() { const greeting = document.querySelector('#student-greeting'); if (!greeting) return; try { const { user, accesses } = await api('/api/student'); greeting.textContent = `Olá, ${user.name.split(' ')[0]}!`; document.querySelector('#student-plan').textContent = user.plan === 'FREE' ? 'Sem plano' : `Plano ${user.plan === 'BETA' ? 'Beta' : 'Pro'}`; document.querySelector('#student-status').textContent = user.paymentStatus === 'CONFIRMED' ? 'Acesso liberado' : 'Aguardando pagamento'; const active = new Set(accesses.filter((a) => a.status === 'ACTIVE').map((a) => a.technology)); const container = document.querySelector('#student-courses'); container.innerHTML = ['HTML', 'CSS', 'JAVASCRIPT'].map((technology) => { const unlocked = active.has(technology); return `<article class="student-course ${unlocked ? '' : 'locked'}"><div class="course-icon">${unlocked ? '✓' : '🔒'}</div><h3>${technology === 'JAVASCRIPT' ? 'JavaScript' : technology}</h3><p>${unlocked ? 'Aulas, apostilas, exercícios e projetos disponíveis.' : technology === 'HTML' ? 'Assine um plano para liberar este curso.' : 'Disponível no Plano Pro.'}</p></article>`; }).join(''); } catch { location.href = 'login.html'; } }
loadStudent();

async function loadApostilas(){const list=document.querySelector('#apostilas-list');if(!list)return;try{const {apostilas}=await api('/api/apostilas');list.innerHTML=apostilas.map(a=>`<article class="student-course ${a.allowed?'':'locked'}"><span class="tag">${a.course} · ${a.required_plan}</span><h3>${a.title}</h3><p>${a.description}</p><p>Progresso: ${a.progress_percent}%</p>${a.allowed?`<a class="button button-small" href="visualizar-apostila.html?slug=${a.slug}">${a.progress_percent?'Continuar estudando':'Estudar agora'}</a>`:'<p>Conteúdo bloqueado pelo plano.</p>'}</article>`).join('')}catch{location.href='login.html'}}
loadApostilas();

function addMessage(content, role, extra = '') { const messages = document.querySelector('#chat-messages'); if (!messages) return null; const item = document.createElement('div'); item.className = `message ${role} ${extra}`; item.textContent = content; messages.append(item); messages.scrollTop = messages.scrollHeight; return item; }
async function loadChat() { const status = document.querySelector('#ai-access-status'); if (!status) return; try { const { user } = await api('/api/auth/me'); if (user.paymentStatus !== 'CONFIRMED') { status.textContent = 'Acesso bloqueado: confirme um pagamento para usar a IA.'; return; } status.textContent = `Acesso liberado: ${user.allowedTechnologies.join(', ')}.`; const { messages } = await api('/api/ai/history'); const box = document.querySelector('#chat-messages'); box.innerHTML = ''; messages.forEach((item) => { addMessage(item.message, 'user'); addMessage(item.response, 'assistant'); }); if (!messages.length) addMessage('Olá! Sou a Gabriela. Em que posso ajudar hoje?', 'assistant'); } catch { status.textContent = 'Entre na sua conta para verificar seu acesso.'; } }
const chatForm = document.querySelector('#chat-form');
if (chatForm) { loadChat(); chatForm.addEventListener('submit', async (event) => { event.preventDefault(); const field = document.querySelector('#chat-text'); const message = field.value.trim(); if (!message) return; addMessage(message, 'user'); field.value = ''; const loading = addMessage('Gabriela está preparando uma explicação…', 'assistant', 'loading'); const button = document.querySelector('#send-message'); button.disabled = true; try { const { answer } = await api('/api/ai/chat', { method: 'POST', body: JSON.stringify({ message }) }); loading.remove(); addMessage(answer, 'assistant'); } catch (error) { loading.textContent = error.message; loading.classList.remove('loading'); } finally { button.disabled = false; } }); }
const clearChat = document.querySelector('#clear-chat'); if (clearChat) clearChat.addEventListener('click', () => { const messages = document.querySelector('#chat-messages'); messages.innerHTML = ''; addMessage('A conversa visual foi limpa. Seu histórico permanece salvo com segurança.', 'assistant'); });
