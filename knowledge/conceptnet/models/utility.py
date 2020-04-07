from __future__ import annotations

from typing import Optional, Union, Tuple

from cachetools import cached
from cachetools.keys import hashkey

from .assertions import Assertion, Dataset, License, Relation, Source
from .concepts import Concept, Language, PartOfSpeech


def uri_of(object: Union[Concept, Assertion,
                         Dataset, Relation]) -> str:
    """Generates ConceptNet URI for the given object."""

    if isinstance(object, Concept):  # concept object
        return f"/c/{object.language.code}/{object.text}" \
            + (f"/{object.part_of_speech.code}" if object.speech else "") \
            + (f"/{object.suffix}" if object.suffix else "")
    elif isinstance(object, Assertion):  # assertion object
        return (f"/a/[{(uri_of(object.relation))}/,{uri_of(object.source)}/,"
                "{uri_of(object.target)}/]")
    elif isinstance(object, Dataset):  # dataset object
        return f"/d/{object.uri}"
    elif isinstance(object, Relation):  # relation object
        return f"/r/{object.relation}"


def create_language(session, code: str, name: Optional[str]) -> Language:
    """Creates and returns a Language instance using the parameters.

    Creates and returns a Language instance using the parameters. If the
    Language instance already exists in the database, returns the database
    instance.
    """

    result = session.query(Language).filter_by(code=code).one_or_none()
    if result is None:
        result = Language(code=code, name=(name if name else code))
        session.add(result)

    return result


@cached(cache={}, key=lambda a, b: hashkey(b))
def query_language(session, code: str):
    return create_language(session, code, None)


def create_part_of_speech(session, code: str, name: Optional[str]) \
        -> PartOfSpeech:
    """Creates and returns a PartOfSpeech instance using the parameters.

    Creates and returns a PartOfSpeech instance using the parameters. If the
    PartOfSpeech instance already exists in the database, returns the database
    instance.
    """

    result = session.query(PartOfSpeech).filter_by(code=code).one_or_none()
    if result is None:
        result = PartOfSpeech(code=code, name=(name if name else code))
        session.add(result)

    return result


@cached(cache={}, key=lambda a, b: hashkey(b))
def query_part_of_speech(session, code: str):
    return create_part_of_speech(session, code, None)


def create_concept(session, lang: str, text: str,
                   speech: Optional[str], suffix: Optional[str]) -> Concept:
    """Creates and returns a Concept instance using the parameters.

    Creates and returns a Concept instance using the parameters. If the Concept
    instance already exists in the database, returns the database instance.
    """

    lang = query_language(session, lang)
    speech = query_part_of_speech(session, speech) if speech else None

    result = session.query(Concept).filter_by(language=lang,
                                              text=text,
                                              part_of_speech=speech,
                                              suffix=suffix).one_or_none()
    if result is None:
        instance = Concept(language=lang,
                           text=text,
                           part_of_speech=speech,
                           suffix=suffix)
        session.add(instance)

    return result


@cached(cache={}, key=lambda a, b, c, d, e: hashkey(b, c, d, e))
def query_concept(session, lang: str, text: str,
                  speech: Optional[str], suffix: Optional[str]) -> Concept:
    return create_concept(session, lang, text, speech, suffix)


def create_relation(session, relation: str, directed: Optional[bool]) \
        -> Relation:
    """Creates and returns a Relation instance using the parameters.

    Creates and returns a Relation instance using the parameters. If the
    Relation instance already exists in the database, returns the database
    instance.
    """

    result = session.query(Relation).filter_by(relation=relation).one_or_none()
    if result is None:
        result = Relation(relation=relation, directed=bool(directed))
        session.add(result)

    return result


@cached(cache={}, key=lambda a, b: hashkey(b))
def query_relation(session, relation: str) -> Relation:
    return create_relation(session, relation, None)


def create_dataset(session, uri: str) -> Dataset:
    """Creates and returns a Dataset instance using the parameters.

    Creates and returns a Dataset instance using the parameters. If the Dataset
    instance already exists in the database, returns the database instance.
    """

    result = session.query(Dataset).filter_by(uri=uri).one_or_none()
    if result is None:
        result = Dataset(uri=uri)
        session.add(result)

    return result


@cached(cache={}, key=lambda a, b: hashkey(b))
def query_dataset(session, uri: str) -> Dataset:
    return create_dataset(session, uri)


def create_license(session, uri: str) -> License:
    """Creates and returns a License instance using the parameters.

    Creates and returns a License instance using the parameters. If the License
    instance already exists in the database, returns the database instance.
    """

    result = session.query(License).filter_by(uri=uri).one_or_none()
    if result is None:
        result = License(uri=uri)
        session.add(result)

    return result


@cached(cache={}, key=lambda a, b: hashkey(b))
def query_license(session, uri: str) -> License:
    return create_license(session, uri)


def create_assertion(session, relation: str, source: str, target: str,
                     dataset: str, license: str, surface: Tuple[str, str, str],
                     weight: float) -> Assertion:
    """Creates and returns an Assertion instance using the parameters.

    Creates and returns an Assertion instance using the parameters. If the
    Assertion instance already exists in the database, returns the database
    instance.
    """

    assert relation.startswith("/r/"), "invalid uri"
    assert source.startswith("/c/") and target.startswith("/c/"), "invalid uri"
    assert dataset is None or dataset.startswith("/d/"), "invalid uri"

    relation = query_relation(session, relation[3:])

    source = source.split('/')[2:]
    source = (source + [None for _ in range(4 - len(source))]
              if 2 <= len(source) <= 3 else
              source[:3] + ['/' + '/'.join(source[3:])])
    source = query_concept(session, *source)

    target = target.split('/')[2:]
    target = (target + [None for _ in range(4 - len(target))]
              if 2 <= len(target) <= 3 else
              target[:3] + ['/' + '/'.join(target[3:])])
    target = query_concept(session, *target)

    result = session.query(Assertion).filter_by(relation=relation,
                                                source=source,
                                                target=target).one_or_none()
    if result is None:
        dataset = query_dataset(session, dataset[3:])
        license = query_license(session, license)

        result = Assertion(relation=relation,
                           source=source,
                           target=target,
                           dataset=dataset,
                           license=license,
                           surface_text=surface[0],
                           surface_source=surface[1],
                           surface_target=surface[2],
                           weight=weight)
        session.add(result)

    return result


@cached(cache={}, key=lambda a, b, c, d, e, f, g, h: hashkey(b, c, d))
def query_assertion(session,  relation: str, source: str, target: str,
                    dataset: str, license: str, surface: Tuple[str, str, str],
                    weight: float) -> Assertion:
    return create_assertion(session, relation, source, target,
                            dataset, license, surface, weight)


def create_source(session, assertion: str, index: int,
                  field: str, value: str) -> Source:
    assert assertion.startswith("/a/"), "invalid uri"

    assertion = assertion[4:-2].split("/,")
    assertion = query_assertion(session, *assertion, None, None, None, None)

    result = session.query(Source).filter_by(assertion=assertion,
                                             index=index,
                                             field=field,
                                             value=value).one_or_none()
    if result is None:
        result = Source(assertion=assertion,
                        index=index,
                        field=field,
                        value=value)
        session.add(result)

    return result


@cached(cache={}, key=lambda a, b, c, d, e: hashkey(b, c, d, e))
def query_source(session, assertion: str, index: int,
                 field: str, value: str) -> Source:
    return create_source(session, assertion, index, field, value)
