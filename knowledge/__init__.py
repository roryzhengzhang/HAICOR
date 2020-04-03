from __future__ import annotations

import os

from flask import Flask

from knowledge.conceptnet import conceptnet
from knowledge.conceptnet.models import database

# flask configuration
app: Flask = Flask(__name__)
app.config.from_json(os.path.join(os.path.dirname(__file__), "config.json"))

app.register_blueprint(conceptnet)

database.init_app(app)
