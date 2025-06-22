import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate("./serviceAccountKey.json")

firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://programming-project-3-35e82-default-rtdb.asia-southeast1.firebasedatabase.app'
})

database = db.reference()
