from __future__ import annotations

from . import database

# short hands
FK = database.ForeignKey
UC = database.UniqueConstraint
Float = database.Float
Column = database.Column
String = database.String
Boolean = database.Boolean
Integer = database.Integer
relationship = database.relationship


class Relation(database.Model):
    __tablename__ = "relations"

    id = Column(Integer, primary_key=True)
    relation = Column(String, unique=True, nullable=False)
    directed = Column(Boolean, nullable=False)

    assertions = relationship("Assertion", back_populates="relation")


class Dataset(database.Model):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True)
    uri = Column(String, index=True, unique=True, nullable=False)

    assertions = relationship("Assertion", back_populates="dataset")


class License(database.Model):
    __tablename__ = "licenses"

    id = Column(Integer, primary_key=True)
    name = Column(String, index=True, unique=True, nullable=False)

    assertions = relationship("Assertion", back_populates="license")


class Assertion(database.Model):
    __tablename__ = "assertions"
    __table_args__ = (UC("relation_id", "source_id", "target_id"),)

    id = Column(Integer, primary_key=True)
    relation_id = Column(Integer, FK("relations.id"), nullable=False)
    source_id = Column(Integer, FK("concepts.id"), index=True, nullable=False)
    target_id = Column(Integer, FK("concepts.id"), index=True, nullable=False)
    dataset_id = Column(Integer, FK("datasets.id"))
    license_id = Column(Integer, FK("licenses.id"))
    surface_text = Column(String)
    surface_source = Column(String)
    surface_target = Column(String)
    weight = Column(Float, nullable=False)

    relation = relationship("Relation", back_populates="assertions")
    source = relationship("Concept",
                          foreign_keys="Assertion.source_id",
                          back_populates="out_assertions")
    target = relationship("Concept",
                          foreign_keys="Assertion.target_id",
                          back_populates="in_assertions")
    dataset = relationship("Dataset", back_populates="assertions")
    license = relationship("License", back_populates="assertions")
    sources = relationship("Source", back_populates="assertion")


class Source(database.Model):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True)
    assertion_id = Column(Integer,
                          FK("assertions.id"),
                          index=True,
                          nullable=False)
    index = Column(Integer, nullable=False)
    field = Column(String, nullable=False)
    value = Column(String, nullable=False)

    assertion = relationship("Assertion", back_populates="sources")
