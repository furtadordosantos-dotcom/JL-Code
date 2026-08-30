from pathlib import Path
from html import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'private' / 'apostilas'
OUT.mkdir(parents=True, exist_ok=True)

# Cada trilha tem 50 aulas sequenciais: ambiente, fundamento, pratica, projetos e preparacao junior.
TRACKS = {
    'HTML': '''Preparar VS Code e pasta do projeto|Usar Live Server e localhost|Criar o primeiro index.html|Entender html head e body|Titulos e paragrafos|Textos com significado|Listas ordenadas e nao ordenadas|Links internos e externos|Imagens e texto alternativo|Audio e video|Div e span|Header nav main e footer|Section e article|Navegacao acessivel|Tabelas de dados|Formulario basico|Tipos de input|Validacao nativa|Select textarea e button|Fieldset e legend|Atributos globais|Caracteres especiais|Estrutura de landing page|Cards de conteudo|Blog com article e time|SEO basico|Metadados Open Graph|Alt descritivo|Navegacao por teclado|Formulario acessivel|Viewport e celular|Performance de imagens|Iframes responsaveis|FAQ com details|Dialog e modais|Template HTML|Data attributes|DevTools para HTML|Projeto pagina pessoal|Projeto catalogo de cursos|Projeto restaurante|Projeto portfolio|Projeto formulario completo|Revisao de semantica|Revisao de acessibilidade|Revisao de SEO|Organizacao de arquivos|Git para iniciantes|Checklist de entrega|Projeto final HTML'''.split('|'),
    'CSS': '''Conectar arquivo CSS|Seletores essenciais|Cascata e especificidade|Heranca e valores iniciais|Cores e contraste|Unidades de medida|Tipografia legivel|Box model|Display|Overflow|Position|Z-index|Pseudo-classes|Pseudo-elementos|Flexbox eixo principal|Flexbox em cards|Flexbox em menus|Grid fundamentos|Grid responsivo|Grid areas|Imagens responsivas|Backgrounds e gradientes|Bordas e sombras|Variaveis CSS|Tema claro e escuro|Media queries|Mobile first|Container queries|Acessibilidade visual|Formularios profissionais|Tabelas responsivas|Transicoes|Transform|Animacoes|Arquitetura CSS|Nomenclatura BEM|DevTools para CSS|Performance visual|Projeto perfil responsivo|Projeto catalogo de cursos|Projeto dashboard|Projeto checkout|Projeto chat|Revisao flexbox e grid|Revisao responsiva|Revisao acessibilidade|Portfolio CSS|Desafio de refatoracao|Preparacao junior|Projeto final CSS'''.split('|'),
    'JavaScript': '''Ambiente e console|Variaveis const e let|Tipos de dados|Operadores|Template strings|Condicionais|Truthy e falsy|Loops|Funcoes|Escopo|Arrays|Metodos de array|Objetos|Desestruturacao|Spread e rest|JSON|DOM seletores|DOM conteudo|DOM classes|Eventos|Eventos em formularios|Delegacao de eventos|LocalStorage|Sessao e seguranca|Fetch|Promises|Async e await|Tratamento de erros|Status HTTP|APIs externas|Modulos|Datas e moeda|Regex pratica|Funcoes de ordem superior|Closures|This e classes|Debugging|Testes manuais|Acessibilidade com JS|Performance no navegador|Projeto lista de tarefas|Projeto quiz|Projeto buscador|Projeto painel|Projeto chat|Refatoracao|Git e colaboracao|Portfolio junior|Entrevista junior|Projeto final JavaScript'''.split('|'),
}

META = {
    'HTML': ('Plano Beta', 'html-fundamentos.pdf', '#ef6c3d', '<main>\n  <h1>Meu primeiro projeto</h1>\n  <p>Conteudo claro e acessivel.</p>\n</main>'),
    'CSS': ('Plano Pro', 'css-interface.pdf', '#3b82f6', '.card {\n  display: grid; gap: 1rem;\n  padding: 1.25rem;\n  border-radius: 1rem;\n}'),
    'JavaScript': ('Plano Pro', 'javascript-pratica.pdf', '#f7c948', "const progresso = 60;\nif (progresso >= 50) {\n  console.log('Continue praticando!');\n}"),
}


def make_styles():
    sheet = getSampleStyleSheet()
    return {
        'cover': ParagraphStyle('cover', parent=sheet['Title'], fontName='Helvetica-Bold', fontSize=29, leading=35, textColor=colors.white, alignment=TA_CENTER),
        'sub': ParagraphStyle('sub', parent=sheet['BodyText'], fontSize=11, leading=16, textColor=colors.HexColor('#b9d9ff'), alignment=TA_CENTER),
        'h1': ParagraphStyle('h1', parent=sheet['Heading1'], fontName='Helvetica-Bold', fontSize=18, leading=23, textColor=colors.HexColor('#0755a4'), spaceAfter=8),
        'h2': ParagraphStyle('h2', parent=sheet['Heading2'], fontName='Helvetica-Bold', fontSize=11.5, leading=14, textColor=colors.HexColor('#123b67'), spaceBefore=8, spaceAfter=3),
        'body': ParagraphStyle('body', parent=sheet['BodyText'], fontSize=9.7, leading=14, textColor=colors.HexColor('#1e293b'), spaceAfter=5),
        'code': ParagraphStyle('code', parent=sheet['Code'], fontName='Courier', fontSize=8.2, leading=11, textColor=colors.HexColor('#08213f')),
        'small': ParagraphStyle('small', parent=sheet['BodyText'], fontSize=8.3, leading=11, textColor=colors.HexColor('#526579')),
    }


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(colors.HexColor('#4da3ff'))
    canvas.line(1.7 * cm, 1.35 * cm, A4[0] - 1.7 * cm, 1.35 * cm)
    canvas.setFillColor(colors.HexColor('#526579'))
    canvas.setFont('Helvetica', 8)
    canvas.drawString(1.7 * cm, .9 * cm, 'JL Code | Criar. Aprender. Evoluir.')
    canvas.drawRightString(A4[0] - 1.7 * cm, .9 * cm, f'Pagina {doc.page}')
    canvas.restoreState()


def lesson_text(tech, topic, number):
    intro = f'Esta aula apresenta {topic.lower()} de forma progressiva. Primeiro compreenda o problema, depois digite e altere o exemplo, e por fim aplique a ideia em uma parte do seu projeto. Profissionais juniores se destacam porque conseguem explicar a decisao tomada, testar o resultado e melhorar o codigo com calma.'
    practice = f'Laboratorio {number:02d}: crie uma pequena implementacao sobre {topic.lower()}. Teste o caminho normal, um caso de erro e a visualizacao no celular. Ao terminar, registre o que funcionou, o que voce mudaria e uma duvida para pesquisar na documentacao.'
    junior = 'Checklist: nomes claros | conteudo acessivel | tela pequena testada | erros tratados | codigo organizado | proximo passo definido.'
    return intro, practice, junior


def build_book(tech):
    plan, filename, accent, example = META[tech]
    st = make_styles()
    cover = Table([[Paragraph('JL CODE', st['cover'])], [Paragraph(f'{tech} do zero ao nivel junior', st['cover'])], [Paragraph(f'Colecao profissional com 50 aulas | {plan}', st['sub'])], [Paragraph('Fundamentos, pratica deliberada, projetos e preparacao para portfolio.', st['sub'])]], colWidths=[15.4 * cm])
    cover.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#071b33')), ('BOX', (0, 0), (-1, -1), 1.3, colors.HexColor(accent)), ('LEFTPADDING', (0, 0), (-1, -1), 20), ('RIGHTPADDING', (0, 0), (-1, -1), 20), ('TOPPADDING', (0, 0), (-1, -1), 12), ('BOTTOMPADDING', (0, 0), (-1, -1), 12)]))
    story = [Spacer(1, 3 * cm), cover, Spacer(1, 1 * cm), Paragraph('Como estudar', st['h1']), Paragraph('Estude uma aula por vez. Leia o objetivo, escreva o exemplo no seu computador, faça o laboratorio e anote suas conclusoes. A trilha foi desenhada para levar voce do primeiro arquivo a projetos que podem entrar no seu portfolio.', st['body']), PageBreak()]
    escaped = escape(example).replace('\n', '<br/>')
    for index, topic in enumerate(TRACKS[tech], start=1):
        intro, practice, junior = lesson_text(tech, topic, index)
        story.extend([Paragraph(f'MODULO {index:02d} | {tech.upper()}', st['small']), Paragraph(topic, st['h1']), Paragraph('Aprenda', st['h2']), Paragraph(intro, st['body']), Paragraph('Exemplo para testar', st['h2']), Table([[Paragraph(escaped, st['code'])]], colWidths=[15.4 * cm], style=TableStyle([('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#edf6ff')), ('BOX', (0, 0), (-1, -1), .5, colors.HexColor('#b6d8f5')), ('LEFTPADDING', (0, 0), (-1, -1), 10), ('RIGHTPADDING', (0, 0), (-1, -1), 10), ('TOPPADDING', (0, 0), (-1, -1), 8), ('BOTTOMPADDING', (0, 0), (-1, -1), 8)])), Paragraph('Pratique', st['h2']), Paragraph(practice, st['body']), Paragraph(junior, st['small'])])
        if index < 50:
            story.append(PageBreak())
    doc = SimpleDocTemplate(str(OUT / filename), pagesize=A4, leftMargin=1.7 * cm, rightMargin=1.7 * cm, topMargin=1.55 * cm, bottomMargin=1.7 * cm, title=f'JL Code - {tech} do zero ao junior', author='JL Code')
    doc.build(story, onFirstPage=footer, onLaterPages=footer)


if __name__ == '__main__':
    for technology in TRACKS:
        build_book(technology)
    print(f'PDFs gerados em {OUT}')
