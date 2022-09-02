# Fuente: https://stackoverflow.com/a/16586277
import json
from bson import ObjectId

class JSONEncoder(json.JSONEncoder):
    def default(self, o):   # pylint: disable=E0202
        if isinstance(o, ObjectId):
            return str(o)
        return json.JSONEncoder.default(self, o)