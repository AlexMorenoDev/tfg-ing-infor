from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
import datetime
import json
import os

app = Flask(__name__)
CORS(app)

mongoContenido = PyMongo(app, uri='mongodb+srv://'+ os.getenv('MONGO_USER') + ':' + os.getenv('MONGO_PASS') +'@cluster1-z5cwz.mongodb.net/contenido?retryWrites=true&w=majority')

@app.route("/documents")
def documents():
   files = list(mongoContenido.db.fs.files.find({}, {'_id': 0, 'md5': 0, 'chunkSize': 0, 'length':0}))
  
   if files:
      return jsonify(files)
   else:
      return jsonify('No files')

@app.route("/document/<filename>")
def document(filename):
   return mongoContenido.send_file(filename)

if __name__ == "__main__": 
  app.run(host='0.0.0.0')