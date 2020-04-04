from __future__ import annotations

import os

from flask import Flask

import knowledge.conceptnet as conceptnet

app = Flask(__name__)
app.config.from_json(os.path.join(os.path.dirname(__file__), "config.json"))

app.register_blueprint(conceptnet.conceptnet)

conceptnet.database.init_app(app)
