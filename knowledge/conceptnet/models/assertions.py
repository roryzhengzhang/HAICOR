from __future__ import annotations

from knowledge.conceptnet.models import database

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
    relation = Column(String, index=True, unique=True, nullable=False)
    directed = Column(Boolean, nullable=False)

    assertions = relationship("Assertion", back_populates="relation")

    def uri(self) -> str:
        """Generate ConceptNet uri for the given relation"""
        return f"/r/{self.relation}"


class Dataset(database.Model):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True)
    uri = Column(String, index=True, unique=True, nullable=False)

    def uri(self) -> str:
        """Generate ConceptNet uri for the given dataset"""
        return f"/d/{self.uri}"


class License(database.Model):
    __tablename__ = "licenses"

    id = Column(Integer, primary_key=True)
    name = Column(String, index=True, unique=True, nullable=False)


class Assertion(database.Model):
    __tablename__ = "assertions"
    __table_args__ = (UC("relation_id", "source_id", "target_id"),)

    id = Column(Integer, primary_key=True)
    relation_id = Column(Integer, FK("relations.id"), nullable=False)
    source_id = Column(Integer, FK("concepts.id"), index=True, nullable=False)
    target_id = Column(Integer, FK("concepts.id"), index=True, nullable=False)
    dataset_id = Column(Integer, FK("datasets.id"))
    license_id = Column(Integer, FK("licenses.id"))
    weight = Column(Float, nullable=False)

    relation = relationship("Relation", back_populates="assertions")
    source = relationship("Concept",
                          foreign_keys="Assertion.source_id",
                          back_populates="out_assertions")
    target = relationship("Concept",
                          foreign_keys="Assertion.target_id",
                          back_populates="in_assertions")
    surfaces = relationship("Surface", back_populates="assertion")
    sources = relationship("Source", back_populates="assertion")

    def uri(self) -> str:
        """Generate ConceptNet uri for the given assertion"""
        return (f"/a/[{self.relation.uri()}/,"
                f"{self.source.uri()}/,{self.target.uri()}/]")


class Surface(database.Model):
    __tablename__ = "surfaces"

    id = Column(Integer, primary_key=True)
    assertion_id = Column(Integer,
                          FK("assertions.id"),
                          index=True,
                          nullable=False)
    text = Column(String, nullable=False)
    start = Column(String, nullable=False)
    end = Column(String, nullable=False)

    assertion = relationship("Assertion", back_populates="surfaces")


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
