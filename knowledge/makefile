CONCEPTNET_TARGET = data/conceptnet-assertions-5.7.0.csv.gz
CONCEPTNET_SOURCE = 'https://s3.amazonaws.com/conceptnet/downloads/2019/edges/conceptnet-assertions-5.7.0.csv.gz'

ENGLISHNET_TARGET = data/englishnet-assertions-5.7.0.csv.gz
ENGLiSHNET_SOURCE = $(CONCEPTNET_TARGET)

.PHONY: all clean

all:

clean:
	rm -f $(CONCEPTNET_TARGET) $(ENGLISHNET_TARGET)

$(CONCEPTNET_TARGET): makefile
	wget --quiet --timestamping --show-progress --directory-prefix $(@D) $(CONCEPTNET_SOURCE)

$(ENGLISHNET_TARGET): $(ENGLiSHNET_SOURCE) makefile
	gunzip -c $(ENGLiSHNET_SOURCE) | grep -P '\t/c/en/.+\t/c/en/.+\t' | gzip > $@
