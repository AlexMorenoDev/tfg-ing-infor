from flask import Flask, render_template, request, jsonify, make_response
# from passlib.hash import sha256_crypt
from json_encoder import JSONEncoder
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from functools import wraps
import datetime
import json
import os
import jwt

app = Flask(__name__)
bcrypt = Bcrypt(app)
CORS(app)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

mongoRegistro = PyMongo(app, uri='mongodb+srv://'+ os.getenv('MONGO_USER') + ':' + os.getenv('MONGO_PASS') +'@cluster1-z5cwz.mongodb.net/registro?retryWrites=true&w=majority')
mongoContenido = PyMongo(app, uri='mongodb+srv://'+ os.getenv('MONGO_USER') + ':' + os.getenv('MONGO_PASS') +'@cluster1-z5cwz.mongodb.net/contenido?retryWrites=true&w=majority')

def token_required(f):
   @wraps(f)
   def decorated(*args, **kwargs):
      token = None
      if 'x-access-token' in request.headers:
         token = request.headers['x-access-token']

      if not token:
         return jsonify({'message': 'Token is missing'}), 401

      try:
         data = jwt.decode(token, app.config['SECRET_KEY'])
         current_inv = mongoRegistro.db.accepted_invs.find_one({'_id': data['public_id']})
      except:
         return jsonify({'message': 'Token is invalid!'}), 401

      return f(current_inv, *args, **kwargs)

   return decorated

@app.route("/register", methods=['GET', 'POST', 'OPTIONS'])
def register_view():
   if request.method == 'POST':
      data = json.loads(request.data)
      no_accepted_invs = mongoRegistro.db.no_accepted_invs.find({})
      if no_accepted_invs:
         for no_user in no_accepted_invs:
            if no_user.get('email') == data['email']:
               return jsonify("¡Ese email ya está en uso!")

      accepted_invs = mongoRegistro.db.accepted_invs.find({})
      if accepted_invs:
         for user in accepted_invs:
            if user.get('email') == data['email']:
               return jsonify("¡Ese email ya está en uso!")

      # passwordHash = sha256_crypt.hash(request.form['password'])
      mongoRegistro.db.no_accepted_invs.insert_one({'email': data['email'], 'username': data['username'], 'password': data['password'], 'date': datetime.datetime.now()})
      return jsonify("¡Te has registrado correctamente! Falta confirmación de un administrador para poder acceder a tu cuenta.")
   
   return jsonify('200 OK')

@app.route("/login")
def login_view():
   auth = request.authorization
   
   if not auth or not auth.get('username') or not auth.get('password'):
      return make_response('Incorrect authorization', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

   inv = mongoRegistro.db.accepted_invs.find_one({'email': auth.get('username')})
   
   if not inv:
      return make_response('Incorrect authorization', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

   if bcrypt.check_password_hash(inv.get('password'), auth.get('password')):
      token = jwt.encode({'public_id': JSONEncoder().encode(inv.get('_id')), 'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)}, app.config['SECRET_KEY'])
      return jsonify({'token': token.decode('UTF-8'), 'username': inv.get('username')})

   return make_response('Incorrect authorization', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

   # email = request.args.get('email')
   # inv = mongo.db.accepted_invs.find_one({'email': email})
   # if inv:
   #    return jsonify({'password': inv.get('password'), 'username': inv.get('username')})
   # else:
   #    return jsonify('noInvs')

@app.route("/file_upload", methods=['GET', 'POST'])
@token_required
def file_upload(current_inv):
   if request.method == 'POST':
      new_file = request.files['file']
      result = mongoContenido.db.fs.files.find_one({'filename': new_file.filename})
      if result is not None:
         return "Error - Name not valid"
      mongoContenido.save_file(new_file.filename, new_file)
      file_extension = os.path.splitext(new_file.filename)[1]
      mongoContenido.db.fs.files.update_one(
         {'filename': new_file.filename}, 
         {'$set': {
            'investigator': request.form['email'],
            'extension': file_extension
            }
         }
      )
      return "Everything OK!"
   
   return "200 OK"

@app.route("/get_my_files")
@token_required
def get_my_files(current_inv):
   email = request.args.get('email')
   files = list(mongoContenido.db.fs.files.find({'investigator': email}, {'_id': 0, 'md5': 0, 'chunkSize': 0, 'length':0}))
  
   if files:
      return jsonify(files)
   else:
      return jsonify('No files')

@app.route("/document/<filename>")
def document(filename):
   return mongoContenido.send_file(filename)

@app.route("/remove_file/<filename>")
@token_required
def remove_file(current_inv, filename):
   removing_file = mongoContenido.db.fs.files.find_one({'filename': filename})
   mongoContenido.db.fs.chunks.remove({'files_id': removing_file.get('_id')})
   mongoContenido.db.fs.files.remove({'filename': filename})

   return jsonify('Documento eliminado correctamente!')

@app.route("/update_file/<filename>", methods=['GET', 'POST'])
@token_required
def update_file(current_inv, filename):
   if request.method == 'POST':
      data = json.loads(request.data)
      file_extension = os.path.splitext(filename)[1]
      newName = data['newName'] + file_extension
      mongoContenido.db.fs.files.update_one(
         {'filename': filename}, 
         {'$set': {
            'filename': newName,
            'uploadDate': datetime.datetime.now()
            }
         }
      )
      return jsonify('Documento actualizado correctamente!')
   
   return '200 OK'

@app.route("/get_user_password")
@token_required
def get_user_password(current_inv):
   email = request.args.get('email')
   inv = mongoRegistro.db.accepted_invs.find_one({'email': email})
   return jsonify(inv.get('password'))

@app.route("/update_user_info", methods=['GET', 'POST'])
@token_required
def update_user_info(current_inv):
   if request.method == 'POST':
      data = json.loads(request.data)
      listUpdates = data['listUpdates']
      invToUpdate = mongoRegistro.db.accepted_invs.find_one({'email': listUpdates.get('actualEmail')})
      all_invs = mongoRegistro.db.accepted_invs.find({})
      updates = {}

      if (listUpdates.get('password') == ''):
         updates['password'] = invToUpdate.get('password')
      else:
         updates['password'] = listUpdates.get('password')

      if (listUpdates.get('newEmail') == ''):
         updates['email'] = invToUpdate.get('email')
      else:
         for i in all_invs:
            if (i.get('email') == listUpdates.get('newEmail')):
               return jsonify({'message': 'Ese email ya está en uso!'})
         updates['email'] = listUpdates.get('newEmail')
         mongoContenido.db.fs.files.update_many(
            {'investigator': listUpdates.get('actualEmail')}, 
            {'$set': {
               'investigator': updates['email']
               }
            }
         )

      if (listUpdates.get('username') == ''):
         updates['username'] = invToUpdate.get('username')
      else:
         updates['username'] = listUpdates.get('username')

      mongoRegistro.db.accepted_invs.update_one({'email': listUpdates.get('actualEmail')}, {"$set": {'email': updates['email'], 'username': updates['username'], 'password': updates['password']}})
      
      return jsonify({'message': 'Everything OK', 'username': updates['username'], 'email': updates['email']})
   
   return '200 OK'

if __name__ == "__main__": 
  app.run(host='0.0.0.0')