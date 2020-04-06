CONCEPTNET_TARGET = data/conceptnet-assertions-5.7.0.csv.gz
CONCEPTNET_SOURCE = 'https://s3.amazonaws.com/conceptnet/downloads/2019/edges/conceptnet-assertions-5.7.0.csv.gz'

ENGLISHNET_TARGET = data/englishnet-assertions-5.7.0.csv.gz
ENGLiSHNET_SOURCE = $(CONCEPTNET_TARGET)

KNOWLEDGE_DATABASE_TARGET = data/knowledge-database.sqlite3
KNOWLEDGE_DATABASE_SOURCE = data/*.csv $(ENGLISHNET_TARGET)
KNOWLEDGE_DATABASE_DEPEND = conceptnet/database.sh conceptnet/database.sql \
							conceptnet/__main__.py conceptnet/models/*.py

.PHONY: all clean

all: $(KNOWLEDGE_DATABASE_TARGET)

clean:
	rm -f $(CONCEPTNET_TARGET) $(ENGLISHNET_TARGET) $(KNOWLEDGE_DATABASE_TARGET)

$(CONCEPTNET_TARGET):
	wget --quiet --timestamping --show-progress --directory-prefix $(@D) \
	$(CONCEPTNET_SOURCE)

$(ENGLISHNET_TARGET): $(ENGLiSHNET_SOURCE)
	gunzip -c $(ENGLiSHNET_SOURCE) | grep -P '\t/c/en/.+\t/c/en/.+\t' | gzip > $@

$(KNOWLEDGE_DATABASE_TARGET): $(KNOWLEDGE_DATABASE_SOURCE) $(KNOWLEDGE_DATABASE_DEPEND)
	rm -f data/temp.sqlite3
	bash conceptnet/database.sh \
	data/temp.sqlite3 data/languages.csv data/relations.csv data/part_of_speeches.csv $(ENGLISHNET_TARGET)
	sqlite3 --echo data/temp.sqlite3 '.read conceptnet/database.sql'
	python -m conceptnet data/temp.sqlite3 $@
	rm -f data/temp.sqlite3
