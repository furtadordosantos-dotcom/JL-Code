"""Gera as 150 apostilas progressivas da JL Code.

Cada apostila e independente, mas foi organizada como parte de uma trilha.
O catalogo foi montado a partir da prova final real: HTML semantico, formularios,
CSS (seletores, box model, Flexbox, Grid e responsividade) e JavaScript
(variaveis, logica, DOM, eventos, arrays, JSON, fetch e Promises).
"""

from __future__ import annotations

from dataclasses import dataclass
from html import escape
from pathlib import Path
from textwrap import dedent

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer


ROOT = Path(__file__).resolve().parent
OUT = ROOT / "private" / "apostilas"


@dataclass(frozen=True)
class Lesson:
    title: str
    focus: str
    code: str
    practice: str
    common_error: str


HTML = [
    Lesson("O que e HTML", "HTML e a linguagem que descreve a estrutura e o significado do conteudo de uma pagina.", "<!doctype html>\n<html lang=\"pt-BR\">\n  <body>\n    Olá, mundo!\n  </body>\n</html>", "Crie um arquivo index.html com a estrutura base e uma frase sobre seu objetivo de estudo.", "Comecar um arquivo sem doctype: isso pode ativar um modo antigo no navegador."),
    Lesson("Primeiro titulo e paragrafo", "Titulos apresentam a hierarquia do assunto; paragrafos organizam ideias em blocos de leitura.", "<h1>Meu primeiro projeto</h1>\n<p>Estou aprendendo a criar paginas web.</p>", "Monte uma apresentacao com um h1 e tres paragrafos curtos.", "Usar varios h1 para decorar: em uma pagina comum, mantenha apenas o titulo principal."),
    Lesson("Hierarquia de titulos", "h1 ate h6 representam niveis de importancia, e nao apenas tamanhos visuais.", "<h1>Curso de HTML</h1>\n<h2>Modulo 1</h2>\n<h3>Exercicio guiado</h3>", "Estruture o sumario de um curso usando h1, h2 e h3 na ordem correta.", "Pular de h1 para h4: leitores de tela perdem a sequencia logica."),
    Lesson("Texto com significado", "strong indica importancia e em indica enfase; ambos carregam significado alem da aparencia.", "<p><strong>Aviso:</strong> salve seu arquivo.</p>\n<p>Leia o exemplo <em>com atencao</em>.</p>", "Escreva um aviso com uma palavra importante e uma expressao enfatizada.", "Usar b e i quando a intencao e semantica; prefira strong e em nesse caso."),
    Lesson("Listas nao ordenadas", "ul agrupa itens sem ordem numerica e li representa cada item da lista.", "<ul>\n  <li>HTML</li>\n  <li>CSS</li>\n  <li>JavaScript</li>\n</ul>", "Liste cinco ferramentas que voce usa ou quer aprender.", "Colocar li fora de ul: o navegador pode exibir, mas a estrutura fica incorreta."),
    Lesson("Listas ordenadas", "ol e indicada quando a sequencia altera o resultado, como etapas de uma receita ou instalacao.", "<ol>\n  <li>Abrir o editor</li>\n  <li>Criar index.html</li>\n  <li>Salvar e testar</li>\n</ol>", "Descreva, em uma lista ordenada, como publicar uma pagina simples.", "Usar ol apenas porque gosta de numeros; escolha-a quando a ordem realmente importar."),
    Lesson("Links", "a cria navegacao e href guarda o endereco de destino.", "<a href=\"https://developer.mozilla.org/pt-BR/\">Estudar na MDN</a>", "Crie links para tres paginas: inicio, projetos e contato.", "Usar 'clique aqui' como unico texto: o texto do link deve explicar o destino."),
    Lesson("Links em nova aba", "target=_blank abre outro contexto; rel=noopener protege a pagina original ao abrir sites externos.", "<a href=\"https://example.com\" target=\"_blank\" rel=\"noopener\">\n  Abrir referencia externa\n</a>", "Adicione um link externo seguro e informe no texto que ele abre nova aba.", "Abrir toda navegacao interna em nova aba: isso confunde a pessoa usuaria."),
    Lesson("Imagens acessiveis", "img exibe uma imagem, src aponta o arquivo e alt descreve a informacao importante para quem nao a ve.", "<img src=\"estudante.jpg\" alt=\"Pessoa estudando HTML em um notebook\">", "Inclua uma foto de projeto com um alt que comunique seu conteudo.", "Deixar alt vazio em imagem informativa ou repetir 'imagem de' sem explicar nada."),
    Lesson("Figuras e legendas", "figure agrupa uma midia com contexto e figcaption fornece legenda relacionada.", "<figure>\n  <img src=\"grafico.png\" alt=\"Evolucao do progresso semanal\">\n  <figcaption>Progresso da turma em agosto.</figcaption>\n</figure>", "Crie uma figura de portifolio com legenda objetiva.", "Usar figcaption como paragrafo solto longe da imagem que ele descreve."),
    Lesson("Estrutura semantica", "header, main e footer delimitam cabecalho, conteudo principal e rodape de uma pagina.", "<header>JL Code</header>\n<main><h1>Conteudo principal</h1></main>\n<footer>2026</footer>", "Transforme uma pagina com divs genericas em uma estrutura com header, main e footer.", "Criar dois elementos main: cada pagina deve ter um conteudo principal."),
    Lesson("Navegacao semantica", "nav identifica um conjunto importante de links de navegacao.", "<nav aria-label=\"Principal\">\n  <a href=\"#inicio\">Inicio</a>\n  <a href=\"#contato\">Contato</a>\n</nav>", "Adicione uma navegacao para tres secoes da sua pagina.", "Envolver qualquer link isolado em nav; use nav para grupos de navegacao."),
    Lesson("Secoes e artigos", "section organiza um tema e article representa conteudo que pode existir de forma independente.", "<section>\n  <h2>Ultimas noticias</h2>\n  <article><h3>Projeto publicado</h3><p>...</p></article>\n</section>", "Monte uma secao de blog com dois artigos independentes.", "Usar section sem titulo: uma secao normalmente precisa de um cabecalho identificavel."),
    Lesson("Conteudo complementar", "aside reune informacoes relacionadas, porem nao essenciais ao fluxo principal.", "<main><article>Texto principal</article></main>\n<aside>Links recomendados</aside>", "Crie uma pagina de artigo com uma caixa lateral de leituras recomendadas.", "Colocar o conteudo principal dentro de aside."),
    Lesson("Tabelas de dados", "table e para dados tabulares; tr cria linha, th cria cabecalho e td cria celula de dado.", "<table>\n  <tr><th>Modulo</th><th>Horas</th></tr>\n  <tr><td>HTML</td><td>12</td></tr>\n</table>", "Monte uma tabela com tres modulos, suas horas e status.", "Usar tabela para posicionar elementos na tela; layout e responsabilidade do CSS."),
    Lesson("Cabecalhos de tabela", "scope em th deixa clara a relacao entre cabecalho e celulas para tecnologias assistivas.", "<tr><th scope=\"col\">Curso</th><th scope=\"col\">Nivel</th></tr>", "Melhore a tabela anterior usando th e scope nas colunas.", "Usar td para cabecalho visualmente em negrito."),
    Lesson("Formularios", "form agrupa campos que serao enviados ou processados juntos.", "<form action=\"/cadastro\" method=\"post\">\n  <button type=\"submit\">Enviar</button>\n</form>", "Crie a base de um formulario de inscricao com botao submit.", "Usar div como formulario sem definir o comportamento de envio."),
    Lesson("Labels e campos", "label associa uma explicacao legivel a um input por meio de for e id.", "<label for=\"nome\">Nome completo</label>\n<input id=\"nome\" name=\"nome\" type=\"text\">", "Adicione campos de nome e cidade, cada um com seu label.", "Confiar apenas no placeholder: ele desaparece enquanto a pessoa digita."),
    Lesson("Tipos de input", "type informa o tipo de dado esperado e permite teclados e validacoes adequadas.", "<input type=\"email\" name=\"email\" autocomplete=\"email\">\n<input type=\"date\" name=\"nascimento\">", "Modele um cadastro com email, data e telefone.", "Usar type=text para todos os dados e perder recursos do navegador."),
    Lesson("Obrigatoriedade e ajuda", "required impede envio sem valor; aria-describedby conecta instrucoes e mensagens ao campo.", "<label for=\"senha\">Senha</label>\n<input id=\"senha\" required aria-describedby=\"ajuda-senha\">\n<small id=\"ajuda-senha\">Use ao menos 8 caracteres.</small>", "Crie um campo obrigatorio com uma dica clara.", "Usar apenas cor vermelha para indicar erro."),
    Lesson("Agrupando escolhas", "fieldset e legend agrupam campos relacionados, como opcoes de plano ou preferencias.", "<fieldset>\n  <legend>Plano desejado</legend>\n  <label><input type=\"radio\" name=\"plano\"> Beta</label>\n</fieldset>", "Crie escolhas exclusivas de plano usando radio buttons.", "Usar o mesmo name em grupos que nao tem relacao."),
    Lesson("Select e textarea", "select oferece opcoes predefinidas; textarea recebe texto com varias linhas.", "<label for=\"tema\">Tema</label>\n<select id=\"tema\"><option>HTML</option><option>CSS</option></select>\n<textarea aria-label=\"Mensagem\"></textarea>", "Monte um formulario de contato com assunto e mensagem.", "Usar select quando a pessoa precisa escrever uma resposta livre."),
    Lesson("Botoes", "button deve ter tipo explicito; submit envia formulario e button executa acao sem envio.", "<button type=\"submit\">Salvar cadastro</button>\n<button type=\"button\">Visualizar</button>", "Crie um formulario com botao de envio e um botao auxiliar.", "Esquecer type em botao dentro de formulario: o padrao e submit."),
    Lesson("Audio e video", "audio e video apresentam midia; controls fornece controles nativos para a pessoa usuaria.", "<video controls width=\"640\">\n  <source src=\"aula.mp4\" type=\"video/mp4\">\n  Seu navegador nao suporta video.\n</video>", "Inclua uma demonstracao em video com texto alternativo de suporte.", "Autoplay com som: ele atrapalha e pode ser bloqueado."),
    Lesson("Metadados basicos", "title aparece na aba e meta description resume a pagina para mecanismos de busca.", "<title>Curso de HTML | JL Code</title>\n<meta name=\"description\" content=\"Aulas de HTML para iniciantes.\">", "Escreva titulo e descricao para uma pagina de portifolio.", "Reutilizar o mesmo title em todas as paginas."),
    Lesson("Idioma da pagina", "lang informa o idioma principal e melhora pronuncia por leitores de tela e ferramentas de traducao.", "<html lang=\"pt-BR\">", "Defina o idioma em uma pagina em portugues e marque uma frase em ingles com lang=en.", "Usar lang=pt quando o documento precisa diferenciar variante brasileira."),
    Lesson("Acessibilidade de links", "Links precisam de nome acessivel e destino compreensivel fora do contexto visual.", "<a href=\"projeto.html\">Ver projeto de lista de tarefas</a>", "Substitua tres links vagos por textos que indiquem seu destino.", "Usar icone sem texto e sem aria-label."),
    Lesson("Atributos globais", "id identifica um elemento de modo unico; class permite reutilizar uma categoria em varios elementos.", "<article id=\"destaque\" class=\"card projeto\">Projeto</article>", "Crie tres cards com class comum e um id unico para a secao principal.", "Repetir o mesmo id em varios elementos."),
    Lesson("Data attributes", "data-* guarda informacoes proprias da interface sem inventar atributos HTML.", "<button data-curso=\"html\">Abrir modulo</button>", "Marque tres cards com data-nivel para usar depois com JavaScript.", "Guardar informacao importante somente em data-* sem mostrar ao usuario."),
    Lesson("URLs relativas", "Caminhos relativos ligam arquivos do mesmo projeto sem depender do dominio publicado.", "<a href=\"contato.html\">Contato</a>\n<img src=\"imagens/logo.png\" alt=\"Logo JL Code\">", "Organize uma pasta imagens e conecte uma pagina secundaria.", "Comecar caminho relativo com barra sem entender que isso aponta para a raiz do dominio."),
    Lesson("Comentarios HTML", "Comentarios registram contexto para quem mantem o codigo, mas nao devem conter segredos.", "<!-- Inicio da secao de projetos -->\n<section id=\"projetos\"></section>", "Comente duas decisoes importantes do seu codigo.", "Deixar comentarios antigos ou dados privados no arquivo publico."),
    Lesson("Entidades HTML", "Entidades permitem mostrar caracteres reservados, como menor que e maior que, no texto.", "<p>Use &amp;lt;h1&amp;gt; para criar um titulo.</p>", "Crie uma explicacao que mostre duas tags literalmente na tela.", "Digitar uma tag real quando queria apenas exibi-la como exemplo."),
    Lesson("Cabecalho de projeto", "Um cabecalho combina marca, navegacao e chamada clara sem duplicar o h1 da pagina.", "<header>\n  <a href=\"index.html\">JL Code</a>\n  <nav aria-label=\"Principal\">...</nav>\n</header>", "Modele o cabecalho de um portifolio com navegacao acessivel.", "Colocar links de navegacao fora de uma estrutura compreensivel."),
    Lesson("Pagina de artigo", "Uma pagina de artigo usa hierarquia, dados de autoria e conteudo principal identificavel.", "<article>\n  <h1>Como comecei a programar</h1>\n  <p><time datetime=\"2026-08-31\">31 de agosto</time></p>\n</article>", "Escreva um miniartigo com titulo, data e tres secoes.", "Usar time com texto de data sem datetime quando a maquina precisa interpretar a data."),
    Lesson("Pagina de portifolio", "Portifolio apresenta projetos com contexto, tecnologias e links de demonstracao.", "<article>\n  <h2>Lista de tarefas</h2>\n  <p>Projeto em HTML, CSS e JavaScript.</p>\n  <a href=\"#\">Ver demonstracao</a>\n</article>", "Documente dois projetos, cada um com descricao e link significativo.", "Exibir somente uma imagem sem explicar qual problema o projeto resolve."),
    Lesson("Pagina de contato", "Formulario de contato precisa de campos nomeados, instrucoes e expectativa de resposta.", "<form>\n  <label for=\"assunto\">Assunto</label>\n  <input id=\"assunto\" required>\n  <button type=\"submit\">Enviar mensagem</button>\n</form>", "Crie uma pagina de contato completa e revise navegacao por teclado.", "Usar formulario sem informar o que acontece depois do envio."),
    Lesson("Pagina de curso", "Conteudo educacional ganha clareza com secoes, objetivos, modulos e chamada para pratica.", "<main>\n  <h1>HTML do zero</h1>\n  <section><h2>Voce vai aprender</h2><ul>...</ul></section>\n</main>", "Estruture uma pagina de curso com objetivos e tres modulos.", "Misturar titulos de modulo sem uma hierarquia consistente."),
    Lesson("Revisao de semantica", "Semantica permite que pessoas e ferramentas entendam o papel de cada parte antes de aplicar estilo.", "<header></header><main><section><article></article></section></main><footer></footer>", "Audite uma pagina antiga e anote cinco divs que podem virar elementos semanticos.", "Trocar div por tag semantica apenas pelo nome, sem conferir o significado."),
    Lesson("Revisao de formularios", "Uma boa revisao verifica labels, tipos, required, agrupamentos e mensagens compreensiveis.", "<label for=\"email\">E-mail</label>\n<input id=\"email\" type=\"email\" required>", "Teste seu formulario sem mouse e liste os pontos confusos.", "Validar so visualmente, sem testar leitor de tela ou teclado."),
    Lesson("Revisao de midia", "Midia precisa de alternativa textual e controles adequados para diferentes necessidades.", "<img src=\"aula.jpg\" alt=\"Instrutora apontando a estrutura de uma pagina\">", "Revise cinco imagens e reescreva seus textos alternativos.", "Repetir no alt a mesma legenda que ja aparece ao lado sem necessidade."),
    Lesson("Revisao de tabelas", "Tabelas devem manter relacoes de cabecalho e dado, inclusive quando receberem estilo responsivo depois.", "<table><caption>Progresso</caption><tr><th scope=\"col\">Modulo</th></tr></table>", "Construa uma tabela de progresso com caption e cabecalhos.", "Omitir caption quando ela ajuda a entender qual conjunto de dados esta sendo exibido."),
    Lesson("Integracao HTML e CSS", "HTML bem estruturado oferece seletores previsiveis para CSS sem depender de divs aleatorias.", "<article class=\"card\">\n  <h2 class=\"card__title\">Projeto</h2>\n</article>", "Crie uma estrutura de card pronta para ser estilizada.", "Criar classes que descrevem cor ou posicao em vez de papel do componente."),
    Lesson("Integracao HTML e JavaScript", "IDs e data attributes permitem que JavaScript encontre elementos sem quebrar a semantica.", "<button id=\"abrir-menu\" aria-expanded=\"false\">Menu</button>", "Prepare um botao de menu com atributos que poderao ser atualizados pelo JavaScript.", "Usar onclick diretamente no HTML em projetos maiores."),
    Lesson("Auditoria de acessibilidade", "Auditoria inicial verifica idioma, titulo, h1, links, alt, labels e navegacao por teclado.", "<a href=\"#conteudo\">Pular para o conteudo</a>\n<main id=\"conteudo\"></main>", "Adicione um link de pulo e revise sua pagina usando somente Tab.", "Considerar acessibilidade apenas no final do projeto."),
    Lesson("Projeto final HTML", "Projeto final integra estrutura, semantica, formulario, tabela e midia de maneira coerente.", "<main>\n  <section id=\"sobre\"></section>\n  <section id=\"projetos\"></section>\n  <section id=\"contato\"></section>\n</main>", "Crie uma pagina de portifolio completa sem CSS, priorizando estrutura e leitura.", "Comecar pelo visual antes de garantir que o documento possui uma estrutura correta."),
    Lesson("Landmarks e leitura rapida", "Landmarks como header, nav, main, aside e footer ajudam a pessoa a saltar entre regioes importantes.", "<header></header><nav aria-label=\"Principal\"></nav><main></main><footer></footer>", "Liste os landmarks de sua pagina e confirme que cada um tem uma finalidade clara.", "Usar nav para conteudo que nao e navegacao."),
    Lesson("Links internos e ancoras", "Links com # levam a uma secao da mesma pagina quando o destino possui id unico.", "<a href=\"#contato\">Falar comigo</a>\n<section id=\"contato\"><h2>Contato</h2></section>", "Crie um menu de uma pagina com quatro links de ancora.", "Criar href para id que nao existe ou esta repetido."),
    Lesson("Detalhes expansivos", "details e summary mostram informacao opcional sem obrigar a pessoa a percorrer todo o texto.", "<details><summary>O que vou aprender?</summary><p>Fundamentos de HTML.</p></details>", "Adicione tres perguntas frequentes a uma pagina de curso.", "Esconder informacao essencial que deveria estar visivel de inicio."),
    Lesson("Validacao do documento", "Conferir aninhamento, atributos e fechamento evita erros silenciosos e torna o codigo sustentavel.", "<main>\n  <h1>Pagina valida</h1>\n  <p>Estrutura revisada.</p>\n</main>", "Revise seu projeto final procurando tags nao fechadas, ids duplicados e imagens sem alt.", "Confiar apenas no resultado visual e ignorar erros de estrutura."),
    Lesson("Preparacao para a avaliacao HTML", "Revisao final cobre h1, a, main, nav, ul, tr, label, doctype, article, audio, target, footer, strong, email e form.", "<form><label for=\"email\">E-mail</label><input id=\"email\" type=\"email\"></form>", "Explique com suas palavras quando usar main, nav, article, footer e form.", "Decorar alternativas sem conseguir montar uma pagina funcional."),
]

CSS = [
    Lesson('O que e CSS','CSS controla a apresentacao visual de elementos HTML, mantendo estrutura e aparencia separadas.','h1 { color: blue; }','Crie um h1 e mude sua cor com uma regra CSS.','Colocar CSS solto sem seletor e chaves.'),
    Lesson('Conectando uma folha de estilos','link rel=stylesheet conecta o HTML a um arquivo CSS externo reutilizavel.','<link rel="stylesheet" href="style.css">','Crie index.html e style.css, depois confirme no navegador que a regra foi aplicada.','Escrever href errado ou salvar os arquivos em pastas diferentes.'),
    Lesson('Seletores de elemento','Um seletor de elemento aplica uma regra a todas as ocorrencias daquela tag.','p { line-height: 1.6; }','Aplique espaco de leitura a todos os paragrafos de uma pagina.','Usar seletor muito amplo e afetar conteudo que deveria ter outro estilo.'),
    Lesson('Seletores de classe','O ponto seleciona elementos que compartilham uma class reutilizavel.','.card { padding: 16px; }','Crie tres cards HTML e aplique a mesma class aos tres.','Esquecer o ponto no CSS ou a class no HTML.'),
    Lesson('Seletores de id','A cerquilha seleciona um unico elemento com id especifico.','#principal { max-width: 960px; }','Defina uma area principal unica e limite sua largura.','Repetir o mesmo id em varios elementos.'),
    Lesson('Cascata e especificidade','Quando regras disputam um valor, o navegador considera origem, especificidade e ordem.','.aviso { color: #b42318; }\np.aviso { color: #7a271a; }','Crie duas regras concorrentes e explique qual vence.','Resolver conflito com !important antes de entender a causa.'),
    Lesson('Heranca','Algumas propriedades, como color e font-family, podem ser herdadas por elementos filhos.','body { color: #172b4d; font-family: Arial, sans-serif; }','Defina tipografia base e observe os elementos filhos.','Esperar que margin ou border sejam herdados automaticamente.'),
    Lesson('Cores','color muda a cor do texto; valores podem ser nomes, hexadecimais, rgb ou hsl.','h1 { color: #1769e0; }','Escolha cores para titulo, texto e fundo com contraste legivel.','Usar cor clara sobre fundo claro sem testar leitura.'),
    Lesson('Fundos','background-color define o fundo de um elemento e ajuda a criar hierarquia visual.','.destaque { background-color: #e8f1ff; }','Crie uma caixa de destaque para uma informacao importante.','Usar fundo como unica forma de comunicar erro ou status.'),
    Lesson('Tipografia','font-size, font-weight e line-height controlam tamanho, peso e ritmo de leitura.','p { font-size: 1rem; line-height: 1.6; }','Estilize um texto longo para leitura confortavel.','Usar fonte pequena demais ou line-height igual ao tamanho da fonte.'),
    Lesson('Unidades','px e fixo; rem segue a fonte raiz; em segue o contexto; % depende do ancestral.','.titulo { font-size: 2rem; margin-bottom: 1em; }','Teste a diferenca entre rem e em em um componente.','Usar px para tudo e perder adaptabilidade.'),
    Lesson('Largura e altura','width e height definem dimensoes; max-width evita que conteudo fique excessivamente largo.','.conteudo { width: 100%; max-width: 720px; }','Centralize uma coluna de leitura sem quebrar no celular.','Fixar width maior que a tela em componentes responsivos.'),
    Lesson('Box model','Todo elemento possui content, padding, border e margin.','.caixa { padding: 20px; border: 1px solid #b9d8f7; margin: 16px; }','Desenhe uma caixa e identifique cada camada do box model.','Confundir padding, espaco interno, com margin, espaco externo.'),
    Lesson('box-sizing','border-box faz width incluir padding e border, tornando medidas previsiveis.','* { box-sizing: border-box; }','Aplique border-box e compare um input com padding antes e depois.','Assumir que width sempre inclui padding sem configurar border-box.'),
    Lesson('Bordas e cantos','border cria contorno; border-radius arredonda cantos sem alterar a estrutura.','.botao { border: 1px solid #1769e0; border-radius: 8px; }','Crie um botao com borda e cantos consistentes.','Usar radius exagerado em componentes que precisam parecer retangulares.'),
    Lesson('Sombras','box-shadow acrescenta profundidade sutil e deve reforcar, nao esconder, a hierarquia.','.card { box-shadow: 0 8px 24px rgba(12, 45, 78, .14); }','Adicione sombra discreta a um card.','Empilhar sombras fortes que diminuem contraste e legibilidade.'),
    Lesson('Display block e inline','block ocupa a linha; inline acompanha texto; inline-block aceita dimensoes mantendo fluxo.','a { display: inline-block; padding: 8px 12px; }','Transforme um link em chamada clicavel com area de toque adequada.','Definir width em elemento inline e esperar que funcione.'),
    Lesson('Position relative','relative mantem o elemento no fluxo e cria referencia para filhos absolutos.','.card { position: relative; }','Prepare um card para receber um selo posicionado.','Usar relative apenas para deslocar layout sem considerar o espaco original.'),
    Lesson('Position absolute','absolute posiciona em relacao ao ancestral posicionado mais proximo.','.selo { position: absolute; top: 8px; right: 8px; }','Inclua selo em card com position relative.','Usar absolute para montar toda a pagina e perder responsividade.'),
    Lesson('Z-index','z-index controla empilhamento de elementos posicionados.','.modal { position: fixed; z-index: 10; }','Crie sobreposicao simples e determine qual elemento fica acima.','Aumentar z-index sem entender novos contextos de empilhamento.'),
    Lesson('Overflow','overflow define o comportamento quando o conteudo ultrapassa a caixa.','.codigo { overflow-x: auto; }','Crie area de codigo que role horizontalmente quando necessario.','Esconder conteudo importante com overflow:hidden.'),
    Lesson('Pseudo-classes','Pseudo-classes representam estado, como hover, focus-visible e disabled.','.botao:hover { transform: translateY(-2px); }','Estilize hover e focus-visible de um botao.','Oferecer efeito apenas em hover e esquecer teclado.'),
    Lesson('Pseudo-elementos','::before e ::after criam elementos decorativos gerados pelo CSS.','.tag::before { content: "#"; }','Adicione um prefixo decorativo a uma tag.','Usar pseudo-elemento para informacao essencial que leitores de tela precisam.'),
    Lesson('Transicoes','transition interpola mudancas de propriedades ao longo do tempo.','.card { transition: transform .2s ease, box-shadow .2s ease; }','Aplique transicao curta a card interativo.','Usar transition: all e animar propriedades caras sem necessidade.'),
    Lesson('Transformacoes','transform move, gira ou escala visualmente sem alterar o fluxo normal.','.botao:hover { transform: scale(1.03); }','Crie feedback sutil de escala para uma acao.','Usar scale excessivo e fazer elementos saltarem.'),
    Lesson('Flexbox base','display:flex organiza itens em um eixo principal.','.linha { display: flex; gap: 16px; }','Organize icone e texto lado a lado.','Esperar que flex centralize sem configurar alinhamento.'),
    Lesson('Flex direction','flex-direction troca entre eixo de linha e coluna.','.painel { display: flex; flex-direction: column; }','Crie uma pilha vertical de campos de formulario.','Confundir row e column ao pensar na direcao visual.'),
    Lesson('Alinhamento Flexbox','justify-content controla eixo principal; align-items controla eixo cruzado.','.barra { display:flex; justify-content:space-between; align-items:center; }','Monte barra com marca a esquerda e botao a direita.','Usar align-items para distribuir espaco horizontal em row.'),
    Lesson('Flex wrap','flex-wrap permite que itens quebrem linha quando nao houver espaco.','.cards { display:flex; flex-wrap:wrap; gap:16px; }','Crie cards que nao espremem demais em telas estreitas.','Forcar itens em uma linha e provocar rolagem lateral.'),
    Lesson('Flex grow e basis','flex-basis da tamanho inicial e flex-grow distribui espaco restante.','.card { flex: 1 1 240px; }','Monte uma grade fluida de cards com largura minima.','Usar flex:1 sem definir limite minimo para conteudo.'),
    Lesson('Grid base','display:grid organiza linhas e colunas explicitamente.','.grade { display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; }','Crie grade de tres cards iguais.','Usar Grid quando apenas um eixo simples precisa de Flexbox.'),
    Lesson('Colunas Grid','grid-template-columns define trilhas com fr, px, minmax e repeat.','.grade { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }','Monte vitrine que muda o numero de colunas automaticamente.','Criar colunas fixas demais para celulares.'),
    Lesson('Areas Grid','grid-template-areas nomeia regioes e facilita layouts editoriais.','.layout { display:grid; grid-template-areas:"cab cab" "menu main"; }','Desenhe cabecalho, menu e conteudo com areas nomeadas.','Declarar area em item que nao existe no template.'),
    Lesson('Gap em layouts','gap separa itens de Flexbox e Grid sem adicionar margem nas extremidades.','.lista { display:grid; gap:12px; }','Troque margens repetidas por gap em uma lista.','Somar gap e margins sem planejar o espacamento final.'),
    Lesson('Responsividade mobile-first','Comece com uma coluna e adicione espaco em telas maiores usando min-width.','.grade { display:grid; grid-template-columns:1fr; }\n@media (min-width: 700px) { .grade { grid-template-columns:repeat(3,1fr); } }','Crie grade mobile-first e teste em duas larguras.','Comecar pelo desktop e sobrescrever muitas regras no celular.'),
    Lesson('Media queries','@media aplica regras quando condicoes de dispositivo ou preferencia sao verdadeiras.','@media (max-width: 600px) { .menu { flex-direction: column; } }','Adapte navegacao horizontal para coluna no celular.','Criar breakpoint baseado em aparelho especifico em vez do conteudo quebrar.'),
    Lesson('Imagens responsivas','max-width:100% impede que imagem ultrapasse o contenedor; height:auto preserva proporcao.','img { max-width: 100%; height: auto; }','Teste imagem grande em tela estreita.','Definir largura e altura incompatveis e distorcer fotografia.'),
    Lesson('object-fit','object-fit controla como imagem preenche uma caixa definida.','.capa { width:100%; height:220px; object-fit:cover; }','Crie capa de card mantendo proporcao.','Usar cover sem conferir se partes importantes da imagem foram cortadas.'),
    Lesson('Variaveis CSS','Custom properties guardam tokens de cor, espaco e tipografia reutilizaveis.',':root { --azul:#1769e0; --espaco:16px; }\n.botao { background:var(--azul); padding:var(--espaco); }','Crie tokens para tres cores e dois espacamentos.','Criar variavel com nome generico que nao comunica seu papel.'),
    Lesson('Tema claro e escuro','prefers-color-scheme permite adaptar tokens conforme preferencia do sistema.','@media (prefers-color-scheme: dark) { :root { --fundo:#07101f; --texto:#fff; } }','Implemente tema escuro com contraste revisado.','Mudar apenas fundo e esquecer cores de texto e borda.'),
    Lesson('Acessibilidade visual','focus-visible, contraste e tamanho de toque tornam a interface mais utilizavel.','button:focus-visible { outline: 3px solid #f4c95d; outline-offset: 3px; }','Adicione foco visivel a links e botoes.','Remover outline sem fornecer alternativa de foco.'),
    Lesson('Prefere menos movimento','prefers-reduced-motion respeita pessoas que pedem menos animacoes.','@media (prefers-reduced-motion: reduce) { * { transition-duration: .01ms; } }','Desative transicoes nao essenciais nessa preferencia.','Criar animacao obrigatoria para entender uma acao.'),
    Lesson('Formulario profissional','Estados de foco, invalido e desabilitado ajudam a pessoa a corrigir campos.','input:focus-visible { border-color:#1769e0; }\ninput:invalid { border-color:#b42318; }','Estilize um formulario com foco e erro sem depender apenas da cor.','Mostrar erro antes da pessoa ter chance de preencher o campo.'),
    Lesson('Componente de card','Um componente coerente combina espaco, borda, titulo e estados de interacao.','.card { padding:24px; border:1px solid #d0ddeb; border-radius:16px; }','Crie card reutilizavel com titulo, texto e acao.','Copiar regras do card em cada pagina em vez de reutilizar class.'),
    Lesson('Vitrine responsiva','auto-fit e minmax criam grades de produtos que se adaptam ao espaco.','.produtos { display:grid; grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); gap:20px; }','Monte vitrine de quatro cursos responsiva.','Definir numero fixo de colunas em todos os tamanhos.'),
    Lesson('Tabela responsiva','Uma tabela larga precisa de rolagem horizontal segura e cabecalhos visiveis.','.tabela-wrap { overflow-x:auto; }\ntable { min-width:640px; }','Envolva uma tabela de dados em area rolavel.','Diminuir fonte ate ficar ilegivel para caber tudo.'),
    Lesson('Gradientes discretos','linear-gradient cria transicao entre cores e pode reforcar areas de destaque sem substituir conteudo.','.hero { background: linear-gradient(135deg, #07101f, #123d6a); }','Crie cabecalho com gradiente e texto de alto contraste.','Usar muitas cores e comprometer leitura.'),
    Lesson('Clamp e tipografia fluida','clamp define minimo, preferido e maximo para valores que acompanham a largura sem extremos.','h1 { font-size: clamp(2rem, 5vw, 4.5rem); }','Crie titulo responsivo testando tela pequena e grande.','Usar vw sem limite e obter texto enorme em monitores largos.'),
    Lesson('Ordem visual e responsiva','order muda apenas apresentacao Flexbox; a ordem HTML deve continuar logica para teclado e leitor de tela.','.acao { order: -1; }','Teste reorganizar um item sem prejudicar a ordem semantica do documento.','Usar order para esconder uma estrutura HTML mal planejada.'),
    Lesson('Preparacao para a avaliacao CSS','Revisao final cobre classe, id, color, padding, flex, Grid, media query, vw, radius, gap, position, transition, text-align, max-width e hover.','.botao { color:white; background:#1769e0; border-radius:8px; transition:transform .2s; }','Explique a diferenca entre padding, margin, gap e max-width com exemplos.','Decorar propriedade sem testar seu efeito em uma pagina.'),
]

JAVASCRIPT = [
    Lesson('O que e JavaScript','JavaScript adiciona comportamento e logica a paginas, executando instrucoes no navegador.','console.log("Olá, JavaScript!");','Mostre uma mensagem no console do navegador.','Esperar que console.log apareca dentro da pagina.'),
    Lesson('Variaveis com let','let declara uma variavel cujo valor pode mudar durante a execucao.','let pontos = 0;\npontos = pontos + 10;','Crie contador de pontos e atualize seu valor.','Usar variavel antes de declara-la.'),
    Lesson('Constantes com const','const declara uma referencia que nao sera reatribuida.','const nomeCurso = "HTML";','Declare tres configuracoes que nao devem ser reatribuidas.','Tentar trocar o valor de uma const em vez de criar nova variavel.'),
    Lesson('Tipos primitivos','String, number, boolean, undefined e null representam valores fundamentais.','const nome = "Ana";\nconst horas = 12;\nconst ativo = true;','Crie valores de cada tipo e use typeof para inspecionar.','Confundir texto "12" com numero 12.'),
    Lesson('Operadores aritmeticos','Operadores como +, -, * e / calculam novos valores.','const total = 3 * 12;','Calcule horas de estudo de quatro modulos.','Concatenar string e numero sem perceber a conversao.'),
    Lesson('Comparacao estrita','=== compara valor e tipo, evitando conversoes inesperadas.','console.log(10 === "10"); // false','Compare numeros, textos e booleanos com ===.','Usar == sem entender conversao implicita.'),
    Lesson('Operadores logicos','&& exige todas as condicoes; || aceita uma; ! nega uma expressao.','const podeEntrar = contaAtiva && emailConfirmado;','Crie regra que libera aula apenas para usuario ativo.','Misturar condicoes sem parenteses quando a leitura fica ambigua.'),
    Lesson('Condicao if','if executa um bloco quando uma expressao e verdadeira.','if (nota >= 80) { console.log("Aprovado"); }','Mostre mensagem de aprovacao para nota suficiente.','Usar = no lugar de === em uma condicao.'),
    Lesson('if e else','else define alternativa quando a condicao principal falha.','if (logado) { mostrarArea(); } else { mostrarLogin(); }','Crie mensagem para pessoa cadastrada e visitante.','Duplicar condicao invertida em vez de usar else.'),
    Lesson('else if','else if permite escolher entre varias faixas de resultado.','if (nota >= 80) { nivel="A"; } else if (nota >= 60) { nivel="B"; } else { nivel="C"; }','Classifique tres faixas de desempenho.','Ordenar faixas da menor para maior e tornar regras inalcançaveis.'),
    Lesson('Funcoes','function agrupa uma tarefa reutilizavel com nome claro.','function saudacao() { return "Bem-vindo"; }','Crie funcao que devolve uma mensagem de estudo.','Criar funcao enorme que faz varias responsabilidades.'),
    Lesson('Parametros','Parametros recebem informacoes para tornar uma funcao reutilizavel.','function cumprimentar(nome) { return `Olá, ${nome}!`; }','Gere saudacoes para tres nomes diferentes.','Usar variavel externa em vez de parametro quando o dado muda.'),
    Lesson('Return','return entrega o resultado de uma funcao para quem a chamou.','function somar(a, b) { return a + b; }','Calcule o total de aulas usando uma funcao.','Esperar que console.log retorne valor utilizavel.'),
    Lesson('Arrow functions','Funcoes seta oferecem sintaxe curta e mantem comportamento de this diferente de function tradicional.','const dobrar = (numero) => numero * 2;','Crie funcao seta para calcular minutos de estudo.','Usar corpo com chaves sem return quando precisa devolver valor.'),
    Lesson('Escopo','Variaveis declaradas dentro de bloco existem apenas naquele bloco.','if (true) { const mensagem = "visivel aqui"; }','Teste uma variavel dentro e fora de uma condicao.','Declarar tudo globalmente e criar conflitos de nome.'),
    Lesson('Arrays','Array agrupa itens em ordem e usa indices iniciando em zero.','const modulos = ["HTML", "CSS", "JavaScript"];','Mostre o primeiro e o ultimo modulo de uma lista.','Tentar acessar primeiro item com indice 1.'),
    Lesson('push e pop','push adiciona ao fim; pop remove e devolve o ultimo item.','const fila = ["HTML"];\nfila.push("CSS");\nfila.pop();','Adicione e remova tarefas de uma lista.','Usar pop pensando que remove o primeiro item.'),
    Lesson('shift e unshift','shift remove inicio; unshift adiciona inicio do array.','const fila=["CSS"];\nfila.unshift("HTML");','Simule fila de atendimento com inicio e fim.','Usar shift em listas grandes sem considerar custo e intencao.'),
    Lesson('forEach','forEach executa uma funcao para cada item, ideal para efeitos como renderizar.','modulos.forEach((modulo) => console.log(modulo));','Liste modulos no console e depois na tela.','Esperar que forEach crie e retorne novo array.'),
    Lesson('map','map transforma cada item e devolve novo array do mesmo tamanho.','const nomes = modulos.map((m) => m.toUpperCase());','Converta lista de cursos para nomes em maiusculas.','Modificar array original esperando que map altere o mesmo array.'),
    Lesson('filter','filter mantem apenas itens que atendem uma condicao.','const pro = cursos.filter((curso) => curso.plano === "PRO");','Filtre cursos do plano Pro.','Usar filter quando precisa transformar, nao remover, itens.'),
    Lesson('find','find devolve o primeiro item que atende uma condicao.','const curso = cursos.find((item) => item.id === "css");','Encontre um curso por id.','Assumir que find retorna array; ele retorna item ou undefined.'),
    Lesson('Objetos','Objetos agrupam propriedades nomeadas de uma entidade.','const aluno = { nome: "Ana", curso: "HTML", ativo: true };','Crie objeto de projeto com titulo, tecnologia e status.','Usar array quando nomes de propriedades tornam a leitura melhor.'),
    Lesson('Acesso a propriedades','Ponto acessa chave conhecida; colchetes acessam chave dinamica.','console.log(aluno.nome);\nconsole.log(aluno["curso"]);','Leia tres propriedades do objeto criado.','Usar ponto com nome guardado em variavel.'),
    Lesson('Desestruturacao','Desestruturacao extrai propriedades e reduz repeticao.','const { nome, curso } = aluno;','Extraia nome e curso para montar uma frase.','Desestruturar chave inexistente e nao tratar undefined.'),
    Lesson('Template strings','Crases permitem interpolar valores com ${}.','const frase = `${aluno.nome} estuda ${aluno.curso}.`;','Crie resumo dinamico de um projeto.','Usar aspas simples esperando que ${} seja interpretado.'),
    Lesson('JSON stringify','JSON.stringify converte dados JavaScript em texto para armazenamento ou envio.','const salvo = JSON.stringify(aluno);','Converta preferencias de tema em texto JSON.','Tentar armazenar funcoes ou referencias circulares em JSON.'),
    Lesson('JSON parse','JSON.parse reconverte texto JSON valido em objeto JavaScript.','const restaurado = JSON.parse(salvo);','Restaure objeto salvo e leia uma propriedade.','Usar JSON.parse em texto comum ou vazio sem tratamento.'),
    Lesson('Selecionando DOM','document.querySelector encontra o primeiro elemento que corresponde a seletor CSS.','const titulo = document.querySelector("#titulo");','Selecione um h1 por id e confirme no console.','Usar seletor que nao existe e tentar acessar propriedade de null.'),
    Lesson('querySelectorAll','querySelectorAll retorna todos os elementos correspondentes em NodeList.','const botoes = document.querySelectorAll(".curso");','Aplique classe de destaque a cada botao de curso.','Chamar metodo de array sem converter ou usar forEach quando necessario.'),
    Lesson('textContent','textContent troca texto de forma segura, sem interpretar HTML recebido.','mensagem.textContent = "Cadastro concluido";','Atualize uma mensagem apos clicar no botao.','Usar innerHTML com dados de usuario e abrir risco de injecao.'),
    Lesson('classList','classList adiciona, remove e alterna classes de estado no DOM.','card.classList.toggle("ativo");','Crie botao que alterna destaque de um card.','Substituir className e apagar classes existentes sem querer.'),
    Lesson('createElement','document.createElement cria elemento novo que pode ser configurado antes de inserir.','const item = document.createElement("li");\nitem.textContent = "Estudar DOM";','Crie uma lista de tarefas dinamicamente.','Usar innerHTML para concatenar dados externos.'),
    Lesson('append','append adiciona nos filhos de um elemento contenedor.','lista.append(item);','Insira tres itens criados com createElement.','Tentar dar append em seletor null.'),
    Lesson('Eventos de clique','addEventListener registra funcao para executar quando o evento ocorre.','botao.addEventListener("click", () => { mensagem.textContent = "Clicou"; });','Crie botao que atualiza contador.','Chamar a funcao ao registrar o listener em vez de passa-la.'),
    Lesson('Evento submit','submit representa envio de formulario e permite validar antes de prosseguir.','form.addEventListener("submit", (event) => { event.preventDefault(); });','Mostre mensagem sem recarregar a pagina.','Esquecer preventDefault e perder estado da interface.'),
    Lesson('preventDefault','preventDefault impede comportamento padrao quando voce implementa fluxo proprio.','link.addEventListener("click", (event) => event.preventDefault());','Intercepte link de demonstracao e exiba aviso.','Impedir comportamento padrao sem fornecer alternativa acessivel.'),
    Lesson('Event target','event.target indica elemento que originou o evento.','lista.addEventListener("click", (event) => { console.log(event.target); });','Descubra qual item de uma lista foi clicado.','Usar target sem confirmar se elemento tem o dado esperado.'),
    Lesson('Delegacao de eventos','Um listener no contenedor atende filhos criados depois dinamicamente.','lista.addEventListener("click", (event) => { if (event.target.matches("button")) remover(event.target); });','Implemente remover tarefa com um unico listener.','Adicionar listener novo em cada item e aumentar complexidade.'),
    Lesson('LocalStorage','localStorage guarda texto no navegador entre recarregamentos.','localStorage.setItem("tema", "escuro");','Salve preferencia de tema e leia apos recarregar.','Guardar senha ou dado sensivel no localStorage.'),
    Lesson('Async e await','async declara funcao assincrona e await espera Promise resolver ou falhar.','async function carregar() { const resposta = await fetch("/api/cursos"); }','Crie funcao assincrona de demonstracao.','Usar await fora de funcao async quando o ambiente nao suporta modulo.'),
    Lesson('Fetch','fetch inicia requisicao HTTP e devolve Promise com resposta.','const resposta = await fetch("/api/cursos");','Busque dados de exemplo e confira status da resposta.','Assumir que fetch rejeita automaticamente resposta 404 ou 500.'),
    Lesson('Tratamento de erros','try/catch captura falhas de operacoes assincronas e permite feedback util.','try { await carregar(); } catch (erro) { mensagem.textContent = "Tente novamente"; }','Mostre estados de carregamento, sucesso e erro.','Engolir erro sem registrar ou informar proxima acao.'),
    Lesson('Estado de interface','Estado guarda dados que determinam o que a tela mostra; render transforma estado em DOM.','const estado = { filtro: "", cursos: [] };','Crie render que exibe lista conforme filtro.','Alterar DOM em varios lugares sem uma fonte de verdade.'),
    Lesson('Busca com debounce','Debounce espera pausa na digitacao antes de executar tarefa repetida.','let timer; campo.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(buscar, 250); });','Implemente busca de cursos sem filtrar a cada tecla imediatamente.','Esquecer clearTimeout e executar varias buscas antigas.'),
    Lesson('Acessibilidade em JavaScript','Interfaces dinamicas precisam comunicar mudancas e preservar foco previsivel.','status.setAttribute("aria-live", "polite");\nstatus.textContent = "Lista atualizada";','Adicione regiao de status a lista filtravel.','Mover foco inesperadamente em toda pequena atualizacao.'),
    Lesson('Projeto lista de tarefas','Projeto integra array, eventos, createElement e persistencia opcional.','const tarefas = [];\nfunction renderizar() { lista.replaceChildren(); }','Crie lista que adiciona e remove tarefas.','Misturar dados e manipulacao de tela sem funcao de renderizacao.'),
    Lesson('Projeto catalogo','Catalogo integra objetos, map, filter, estado vazio e cards renderizados.','const cursos = [{ id:"html", nome:"HTML", plano:"BETA" }];','Crie catalogo filtravel por tecnologia.','Nao tratar quando filtro nao encontra nenhum item.'),
    Lesson('Projeto formulario seguro','Formulario profissional valida campos, mostra mensagens e nunca injeta dados com innerHTML.','if (!email.includes("@")) { erro.textContent = "Informe e-mail valido"; }','Valide nome e email antes de enviar demonstracao.','Confiar somente na validacao do navegador para dados importantes.'),
    Lesson('Preparacao para a avaliacao JavaScript','Revisao final cobre const, ===, while, querySelector, click, array, push, function, null, JSON.parse, if/else, !, pop, fetch, preventDefault, await e map.','const cursos = ["HTML", "CSS"];\nconst nomes = cursos.map((curso) => curso.toLowerCase());','Explique, com exemplo proprio, a diferenca entre map, filter, find e forEach.','Memorizar nome de metodo sem testar entrada, saida e efeito.'),
]


def styles():
    base = getSampleStyleSheet()
    base.add(ParagraphStyle(name="JLTitle", parent=base["Title"], fontName="Helvetica-Bold", fontSize=25, leading=31, textColor=HexColor("#1b85e8"), spaceAfter=12))
    base.add(ParagraphStyle(name="JLSub", parent=base["BodyText"], fontSize=10, leading=14, textColor=HexColor("#6884a2"), alignment=TA_CENTER, spaceAfter=20))
    base.add(ParagraphStyle(name="JLHeading", parent=base["Heading2"], fontName="Helvetica-Bold", fontSize=15, leading=19, textColor=HexColor("#0b5da7"), spaceBefore=13, spaceAfter=7))
    base.add(ParagraphStyle(name="JLBody", parent=base["BodyText"], fontSize=10.6, leading=16, spaceAfter=8))
    base.add(ParagraphStyle(name="JLCode", parent=base["Code"], fontName="Courier", fontSize=8.7, leading=12, backColor=HexColor("#edf5ff"), borderColor=HexColor("#b9d8f7"), borderPadding=9, spaceBefore=5, spaceAfter=10))
    base.add(ParagraphStyle(name="JLNote", parent=base["BodyText"], fontSize=10, leading=15, backColor=HexColor("#fff5d6"), borderColor=HexColor("#e6bd54"), borderPadding=8, spaceBefore=8, spaceAfter=8))
    return base


def paragraph_code(code: str) -> str:
    return escape(dedent(code).strip()).replace("\n", "<br/>")


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(HexColor("#1b85e8")); canvas.setLineWidth(1)
    canvas.line(2 * cm, 1.45 * cm, A4[0] - 2 * cm, 1.45 * cm)
    canvas.setFont("Helvetica", 8); canvas.setFillColor(HexColor("#54718e"))
    canvas.drawString(2 * cm, 0.9 * cm, "JL Code - Formacao em Programacao")
    canvas.drawRightString(A4[0] - 2 * cm, 0.9 * cm, f"Pagina {doc.page}")
    canvas.restoreState()


def variation_code(technology: str, number: int, lesson: Lesson) -> str:
    """Um segundo exemplo executavel, com identificadores unicos por aula."""
    if technology == "HTML":
        return f"<section class=\"pratica-{number:02d}\">\n  <h2>{lesson.title}</h2>\n  <p>Exemplo adaptado ao meu projeto.</p>\n</section>"
    if technology == "CSS":
        return f".pratica-{number:02d} {{\n  padding: 1rem;\n  border: 1px solid #1769e0;\n  border-radius: .75rem;\n}}"
    return f"function praticarAula{number:02d}() {{\n  const conceito = \"{lesson.title}\";\n  return `Praticando: ${{conceito}}`;\n}}\nconsole.log(praticarAula{number:02d}());"


def build_lesson(technology: str, number: int, lesson: Lesson, required_plan: str):
    out = OUT / f"{technology.lower()}-{number:02d}.pdf"
    doc = SimpleDocTemplate(str(out), pagesize=A4, rightMargin=2 * cm, leftMargin=2 * cm, topMargin=1.8 * cm, bottomMargin=2 * cm, title=f"{technology} {number:02d} - {lesson.title}", author="JL Code")
    s = styles()
    intro = (
        f"<b>Trilha {technology} - Apostila {number:02d} de 50</b><br/>"
        f"Plano requerido: {required_plan}. Esta aula prepara conhecimentos praticos usados na avaliacao final, sem antecipar respostas ou gabaritos."
    )
    code_explanation = (
        f"O codigo apresentado demonstra <b>{lesson.title.lower()}</b>. {lesson.focus} "
        "Leia cada linha, altere valores pequenos e observe o resultado no navegador antes de seguir."
    )
    story = [
        Paragraph("JL CODE", s["JLSub"]),
        Paragraph(f"{technology} {number:02d}: {lesson.title}", s["JLTitle"]),
        Paragraph(intro, s["JLBody"]),
        Paragraph("Objetivo da aula", s["JLHeading"]),
        Paragraph(lesson.focus, s["JLBody"]),
        Paragraph("Codigo", s["JLHeading"]),
        Paragraph(paragraph_code(lesson.code), s["JLCode"]),
        Paragraph("O que faz e para que serve", s["JLHeading"]),
        Paragraph(code_explanation, s["JLBody"]),
        Paragraph("Como usar na pratica", s["JLHeading"]),
        Paragraph("Copie o exemplo para um arquivo proprio, salve, abra no navegador e faça uma alteracao por vez. Compare o resultado antes e depois da mudanca. Essa rotina transforma leitura em entendimento.", s["JLBody"]),
        Paragraph("Segundo exemplo pratico", s["JLHeading"]),
        Paragraph(paragraph_code(variation_code(technology, number, lesson)), s["JLCode"]),
        Paragraph("Compare os dois codigos: o primeiro apresenta o conceito da aula; o segundo mostra como transformar a mesma ideia em uma parte reutilizavel de projeto. Altere o texto, o nome ou um valor e explique o resultado em suas palavras.", s["JLBody"]),
        Paragraph("Resultado esperado", s["JLHeading"]),
        Paragraph(f"Ao finalizar, voce deve conseguir explicar {lesson.title.lower()} sem ler o codigo e reconhecer quando esse recurso e apropriado em um projeto real.", s["JLBody"]),
        PageBreak(),
        Paragraph("Explicacao linha por linha", s["JLHeading"]),
        Paragraph("1. Identifique o elemento, seletor ou instrucao que inicia o exemplo.<br/>2. Observe quais valores foram escolhidos e o que cada valor comunica.<br/>3. Localize o fechamento, a condicao ou a relacao entre os elementos.<br/>4. Altere um valor seguro e confira o efeito. Se algo nao funcionar, volte ao ultimo estado que funcionava.", s["JLBody"]),
        Paragraph("Exercicio guiado", s["JLHeading"]),
        Paragraph(lesson.practice, s["JLBody"]),
        Paragraph("Desafio", s["JLHeading"]),
        Paragraph(f"Amplie o exercicio criando uma segunda versao para outra situacao real. Mantenha {lesson.title.lower()} como ponto central e escreva uma frase explicando sua decisao tecnica.", s["JLBody"]),
        Paragraph(f"<b>Erro comum:</b> {lesson.common_error}", s["JLNote"]),
        Paragraph("Revisao e fixacao", s["JLHeading"]),
        Paragraph(f"- O que {lesson.title.lower()} resolve? <br/>- Em qual parte do seu proximo projeto voce usaria esse recurso? <br/>- Que erro de sintaxe ou de significado voce precisa evitar? <br/>- Reescreva o exemplo sem consultar esta pagina.<br/>- Explique a diferenca entre o primeiro e o segundo exemplo desta apostila.", s["JLBody"]),
        Paragraph("Conexao com a prova", s["JLHeading"]),
        Paragraph("A avaliacao exige reconhecimento e aplicacao de fundamentos. Esta apostila desenvolve o raciocinio necessario para interpretar codigo, escolher a estrutura correta e justificar a decisao, sem revelar nenhuma alternativa da prova.", s["JLBody"]),
    ]
    doc.build(story, onFirstPage=footer, onLaterPages=footer)


def make_catalog_sql(catalog):
    rows = [
        "-- Catalogo gerado: 150 apostilas individuais da JL Code",
        "-- Substitui apenas os tres materiais resumidos anteriores.",
        "DELETE FROM user_apostila_access WHERE apostila_id IN (SELECT id FROM apostilas WHERE slug IN ('html-fundamentos','css-interface','javascript-pratica'));",
        "DELETE FROM apostilas WHERE slug IN ('html-fundamentos','css-interface','javascript-pratica');",
    ]
    for technology, plan, lessons in catalog:
        for index, lesson in enumerate(lessons, 1):
            slug = f"{technology.lower()}-{index:02d}"
            filename = f"{slug}.pdf"
            title = f"{technology} {index:02d} - {lesson.title}".replace("'", "''")
            description = lesson.focus.replace("'", "''")
            rows.append("INSERT OR IGNORE INTO apostilas (course_id,slug,title,description,required_plan,private_filename) VALUES "
                        f"((SELECT id FROM courses WHERE code='{technology}'),'{slug}','{title}','{description}','{plan}','{filename}');")
    return "\n".join(rows) + "\n"


def main():
    if not (len(HTML) == len(CSS) == len(JAVASCRIPT) == 50):
        raise SystemExit("O curriculo deve conter exatamente 50 aulas por tecnologia.")
    OUT.mkdir(parents=True, exist_ok=True)
    catalog = [("HTML", "BETA", HTML), ("CSS", "PRO", CSS), ("JAVASCRIPT", "PRO", JAVASCRIPT)]
    for technology, plan, lessons in catalog:
        for index, lesson in enumerate(lessons, 1):
            build_lesson(technology, index, lesson, plan)
    (ROOT / "apostilas-catalogo.sql").write_text(make_catalog_sql(catalog), encoding="utf-8")
    print(f"Geradas {len(list(OUT.glob('*.pdf')))} apostilas em {OUT}")


if __name__ == "__main__":
    main()
