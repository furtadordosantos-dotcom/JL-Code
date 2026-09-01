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
const authParams = new URLSearchParams(location.search);
const loginPanel = document.querySelector('#login-panel');
const forgotPasswordPanel = document.querySelector('#forgot-password-panel');
const resetPasswordPanel = document.querySelector('#reset-password-panel');
if (authParams.get('recuperar') === '1' && forgotPasswordPanel) { loginPanel.hidden = true; forgotPasswordPanel.hidden = false; }
if (authParams.get('redefinir') === '1' && resetPasswordPanel) { loginPanel.hidden = true; resetPasswordPanel.hidden = false; }
const forgotPasswordForm = document.querySelector('#forgot-password-form');
if (forgotPasswordForm) forgotPasswordForm.addEventListener('submit', async (event) => { event.preventDefault(); const area = document.querySelector('#forgot-feedback') || document.querySelector('#form-feedback'); feedback(area, 'Enviando link seguro…', ''); try { const data = await api('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(forgotPasswordForm))) }); feedback(area, data.message, 'success'); } catch (error) { feedback(area, error.message); } });
const resetPasswordForm = document.querySelector('#reset-password-form');
if (resetPasswordForm) resetPasswordForm.addEventListener('submit', async (event) => { event.preventDefault(); const area = document.querySelector('#reset-feedback') || document.querySelector('#form-feedback'); const data = Object.fromEntries(new FormData(resetPasswordForm)); const token = new URLSearchParams(location.search).get('token'); if (!token) return feedback(area, 'Link de recuperação inválido. Solicite um novo e-mail.'); if (data.password !== data.confirmPassword) return feedback(area, 'As senhas não coincidem.'); feedback(area, 'Salvando nova senha…', ''); try { const result = await api('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ ...data, token }) }); feedback(area, result.message, 'success'); setTimeout(() => { location.href = 'login.html'; }, 1400); } catch (error) { feedback(area, error.message); } });
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

async function loadFinalExam(){
  const status=document.querySelector('#exam-status');
  if(!status)return;
  try{
    const state=await api('/api/final-exam/status');
    if(state.certificate){status.innerHTML=`Certificado emitido: <a href="certificado.html">${state.certificate.certificate_code}</a> · <a href="validar-certificado.html?code=${encodeURIComponent(state.certificate.certificate_code)}">validar</a>`;return;}
    if(!state.eligible){status.textContent=`Bloqueada. ${state.daysActive}/90 dias de acesso e ${state.confirmedPayments}/6 pagamentos confirmados.`;return;}
    if(!state.canAttempt){const updateRetry=()=>{const remaining=Math.max(0,new Date(state.retryAt).getTime()-Date.now());const hours=Math.floor(remaining/3600000);const minutes=Math.floor((remaining%3600000)/60000);const seconds=Math.floor((remaining%60000)/1000);status.textContent=`Você não atingiu 80% na última tentativa. Nova prova liberada em ${hours}h ${minutes}m ${seconds}s.`;};updateRetry();setInterval(updateRetry,1000);return;}
    const data=await api('/api/final-exam/questions');
    const panel=document.querySelector('#exam-panel');
    const form=document.querySelector('#exam-form');
    const title=document.querySelector('#exam-title');
    const progress=document.querySelector('#exam-progress');
    const previous=document.querySelector('#exam-previous');
    const next=document.querySelector('#exam-next');
    const answers=new Map();
    let current=0;
    status.textContent='Você cumpriu os requisitos. Responda às 50 questões para concluir.';
    title.textContent='Prova Final — Programação Web Júnior';
    function renderReview(items){
      const review=document.querySelector('#exam-review');
      review.replaceChildren();
      review.hidden=false;
      const heading=document.createElement('h2');
      heading.textContent=items.length?'Revise as questões que você errou':'Revisão da prova';
      review.append(heading);
      if(!items.length){const success=document.createElement('p');success.textContent='Excelente: você acertou todas as questões.';review.append(success);return;}
      const intro=document.createElement('p');intro.textContent='Use esta revisão para estudar antes de uma nova tentativa.';review.append(intro);
      items.forEach((item)=>{const article=document.createElement('article');article.className='exam-review-item';const tag=document.createElement('span');tag.className='tag';tag.textContent=`QUESTÃO ${item.id} · ${item.technology}`;const question=document.createElement('h3');question.textContent=item.question;const selected=document.createElement('p');selected.className='wrong-answer';selected.textContent=`Sua resposta: ${item.selectedOption}`;const correct=document.createElement('p');correct.className='correct-answer';correct.textContent=`Resposta correta: ${item.correctOption}`;article.append(tag,question,selected,correct);review.append(article);});
    }
    if(state.user?.isAdmin){
      const testButton=document.createElement('button');
      testButton.type='button'; testButton.className='button'; testButton.textContent='Finalizar prova de teste (100%)';
      testButton.addEventListener('click',async()=>{try{testButton.disabled=true;testButton.textContent='Preparando certificado…';const result=await api('/api/final-exam/admin-pass',{method:'POST',body:'{}'});renderReview(result.review||[]);status.textContent='Teste administrativo concluído: 50 de 50 questões corretas — 100%.';panel.hidden=true;const certificateFlow=document.querySelector('#certificate-flow');certificateFlow.hidden=false;certificateFlow.scrollIntoView({behavior:'smooth',block:'center'});}catch(error){status.textContent=error.message;testButton.disabled=false;testButton.textContent='Finalizar prova de teste (100%)';}});
      status.after(testButton);
    }
    function renderQuestion(){
      const question=data.questions[current];
      form.replaceChildren();
      const fieldset=document.createElement('fieldset');
      fieldset.className='exam-question';
      const legend=document.createElement('legend');
      legend.textContent=`${current+1}. [${question.technology}] ${question.question}`;
      fieldset.append(legend);
      question.options.forEach((option,index)=>{
        const label=document.createElement('label');
        const input=document.createElement('input');
        input.type='radio'; input.name=`q${question.id}`; input.value=String(index); input.checked=answers.get(question.id)===index;
        input.addEventListener('change',()=>{answers.set(question.id,index); next.disabled=false;});
        label.append(input,document.createTextNode(` ${option}`));
        fieldset.append(label);
      });
      form.append(fieldset);
      progress.textContent=`Questão ${current+1} de ${data.questions.length} · ${answers.size}/${data.questions.length} respondidas`;
      previous.hidden=current===0;
      next.textContent=current===data.questions.length-1?'Finalizar prova':'Próxima pergunta';
      next.disabled=!answers.has(question.id);
    }
    previous.addEventListener('click',()=>{if(current>0){current--;renderQuestion();}});
    next.addEventListener('click',async()=>{
      const question=data.questions[current];
      if(!answers.has(question.id)){status.textContent='Selecione uma alternativa antes de continuar.';return;}
      if(current<data.questions.length-1){current++;renderQuestion();return;}
      if(answers.size!==data.questions.length){status.textContent='Responda todas as questões antes de finalizar.';return;}
      next.disabled=true; next.textContent='Corrigindo prova…';
      const result=await api('/api/final-exam/submit',{method:'POST',body:JSON.stringify({answers:data.questions.map(q=>answers.get(q.id))})});
      renderReview(result.review||[]);
      if(result.status==='PASSED'){status.textContent=`Resultado final: ${result.correct} de 50 questões corretas — ${result.percentage}%. Você atingiu a nota necessária para o certificado.`;panel.hidden=true;const certificateFlow=document.querySelector('#certificate-flow');certificateFlow.hidden=false;certificateFlow.scrollIntoView({behavior:'smooth',block:'center'});return;}
      status.textContent=`Resultado final: ${result.correct} de 50 questões corretas — ${result.percentage}%. São necessários 80%. Você pode tentar novamente quando estiver preparado.`;
      panel.hidden=true;
    });
    panel.hidden=false;
    const certificateForm=document.querySelector('#certificate-form');
    if(certificateForm)certificateForm.addEventListener('submit',async(event)=>{event.preventDefault();const fullName=document.querySelector('#certificate-full-name').value.trim();const button=certificateForm.querySelector('button');button.disabled=true;button.textContent='Emitindo certificado…';try{await api('/api/final-exam/certificate',{method:'POST',body:JSON.stringify({fullName})});location.href='certificado.html';}catch(error){status.textContent=error.message;button.disabled=false;button.textContent='Emitir meu certificado';}});
    renderQuestion();
  }catch(e){status.textContent=e.message;}
}
loadFinalExam();
const waitForImages=(element)=>Promise.all([...element.querySelectorAll('img')].map((image)=>image.complete&&image.naturalWidth?Promise.resolve():new Promise((resolve)=>{image.addEventListener('load',resolve,{once:true});image.addEventListener('error',resolve,{once:true});setTimeout(resolve,12000)})));
const certificateImage=(source)=>new Promise((resolve)=>{const image=new Image();image.crossOrigin='anonymous';image.onload=()=>resolve(image);image.onerror=()=>resolve(null);image.src=source});
const certificateText=(target,fallback='—')=>document.querySelector(target)?.textContent?.trim()||fallback;
async function createCertificateCanvas(certificate){const canvas=document.createElement('canvas'),width=1600,height=900,ctx=canvas.getContext('2d'),publicView=certificate.id==='public-certificate-document';canvas.width=width;canvas.height=height;const gradient=ctx.createLinearGradient(0,0,width,height);gradient.addColorStop(0,'#06142a');gradient.addColorStop(.48,'#0c3570');gradient.addColorStop(1,'#161041');ctx.fillStyle=gradient;ctx.fillRect(0,0,width,height);ctx.save();ctx.globalAlpha=.17;ctx.strokeStyle='#50c8ff';ctx.lineWidth=1;for(let x=-height;x<width;x+=62){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+height,height);ctx.stroke()}ctx.restore();ctx.strokeStyle='#6ee1ff';ctx.lineWidth=4;ctx.strokeRect(25,25,width-50,height-50);ctx.strokeStyle='#f2c756';ctx.lineWidth=2;ctx.strokeRect(40,40,width-80,height-80);const [logo,html,css,js,qr]=await Promise.all([certificateImage(certificate.querySelector('.certificate-logo')?.src),certificateImage(certificate.querySelector('.certificate-technologies article:nth-child(1) img')?.src),certificateImage(certificate.querySelector('.certificate-technologies article:nth-child(2) img')?.src),certificateImage(certificate.querySelector('.certificate-technologies article:nth-child(3) img')?.src),certificateImage(certificate.querySelector('.certificate-qr')?.src)]);const draw=(image,x,y,w,h)=>{if(image)ctx.drawImage(image,x,y,w,h)};draw(logo,82,72,100,100);ctx.fillStyle='#eaf8ff';ctx.font='800 31px Arial';ctx.fillText('JL CODE ACADEMY',202,110);ctx.fillStyle='#65cfff';ctx.font='700 15px Arial';ctx.fillText('EDUCAÇÃO · TECNOLOGIA · FUTURO',204,141);ctx.strokeStyle='#71d5ff';ctx.lineWidth=2;ctx.strokeRect(1322,70,190,70);ctx.fillStyle='#d9f7ff';ctx.font='800 16px Arial';ctx.textAlign='center';ctx.fillText('CERTIFICADO',1417,100);ctx.fillText('OFICIAL',1417,126);ctx.fillStyle='#68d7ff';ctx.font='800 20px Arial';ctx.fillText('CERTIFICADO DE CONCLUSÃO',800,190);const course=certificateText(publicView?'#public-certificate-course':'.certificate-title-new h2','PROGRAMAÇÃO WEB');ctx.font='900 76px Arial';ctx.fillStyle='#82d8ff';ctx.fillText(course.toUpperCase(),800,270);ctx.font='700 18px Arial';ctx.fillStyle='#d9efff';ctx.fillText(certificateText(publicView?'#public-certificate-level':'.certificate-title-new span','TRILHA PROFISSIONAL · NÍVEL JÚNIOR'),800,305);ctx.font='600 22px Arial';ctx.fillStyle='#eaf6ff';ctx.fillText('Certificamos que',800,372);const name=certificateText(publicView?'#public-certificate-name':'#certificate-name');ctx.font='bold 68px Georgia';ctx.fillStyle='#fff4c8';ctx.fillText(name,800,450);const nameWidth=ctx.measureText(name).width;const line=ctx.createLinearGradient(800-nameWidth*.58,0,800+nameWidth*.58,0);line.addColorStop(0,'transparent');line.addColorStop(.5,'#5fd6ff');line.addColorStop(1,'transparent');ctx.fillStyle=line;ctx.fillRect(800-nameWidth*.62,468,nameWidth*1.24,3);ctx.font='500 22px Arial';ctx.fillStyle='#e5f5ff';ctx.fillText('concluiu a trilha de desenvolvimento web com aproveitamento comprovado na avaliação final.',800,510);const icons=[html,css,js],labels=['HTML5','CSS3','JAVASCRIPT'];icons.forEach((image,index)=>{const x=610+index*150;draw(image,x,548,55,55);ctx.font='800 16px Arial';ctx.fillStyle='#effaff';ctx.fillText(labels[index],x+96,582)});ctx.fillStyle='#061a36cc';ctx.fillRect(90,650,1420,110);ctx.strokeStyle='#5bcaff';ctx.lineWidth=2;ctx.strokeRect(90,650,1420,110);const values=[['DATA DE CONCLUSÃO',certificateText(publicView?'#public-certificate-date':'#certificate-date')],['CARGA HORÁRIA',certificateText(publicView?'#public-certificate-hours':'#certificate-hours')],['DESEMPENHO',certificateText(publicView?'#public-certificate-score':'#certificate-score')],['CÓDIGO DO CERTIFICADO',certificateText(publicView?'#public-certificate-code':'#certificate-code')]];values.forEach(([label,value],index)=>{const x=120+index*(index===3?360:330);if(index){ctx.strokeStyle='#54caff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-25,670);ctx.lineTo(x-25,742);ctx.stroke()}ctx.textAlign='left';ctx.fillStyle='#83d8ff';ctx.font='800 14px Arial';ctx.fillText(label,x,688);ctx.fillStyle='#fff';ctx.font=index===3?'800 17px Arial':'700 19px Arial';ctx.fillText(value,x,722)});ctx.textAlign='center';ctx.strokeStyle='#8be4ff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(110,790);ctx.lineTo(700,790);ctx.stroke();ctx.fillStyle='#fff';ctx.font='italic 34px Georgia';ctx.fillText('JL Code',400,822);ctx.font='700 15px Arial';ctx.fillStyle='#bde6ff';ctx.fillText('Equipe JL Code · Excelência em educação',400,848);if(qr){ctx.fillStyle='#fff';ctx.fillRect(1102,785,112,112);draw(qr,1108,791,100,100)}ctx.textAlign='left';ctx.fillStyle='#9ae4ff';ctx.font='800 16px Arial';ctx.fillText('VALIDAÇÃO DIGITAL',1235,820);ctx.fillStyle='#e0f4ff';ctx.font='500 15px Arial';ctx.fillText('Escaneie o QR Code para abrir a',1235,846);ctx.fillText('validação oficial.',1235,867);draw(logo,1440,790,78,78);return canvas}
function certificatePdfBlob(canvas){const base64=canvas.toDataURL('image/jpeg',.96).split(',')[1],binary=atob(base64),imageBytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)imageBytes[i]=binary.charCodeAt(i);const encoder=new TextEncoder(),parts=[],offsets=[0],add=(value)=>{const bytes=typeof value==='string'?encoder.encode(value):value;parts.push(bytes);return bytes.length};let length=add('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');const object=(id,content)=>{offsets[id]=length;length+=add(`${id} 0 obj\n`);length+=add(content);length+=add('\nendobj\n')};object(1,'<< /Type /Catalog /Pages 2 0 R >>');object(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');object(3,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${canvas.width} ${canvas.height}] /Resources << /ProcSet [/PDF /ImageC] /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>`);const content=`q\n${canvas.width} 0 0 ${canvas.height} 0 0 cm\n/Im0 Do\nQ`;object(4,`<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`);offsets[5]=length;length+=add('5 0 obj\n');length+=add(`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`);length+=add(imageBytes);length+=add('\nendstream\nendobj\n');const xref=length;length+=add(`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((offset)=>`${String(offset).padStart(10,'0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);return new Blob(parts,{type:'application/pdf'})}
const saveCertificateBlob=(blob,fileName)=>{const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=fileName;link.style.display='none';document.body.append(link);link.click();setTimeout(()=>{URL.revokeObjectURL(url);link.remove()},60000)};
async function downloadCertificatePdf(selector,fileName,button,status){const certificate=document.querySelector(selector);if(!certificate)return;if(!window.html2canvas)throw Error('O gerador do certificado ainda está carregando. Aguarde alguns segundos e tente novamente.');const originalLabel=button.textContent;button.disabled=true;button.textContent='Gerando PDF colorido…';try{await waitForImages(certificate);const canvas=await window.html2canvas(certificate,{backgroundColor:'#071425',scale:2,useCORS:true,allowTaint:false,logging:false,imageTimeout:15000,scrollX:0,scrollY:0,windowWidth:1280,windowHeight:820,onclone:(documentClone)=>{const title=documentClone.querySelector(`${selector} .certificate-title-new h2`);if(title){title.style.background='none';title.style.backgroundImage='none';title.style.backgroundClip='border-box';title.style.webkitBackgroundClip='border-box';title.style.color='#82d8ff';title.style.webkitTextFillColor='#82d8ff';}}});saveCertificateBlob(certificatePdfBlob(canvas),fileName);if(status)status.textContent='PDF horizontal, colorido e válido baixado com sucesso.'}catch(error){throw Error(`Não foi possível gerar o PDF: ${error.message}`)}finally{button.disabled=false;button.textContent=originalLabel}}
async function loadCertificate(){const status=document.querySelector('#certificate-status');if(!status)return;try{const state=await api('/api/final-exam/status');const c=state.certificate;if(!c){status.textContent='Você ainda não possui um certificado emitido.';return}const fullName=String(state.user.name||'').trim().replace(/\s+/g,' ');const nameParts=fullName.split(' ').filter(Boolean);const displayName=nameParts.length>1?`${nameParts[0]} ${nameParts.at(-1)}`:fullName;const validation=`https://jlcode.pages.dev/validar-certificado.html?code=${encodeURIComponent(c.certificate_code)}`;document.querySelector('#certificate-name').textContent=displayName;document.querySelector('#certificate-date').textContent=new Date(c.completed_at).toLocaleDateString('pt-BR');document.querySelector('#certificate-hours').textContent=`${c.training_days} dias de estudo`;document.querySelector('#certificate-score').textContent=`Aprovado (${c.score_percent}%)`;document.querySelector('#certificate-code').textContent=c.certificate_code;const qr=document.querySelector('#certificate-qr');qr.crossOrigin='anonymous';qr.src=`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(validation)}`;document.querySelector('#certificate-qr-link').href=validation;document.querySelector('#validate-certificate').href=validation;document.querySelector('#certificate-document').hidden=false;document.querySelector('#certificate-actions').hidden=false;status.textContent='Certificado emitido e protegido pela sua conta.';document.querySelector('#print-certificate').textContent='Baixar certificado em PDF';document.querySelector('#print-certificate').addEventListener('click',async(event)=>{try{await downloadCertificatePdf('#certificate-document',`certificado-jl-code-${c.certificate_code}.pdf`,event.currentTarget,status)}catch(error){status.textContent=error.message}})}catch(e){status.textContent=e.message}}
loadCertificate();
async function loadAdminCertificates(){const form=document.querySelector('#admin-certificate-form');if(!form)return;const results=document.querySelector('#admin-certificate-results');async function search(){try{const q=document.querySelector('#admin-certificate-query').value;const {certificates}=await api(`/api/admin/certificates?q=${encodeURIComponent(q)}`);results.innerHTML=certificates.length?certificates.map(c=>`<article class="student-course"><span class="tag">${c.certificate_code}</span><h3>${c.name}</h3><p>${c.email}<br>${c.course_name} · ${c.score_percent}%<br>${new Date(c.completed_at).toLocaleDateString('pt-BR')}</p><a class="text-link" href="validar-certificado.html?code=${encodeURIComponent(c.certificate_code)}">Validar</a></article>`).join(''):'<p>Nenhum certificado encontrado.</p>'}catch(e){results.innerHTML=`<p class="form-feedback error">${e.message}</p>`}}form.addEventListener('submit',e=>{e.preventDefault();search()});search()}
loadAdminCertificates();
async function loadCertificateValidation(){const target=document.querySelector('#certificate-validation-content');if(!target)return;const code=new URLSearchParams(location.search).get('code');if(!code){target.textContent='Informe um código de certificado válido.';return}try{const {certificate:c}=await api(`/api/certificates/${encodeURIComponent(code)}`);document.querySelector('#certificate-validation-title').textContent='Certificado válido';target.innerHTML=`<strong>${c.name}</strong><br>${c.course} - ${c.level}<br>Conclusão: ${new Date(c.completedAt).toLocaleString('pt-BR')}<br>${c.trainingDays} dias de formação - ${c.scorePercent}%<br>Código: ${c.code}`;const actions=document.querySelector('#certificate-validation-actions'),download=document.querySelector('#download-validated-certificate');if(actions&&download){download.href=`certificado-publico.html?code=${encodeURIComponent(c.code)}`;actions.hidden=false}}catch(e){target.textContent=e.message}}
loadCertificateValidation();
async function loadPublicCertificate(){const status=document.querySelector('#public-certificate-status');if(!status)return;const code=new URLSearchParams(location.search).get('code');if(!code){status.textContent='Informe um código de certificado válido.';return}try{const {certificate:c}=await api(`/api/certificates/${encodeURIComponent(code)}`),fullName=String(c.name||'').trim().replace(/\s+/g,' '),parts=fullName.split(' ').filter(Boolean),displayName=parts.length>1?`${parts[0]} ${parts.at(-1)}`:fullName,validation=`${location.origin}/validar-certificado.html?code=${encodeURIComponent(c.code)}`;document.querySelector('#public-certificate-name').textContent=displayName;document.querySelector('#public-certificate-course').textContent=c.course;document.querySelector('#public-certificate-level').textContent=`TRILHA PROFISSIONAL · ${c.level}`;document.querySelector('#public-certificate-date').textContent=new Date(c.completedAt).toLocaleDateString('pt-BR');document.querySelector('#public-certificate-hours').textContent=`${c.trainingDays} dias de estudo`;document.querySelector('#public-certificate-score').textContent=`Aprovado (${c.scorePercent}%)`;document.querySelector('#public-certificate-code').textContent=c.code;const qr=document.querySelector('#public-certificate-qr');qr.crossOrigin='anonymous';qr.src=`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(validation)}`;document.querySelector('#public-certificate-qr-link').href=validation;document.querySelector('#back-to-validation').href=validation;document.querySelector('#public-certificate-document').hidden=false;document.querySelector('#public-certificate-actions').hidden=false;status.textContent='Certificado verificado. Use o botão abaixo para baixar o PDF oficial.';document.querySelector('#download-public-certificate').addEventListener('click',async(event)=>{try{await downloadCertificatePdf('#public-certificate-document',`certificado-jl-code-${c.code}.pdf`,event.currentTarget,status)}catch(error){status.textContent=error.message}})}catch(e){status.textContent=e.message}}
loadPublicCertificate();

async function loadStudent() { const greeting = document.querySelector('#student-greeting'); if (!greeting) return; try { const { user, accesses } = await api('/api/student'); greeting.textContent = `Olá, ${user.name.split(' ')[0]}!`; document.querySelector('#student-plan').textContent = user.plan === 'FREE' ? 'Sem plano' : `Plano ${user.plan === 'BETA' ? 'Beta' : 'Pro'}`; document.querySelector('#student-status').textContent = user.paymentStatus === 'CONFIRMED' ? 'Acesso liberado' : 'Aguardando pagamento'; const active = new Set(accesses.filter((a) => a.status === 'ACTIVE').map((a) => a.technology)); const container = document.querySelector('#student-courses'); container.innerHTML = ['HTML', 'CSS', 'JAVASCRIPT'].map((technology) => { const unlocked = active.has(technology); return `<article class="student-course ${unlocked ? '' : 'locked'}"><div class="course-icon">${unlocked ? '✓' : '🔒'}</div><h3>${technology === 'JAVASCRIPT' ? 'JavaScript' : technology}</h3><p>${unlocked ? 'Aulas, apostilas, exercícios e projetos disponíveis.' : technology === 'HTML' ? 'Assine um plano para liberar este curso.' : 'Disponível no Plano Pro.'}</p></article>`; }).join(''); } catch { location.href = 'login.html'; } }
loadStudent();
function addCertificationShortcut(){const resources=document.querySelector('.student-resources>div');if(!resources||document.querySelector('#certification-resource'))return;const card=document.createElement('article');card.id='certification-resource';card.innerHTML='★<h3><a href="prova-final.html">Prova e certificado</a></h3><p>Conquiste sua certificação ao concluir a trilha Pro.</p>';resources.append(card);const nav=document.querySelector('.nav-links');if(nav){const link=document.createElement('a');link.href='prova-final.html';link.textContent='Prova final';nav.insertBefore(link,nav.querySelector('#logout-link')||null)}}
addCertificationShortcut();

async function loadApostilas() {
  const list = document.querySelector('#apostilas-list');
  if (!list) return;
  try {
    const { apostilas } = await api('/api/apostilas');
    const tracks = [
      { code: 'HTML', name: 'HTML', plan: 'BETA', description: 'Estrutura, semântica, formulários e acessibilidade.' },
      { code: 'CSS', name: 'CSS', plan: 'PRO', description: 'Estilos, layout, responsividade e interfaces.' },
      { code: 'JAVASCRIPT', name: 'JavaScript', plan: 'PRO', description: 'Lógica, DOM, eventos, dados e projetos.' }
    ];
    list.innerHTML = tracks.map((track) => {
      const lessons = apostilas.filter((apostila) => apostila.course === track.code);
      const unlocked = lessons.some((apostila) => apostila.allowed);
      const lessonCards = lessons.map((apostila, index) => `<article class="student-course ${apostila.allowed ? '' : 'locked'}"><span class="tag">AULA ${String(index + 1).padStart(2, '0')} · ${apostila.required_plan}</span><h3>${apostila.title}</h3><p>${apostila.description}</p><p>Progresso: ${apostila.progress_percent}%</p>${apostila.allowed ? `<a class="button button-small" href="visualizar-apostila.html?slug=${apostila.slug}">${apostila.progress_percent ? 'Continuar estudando' : 'Abrir apostila'}</a>` : '<p>Disponível no Plano Pro.</p>'}</article>`).join('');
      return `<details class="apostila-track ${unlocked ? '' : 'locked'}"><summary><span class="tag">${track.name.toUpperCase()} · ${track.plan}</span><h2>${track.name}</h2><p>${track.description}</p><strong>${lessons.length} apostilas</strong><span class="button button-small">${unlocked ? 'Ver apostilas' : 'Plano Pro'}</span></summary><div class="apostila-track-content">${unlocked ? `<p class="apostila-track-note">Escolha uma das 50 apostilas de ${track.name} para estudar.</p><div class="student-courses">${lessonCards}</div>` : '<p class="form-feedback error">Este conteúdo é exclusivo do Plano Pro.</p>'}</div></details>`;
    }).join('');
  } catch {
    location.href = 'login.html';
  }
}
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
