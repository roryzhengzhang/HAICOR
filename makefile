# variables
CONCEPTNET_TARGET = knowledge/data/conceptnet-assertions-5.7.0.csv.gz
CONCEPTNET_SOURCE = 'https://s3.amazonaws.com/conceptnet/downloads/2019/edges/conceptnet-assertions-5.7.0.csv.gz'

ENGLISHNET_TARGET = knowledge/data/englishnet-assertions-5.7.0.csv.gz

KNOWLEDGE_DATABASE_TARGET = knowledge/data/knowledge-database.sqlite3
KNOWLEDGE_DATABASE_LANGUAGE_SOURCE = knowledge/data/languages.csv
KNOWLEDGE_DATABASE_RELATION_SOURCE = knowledge/data/relations.csv
KNOWLEDGE_DATABASE_PART_OF_SPEECH_SOURCE = knowledge/data/part_of_speeches.csv
KNOWLEDGE_DATABASE_DEPEND = knowledge/conceptnet/__init__.py knowledge/conceptnet/models.py knowledge/__init__.py knowledge/__main__.py

# rules
.PHONY: all clean knowledge

all: knowledge

clean:
	rm -f $(CONCEPTNET_TARGET) $(ENGLISHNET_TARGET) $(KNOWLEDGE_DATABASE_TARGET)

knowledge: $(CONCEPTNET_TARGET) $(ENGLISHNET_TARGET) $(KNOWLEDGE_DATABASE_TARGET)

$(CONCEPTNET_TARGET):
	wget -qNP $(@D) --show-progress $(CONCEPTNET_SOURCE)

$(ENGLISHNET_TARGET): $(CONCEPTNET_TARGET)
	gunzip -c $(CONCEPTNET_TARGET) | grep -P '^.+\t.+\t/c/en.+\t/c/en.+\t.+$$' | gzip > $@

$(KNOWLEDGE_DATABASE_TARGET): $(KNOWLEDGE_DATABASE_LANGUAGE_SOURCE) \
							  $(KNOWLEDGE_DATABASE_RELATION_SOURCE) \
							  $(KNOWLEDGE_DATABASE_PART_OF_SPEECH_SOURCE) \
							  $(ENGLISHNET_TARGET) $(KNOWLEDGE_DATABASE_DEPEND)
	python -m knowledge \
	--language-file $(KNOWLEDGE_DATABASE_LANGUAGE_SOURCE) \
	--relation-file $(KNOWLEDGE_DATABASE_RELATION_SOURCE) \
	--part-of-speech-file $(KNOWLEDGE_DATABASE_PART_OF_SPEECH_SOURCE) \
	--conceptnet-file $(ENGLISHNET_TARGET)
