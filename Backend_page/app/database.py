import mysql.connector

def get_db_connection(db_name="event_db"):
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="sriramk@2003",
        database=db_name
    )
