#!/usr/bin/env python3
"""Guarda de sanidade do HTML. Existe por causa de dois incidentes reais:

1. Um <!--pre:...--> dentro de outro comentario fechou-o cedo e despejou cinco
   paragrafos de notas internas na pagina publicada (PokeAuto).
2. Um bloco colado com <![CDATA[ ... ]]> a volta. Em HTML o `<!` que nao e
   `<!--` nem `<!doctype` abre um BOGUS COMMENT: o parser engole tudo ate ao
   primeiro `>`. Aqui engoliu a tag <section id="obras"> inteira — a ancora
   #obras deixou de existir, o menu deixou de la chegar e o </section> orfao
   fechou a seccao anterior a meio (RafMatos).

Corre com: python3 .github/scripts/html_sao.py *.html legal/*.html
"""
import re, sys

def verifica(caminho):
    s = open(caminho, encoding='utf-8').read()
    erros = []

    # --- comentarios equilibrados e sem <!-- no interior ---
    i = 0
    while True:
        a = s.find('<!--', i)
        if a < 0:
            break
        b = s.find('-->', a + 4)
        if b < 0:
            erros.append('comentario aberto na linha %d e nunca fechado' % s[:a].count('\n'))
            break
        if '<!--' in s[a + 4:b]:
            erros.append('comentario aninhado na linha %d — o primeiro fecha cedo e o resto vai a publico'
                         % s[:a].count('\n'))
        i = b + 3

    # --- --> orfaos ---
    j = 0
    while True:
        b = s.find('-->', j)
        if b < 0:
            break
        if s.rfind('<!--', 0, b) < 0:
            erros.append('--> orfao na linha %d' % s[:b].count('\n'))
        j = b + 3

    # --- bogus comments: <! que nao e <!-- nem <!doctype ---
    for m in re.finditer(r'<!(?!--)(?!\[?doctype)(?!\[?DOCTYPE)', s):
        linha = s[:m.start()].count('\n') + 1
        engolido = s[m.start():m.start() + 90].split('>')[0]
        erros.append('bogus comment na linha %d: «%s» — o parser engole ate ao proximo >'
                     % (linha, engolido.replace('\n', ' ')))

    # --- ]]> a solta ---
    for m in re.finditer(r'\]\]>', s):
        erros.append(']]> na linha %d — sobra de um bloco CDATA colado' % (s[:m.start()].count('\n') + 1))

    # --- texto solto a margem esquerda do <body> ---
    # Terceiro incidente da mesma familia: um bloco colado trazia, a seguir ao
    # </section>, uma linha de instrucoes para mim («--- E MAIS UMA LINHA NO
    # <head> ---»). Colei-a com o resto e ficou a LER-SE na pagina publicada,
    # entre a galeria e os contactos. O parser nao se queixa: e texto valido.
    #
    # Regra: dentro do <body>, uma linha que comeca na margem esquerda sem ser
    # por uma tag e prosa que nao devia estar ali — em HTML bem formado o texto
    # vive dentro de um elemento, e portanto indentado.
    #
    # A varredura e linha a linha com estado, e NAO por regex de limpeza: a
    # primeira versao usava re.sub para tirar script/style/svg antes de olhar, e
    # um <svg> a montante engolia a linha suspeita — o guarda dava «ok» sobre o
    # proprio ficheiro que tinha o defeito.
    dentro_bloco = 0
    dentro_comentario = False
    linhas = s[s.find('<body'):].split('\n') if '<body' in s else []
    for linha in linhas:
        crua = linha
        if dentro_comentario:
            if '-->' in crua:
                dentro_comentario = False
                crua = crua.split('-->', 1)[1]
            else:
                continue
        while '<!--' in crua:
            antes, resto = crua.split('<!--', 1)
            if '-->' in resto:
                crua = antes + resto.split('-->', 1)[1]
            else:
                crua = antes
                dentro_comentario = True
                break
        baixo = crua.lower()
        for t in ('script', 'style', 'noscript', 'textarea', 'pre', 'svg'):
            dentro_bloco += baixo.count('<' + t) - baixo.count('</' + t)
        if dentro_bloco > 0 or not crua.strip():
            continue
        if crua[:1] in ' \t' or crua.startswith('<'):
            continue
        erros.append('texto solto a margem esquerda do body: «%s»' % crua.strip()[:70])

    # --- <section> equilibradas e ancoras vivas ---
    ab, fe = len(re.findall(r'<section\b', s)), len(re.findall(r'</section>', s))
    if ab != fe:
        erros.append('%d <section> para %d </section>' % (ab, fe))

    # --- toda a ancora #x tem de ter um id="x" ---
    ids = set(re.findall(r'\bid="([^"]+)"', s))
    for alvo in set(re.findall(r'href="#([^"]+)"', s)):
        if alvo and alvo not in ids:
            erros.append('href="#%s" nao tem destino: nenhum elemento com esse id' % alvo)

    return erros

def main(caminhos):
    mau = False
    for c in caminhos:
        erros = verifica(c)
        print('%-28s %s' % (c, 'ok' if not erros else 'FALHA'))
        for e in erros:
            print('    ', e)
            mau = True
    return 1 if mau else 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1:] or ['index.html']))
