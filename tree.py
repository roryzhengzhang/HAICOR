from __future__ import annotations

import json


def is_leaf(content: dict) -> bool:
    return "children" not in content.keys()


def cleanup(content: dict) -> dict:
    if is_leaf(content):
        return {"name": content["name"]}

    return {"name": content["name"],
            "children": [cleanup(i) for i in content["children"]]}
