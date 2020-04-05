from __future__ import annotations

import argparse
import csv
import gzip
import json
import os
import time

from flask import Flask

from .models import database, utility

parser = argparse.ArgumentParser()

parser.add_argument("database", type=str,
                    help="SQLite database to be generated")
parser.add_argument("conceptnet", type=str,
                    help="Precompiled ConceptNet assertions")
parser.add_argument("--config-dir", type=str, default="data/",
                    help="Directory containing the configuration files (.csv)")

if __name__ == "__main__":
    args = parser.parse_args()

    # temporary flask application for database population
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///"
    app.config["SQLALCHEMY_DATABASE_URI"] += os.path.abspath(args.database)
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    database.init_app(app)

    with app.app_context():
        # database population
        database.drop_all()
        database.create_all()

        DIR = os.path.abspath(args.config_dir)

        with open(os.path.join(DIR, "languages.csv"), "r") as file:
            for code, name in csv.reader(file):
                utility.create_language(database.session, code, name)

        with open(os.path.join(DIR, "part_of_speeches.csv"), "r") as file:
            for code, name in csv.reader(file):
                utility.create_part_of_speech(database.session, code, name)

        with open(os.path.join(DIR, "relations.csv"), "r") as file:
            for relation, directed in csv.reader(file):
                utility.create_relation(database.session, relation,
                                        directed == "directed")

        database.session.commit()

        with gzip.open(args.conceptnet, "rt") as file:
            start = time.time()
            reader = csv.reader(file, delimiter='\t')

            for i, (uri, relation, source, target, data) in enumerate(reader):
                current = time.time() - start
                print(f"{i + 1} of lines processed ({current:.2f}s, "
                      f"{current / (i + 1) * 1000:.2f}ms/line)", end='\r')

                source = source.split('/')[2:]
                source = (source + [None for _ in range(4 - len(source))]
                          if 2 <= len(source) <= 3 else
                          source[:3] + ['/' + '/'.join(source[3:])])
                utility.create_concept(database.session, *source)

                if relation == "/r/ExternalURL":
                    continue

                target = target.split('/')[2:]
                target = (target + [None for _ in range(4 - len(target))]
                          if 2 <= len(target) <= 3 else
                          target[:3] + ['/' + '/'.join(target[3:])])
                utility.create_concept(database.session, *target)

            print()

        database.session.commit()

        with gzip.open(args.conceptnet, "rt") as file:
            start = time.time()
            reader = csv.reader(file, delimiter='\t')

            for i, (uri, relation, source, target, data) in enumerate(reader):
                current = time.time() - start
                print(f"{i + 1} of lines processed ({current:.2f}s, "
                      f"{current / (i + 1) * 1000:.2f}ms/line)", end='\r')

                if relation == "/r/ExternalURL":
                    continue

                data = json.loads(data)

                surface = ([None, None, None]
                           if "surfaceText" not in data.keys() else
                           [data["surfaceText"],
                            data["surfaceStart"], data["surfaceEnd"]])

                utility.create_assertion(database.session,
                                         relation,
                                         source,
                                         target,
                                         data["dataset"],
                                         data["license"],
                                         surface,
                                         data["weight"])

            print()

        database.session.commit()

        with gzip.open(args.conceptnet, "rt") as file:
            start = time.time()
            reader = csv.reader(file, delimiter='\t')

            for i, (uri, relation, source, target, data) in enumerate(reader):
                current = time.time() - start
                print(f"{i + 1} of lines processed ({current:.2f}s, "
                      f"{current / (i + 1) * 1000:.2f}ms/line)", end='\r')

                if relation == "/r/ExternalURL":
                    continue

                data = json.loads(data)
                for index, source in enumerate(data["sources"]):
                    for field, value in source.items():
                        utility.create_source(database.session, uri, index,
                                              field, value)

            print()

        database.session.commit()
