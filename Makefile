
MDOWN=$(wildcard *.mdown)
HTML=$(MDOWN:.mdown=.html)

all: $(HTML)

%.html: %.mdown
	pandoc -o $@ $< 

