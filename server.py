from fastapi import FastAPI, HTTPException, Response, Request
from pydantic import BaseModel
from termcolor import colored
import pandas as pd
import datetime
import sqlite3
import time
import re

db = sqlite3.connect('database.db')
services = pd.read_sql('SELECT * FROM services', db, index_col='id')
ips = {}

app = FastAPI()


class FindRequest(BaseModel):
    ip: str
    token: str
    service: str
    x: float
    y: float


def log(level: str, message: str):
    if level == 'INFO':
        level = colored(level, 'blue')
    elif level == 'WARN':
        level = colored(level, 'yellow')
    elif level == 'ERROR':
        level = colored(level, 'red')
    print(f'[{datetime.datetime.now().strftime("%H:%M:%S")}] {level:6}: {message}')


@app.post('/api/v1/find')
async def find(user_request: FindRequest):
    if not re.match(r'^[a-z0-9]{64}$', user_request.token):
        log('WARN', f'Possible injection: SELECT * FROM users WHERE hash = "{user_request.token}"')
        raise HTTPException(400, 'incorrect token')
    if user_request.ip in ips and time.time() - ips[user_request.ip] < 150:
        raise HTTPException(400, 'wait a little bit')
    else:
        ips[user_request.ip] = time.time()
    user = db.execute(f'SELECT * FROM users WHERE hash = "{user_request.token}"').fetchone()
    if not user:
        raise HTTPException(400, 'user not found')
    distances = services.loc[:, ['x', 'y']] - [user_request.x, user_request.y]
    distances = distances.x ** 2 + distances.y ** 2
    distances = distances[services.type == user_request.service].sort_values()
    best_services = services.loc[distances.index]
    filled_percentage = best_services.occupied / best_services.capacity
    for cap in [0.8, 0.9, 1]:
        for i in filled_percentage.index:
            if filled_percentage[i] < cap:
                services.loc[i, 'occupied'] += 1
                db.execute(f'UPDATE services SET occupied = {services.loc[i, "occupied"]} WHERE id = {i}')
                log('WARN', f'Directing {user[0]} {user[1]} to ({services.loc[i, "x"]}, {services.loc[i, "y"]})')
                return {
                    'service_id': i,
                    'x': services.loc[i, 'x'],
                    'y': services.loc[i, 'y'],
                }
    raise HTTPException(400, 'service not found')


@app.post('/api/v1/quit/{id}')
async def user_quit(id: int):
    try:
        if services.loc[id, 'occupied'] > 0:
            services.loc[id, 'occupied'] -= 1
            db.execute(f'UPDATE services SET occupied = {services.loc[id, "occupied"]} WHERE id = {id}')
            return Response(status_code=200)
        raise HTTPException(400, 'service is empty')
    except:
        raise HTTPException(400, 'something went wrong')


@app.post('/api/v1/get_occupancy')
async def get_occupancy(request: Request):
    print(request.user.host)
    return (services.occupied / services.capacity).mean()


@app.post('/api/v1/get_users')
async def get_users():
    tokens = db.execute('SELECT hash FROM users').fetchall()
    return [x[0] for x in tokens]


@app.post('/api/v1/get_services')
async def get_services():
    return list(services.to_dict('index').values())
