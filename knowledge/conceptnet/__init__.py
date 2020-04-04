from __future__ import annotations

from flask import Blueprint

from knowledge.conceptnet.models import assertions, concepts, database

conceptnet = Blueprint("conceptnet", __name__)
