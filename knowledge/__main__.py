from __future__ import annotations

import argparse
import csv
import gzip
import time

from knowledge import app
from knowledge.conceptnet.models import (Assertion, Language, PartOfSpeech,
                                         Relation, database)

# command line arguments
parser = argparse.ArgumentParser()

parser.add_argument("--language-file", type=str,
                    help="CSV file containting the language specification")
parser.add_argument("--relation-file", type=str,
                    help="CSV file containting the relation specification")
parser.add_argument("--part-of-speech-file", type=str,
                    help="CSV file containting the part-of-speech specification")
parser.add_argument("--conceptnet-file", type=str,
                    help="ConceptNet assertions file (.csv.gz)")

if __name__ == "__main__":
    args = parser.parse_args()

    with app.app_context():
        database.create_all()

        # process languages
        with open(args.language_file, "r") as file:
            for code, name in csv.reader(file):
                Language.create(database.session, code, name)

        # process relations
        with open(args.relation_file, "r") as file:
            for relation, directed in csv.reader(file):
                Relation.create(database.session,
                                relation, directed == "Directed")

        # process part of speeches
        with open(args.part_of_speech_file, "r") as file:
            for code, name in csv.reader(file):
                PartOfSpeech.create(database.session, code, name)

        database.session.commit()

        # process assertions
        with gzip.open(args.conceptnet_file, "rt") as file:
            start = time.time()
            reader = csv.reader(file, delimiter='\t')

            for index, (uri, relation, _, _, _) in enumerate(reader):
                print(f"ConceptNet assertion processed: {index} "
                      f"(elapsed time: {time.time() - start:.3f}s)", end='\r')

                if relation == "/r/ExternalURL":
                    continue

                Assertion.create_from_uri(database.session, uri)

                if index % 10000 == 0:
                    database.session.commit()

            print()

        database.session.commit()
