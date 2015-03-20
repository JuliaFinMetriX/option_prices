TMPL_PREFIX = pandoc_settings/templates
#TMPLATES = $(TMPL_PREFIX)/revealjs.template $(TMPL_PREFIX)/beamer.template
TMPLATES = $(TMPL_PREFIX)/revealjs.template

slides.html: present.md Makefile $(TMPLATES)
	pandoc -t revealjs -s --template=pandoc_settings/templates/revealjs.template -V theme=league -o slides.html present.md

slides.pdf:	present.md Makefile $(TMPLATES)
	pandoc -t beamer -V theme:Warsaw -s --latex-engine=pdflatex --template=pandoc_settings/templates/beamer.template -o slides.pdf present.md

all: slides.html slides.pdf

clean:
	rm -f slides.pdf slides.html

again:
	make clean
	make
