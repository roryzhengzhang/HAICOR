from __future__ import annotations

from . import database

# short hands
FK = database.ForeignKey
UC = database.UniqueConstraint
Column = database.Column
String = database.String
Integer = database.Integer
relationship = database.relationship


class Language(database.Model):
    __tablename__ = "languages"

    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True, nullable=False)
    name = Column(String)

    concepts = relationship("Concept", back_populates="language")


class PartOfSpeech(database.Model):
    __tablename__ = "part_of_speeches"

    id = Column(Integer, primary_key=True)
    code = Column(String, unique=True, nullable=False)
    name = Column(String)

    concepts = relationship("Concept", back_populates="part_of_speech")


class Concept(database.Model):
    __tablename__ = "concepts"
    __table_args__ = (UC("lang", "text", "speech", "suffix"),)

    id = Column(Integer, primary_key=True)
    lang = Column(Integer, FK("languages.id"), nullable=False)
    text = Column(String, index=True, nullable=False)
    speech = Column(Integer, FK("part_of_speeches.id"))
    suffix = Column(String)

    language = relationship("Language", back_populates="concepts")
    part_of_speech = relationship("PartOfSpeech", back_populates="concepts")
    out_assertions = relationship("Assertion",
                                  foreign_keys="Assertion.source_id",
                                  back_populates="source")
    in_assertions = relationship("Assertion",
                                 foreign_keys="Assertion.target_id",
                                 back_populates="target")
