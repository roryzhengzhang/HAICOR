from __future__ import annotations

import csv
import gzip
import json
import re
import sqlite3 as sqlite

CONCEPT_REGEX = re.compile("^/c/([^/]+)/([^/]+)/?([^/]+)?/?(.+)?$")
CONCEPTNET_FILENAME = "knowledge/data/conceptnet-assertions-5.7.0.csv.gz"


def progress():
    print("Hi")


def get_or_none(data: dict, field: str):
    return data[field] if field in data.keys() else None


if __name__ == "__main__":
    with sqlite.connect(":memory:") as database:
        database.set_progress_handler(progress, 1)
        cursor = database.cursor()

        # initialize database
        cursor.executescript(
            """
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

            CREATE TABLE external_urls (
                uri     TEXT UNIQUE NOT NULL,
                source  TEXT NOT NULL,
                target  TEXT NOT NULL,
                dataset TEXT NOT NULL,
                license TEXT NOT NULL,
                weight  REAL NOT NULL,
                sources TEXT NOT NULL
            );
            """
        )

        with gzip.open(CONCEPTNET_FILENAME, "rt") as conceptnet:
            reader = csv.reader(conceptnet, delimiter='\t')

            for i, (uri, relation, source, target, data) in enumerate(reader):
                print(f"Processing line {i + 1}", end='\r')
                data = json.loads(data)

                if relation == "/r/ExternalURL":
                    cursor.execute(
                        "INSERT INTO external_urls VALUES(?,?,?,?,?,?,?)",
                        (uri,
                         source,
                         target,
                         data["dataset"],
                         data["license"],
                         data["weight"],
                         json.dumps(data["sources"]))
                    )
                else:
                    source_match = re.match(CONCEPT_REGEX, source)
                    target_match = re.match(CONCEPT_REGEX, target)
                    cursor.execute(
                        "INSERT INTO assertions "
                        "VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                        (uri,
                         relation[3:],
                         source,
                         *source_match.groups(),
                         target,
                         *target_match.groups(),
                         data["dataset"],
                         data["license"],
                         data["weight"],
                         get_or_none(data, "surfaceText"),
                         get_or_none(data, "surfaceStart"),
                         get_or_none(data, "surfaceEnd"),
                         json.dumps(data["sources"]))
                    )

            print()

            cursor.close()
            database.commit()
