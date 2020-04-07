from __future__ import annotations

import argparse
import csv
import gzip
import json
import os
import re
import sqlite3 as sqlite

from flask import Flask

from . import models
from .models import utility

CONCEPT_REGEX = re.compile("^/c/([^/]+)/([^/]+)/?([^/]+)?/?(.+)?$")

LANGUAGE_INSERT = "INSERT INTO languages(code, name) VALUES(?,?)"
RELATION_INSERT = "INSERT INTO relations(relation, directed) VALUES(?,?)"
ASSERTION_INSERT = "INSERT INTO assertions VALUES(" + "?," * 18 + "?)"
PART_OF_SPEECH_INSERT = "INSERT INTO part_of_speeches(code, name) VALUES(?,?)"

CONCEPT_SQL = """
SELECT DISTINCT
    ROW_NUMBER() OVER (ORDER BY uri) AS id,
    languages.id AS lang,
    text,
    part_of_speeches.id AS speech,
    suffix
FROM (
    SELECT
        source_lang AS lang,
        source_text AS text,
        source_speech AS speech,
        source_suffix AS suffix,
        source_uri AS uri
    FROM assertions
    UNION
    SELECT
        target_lang AS lang,
        target_text AS text,
        target_speech AS speech,
        target_suffix AS suffix,
        target_uri AS uri
    FROM assertions
)
LEFT JOIN languages ON lang == languages.code
LEFT JOIN part_of_speeches ON speech == part_of_speeches.code
"""
DATASET_SQL = """
SELECT ROW_NUMBER() OVER (ORDER BY uri) AS id, uri
FROM (SELECT DISTINCT dataset AS uri FROM assertions)
"""
LICENSE_SQL = """
SELECT ROW_NUMBER() OVER (ORDER BY uri) AS id, uri
FROM (SELECT DISTINCT license AS uri FROM assertions)
"""
ASSERTION_SQL = """
SELECT
    ROW_NUMBER() OVER (ORDER BY assertions.uri) AS id,
    relations.id AS relation_id,
    source.id AS source_id,
    target.id AS target_id,
    datasets.id AS dataset_id,
    licenses.id AS license_id,
    surface_text,
    surface_source,
    surface_target,
    weight
FROM assertions
JOIN relations ON assertions.relation == relations.relation
JOIN (
    SELECT ROW_NUMBER() OVER (ORDER BY uri) AS id, uri FROM (
        SELECT DISTINCT source_uri AS uri FROM assertions
        UNION
        SELECT DISTINCT target_uri AS uri FROM assertions
    )
) source ON assertions.source_uri == source.uri
JOIN (
    SELECT ROW_NUMBER() OVER (ORDER BY uri) AS id, uri FROM (
        SELECT DISTINCT source_uri AS uri FROM assertions
        UNION
        SELECT DISTINCT target_uri AS uri FROM assertions
    )
) target ON assertions.target_uri == target.uri
JOIN (
    SELECT DISTINCT ROW_NUMBER() OVER (ORDER BY dataset) AS id, dataset
    FROM (SELECT DISTINCT dataset FROM assertions)
) datasets ON assertions.dataset == datasets.dataset
JOIN (
    SELECT DISTINCT ROW_NUMBER() OVER (ORDER BY license) AS id, license
    FROM (SELECT DISTINCT license FROM assertions)
) licenses ON assertions.license == licenses.license
"""
SOURCE_SQL = "SELECT ROW_NUMBER() OVER (ORDER BY uri), sources FROM assertions"


def init_database(cursor: sqlite.Cursor):
    cursor.executescript(
        """
        CREATE TABLE languages (
            id   INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT    UNIQUE NOT NULL,
            name TEXT    NOT NULL
        );

        CREATE TABLE relations (
            id       INTEGER PRIMARY KEY AUTOINCREMENT,
            relation TEXT    UNIQUE NOT NULL,
            directed INTEGER NOT NULL
        );

        CREATE TABLE part_of_speeches (
            id   INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT    UNIQUE NOT NULL,
            name TEXT    NOT NULL
        );

        CREATE TABLE assertions (
            uri            TEXT UNIQUE NOT NULL,
            relation       TEXT NOT NULL,
            source_uri     TEXT NOT NULL,
            source_lang    TEXT NOT NULL,
            source_text    TEXT NOT NULL,
            source_speech  TEXT,
            source_suffix  TEXT,
            target_uri     TEXT NOT NULL,
            target_lang    TEXT NOT NULL,
            target_text    TEXT NOT NULL,
            target_speech  TEXT,
            target_suffix  TEXT,
            dataset        TEXT NOT NULL,
            license        TEXT NOT NULL,
            weight         REAL NOT NULL,
            surface_text   TEXT,
            surface_source TEXT,
            surface_target TEXT,
            sources        TEXT NOT NULL
        );
        """
    )


def one_or_none(data, field):
    return data[field] if field in data.keys() else None


def import_language(cursor, filename):
    with open(filename, "r") as file:
        for code, name in sorted(csv.reader(file)):
            cursor.execute(LANGUAGE_INSERT, (code, name))


def import_relation(cursor, filename):
    with open(filename, "r") as file:
        for relation, directed in sorted(csv.reader(file)):
            cursor.execute(RELATION_INSERT, (relation, directed == "directed"))


def import_part_of_speech(cursor, filename):
    with open(filename, "r") as file:
        for code, name in sorted(csv.reader(file)):
            cursor.execute(PART_OF_SPEECH_INSERT, (code, name))


def import_assertion(cursor, uri, relation, source, target, data):
    assert relation != "/r/ExternalURL"

    source_match = re.match(CONCEPT_REGEX, source)
    target_match = re.match(CONCEPT_REGEX, target)

    cursor.execute(ASSERTION_INSERT,
                   (uri, relation[3:],
                    source, *source_match.groups(),
                    target, *target_match.groups(),
                    data["dataset"][3:], data["license"], data["weight"],
                    one_or_none(data, "surfaceText"),
                    one_or_none(data, "surfaceStart"),
                    one_or_none(data, "surfaceEnd"),
                    json.dumps(data["sources"])))


def insert_language(session, cursor):
    for row in cursor.execute("SELECT * FROM languages"):
        session.add(utility.Language(**dict(row)))


def insert_relation(session, cursor):
    for row in cursor.execute("SELECT * FROM relations"):
        session.add(utility.Relation(**dict(row)))


def insert_part_of_speech(session, cursor):
    for row in cursor.execute("SELECT * FROM part_of_speeches"):
        session.add(utility.PartOfSpeech(**dict(row)))


parser = argparse.ArgumentParser()

parser.add_argument("database", type=str, help="Database file to be generated")
parser.add_argument("conceptnet", type=str, help="ConceptNet assertions file")
parser.add_argument("--configuration-dir", type=str, default="data")
parser.add_argument("--commit-batch-size", type=int, default=500000)

if __name__ == "__main__":
    args = parser.parse_args()

    DATABASE = "sqlite:///" + os.path.abspath(args.database)
    CONCEPTNET = os.path.abspath(args.conceptnet)
    CONFIGURATION = os.path.abspath(args.configuration_dir)

    # temporary flask application
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    models.database.init_app(app)

    # temporary database
    with sqlite.connect(":memory:") as database:
        database.row_factory = sqlite.Row

        cursor = database.cursor()

        init_database(cursor)

        import_language(cursor, CONFIGURATION + "/languages.csv")
        import_relation(cursor, CONFIGURATION + "/relations.csv")
        import_part_of_speech(cursor, CONFIGURATION + "/part_of_speeches.csv")

        with gzip.open(CONCEPTNET, "rt") as conceptnet:
            for idx, line in enumerate(csv.reader(conceptnet, delimiter='\t')):
                print(f"Processing lines: {idx + 1}", end='\r')

                if line[1] == "/r/ExternalURL":
                    continue

                line[-1] = json.loads(line[-1])
                import_assertion(cursor, *line)

            print()

        database.commit()

        # populate database
        with app.app_context():
            models.database.drop_all()
            models.database.create_all()

            session = models.database.session

            insert_language(session, cursor)
            insert_relation(session, cursor)
            insert_part_of_speech(session, cursor)

            for index, row in enumerate(cursor.execute(CONCEPT_SQL)):
                print(f"Processing concepts: {index + 1}", end='\r')
                session.add(utility.Concept(**dict(row)))

                if (index + 1) % args.commit_batch_size == 0:
                    session.commit()

            print()
            session.commit()

            for row in cursor.execute(DATASET_SQL):
                session.add(utility.Dataset(**dict(row)))

            for row in cursor.execute(LICENSE_SQL):
                session.add(utility.License(**dict(row)))

            for index, row in enumerate(cursor.execute(ASSERTION_SQL)):
                print(f"Processing assertions: {index + 1}", end='\r')
                session.add(utility.Assertion(**dict(row)))

                if (index + 1) % args.commit_batch_size == 0:
                    session.commit()

            print()
            session.commit()

            id = 0
            for index, row in enumerate(cursor.execute(SOURCE_SQL)):
                print(f"Processing assertion sources: {index + 1}", end='\r')
                assertion_id, sources = row
                for index, source in enumerate(json.loads(sources)):
                    for field, value in source.items():
                        id += 1
                        session.add(utility.Source(
                            id=id,
                            assertion_id=assertion_id,
                            index=index,
                            field=field,
                            value=value
                        ))

                    if id % args.commit_batch_size == 0:
                        session.commit()

            print()
            session.commit()
