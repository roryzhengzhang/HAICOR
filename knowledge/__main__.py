from __future__ import annotations

import argparse
import csv
import gzip
import json
from typing import Optional, Tuple

from knowledge import app
from knowledge.conceptnet.models import (Assertion, Concept, Language,
                                         PartOfSpeech, Relation, database)


def parse_concept_uri(uri: str) -> Tuple[str, str, Optional[str], Optional[str]]:
    assert uri.startswith("/c/"), "Invalid URI for Concept object"
    uri = uri.split('/')[2:]

    if len(uri) <= 3:
        return tuple(uri + [None for _ in range(4 - len(uri))])
    else:
        return tuple(uri[:3] + ['/' + '/'.join(uri[3:])])


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
parser.add_argument("--commit-batch-size", type=int, default=1000000,
                    help="The batch size of the database commit, larger size improves performance, while smaller size saves on memory")

if __name__ == "__main__":
    args = parser.parse_args()

    with app.app_context():
        database.drop_all()
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

        # setup for concept and assertion processing
        LANGUAGES = database.session.query(Language).all()
        LANGUAGES = {str(i.code): int(i.id) for i in LANGUAGES}

        RELATIONS = database.session.query(Relation).all()
        RELATIONS = {"/r/" + i.relation: int(i.id) for i in RELATIONS}

        PART_OF_SPEECHES = database.session.query(PartOfSpeech).all()
        PART_OF_SPEECHES = {str(i.code): int(i.id) for i in PART_OF_SPEECHES}
        PART_OF_SPEECHES[None] = None  # special case

        CONCEPTS = {}

        # process concepts
        concept_counter = 0

        with gzip.open(args.conceptnet_file, "rt") as file:
            reader = csv.reader(file, delimiter='\t')

            for index, (_, relation, start, end, _) in enumerate(reader):
                print(f"Extracting concept from line {index}", end='\r')

                if start not in CONCEPTS.keys():
                    concept_counter += 1

                    lang, text, pos, suffix = parse_concept_uri(start)
                    concept = Concept(id=concept_counter,
                                      language_id=LANGUAGES[lang],
                                      text=text,
                                      part_of_speech_id=PART_OF_SPEECHES[pos],
                                      suffix=suffix)

                    database.session.add(concept)
                    CONCEPTS[start] = concept_counter

                if end not in CONCEPTS.keys() and relation != "/r/ExternalURL":
                    concept_counter += 1

                    lang, text, pos, suffix = parse_concept_uri(end)
                    concept = Concept(id=concept_counter,
                                      language_id=LANGUAGES[lang],
                                      text=text,
                                      part_of_speech_id=PART_OF_SPEECHES[pos],
                                      suffix=suffix)

                    database.session.add(concept)
                    CONCEPTS[end] = concept_counter

                if index % args.commit_batch_size == 0:
                    database.session.commit()

            print()

        database.session.commit()

        # process assertions
        with gzip.open(args.conceptnet_file, "rt") as file:
            reader = csv.reader(file, delimiter='\t')

            for index, (_, relation, start, end, info) in enumerate(reader):
                print(f"Extracting assertion from line {index}", end='\r')

                if relation == "/r/ExternalURL":
                    continue

                assertions = Assertion(relation_id=RELATIONS[relation],
                                       start_id=CONCEPTS[start],
                                       end_id=CONCEPTS[end],
                                       information=json.loads(info))

                database.session.add(assertions)

                if index % args.commit_batch_size == 0:
                    database.session.commit()

            print()

        database.session.commit()
