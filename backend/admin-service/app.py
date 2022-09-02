from flask import Flask, render_template, request, jsonify, make_response
from email.message import EmailMessage
from json_encoder import JSONEncoder
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from functools import wraps
import datetime
import smtplib
import random
import string
import json
import jwt
import os

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
         current_admin = mongoRegistro.db.admins.find_one({'_id': data['public_id']})
      except:
         return jsonify({'message': 'Token is invalid!'}), 401

      return f(current_admin, *args, **kwargs)

   return decorated

@app.route("/admin")
def admin_view():
  auth = request.authorization
   
  if not auth or not auth.get('username') or not auth.get('password'):
    return make_response('Incorrect authorization', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

  admin = mongoRegistro.db.admins.find_one({'email': auth.get('username')})
  
  if not admin:
    return make_response('Incorrect authorization', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

  if bcrypt.check_password_hash(admin.get('password'), auth.get('password')):
    token = jwt.encode({'public_id': JSONEncoder().encode(admin.get('_id')), 'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=30)}, app.config['SECRET_KEY'])
    key = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(6))
    hashedKey = bcrypt.generate_password_hash(key)
  
    s = smtplib.SMTP('smtp.gmail.com', 587) 
    s.starttls() 
    s.login(os.getenv('GMAIL_EMAIL'), os.getenv('GMAIL_PASS')) 
    msg = prepareEmailAdminLogIn('./code_email.txt', auth.get('username'), key)
    s.send_message(msg) 
    s.quit() 

    return jsonify({'token': token.decode('UTF-8'), 'username': admin.get('username'), 'code': hashedKey.decode('UTF-8')})

  return make_response('Incorrect authorization', 401, {'WWW-Authenticate': 'Basic realm="Login required!"'})

@app.route("/admin/get_noaccepted_invs")
@token_required
def admin_accept_view(current_admin):
  no_accepted_invs = list(mongoRegistro.db.no_accepted_invs.find({}, {'_id': 0}))
  if no_accepted_invs:
    return jsonify(no_accepted_invs)
  else:
    return jsonify('noInvs')

@app.route("/admin/accept_inv", methods=['GET', 'POST'])
@token_required
def admin_accept_inv(current_admin):
  if request.method == 'POST':
    data = json.loads(request.data)
    query = {'email': data['email']}
    inv_accepted = mongoRegistro.db.no_accepted_invs.find_one(query)
    
    insert_result = mongoRegistro.db.accepted_invs.insert_one({
      'email': inv_accepted['email'],
      'username': inv_accepted['username'],
      'password': inv_accepted['password']
    })
    
    if insert_result.acknowledged == False:
      return jsonify('An error occurred when inserting document')

    delete_result = mongoRegistro.db.no_accepted_invs.delete_one(query)

    if delete_result.acknowledged == False:
      return jsonify('An error occurred when deleting document')

    # sendEmail('./accept_email.txt', data['email'])

    return jsonify('Everything OK')

  return jsonify('200 OK')
  
@app.route("/admin/reject_inv", methods=['GET', 'POST'])
@token_required
def admin_reject_inv(current_admin):
  if request.method == 'POST':
    data = json.loads(request.data)
    delete_result = mongoRegistro.db.no_accepted_invs.delete_one({'email': data['email']})

    if delete_result.acknowledged == False:
      return jsonify('An error occurred when deleting document')

    # sendEmail('./reject_email.txt', data['email'])

    return jsonify('Everything OK')

  return jsonify('200 OK')

def prepareEmail(textfile, receiverEmail):
  with open(textfile, encoding='utf-8') as fp:
    msg = EmailMessage()
    msg.set_content(fp.read())

  msg['Subject'] = 'Creación de nueva cuenta'
  msg['From'] = '<sender_email>'
  msg['To'] = receiverEmail

  return msg

def sendEmail(filename, email):
  s = smtplib.SMTP('smtp.gmail.com', 587) 
  s.starttls() 
  s.login(os.getenv('GMAIL_EMAIL'), os.getenv('GMAIL_PASS'))
  msg = prepareEmail(filename, email)
  s.send_message(msg) 
  s.quit() 

def prepareEmailAdminLogIn(textfile, receiverEmail, key):
  with open(textfile, encoding='utf-8') as fp:
    msg = EmailMessage()
    msg.set_content(fp.read() + key)

  msg['Subject'] = 'Iniciar sesión'
  msg['From'] = os.getenv('GMAIL_EMAIL')
  msg['To'] = receiverEmail

  return msg 

@app.route("/admin/get_all_content")
@token_required
def get_all_content(current_admin):
  content = []
  all_invs = mongoRegistro.db.accepted_invs.find({}, {'_id': 0})
  
  for inv in all_invs:
    content.append({
      'email': inv.get('email'),
      'username': inv.get('username'),
      'files': list(mongoContenido.db.fs.files.find({'investigator': inv.get('email')}, {'_id': 0, 'md5': 0, 'chunkSize': 0, 'length':0}))
      }
    )

  if content:
    return jsonify(content)
  else:
    return jsonify('No content')

@app.route("/document/<filename>")
def document(filename):
   return mongoContenido.send_file(filename)

@app.route("/admin/removeFile/<filename>", methods=['GET', 'POST'])
@token_required
def removeFile(current_admin, filename):
  if request.method == 'POST':
    removing_file = mongoContenido.db.fs.files.find_one({'filename': filename})
    mongoContenido.db.fs.chunks.remove({'files_id': removing_file.get('_id')})
    mongoContenido.db.fs.files.remove({'filename': filename})

    return jsonify('Documento eliminado correctamente!')

  return '200 OK'

@app.route("/admin/removeInv", methods=['GET', 'POST'])
@token_required
def removeInv(current_admin):
  if request.method == 'POST':
    data = json.loads(request.data)
    inv_files = mongoContenido.db.fs.files.find({'investigator': data['email']})
    
    if inv_files:
      for f in inv_files:
        mongoContenido.db.fs.chunks.remove({'files_id': f.get('_id')})
        mongoContenido.db.fs.files.remove({'filename': f.get('filename')})
    
    mongoRegistro.db.accepted_invs.delete_one({'email': data['email']})

    return jsonify('Investigador eleminado correctamente!')
  
  return '200 OK'

if __name__ == "__main__": 
  app.run(host='0.0.0.0')