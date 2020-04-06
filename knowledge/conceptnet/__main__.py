from __future__ import annotations

import argparse
import json
import os
import sqlite3 as sqlite
from flask import Flask

from .models import database
from .models.concepts import *
from .models.assertions import *

parser = argparse.ArgumentParser()

parser.add_argument("source", type=str, help="Source SQLite database")
parser.add_argument("target", type=str, help="Target SQLAlchemy database")

if __name__ == "__main__":
    args = parser.parse_args()

    # temporary flask application for database population
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///"
    app.config["SQLALCHEMY_DATABASE_URI"] += os.path.abspath(args.target)
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    database.init_app(app)

    with app.app_context():
        # database population
        database.drop_all()
        database.create_all()

        database.session.commit()

    source_db = sqlite.connect(os.path.abspath(args.source))
    target_db = sqlite.connect(os.path.abspath(args.target))

    # languages
    values = source_db.execute("SELECT * FROM languages").fetchall()
    target_db.executemany("INSERT INTO languages VALUES(?,?,?)", values)

    # part_of_speeches
    values = source_db.execute("SELECT * FROM part_of_speeches").fetchall()
    target_db.executemany("INSERT INTO part_of_speeches VALUES(?,?,?)", values)

    # concepts
    values = source_db.execute("SELECT * FROM concepts").fetchall()
    target_db.executemany("INSERT INTO concepts VALUES(?,?,?,?,?)",
                          (i[:-1] for i in values))

    # relations
    values = source_db.execute("SELECT * FROM relations").fetchall()
    target_db.executemany("INSERT INTO relations VALUES(?,?,?)", values)

    # datasets
    values = source_db.execute("SELECT * FROM datasets").fetchall()
    target_db.executemany("INSERT INTO datasets VALUES(?,?)", values)

    # licenses
    values = source_db.execute("SELECT * FROM licenses").fetchall()
    target_db.executemany("INSERT INTO licenses VALUES(?,?)", values)

    # assertions
    values = source_db.execute("SELECT * FROM assertions").fetchall()
    target_db.executemany("INSERT INTO assertions VALUES(?,?,?,?,?,?,?,?,?,?)",
                          (i[:-1] for i in values))

    # sources
    for id, data in source_db.execute("SELECT id, data FROM assertions"):
        sources = json.loads(data)["sources"]

        for index, source in enumerate(sources):
            for field, value in source.items():
                target_db.execute("INSERT INTO sources(assertion_id,[index],"
                                  "field,value) VALUES(?,?,?,?)",
                                  (id, index, field, value))
    target_db.commit()
    target_db.close()
    source_db.close()
