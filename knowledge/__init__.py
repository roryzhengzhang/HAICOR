from __future__ import annotations

import os

from flask import Flask

from knowledge.conceptnet import conceptnet
from knowledge.conceptnet.models import database

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "config.json")

app = Flask(__name__)
app.config.from_json(CONFIG_FILE)

app.register_blueprint(conceptnet)
database.init_app(app)
