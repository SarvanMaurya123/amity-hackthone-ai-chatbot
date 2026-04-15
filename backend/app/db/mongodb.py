from pymongo import ASCENDING, MongoClient
from pymongo.collection import Collection
from pymongo.database import Database

from app.core.config import settings

client: MongoClient | None = None
database: Database | None = None


def connect_to_mongo() -> None:
    global client, database
    client = MongoClient(settings.mongo_url)
    database = client[settings.mongo_db_name]


def close_mongo_connection() -> None:
    global client, database
    if client is not None:
        client.close()
    client = None
    database = None


def get_database() -> Database:
    if database is None:
        connect_to_mongo()
    if database is None:
        raise RuntimeError("MongoDB connection is not initialized")
    return database


def get_users_collection() -> Collection:
    return get_database()["users"]


def ensure_indexes() -> None:
    get_users_collection().create_index([("email", ASCENDING)], unique=True)
