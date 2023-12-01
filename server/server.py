import asyncio
import websockets
import json
from pymongo import MongoClient

ADMIN_SET = set()
USER_SET = set()
CLIENTS = {}
db = MongoClient().disharmony

def error_event(type, message):
    return json.dumps([type, {"message": message}])

def user_update_event(username, online):
    return json.dumps(["user_update", {"username": username, "online": online}])

# Generates the data object that a user gets upon login
def login_data_event(user: dict):
    # Get direct messages
    direct_messages = []
    friends = user.get("friends")
    if friends:
        for friend in friends:
            convo_string = user["username"] + ";" + friend
            convo = db.dm_convos.find_one({"convo": convo_string})
            if convo:
                direct_messages.append({
                    "friend": friend,
                    "messages": convo["messages"]
                })
    
    # Blocked users
    blocked_users = user.get("blocked")

    # Incoming friend requests
    friend_reqs = user.get("incoming_friend_reqs")

    # Users and their online status
    users_info = [{
        "username": _user["username"],
        "online": _user["online"]
    } for _user in db.users.find(projection=['username', 'online'])]

    # Channels and their messages
    channels_cursor = (db.channels.find()
                       if user["type"] == "ADMIN"
                       else db.channels.find({"name": {"$in": user["channels"]}})
                       )
    channels_info = [{
        "name": channel["name"],
        "users": channel["users"],
        "messages": channel.get("messages") if channel.get("messages") else []
    } for channel in channels_cursor]

    # Serialize
    return json.dumps([
        "login_data",
        {
            "user_type": user["type"],
            "direct_messages": direct_messages,
            "blocked_users": blocked_users if blocked_users else [],
            "friends": friends if friends else [],
            "friend_requests": friend_reqs if friend_reqs else [],
            "users": users_info,
            "channels": channels_info
        }
    ])

async def login_res(username, password, websocket):
    # Get user from DB
    user = db.users.find_one({"username": username})

    # Check if account exists
    if not user:
        await websocket.send(error_event("login_err", "Username not found."))
        return False
    
    # Check if password matches DB
    db_pw = user["password"]
    if password != db_pw:
        await websocket.send(error_event("login_err", "Invalid password."))
        return False
    
    # Update online status in DB
    db.users.update_one({"username": username}, {"$set": {"online": True}})

    # Broadcast to the other clients that this client is online
    websockets.broadcast(CLIENTS.values(), user_update_event(username, True))

    # Store info about this connection
    CLIENTS[username] = websocket
    if user["type"] == "ADMIN":
        ADMIN_SET.add(websocket)
    else:
        USER_SET.add(websocket)
    
    # Return data about state of application
    await websocket.send(login_data_event(user))
    return True


# def register_event(id):
#     return json.dumps({"type": "register", "id": id})

# def users_event():
#     return json.dumps({"type": "users", "value": list(CLIENTS)})

async def messages(websocket):
    message = await websocket.recv()
    req = json.loads(message)
    req_type = req[0]

    # The first request from a socket should always be either login or register
    if req_type == "login_req":
        if not (await login_res(req[1]["username"], req[1]["password"], websocket)):
            return
    elif req_type == "register_req":
        return

    # At this point the socket is authenticated
    async for message in websocket:
        print("hi")
            

    #     # Check the name and register if unique
    #     name = ""
    #     name = await websocket.recv()
    #     name = json.loads(name)["name"]
    #     if (name in CLIENTS.keys()):
    #         await websocket.send(register_event(-2))
    #         print(f"Duplicate client {name}. Closing connection...")
    #         name = ""
    #         return
        
    #     print(f"Registering new client {name}.")
    #     CLIENTS[name] = websocket
    #     numClients += 1
    #     print(f"{numClients} clients online.")
    #     await websocket.send(register_event(currID))
    #     ready = await websocket.recv()
    #     ready = json.loads(ready)["ready"]
    #     if (ready):
    #         websockets.broadcast(CLIENTS.values(), users_event())
    #     currID += 1
        
    #     # Listen to incoming messages
    #     async for message in websocket:
    #         print(f"recieved message from {name}: {message}")
    #         out = [CLIENTS[name], CLIENTS[json.loads(message)["to"]]]
    #         websockets.broadcast(out, message)
    
    # except websockets.exceptions.ConnectionClosedOK:
    #     print("Connection closed without errors.")

    # except websockets.exceptions.ConnectionClosedError:
    #     print("Connection closed with an error.")
        
    # finally:
    #     if (name in CLIENTS.keys()):
    #         print(f"Client {name} has disconnected.")
    #         CLIENTS.pop(name)
    #         websockets.broadcast(CLIENTS.values(), users_event())
    #         numClients -= 1
    #     print(f"{numClients} clients online.")

async def main():
    async with websockets.serve(messages, "localhost", 8000):
        await asyncio.Future()  # run forever

asyncio.run(main())