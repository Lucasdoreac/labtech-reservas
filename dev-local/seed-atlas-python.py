#!/usr/bin/env python3
"""
Copia o catalogo do UDF do Mongo local para o MongoDB Atlas via pymongo.
Colecoes copiadas: campus, rooms, courses, disciplines, teachers, offers, periods, types.
"""
import os
import sys
from pymongo import MongoClient

LOCAL_URI = os.getenv("LOCAL_MONGO_URI", "mongodb://mongo:27017/")
DB_NAME = "rooms-reservation-app"

ATLAS_URI = sys.argv[1] if len(sys.argv) > 1 else None

if not ATLAS_URI:
    print("Uso: python3 seed-atlas-python.py '<ATLAS_MONGO_URI>'")
    sys.exit(1)

print(f"Conectando ao MongoDB local ({LOCAL_URI})...")
local_client = MongoClient(LOCAL_URI, serverSelectionTimeoutMS=5000)
local_db = local_client[DB_NAME]

print(f"Conectando ao MongoDB Atlas...")
atlas_client = MongoClient(ATLAS_URI, serverSelectionTimeoutMS=10000)
atlas_db = atlas_client[DB_NAME]

COLLECTIONS = [
    "campus",
    "rooms",
    "courses",
    "disciplines",
    "teachers",
    "offers",
    "periods",
    "types"
]

total_docs = 0
for col_name in COLLECTIONS:
    local_col = local_db[col_name]
    atlas_col = atlas_db[col_name]
    
    docs = list(local_col.find({}))
    count = len(docs)
    
    if count > 0:
        atlas_col.delete_many({})
        atlas_col.insert_many(docs)
        print(f"  ✅ {col_name}: {count} documentos migrados.")
        total_docs += count
    else:
        print(f"  ⚠️ {col_name}: vazio no local.")

print(f"\n🎉 Sucesso absoluto! Total de {total_docs} documentos carregados no MongoDB Atlas.")
