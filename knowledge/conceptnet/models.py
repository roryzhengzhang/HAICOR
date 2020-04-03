from __future__ import annotations

from flask_sqlalchemy import SQLAlchemy, sqlalchemy

# database configuration
database: SQLAlchemy = SQLAlchemy()

# shorthand
db = database


class Language(db.Model):
    __tablename__ = "languages"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String, unique=True, nullable=False)
    name = db.Column(db.String, unique=True, nullable=False)

    concepts = db.relation("Concept", back_populates="language")

    @staticmethod
    def exists(session, code: str, name: str) -> bool:
        return session.query(Language).filter_by(code=code, name=name).scalar()

    @staticmethod
    def create(session, code: str, name: str) -> Language:
        if not Language.exists(session, code, name):
            session.add(Language(code=code, name=name))

        return session.query(Language).filter_by(code=code, name=name).one()


class Relation(db.Model):
    __tablename__ = "relations"

    id = db.Column(db.Integer, primary_key=True)
    relation = db.Column(db.String, unique=True, nullable=False)
    directed = db.Column(db.Boolean, nullable=False)

    assertions = db.relation("Assertion", back_populates="relation")

    @staticmethod
    def exists(session, relation: str, directed: bool) -> bool:
        return session.query(Relation).filter_by(relation=relation,
                                                 directed=directed).scalar()

    @staticmethod
    def create(session, relation: str, directed: bool) -> Relation:
        if not Relation.exists(session, relation, directed):
            session.add(Relation(relation=relation, directed=directed))

        return session.query(Relation).filter_by(relation=relation,
                                                 directed=directed).one()


class PartOfSpeech(db.Model):
    __tablename__ = "part_of_speeches"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String, unique=True, nullable=False)
    name = db.Column(db.String, unique=True, nullable=False)

    concepts = db.relation("Concept", back_populates="part_of_speech")

    @staticmethod
    def exists(session, code: str, name: str) -> bool:
        return session.query(PartOfSpeech).filter_by(code=code,
                                                     name=name).scalar()

    @staticmethod
    def create(session, code: str, name: str) -> bool:
        if not PartOfSpeech.exists(session, code, name):
            session.add(PartOfSpeech(code=code, name=name))

        return session.query(PartOfSpeech).filter_by(code=code,
                                                     name=name).one()


class Concept(db.Model):
    __tablename__ = "concepts"

    id = db.Column(db.Integer, primary_key=True)
    language_id = db.Column(db.Integer, db.ForeignKey(Language.id),
                            nullable=False)
    text = db.Column(db.String, nullable=False)
    part_of_speech_id = db.Column(db.Integer, db.ForeignKey(PartOfSpeech.id))
    suffix = db.Column(db.String)

    __table_args__ = (
        db.UniqueConstraint(language_id, text, part_of_speech_id, suffix),
    )

    language = db.relation("Language", back_populates="concepts")
    part_of_speech = db.relation("PartOfSpeech", back_populates="concepts")

    out_assertions = db.relation("Assertion", foreign_keys="Assertion.start_id",
                                 back_populates="start")
    in_assertions = db.relation("Assertion", foreign_keys="Assertion.end_id",
                                back_populates="end")

    @staticmethod
    def exists(session, language: Language, text: str,
               part_of_speech: PartOfSpeech, suffix: str) -> bool:
        return session.query(Concept)\
            .filter_by(
                language_id=language.id,
                text=text,
                part_of_speech_id=part_of_speech.id if part_of_speech else None,
                suffix=suffix)\
            .scalar()

    @staticmethod
    def create(session, language: Language, text: str,
               part_of_speech: PartOfSpeech, suffix: str) -> Concept:
        if not Concept.exists(session, language, text, part_of_speech, suffix):
            session.add(Concept(language=language, text=text,
                                part_of_speech=part_of_speech, suffix=suffix))

        return session.query(Concept)\
            .filter_by(
                language_id=language.id,
                text=text,
                part_of_speech_id=part_of_speech.id if part_of_speech else None,
                suffix=suffix)\
            .one()

    @staticmethod
    def create_from_uri(session, uri: str) -> Concept:
        assert uri.startswith("/c/"), "Invalid URI for Concept object"

        uri = uri.split('/')[2:]
        if len(uri) <= 3:
            # /c/<language>/<concept> or /c/<language>/<concept>/<pos>
            uri = uri + [None for _ in range(4 - len(uri))]
        else:
            # /c/<language>/<concept>/<pos>/<suffix>*
            uri = uri[:3] + ['/' + '/'.join(uri[3:])]

        return Concept.create(
            session,
            session.query(Language).filter_by(code=uri[0]).one(),
            uri[1],
            session.query(PartOfSpeech).filter_by(code=uri[2]).one_or_none(),
            uri[3]
        )


class Assertion(db.Model):
    __tablename__ = "assertions"

    id = db.Column(db.Integer, primary_key=True)
    relation_id = db.Column(db.Integer, db.ForeignKey(Relation.id),
                            nullable=False)
    start_id = db.Column(db.Integer, db.ForeignKey(Concept.id),
                         nullable=False)
    end_id = db.Column(db.Integer, db.ForeignKey(Concept.id),
                       nullable=False)

    __table_args__ = (
        db.UniqueConstraint(relation_id, start_id, end_id),
    )

    relation = db.relation("Relation", back_populates="assertions")
    start = db.relation("Concept", foreign_keys=start_id,
                        back_populates="out_assertions")
    end = db.relation("Concept", foreign_keys=end_id,
                      back_populates="in_assertions")

    @staticmethod
    def exists(session, relation: Relation, start: Concept, end: Concept) -> bool:
        return session.query(Assertion).filter_by(relation_id=relation.id,
                                                  start_id=start.id,
                                                  end_id=end.id).scalar()

    @staticmethod
    def create(session, relation: Relation, start: Concept, end: Concept) -> Assertion:
        if not Assertion.exists(session, relation, start, end):
            session.add(Assertion(relation=relation, start=start, end=end))

        return session.query(Assertion).filter_by(relation_id=relation.id,
                                                  start_id=start.id,
                                                  end_id=end.id).one()

    @staticmethod
    def create_from_uri(session, uri: str) -> Assertion:
        assert uri.startswith("/a/"), "Invalid URI for Assertion object"

        uri = [i.strip()[:-1] for i in uri[4:-1].split(',')]
        uri[0] = uri[0][3:]

        return Assertion.create(
            session,
            session.query(Relation).filter_by(relation=uri[0]).one(),
            Concept.create_from_uri(session, uri[1]),
            Concept.create_from_uri(session, uri[2])
        )
