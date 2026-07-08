"""MongoDB connection helper.

Reads credentials from environment variables (via .env, loaded with python-dotenv).
The .env file is not checked into source control - create it locally with:

MONGO_URI=<your connection string>
MONGO_DB_NAME=<your database name>
"""

import os

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

_client = None


def get_client():
    """Return a singleton MongoClient built from environment variables."""
    global _client
    if _client is None:
        _client = MongoClient(MONGO_URI)
    return _client


def get_db():
    """Return the configured database from the singleton client."""
    return get_client()[MONGO_DB_NAME]
