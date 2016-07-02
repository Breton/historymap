
MDOWN=$(wildcard *.mdown)
HTML=$(MDOWN:.mdown=.inc.html)
JSON=$(MDOWN:.mdown=.json)

all: $(HTML) $(JSON) xoxo2json.js 

clean: 
	rm $(HTML) $(JSON)

%.inc.html: %.mdown
	pandoc -o $@ $< 

%.json: %.inc.html
	node xoxo2json.js < $< > $@
