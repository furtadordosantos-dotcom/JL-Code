import bcrypt from 'bcryptjs';
import { finalExamQuestions, publicQuestions } from './exam-catalog.js';

const plans = {
  BETA: { price: 12990, name: 'Plano Beta', description: 'Acesso ao Plano Beta JL Code por 15 dias' },
  PRO: { price: 19990, name: 'Plano Pro', description: 'Acesso ao Plano Pro JL Code por 15 dias' }
};
const INFINITEPAY_CHECKOUT_URL = 'https://api.checkout.infinitepay.io/links';
const INFINITEPAY_CHECK_URL = 'https://api.checkout.infinitepay.io/payment_check';
const PLAN_PERIOD_DAYS = 15;
const PLAN_DURATION_MS = PLAN_PERIOD_DAYS * 24 * 60 * 60 * 1000;
function subscriptionTerms(planCode, periods) {
  const quantity = Number(periods);
  if (!plans[planCode] || !Number.isSafeInteger(quantity) || quantity < 1) throw Error('Quantidade de períodos inválida.');
  const amountCents = plans[planCode].price * quantity;
  const accessDays = PLAN_PERIOD_DAYS * quantity;
  if (!Number.isSafeInteger(amountCents) || !Number.isSafeInteger(accessDays)) throw Error('Quantidade de períodos inválida.');
  return { periods: quantity, accessDays, amountCents };
}
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
['js-project-catalog','JAVASCRIPT','Projeto catálogo','Crie catálogo com filtro, ordenação e estado vazio.','Use array de objetos, map/filter e mensagens de interface claras.'],
['css-forms','CSS','Formulário premium','Projete um formulário completo com estados de foco, erro e sucesso.','Aplique :focus-visible, :invalid e contraste adequado sem depender apenas da cor.'],
['css-commerce','CSS','Vitrine de produtos','Monte uma vitrine com cartões consistentes, imagem responsiva e botão de ação.','Use Grid auto-fit, object-fit e uma grade que mantenha os cards proporcionais.'],
['css-data-table','CSS','Tabela de dados responsiva','Transforme uma tabela de métricas em uma experiência legível em telas pequenas.','Crie cabeçalho fixo visual, rolagem horizontal segura e destaque de linhas.'],
['css-component-states','CSS','Estados de componente','Modele estados de carregamento, vazio, erro e sucesso para um componente.','Crie estilos distintos para cada estado e mantenha a mesma hierarquia visual.'],
['js-auth-flow','JAVASCRIPT','Fluxo de autenticação simulado','Crie uma tela que valide credenciais de demonstração e apresente feedback seguro.','Valide campos, trate erro e nunca mostre a senha na interface.'],
['js-modal','JAVASCRIPT','Modal acessível','Implemente um modal que abra, feche e devolva o foco corretamente.','Use eventos de teclado e feche com Escape ou clique fora do conteúdo.'],
['js-dashboard','JAVASCRIPT','Dashboard de estudos','Crie painel que calcula progresso e destaca a próxima atividade.','Use array de módulos, reduce e renderização dinâmica do resumo.'],
['js-error-boundary','JAVASCRIPT','Tratamento de falhas','Crie uma interface resiliente para uma consulta que pode falhar.','Mostre carregamento, erro com tentativa novamente e resultado vazio.']
];
exerciseCatalog.push(...professionalExerciseTracks.map(([id,technology,title,description,goal])=>({id,technology,requiredPlan:'PRO',level:'Profissional',title,description,goal,starterCode:technology==='HTML'?'<main>\n  <h1>Desafio JL Code</h1>\n</main>':technology==='CSS'?'<style>\n  :root { --brand: #1769e0; }\n</style>\n<main class="app">Comece aqui</main>':'<main><h1>Desafio JL Code</h1><div id="app"></div></main>\n<script>\n  const app = document.querySelector("#app");\n<\\/script>'})));

const examPreparationExercises = [
  {id:'exam-html-structure',technology:'HTML',requiredPlan:'BETA',level:'Preparação para prova',title:'Estrutura e semântica',description:'Treine h1, navegação e conteúdo principal — temas cobrados na prova final.',goal:'Use apenas um h1 e organize a página com header, nav, main e footer.',starterCode:'<header><h1>Minha jornada na JL Code</h1><nav><a href="#conteudo">Conteúdo</a></nav></header>\n<main id="conteudo"><article><h2>Primeiro passo</h2><p>Escreva seu conteúdo.</p></article></main>\n<footer>JL Code</footer>'},
  {id:'exam-html-form',technology:'HTML',requiredPlan:'BETA',level:'Preparação para prova',title:'Formulário acessível',description:'Pratique label, input de e-mail e botão de envio.',goal:'Crie um formulário com label associado a cada campo e type="email".',starterCode:'<h1>Inscrição</h1>\n<form>\n  <label for="nome">Nome</label><input id="nome" required>\n  <label for="email">E-mail</label><input id="email" type="email" required>\n  <button>Enviar</button>\n</form>'},
  {id:'exam-html-content',technology:'HTML',requiredPlan:'BETA',level:'Preparação para prova',title:'Links, listas e imagens',description:'Reforce links, alt em imagens e listas HTML.',goal:'Adicione uma imagem com alt, um link e uma lista não ordenada.',starterCode:'<h1>Recursos para estudar</h1>\n<img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=80" alt="Notebook usado para estudar programação">\n<ul><li>HTML</li><li>CSS</li><li>JavaScript</li></ul>\n<a href="https://developer.mozilla.org/pt-BR/">Visitar a MDN</a>'},
  {id:'exam-css-foundations',technology:'CSS',requiredPlan:'PRO',level:'Preparação para prova',title:'Seletores e box model',description:'Aplique cor, padding, margin e borda em um cartão.',goal:'Edite as propriedades para dar espaçamento interno e cantos arredondados ao cartão.',starterCode:'<style>\n  .card { color: #0b5fc0; padding: 24px; margin: 24px; border: 2px solid #49b7ff; border-radius: 16px; }\n</style>\n<article class="card"><h1>CSS na prática</h1><p>Organize com o box model.</p></article>'},
  {id:'exam-css-layout',technology:'CSS',requiredPlan:'PRO',level:'Preparação para prova',title:'Flexbox e Grid',description:'Treine os dois sistemas de layout que aparecem na avaliação.',goal:'Use Flexbox no cabeçalho e Grid nos cartões de tecnologia.',starterCode:'<style>\n  .topo { display:flex; justify-content:space-between; gap:16px; }\n  .cards { display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; }\n  .card { padding:20px; border:1px solid #66caff; }\n</style>\n<header class="topo"><strong>JL Code</strong><span>Trilha Pro</span></header>\n<section class="cards"><div class="card">HTML</div><div class="card">CSS</div><div class="card">JavaScript</div></section>'},
  {id:'exam-css-responsive',technology:'CSS',requiredPlan:'PRO',level:'Preparação para prova',title:'Responsividade profissional',description:'Use media query, max-width e transição em uma interface.',goal:'No celular, deixe os cartões em uma coluna e reduza o título.',starterCode:'<style>\n  .app { max-width:900px; margin:auto; }\n  .cards { display:grid; grid-template-columns:repeat(3, 1fr); gap:16px; }\n  .card { padding:22px; transition:transform .2s; }\n  .card:hover { transform:translateY(-4px); }\n  @media (max-width:600px) { .cards { grid-template-columns:1fr; } h1 { font-size:1.6rem; } }\n</style>\n<main class="app"><h1>Interface responsiva</h1><section class="cards"><div class="card">1</div><div class="card">2</div><div class="card">3</div></section></main>'},
  {id:'exam-js-logic',technology:'JAVASCRIPT',requiredPlan:'PRO',level:'Preparação para prova',title:'Variáveis, funções e condições',description:'Pratique const, função, if/else e comparação estrita.',goal:'Troque o valor da nota e veja se o resultado muda entre aprovado e revisão.',starterCode:'<p id="resultado"></p>\n<script>\n  const nota = 8;\n  function avaliar(valor) {\n    return valor >= 7 ? "Aprovado" : "Revise os estudos";\n  }\n  document.querySelector("#resultado").textContent = avaliar(nota);\n</script>'},
  {id:'exam-js-arrays',technology:'JAVASCRIPT',requiredPlan:'PRO',level:'Preparação para prova',title:'Arrays, map e filter',description:'Use arrays e métodos modernos para organizar dados.',goal:'Adicione uma tecnologia e filtre apenas os itens com mais de três letras.',starterCode:'<ul id="lista"></ul>\n<script>\n  const tecnologias = ["HTML", "CSS", "JavaScript"];\n  const filtradas = tecnologias.filter(item => item.length > 3);\n  document.querySelector("#lista").innerHTML = filtradas.map(item => "<li>" + item + "</li>").join("");\n</script>'},
  {id:'exam-js-dom',technology:'JAVASCRIPT',requiredPlan:'PRO',level:'Preparação para prova',title:'DOM e evento de clique',description:'Treine querySelector, addEventListener e textContent.',goal:'Ao clicar, atualize a mensagem sem recarregar a página.',starterCode:'<button id="praticar">Praticar agora</button>\n<p id="status">Pronto para começar.</p>\n<script>\n  const botao = document.querySelector("#praticar");\n  botao.addEventListener("click", () => {\n    document.querySelector("#status").textContent = "Exercício concluído!";\n  });\n</script>'},
  {id:'exam-js-json',technology:'JAVASCRIPT',requiredPlan:'PRO',level:'Preparação para prova',title:'JSON e persistência',description:'Pratique JSON.stringify, JSON.parse e LocalStorage.',goal:'Salve uma preferência de estudo e leia o valor novamente.',starterCode:'<p id="preferencia"></p>\n<script>\n  const dados = { trilha: "JavaScript", progresso: 25 };\n  localStorage.setItem("estudo", JSON.stringify(dados));\n  const salvo = JSON.parse(localStorage.getItem("estudo"));\n  document.querySelector("#preferencia").textContent = salvo.trilha + ": " + salvo.progresso + "%";\n</script>'},
  {id:'exam-js-fetch',technology:'JAVASCRIPT',requiredPlan:'PRO',level:'Preparação para prova',title:'Fetch e tratamento de erro',description:'Monte a estrutura segura de carregamento, sucesso e falha.',goal:'Use try/catch e apresente uma mensagem clara de carregamento.',starterCode:'<p id="saida">Carregando...</p>\n<script>\n  async function carregar() {\n    try {\n      const resposta = await fetch("https://jsonplaceholder.typicode.com/todos/1");\n      const dado = await resposta.json();\n      document.querySelector("#saida").textContent = dado.title;\n    } catch (erro) {\n      document.querySelector("#saida").textContent = "Não foi possível carregar os dados.";\n    }\n  }\n  carregar();\n</script>'}
];
exerciseCatalog.push(...examPreparationExercises);


const advancedExamExercises = [
  {id:'exam-html-document',technology:'HTML',requiredPlan:'BETA',level:'Preparação para prova',title:'Documento HTML completo',description:'Trabalhe doctype, title e meta description em uma página completa.',goal:'Monte a estrutura de documento, inclua title e uma descrição objetiva.',starterCode:'<!doctype html>\n<html lang="pt-BR"><head><meta charset="utf-8"><meta name="description" content="Meu projeto de programação"><title>Meu projeto</title></head><body><main><h1>JL Code</h1><p>Minha primeira página completa.</p></main></body></html>'},
  {id:'exam-html-table',technology:'HTML',requiredPlan:'BETA',level:'Preparação para prova',title:'Tabela de progresso',description:'Pratique table, tr, th e td com uma estrutura legível.',goal:'Adicione uma nova linha de tecnologia com seu percentual de estudo.',starterCode:'<h1>Meu progresso</h1>\n<table>\n  <caption>Trilhas estudadas</caption>\n  <thead><tr><th scope="col">Tecnologia</th><th scope="col">Progresso</th></tr></thead>\n  <tbody><tr><td>HTML</td><td>60%</td></tr><tr><td>CSS</td><td>35%</td></tr></tbody>\n</table>'},
  {id:'exam-html-media',technology:'HTML',requiredPlan:'BETA',level:'Preparação para prova',title:'Mídia com fallback',description:'Use audio e source oferecendo uma alternativa de conteúdo.',goal:'Inclua controls e escreva um texto de fallback para navegadores antigos.',starterCode:'<h1>Aula em áudio</h1>\n<audio controls>\n  <source src="aula.mp3" type="audio/mpeg">\n  Seu navegador não suporta áudio.\n</audio>'},
  {id:'exam-html-article',technology:'HTML',requiredPlan:'BETA',level:'Preparação para prova',title:'Artigo com ênfase',description:'Estruture um artigo independente e destaque informações importantes.',goal:'Use article, h2, p e strong para comunicar uma mensagem importante.',starterCode:'<article>\n  <h2>Como estudar melhor</h2>\n  <p>Estude um pouco todos os dias e <strong>pratique o código</strong>.</p>\n</article>'},
  {id:'exam-html-fieldset',technology:'HTML',requiredPlan:'BETA',level:'Preparação para prova',title:'Cadastro bem estruturado',description:'Use fieldset, legend e validação nativa em um formulário.',goal:'Adicione um campo obrigatório e mantenha todos os labels associados.',starterCode:'<form>\n  <fieldset><legend>Dados de contato</legend>\n    <label for="usuario">Usuário</label><input id="usuario" required>\n    <label for="contato">E-mail</label><input id="contato" type="email" required>\n  </fieldset>\n  <button>Cadastrar</button>\n</form>'},
  {id:'exam-css-specificity',technology:'CSS',requiredPlan:'PRO',level:'Preparação para prova',title:'Cascata e especificidade',description:'Entenda como classe, id e seletor de elemento disputam estilos.',goal:'Mude a regra mais específica e confira qual cor vence.',starterCode:'<style>\n  p { color: #dbeafe; }\n  .aviso { color: #67e8f9; }\n  #principal { color: #fbbf24; }\n</style>\n<p class="aviso" id="principal">Qual regra está sendo aplicada?</p>'},
  {id:'exam-css-position',technology:'CSS',requiredPlan:'PRO',level:'Preparação para prova',title:'Posicionamento e camadas',description:'Use position e z-index para montar um selo sobre um cartão.',goal:'Mova o selo para o canto superior direito sem tirar o conteúdo do fluxo.',starterCode:'<style>\n  .card { position:relative; width:300px; padding:28px; background:#10233d; color:white; border-radius:16px; }\n  .selo { position:absolute; top:12px; right:12px; z-index:1; padding:6px 10px; background:#fbbf24; color:#111827; border-radius:999px; }\n</style>\n<article class="card"><span class="selo">PRO</span><h1>Projeto JL Code</h1><p>Organize as camadas.</p></article>'},
  {id:'exam-css-grid-auto',technology:'CSS',requiredPlan:'PRO',level:'Preparação para prova',title:'Grade adaptável',description:'Crie cartões que se reorganizam automaticamente com CSS Grid.',goal:'Ajuste minmax para manter os cartões legíveis em qualquer largura.',starterCode:'<style>\n  .grade { display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:16px; }\n  .item { padding:22px; background:#e0f2fe; border-radius:12px; }\n</style>\n<section class="grade"><div class="item">HTML</div><div class="item">CSS</div><div class="item">JavaScript</div><div class="item">Projeto</div></section>'},
  {id:'exam-css-focus',technology:'CSS',requiredPlan:'PRO',level:'Preparação para prova',title:'Estados de interação',description:'Pratique :hover e :focus-visible com acessibilidade.',goal:'Dê um foco visível ao botão e um efeito leve ao passar o mouse.',starterCode:'<style>\n  button { padding:12px 18px; border:0; border-radius:8px; background:#1677ff; color:white; transition:transform .2s, background .2s; }\n  button:hover { transform:translateY(-2px); background:#0e5fcf; }\n  button:focus-visible { outline:3px solid #fbbf24; outline-offset:3px; }\n</style>\n<button>Começar exercício</button>'},
  {id:'exam-css-clamp',technology:'CSS',requiredPlan:'PRO',level:'Preparação para prova',title:'Tipografia fluida',description:'Use clamp e unidades relativas para um título responsivo.',goal:'Ajuste os valores de clamp e veja o título acompanhar o tamanho da tela.',starterCode:'<style>\n  h1 { font-size:clamp(2rem, 7vw, 5rem); line-height:1; color:#38bdf8; }\n  .conteudo { max-width:72ch; margin:auto; padding:clamp(16px, 4vw, 48px); }\n</style>\n<main class="conteudo"><h1>Programação Web</h1><p>Uma interface que se adapta sem quebrar.</p></main>'},
  {id:'exam-js-objects',technology:'JAVASCRIPT',requiredPlan:'PRO',level:'Preparação para prova',title:'Objetos e desestruturação',description:'Leia dados de um objeto usando propriedades e desestruturação.',goal:'Altere o objeto aluno e mantenha a mensagem dinâmica.',starterCode:'<p id="perfil"></p>\n<script>\n  const aluno = { nome: "Ana", trilha: "JavaScript", progresso: 40 };\n  const { nome, trilha, progresso } = aluno;\n  document.querySelector("#perfil").textContent = nome + " está em " + trilha + " (" + progresso + "%).";\n</script>'},
  {id:'exam-js-foreach',technology:'JAVASCRIPT',requiredPlan:'PRO',level:'Preparação para prova',title:'forEach e createElement',description:'Renderize uma lista sem usar HTML pronto para cada item.',goal:'Adicione uma tecnologia ao array e exiba usando createElement e textContent.',starterCode:'<ul id="tecnologias"></ul>\n<script>\n  const itens = ["HTML", "CSS", "JavaScript"];\n  const lista = document.querySelector("#tecnologias");\n  itens.forEach((item) => {\n    const linha = document.createElement("li");\n    linha.textContent = item;\n    lista.append(linha);\n  });\n</script>'},
  {id:'exam-js-submit',technology:'JAVASCRIPT',requiredPlan:'PRO',level:'Preparação para prova',title:'Envio de formulário',description:'Use submit e preventDefault para controlar o fluxo da página.',goal:'Mostre uma confirmação sem permitir que o formulário recarregue a página.',starterCode:'<form id="form"><label>Nome <input required></label><button>Salvar</button></form><p id="retorno"></p>\n<script>\n  document.querySelector("#form").addEventListener("submit", (evento) => {\n    evento.preventDefault();\n    document.querySelector("#retorno").textContent = "Dados salvos para estudo.";\n  });\n</script>'},
  {id:'exam-js-reduce',technology:'JAVASCRIPT',requiredPlan:'PRO',level:'Preparação para prova',title:'Cálculo de progresso',description:'Use reduce para resumir uma lista de módulos concluídos.',goal:'Adicione um valor ao array e observe o percentual calculado.',starterCode:'<p id="progresso"></p>\n<script>\n  const modulos = [100, 80, 60];\n  const total = modulos.reduce((soma, valor) => soma + valor, 0);\n  document.querySelector("#progresso").textContent = "Média: " + (total / modulos.length).toFixed(0) + "%";\n</script>'},
  {id:'exam-js-errors',technology:'JAVASCRIPT',requiredPlan:'PRO',level:'Preparação para prova',title:'Tratamento de erros',description:'Use try/catch para transformar uma falha em mensagem útil.',goal:'Troque o valor de entrada para testar os caminhos de sucesso e erro.',starterCode:'<p id="aviso"></p>\n<script>\n  const entrada = "{invalido}";\n  try {\n    const dados = JSON.parse(entrada);\n    document.querySelector("#aviso").textContent = dados.nome;\n  } catch (erro) {\n    document.querySelector("#aviso").textContent = "Dados inválidos. Revise o formato JSON.";\n  }\n</script>'}
];
exerciseCatalog.push(...advancedExamExercises);
const uniqueExercises = exerciseCatalog.filter((exercise, index, items) => index === items.findIndex((candidate) => candidate.id === exercise.id || (candidate.technology === exercise.technology && candidate.title.trim().toLocaleLowerCase() === exercise.title.trim().toLocaleLowerCase())));
exerciseCatalog.splice(0, exerciseCatalog.length, ...uniqueExercises);

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
async function user(env,id) {
  let account=await env.DB.prepare('SELECT * FROM users WHERE id=?').bind(id).first();
  if(!account) return account;
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
async function finalExamEligibility(env,u) { const started=Date.parse(u.plan_started_at||u.created_at); const payments=(await env.DB.prepare("SELECT COUNT(*) count FROM payments WHERE user_id=? AND status='CONFIRMED'").bind(u.id).first()).count; const eligible=isAdmin(u)||(u.plan==='PRO'&&u.payment_status==='CONFIRMED'&&Date.now()-started>=90*86400000&&payments>=6); const lastFailed=await env.DB.prepare("SELECT created_at FROM final_exam_attempts WHERE user_id=? AND status='FAILED' ORDER BY id DESC LIMIT 1").bind(u.id).first(); const retryAt=!isAdmin(u)&&lastFailed?new Date(Date.parse(lastFailed.created_at)+86400000).toISOString():null; return {eligible,started,payments,daysActive:Math.max(0,Math.floor((Date.now()-started)/86400000)),retryAt,canAttempt:isAdmin(u)||!retryAt||Date.now()>=Date.parse(retryAt)}; }
function publicUser(u) { return { id:u.id,name:u.name,email:u.email,plan:u.plan,paymentStatus:u.payment_status,allowedTechnologies:allowed(u),planStartedAt:u.plan_started_at,planEndsAt:u.plan_ends_at,isAdmin:isAdmin(u) }; }
async function mail(env,to,subject,html) { if(!env.BREVO_API_KEY || !env.EMAIL_FROM) throw Error('O envio de e-mail não está configurado.'); const r=await fetch('https://api.brevo.com/v3/smtp/email',{method:'POST',headers:{'api-key':env.BREVO_API_KEY,'content-type':'application/json','accept':'application/json'},body:JSON.stringify({sender:{name:'JL Code',email:env.EMAIL_FROM},to:[{email:to}],subject,htmlContent:html})}); const data=await r.json().catch(()=>({})); if(!r.ok) throw Error(data.message || data.code || 'O Brevo recusou o envio.'); }
async function requireUser(context) { const id=await session(context.request,context.env); if(!id) return null; return user(context.env,id); }
async function createVerification(env,u,origin) { await env.DB.prepare('DELETE FROM email_verifications WHERE user_id=? AND used_at IS NULL').bind(u.id).run(); const token=crypto.randomUUID()+crypto.randomUUID(); await env.DB.prepare('INSERT INTO email_verifications (user_id,token_hash,expires_at) VALUES (?,?,?)').bind(u.id,await sha(token),new Date(Date.now()+86400000).toISOString()).run(); const link=`${origin}/api/auth/verify-email?token=${encodeURIComponent(token)}`; await mail(env,u.email,'Confirme seu cadastro — JL Code',emailLayout(`<p>Olá, ${escapeHtml(u.name)}.</p><p>Seu cadastro foi criado com sucesso. Confirme seu e-mail para ativar a sua conta:</p><p style="text-align:center;margin:28px 0"><a href="${link}" style="display:inline-block;background:#2687ff;color:#ffffff;text-decoration:none;border-radius:9px;padding:13px 22px;font-weight:700">CONFIRMAR MEU E-MAIL</a></p><p style="font-size:13px;color:#9db2cc">Este link é válido por 24 horas. Use sempre o botão do e-mail mais recente.</p>`)); }
function topic(message) { const text=message.toLowerCase(); if(/\b(css|flexbox|grid|stylesheet|estilo|seletor|box model|media query|responsiv)/.test(text)) return 'CSS'; if(/\b(javascript|js\b|dom|array|função|funcao|variável|variavel|objeto|evento|api|fetch|loop)/.test(text)) return 'JAVASCRIPT'; return 'HTML'; }
function betaAnswerLeaks(answer) {
  return /<\/?(?:script|style)\b|\b(?:const|let|var|function|addEventListener|querySelector|document\.|window\.|fetch\(|localStorage|sessionStorage|onclick\s*=|onchange\s*=|@media|display\s*:|color\s*:|margin\s*:|padding\s*:|font-family\s*:|grid-template|flex(?:-direction|-wrap|-grow|-shrink)?\s*:)/i.test(String(answer || ''));
}
function betaHtmlOnlyFallback(message) {
  const request = escapeHtml(String(message || '').slice(0, 140));
  return `Você está usando o Plano Beta; vou ajudar somente na parte de HTML. Sobre “${request}”, comece criando a estrutura da página com títulos, campos, botões e áreas de resultado em HTML. Para aparência, interações e comportamentos, assine o Plano Pro para estudar CSS e JavaScript com a IA Gabriela.`;
}

async function createPasswordReset(env,u,origin) {
  await env.DB.prepare('DELETE FROM password_reset_tokens WHERE user_id=? AND used_at IS NULL').bind(u.id).run();
  const token=crypto.randomUUID()+crypto.randomUUID();
  await env.DB.prepare('INSERT INTO password_reset_tokens (user_id,token_hash,expires_at) VALUES (?,?,?)').bind(u.id,await sha(token),new Date(Date.now()+3600000).toISOString()).run();
  await mail(env,u.email,'Redefina sua senha — JL Code',emailLayout(`<p>Olá, ${escapeHtml(u.name)}.</p><p>Recebemos um pedido para redefinir a senha da sua conta JL Code.</p><p style="text-align:center;margin:28px 0"><a href="${origin}/login.html?redefinir=1&amp;token=${encodeURIComponent(token)}" style="display:inline-block;background:#2687ff;color:#ffffff;text-decoration:none;border-radius:9px;padding:13px 22px;font-weight:700">REDEFINIR MINHA SENHA</a></p><p style="font-size:13px;color:#9db2cc">Este link expira em uma hora e pode ser usado uma única vez.</p>`));
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
  const account=await user(env,order.user_id);
  const periods=Number(order.periods)||1;
  const accessDays=Number(order.access_days)||PLAN_PERIOD_DAYS;
  const currentEnd=Date.parse(account?.plan_ends_at||'');
  const hasActiveAccess=Number.isFinite(currentEnd)&&currentEnd>Date.now();
  const start=hasActiveAccess&&account?.plan==='PRO'&&order.plan_code==='PRO' ? (account.plan_started_at||now()) : now();
  const end=new Date((hasActiveAccess?currentEnd:Date.now())+accessDays*24*60*60*1000).toISOString();
  const technologies=order.plan_code==='PRO'?['HTML','CSS','JAVASCRIPT']:['HTML'];
  const paid=await env.DB.prepare("UPDATE payment_orders SET status='PAID', transaction_nsu=?, invoice_slug=COALESCE(invoice_slug,?), receipt_url=?, capture_method=?, confirmed_at=?, expires_at=? WHERE id=? AND status='PENDING'")
    .bind(String(payment.transaction_nsu||order.transaction_nsu||''),String(payment.slug||payment.invoice_slug||order.invoice_slug||'')||null,String(payment.receipt_url||order.receipt_url||'')||null,String(payment.capture_method||order.capture_method||'')||null,now(),end,order.id).run();
  if(!paid.meta.changes) return env.DB.prepare('SELECT * FROM payment_orders WHERE id=?').bind(order.id).first();
  await env.DB.batch([
    env.DB.prepare("INSERT OR IGNORE INTO payments (user_id,plan_code,amount_cents,periods,access_days,method,status,transaction_id) VALUES (?,?,?,?,?,?,?,?)").bind(order.user_id,order.plan_code,order.amount_cents,periods,accessDays,method,'CONFIRMED',String(payment.transaction_nsu||order.order_nsu)),
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
    if(method==='GET'&&path.join('/')==='auth/me') { const u=await auth(); return u instanceof Response?u:json({user:publicUser(u)}); }
    if(method==='GET'&&path.join('/')==='plans') return json({plans:(await env.DB.prepare('SELECT * FROM plans ORDER BY id').all()).results});
    if(method==='POST'&&path.join('/')==='payments/infinitepay/checkout') {
      const u=await auth(); if(u instanceof Response)return u;
      const plan=String(body.plan||'').toUpperCase();
      const paymentMethod=String(body.paymentMethod||'').toUpperCase();
      if(!plans[plan]) return json({error:'Plano inválido.'},400);
      let terms;
      try { terms=subscriptionTerms(plan,body.periods); } catch(error) { return json({error:error.message},400); }
      if(paymentMethod && !['PIX','CARD'].includes(paymentMethod)) return json({error:'Forma de pagamento inválida.'},400);
      if(!infinitePayConfigured(env)) return json({error:'O checkout da InfinitePay ainda não foi configurado.'},503);
      const origin=apiOrigin(env,url), orderNsu=`JL-${crypto.randomUUID()}`;
      await env.DB.prepare('INSERT INTO payment_orders (user_id,plan_code,amount_cents,periods,access_days,order_nsu) VALUES (?,?,?,?,?,?)').bind(u.id,plan,terms.amountCents,terms.periods,terms.accessDays,orderNsu).run();
      try {
        const checkout=await infinitePayRequest(INFINITEPAY_CHECKOUT_URL,{
          handle:env.INFINITEPAY_HANDLE,
          order_nsu:orderNsu,
          redirect_url:`${origin}/pagamento-aprovado.html?order_nsu=${encodeURIComponent(orderNsu)}`,
          webhook_url:`${origin}/api/payments/infinitepay/webhook`,
          customer:{name:u.name,email:u.email},
          items:[{quantity:terms.periods,price:plans[plan].price,description:`${plans[plan].description} — ${terms.accessDays} dias`}]
        });
        if(!checkout.url) throw Error('A InfinitePay não retornou o link de checkout.');
        await env.DB.prepare('UPDATE payment_orders SET checkout_url=?, invoice_slug=? WHERE order_nsu=?').bind(checkout.url,checkout.invoice_slug||checkout.slug||null,orderNsu).run();
        return json({checkoutUrl:checkout.url,orderNsu,plan,periods:terms.periods,accessDays:terms.accessDays,amountCents:terms.amountCents},201);
      } catch(error) {
        await env.DB.prepare("UPDATE payment_orders SET status='FAILED' WHERE order_nsu=? AND status='PENDING'").bind(orderNsu).run();
        throw error;
      }
    }
    if(method==='GET'&&path.join('/')==='payments/infinitepay/status') {
      const u=await auth(); if(u instanceof Response)return u;
      const orderNsu=String(url.searchParams.get('order_nsu')||'');
      const order=await env.DB.prepare('SELECT order_nsu,plan_code,amount_cents,periods,access_days,status,receipt_url,expires_at FROM payment_orders WHERE order_nsu=? AND user_id=?').bind(orderNsu,u.id).first();
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
        mail(env,account.email,`Pagamento confirmado — ${plans[order.plan_code].name} JL Code`,emailLayout(`<p>Olá, ${escapeHtml(account.name)}.</p><p>Seu pagamento foi confirmado. O ${plans[order.plan_code].name} está ativo por ${Number(confirmed.access_days)||PLAN_PERIOD_DAYS} dias.</p><p style="text-align:center;margin:28px 0"><a href="${apiOrigin(env,url)}/aluno.html" style="display:inline-block;background:#2687ff;color:#ffffff;text-decoration:none;border-radius:9px;padding:13px 22px;font-weight:700">ACESSAR ÁREA DO ALUNO</a></p>`)).catch(console.error);
        return json({success:true,message:null});
      } catch(error) { return json({success:false,message:error.message||'Não foi possível confirmar o pagamento.'},400); }
    }
    if(method==='GET'&&path.join('/')==='final-exam/status') { const u=await auth(); if(u instanceof Response)return u; const exam=await finalExamEligibility(env,u); const certificate=await env.DB.prepare('SELECT certificate_code,status,score_percent,completed_at,training_days FROM certificates WHERE user_id=?').bind(u.id).first(); return json({eligible:exam.eligible,canAttempt:exam.canAttempt,retryAt:exam.retryAt,daysActive:exam.daysActive,confirmedPayments:exam.payments,certificate,user:{name:u.name,isAdmin:isAdmin(u)}}); }
    if(method==='GET'&&path.join('/')==='final-exam/questions') { const u=await auth(); if(u instanceof Response)return u; const exam=await finalExamEligibility(env,u); if(!exam.eligible)return json({error:'A Prova Final estará disponível após 90 dias de acesso Pro ativo e seis pagamentos confirmados.'},403); if(!exam.canAttempt)return json({error:`Você poderá tentar novamente após ${exam.retryAt}.`},429); return json({questions:publicQuestions}); }
    if(method==='POST'&&path.join('/')==='final-exam/submit') { const u=await auth(); if(u instanceof Response)return u; const exam=await finalExamEligibility(env,u); if(!exam.eligible)return json({error:'Você ainda não cumpre os requisitos da prova.'},403); if(!exam.canAttempt)return json({error:`Aguarde até ${exam.retryAt} para uma nova tentativa.`},429); const answers=Array.isArray(body.answers)?body.answers:[]; if(answers.length!==50)return json({error:'Responda às 50 questões antes de finalizar.'},400); const review=finalExamQuestions.map((q,i)=>({id:i+1,technology:q.technology,question:q.question,selectedOption:q.options[Number(answers[i])]||'Sem resposta',correctOption:q.options[q.answer],correct:Number(answers[i])===q.answer})); const correct=review.filter(item=>item.correct).length, percentage=correct*2, status=percentage>=80?'PASSED':'FAILED'; const previous=(await env.DB.prepare('SELECT COUNT(*) count FROM final_exam_attempts WHERE user_id=?').bind(u.id).first()).count; await env.DB.prepare('INSERT INTO final_exam_attempts (user_id,attempt_number,answers_json,correct_answers,percentage,status) VALUES (?,?,?,?,?,?)').bind(u.id,previous+1,JSON.stringify(answers),correct,percentage,status).run(); return json({correct,percentage,status,review:review.filter(item=>!item.correct),requiresCertificateName:status==='PASSED'}); }
    if(method==='POST'&&path.join('/')==='final-exam/admin-pass') { const u=await auth(); if(u instanceof Response)return u; if(!isAdmin(u))return json({error:'Atalho de teste disponível somente para a administração.'},403); const answers=finalExamQuestions.map(question=>question.answer); const previous=(await env.DB.prepare('SELECT COUNT(*) count FROM final_exam_attempts WHERE user_id=?').bind(u.id).first()).count; await env.DB.prepare('INSERT INTO final_exam_attempts (user_id,attempt_number,answers_json,correct_answers,percentage,status) VALUES (?,?,?,?,?,?)').bind(u.id,previous+1,JSON.stringify(answers),50,100,'PASSED').run(); return json({correct:50,percentage:100,status:'PASSED',review:[],requiresCertificateName:true}); }
    if(method==='POST'&&path.join('/')==='final-exam/certificate') { const u=await auth(); if(u instanceof Response)return u; const fullName=String(body.fullName||'').trim().replace(/\s+/g,' '); if(fullName.length<5||fullName.length>120||fullName.split(' ').length<2)return json({error:'Informe seu nome completo para o certificado.'},400); const eligibility=await finalExamEligibility(env,u); if(!eligibility.eligible)return json({error:'Você ainda não cumpriu os requisitos necessários para emitir o certificado.'},403); const existing=await env.DB.prepare('SELECT * FROM certificates WHERE user_id=?').bind(u.id).first(); if(existing)return json({certificate:existing}); const passed=await env.DB.prepare("SELECT percentage FROM final_exam_attempts WHERE user_id=? AND status='PASSED' ORDER BY id DESC LIMIT 1").bind(u.id).first(); if(!passed||Number(passed.percentage)<80)return json({error:'Conclua a prova com pelo menos 80% antes de emitir o certificado.'},403); const started=Date.parse(u.plan_started_at||u.created_at); const code=`JLC-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${crypto.randomUUID().slice(0,8).toUpperCase()}`; await env.DB.batch([env.DB.prepare('UPDATE users SET name=? WHERE id=?').bind(fullName,u.id),env.DB.prepare("INSERT INTO certificates (user_id,certificate_code,completed_at,training_days,score_percent) VALUES (?,?,?,?,?)").bind(u.id,code,now(),Math.max(0,Math.floor((Date.now()-started)/86400000)),passed.percentage)]); const certificate=await env.DB.prepare('SELECT * FROM certificates WHERE user_id=?').bind(u.id).first(); return json({certificate}); }
    if(method==='GET'&&path[0]==='certificates'&&path[1]) { const c=await env.DB.prepare('SELECT c.*,u.name FROM certificates c JOIN users u ON u.id=c.user_id WHERE c.certificate_code=?').bind(path[1]).first(); if(!c||c.status!=='VALID')return json({error:'Certificado não encontrado.'},404); return json({certificate:{code:c.certificate_code,name:c.name,course:c.course_name,level:c.level,completedAt:c.completed_at,trainingDays:c.training_days,scorePercent:c.score_percent,status:c.status}}); }
    if(method==='GET'&&path.join('/')==='admin/certificates') { const u=await auth(); if(u instanceof Response)return u; if(!isAdmin(u))return json({error:'Acesso administrativo necessário.'},403); const search=String(url.searchParams.get('q')||'').trim(); const like=`%${search}%`; const rows=(await env.DB.prepare("SELECT c.certificate_code,c.course_name,c.level,c.completed_at,c.training_days,c.score_percent,c.status,u.name,u.email FROM certificates c JOIN users u ON u.id=c.user_id WHERE u.name LIKE ? OR u.email LIKE ? OR c.certificate_code LIKE ? ORDER BY c.created_at DESC LIMIT 100").bind(like,like,like).all()).results; return json({certificates:rows}); }
    if(method==='GET'&&path.join('/')==='student') { const u=await auth(); if(u instanceof Response)return u; return json({user:publicUser(u),accesses:(await env.DB.prepare('SELECT technology,status FROM accesses WHERE user_id=?').bind(u.id).all()).results}); }
    if(method==='GET'&&path.join('/')==='exercises') { const u=await auth(); if(u instanceof Response)return u; const proAccess=isAdmin(u)||(u.plan==='PRO'&&u.payment_status==='CONFIRMED'); return json({proAccess,exercises:proAccess?exerciseCatalog.map(exercise=>({...exercise,allowed:true})):[]}); }
    if(method==='GET'&&path[0]==='apostilas'&&path.length===1) { const u=await auth(); if(u instanceof Response)return u; const items=(await env.DB.prepare('SELECT a.slug,a.title,a.description,a.required_plan,c.name course,COALESCE(ua.progress_percent,0) progress_percent FROM apostilas a JOIN courses c ON c.id=a.course_id LEFT JOIN user_apostila_access ua ON ua.apostila_id=a.id AND ua.user_id=? ORDER BY a.id').bind(u.id).all()).results; return json({apostilas:items.map(x=>({...x,allowed:allowed(u).length>0&&(u.plan==='PRO'||x.required_plan==='BETA'&&u.plan==='BETA')}))}); }
    if((method==='GET'||method==='HEAD')&&path[0]==='apostilas'&&path[2]==='pdf') { const u=await auth(); if(u instanceof Response)return u; const a=await env.DB.prepare('SELECT * FROM apostilas WHERE slug=?').bind(path[1]).first(); if(!a)return json({error:'Apostila não encontrada.'},404); if(!(isAdmin(u)||(u.plan==='PRO'&&u.payment_status==='CONFIRMED')||(u.plan==='BETA'&&u.payment_status==='CONFIRMED'&&a.required_plan==='BETA')))return json({error:'Esta apostila não está liberada para o seu plano.'},403); if(!env.APOSTILAS)return json({error:'O armazenamento privado das apostilas ainda não está conectado.'},503); const object=await env.APOSTILAS.get(`apostilas/${a.private_filename}`,{range:request.headers}); if(!object)return json({error:'Esta apostila ainda não foi enviada ao armazenamento privado.'},503); const headers=new Headers({'content-type':'application/pdf','content-disposition':'inline','cache-control':'private, no-store','x-content-type-options':'nosniff','accept-ranges':'bytes'}); object.writeHttpMetadata(headers); if(!headers.get('content-type'))headers.set('content-type','application/pdf'); if(method==='HEAD')return new Response(null,{headers,status:200}); await env.DB.prepare('INSERT INTO user_apostila_access (user_id,apostila_id,progress_percent,last_opened_at) VALUES (?,?,5,?) ON CONFLICT(user_id,apostila_id) DO UPDATE SET progress_percent=MAX(progress_percent,5),last_opened_at=excluded.last_opened_at').bind(u.id,a.id,now()).run(); return new Response(object.body,{headers,status:object.range?206:200}); }
    if(method==='GET'&&path.join('/')==='ai/history') { const u=await auth(); if(u instanceof Response)return u; const results=(await env.DB.prepare('SELECT message,response,created_at FROM ai_conversations WHERE user_id=? ORDER BY id DESC LIMIT 30').bind(u.id).all()).results.reverse(); return json({messages:results}); }
    if(method==='POST'&&path.join('/')==='ai/chat') {
      const u=await auth(); if(u instanceof Response)return u;
      const message=String(body.message||'').trim(), permitted=allowed(u), t=topic(message), beta=u.plan==='BETA';
      if(!message||message.length>4000)return json({error:'Envie uma pergunta de até 4.000 caracteres.'},400);
      if(!permitted.length)return json({error:'Seu acesso à IA Gabriela está bloqueado. Assine um plano para liberar o acesso.'},403);
      if(!permitted.includes(t))return json({error:beta?'Assine o Plano Pro para estudar CSS e JavaScript com a IA Gabriela.':`Seu plano libera somente ${permitted.join(', ')}.`},403);
      if(!env.AI)return json({error:'IA not configured.'},503);
      const allHistory=(await env.DB.prepare('SELECT message,response FROM ai_conversations WHERE user_id=? ORDER BY id DESC LIMIT 8').bind(u.id).all()).results.reverse();
      const history=beta ? allHistory.filter(item=>topic(item.message)==='HTML'&&!betaAnswerLeaks(item.response)) : allHistory;
      const betaInstruction=beta
        ? ' Você está atendendo uma pessoa do Plano Beta. Responda SOMENTE com explicações e código HTML puro. Não use, não inclua e não ensine CSS, JavaScript, tags style ou script, atributos de evento, links de stylesheet ou qualquer comportamento dinâmico. Mesmo se a pessoa pedir um site, calculadora, jogo, formulário ou projeto completo, entregue exclusivamente a estrutura HTML e informe que CSS e JavaScript exigem o Plano Pro.'
        : '';
      const messages=[{role:'system',content:`Você é Gabriela, professora de programação para iniciantes. Responda apenas sobre ${permitted.join(', ')}; ensine passo a passo em português.${betaInstruction}`},...history.flatMap(x=>[{role:'user',content:x.message},{role:'assistant',content:x.response}]),{role:'user',content:message}];
      const data=await env.AI.run('@cf/meta/llama-3.2-3b-instruct',{messages,max_tokens:700,temperature:0.35});
      const generated=String(data.response||data.result?.response||'Não consegui gerar uma resposta agora.');
      const answer=beta&&betaAnswerLeaks(generated)?betaHtmlOnlyFallback(message):generated;
      await env.DB.prepare('INSERT INTO ai_conversations (user_id,message,response,user_plan) VALUES (?,?,?,?)').bind(u.id,message,answer,u.plan).run();
      return json({answer});
    }
    return json({error:'Rota não encontrada.'},404);
  } catch(error) { console.error(error); return json({error:error.message||'Erro interno.'},500); }
}
