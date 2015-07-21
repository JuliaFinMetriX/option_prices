TMPL = pandoc_custom/templates/revealjs.template
CSL = pandoc_custom/csl/elsevier-harvard.csl

# output files, file stem
FILES = option_data.slides.html option_data.pdf
OUTDIR = output
OUT := $(addprefix $(OUTDIR)/,$(FILES))

html: output/option_data.slides.html

all: $(OUT)

debug: $(OUTDIR)/option_data.tex

$(OUTDIR)/option_data.slides.html: src/option_data.md Makefile
	pandoc --template=$(TMPL) \
	--slide-level=3 --toc --toc-depth=1 \
	--filter pandoc_custom/filters/adaptHeaders.hs \
	--filter pandoc_custom/filters/amsmath.hs \
	-V slideNumber=true \
	--include-in-header=pandoc_custom/css/reveal_left_strong.css \
	-s -V revealjs-url=../reveal.js -t revealjs -f markdown \
	--filter pandoc-citeproc --csl=$(CSL) \
	--bibliography=refs.bib \
	-o $@ $<


all: slides.html slides.pdf

clean:
	rm -f slides.pdf slides.html

again:
	make clean
	make
