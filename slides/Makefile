# From https://github.com/kjhealy/pandoc-templates/blob/master/examples/Makefile
# thanks to Kieran Healy

## Markdown extension (e.g. md, markdown, mdown).
MEXT = md

## 	All markdown files in the working directory
# SRC = $(wildcard *.$(MEXT))
SRC = present.md

## Location of Pandoc support files.
PREFIX = pandoc_settings

## Location of your working bibliography file
BIB = refs.bib

## CSL stylesheet (located in the csl folder of the PREFIX directory).
CSL = apsa

REVEAL=$(SRC:.md=.slides.html)

all: $(REVEAL)

html:	clean $(REVEAL)

%.slides.html:	%.md
	pandoc -t revealjs -s --template=$(PREFIX)/templates/revealjs.template -V theme=league -o $@ $<

# %.slides.html:	%.md
# 	pandoc -t revealjs -s --toc-depth=1 --toc --template=$(PREFIX)/templates/revealjs.template --filter pandoc-citeproc --csl=$(PREFIX)/csl/$(CSL).csl --bibliography=$(BIB) -V theme=league -o $@ $<

clean:
	rm -f *.slides.html

again:
	make clean
	make
