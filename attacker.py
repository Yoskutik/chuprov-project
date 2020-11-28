import requests
import random
import json


def post(url, data=None):
    return requests.post(
        f'http://127.0.0.1:69{url}',
        data=json.dumps(data) if data else None,
        headers={
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Content-Encoding': 'utf-8',
        }
    )


res = post('/api/v1/get_users')
tokens = res.json()


def create_data():
    return {
        'x': random.random() * 100,
        'y': random.random() * 100,
        'token': tokens[random.randint(0, len(tokens) - 1)],
        'service': 'Скорая',
    }


print(post('/api/v1/find', create_data()).text)
print(post('/api/v1/find', create_data()).text)
print(post('/api/v1/find', create_data()).text)
