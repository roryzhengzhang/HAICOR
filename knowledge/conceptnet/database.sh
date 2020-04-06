#!/bin/bash
echo "Initializing SQLite database ($1) ..."

# create database tables
sqlite3 --echo $1 \
"CREATE TABLE languages_raw (
    code TEXT,
    name TEXT
);

CREATE TABLE relations_raw (
    relation TEXT,
    directed TEXT
);

CREATE TABLE part_of_speeches_raw (
    code TEXT,
    name TEXT
);

CREATE TABLE assertions_raw(
    uri             TEXT,
    relation_uri    TEXT,
    relation        TEXT,
    source_uri      TEXT,
    source_language TEXT,
    source_text     TEXT,
    source_pos      TEXT,
    source_suffix   TEXT,
    target_uri      TEXT,
    target_language TEXT,
    target_text     TEXT,
    target_pos      TEXT,
    target_suffix   TEXT,
    data            TEXT
);"

# import data from csv
echo "Processing language configuration ($2)　..."
cat $2 | pv -l -s $(wc -l $2) | sqlite3 --echo --csv $1 ".import /dev/stdin languages_raw"

echo "Processing relation configutation ($3)　..."
cat $3 | pv -l -s $(wc -l $3) | sqlite3 --echo --csv $1 ".import /dev/stdin relations_raw"

echo "Processing part of speech configuration ($4)　..."
cat $4 | pv -l -s $(wc -l $4) | sqlite3 --echo --csv $1 ".import /dev/stdin part_of_speeches_raw"

echo "Processing ConceptNet assertions ($5) ..."
gunzip -c $5 | perl -ne '/^(\/a\/\S+)\t(\/r\/(\S+))\t(\/c\/([^\/]+)\/([^\/]+)\/?([^\/]+)?\/?(\S+)?)\t(\/c\/([^\/]+)\/([^\/]+)\/?([^\/]+)?\/?(\S+)?)\t(.+)$/ && print "$1\t$2\t$3\t$4\t$5\t$6\t$7\t$8\t$9\t$10\t$11\t$12\t$13\t$14\n"' \
| pv -l -s $(gunzip -c $5 | wc -l) | sqlite3 --echo --csv --separator $'\t' $1 ".import /dev/stdin assertions_raw"
