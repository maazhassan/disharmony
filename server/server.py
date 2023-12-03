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

def register_response_event(success):
    return json.dumps(["register_res", {"success": success}])

def channel_data_response_event(data):
    return json.dumps(["channel_data_res", {"data": data}])

def dm_data_response_event(data):
    return json.dumps(["dm_data_res", {"data": data}])

def friend_request_event(_from, to):
    return json.dumps(["friend_request_req", {"from": _from, "to": to}])

def get_channel_data(name):
    channel = db.channels.find_one({"name": name})
    messages = channel.get("messages")
    if not messages:
        messages = []
    return {
        "name": name,
        "users": channel["users"],
        "messages": messages
    }

def get_dm_convo_name(name1, name2):
    sorted_names = sorted([name1, name2])
    return sorted_names[0] + ";" + sorted_names[1]

# Generates the data object that a user gets upon login
def login_data_event(user: dict):
    # Get direct messages
    friends = user.get("friends")
    # direct_messages = []
    # if friends:
    #     for friend in friends:
    #         convo_string = user["username"] + ";" + friend
    #         convo = db.dm_convos.find_one({"convo": convo_string})
    #         if convo:
    #             direct_messages.append({
    #                 "friend": friend,
    #                 "messages": convo["messages"]
    #             })
    
    # Blocked users
    blocked_users = user.get("blocked")

    # Incoming friend requests
    friend_reqs = user.get("incoming_friend_reqs")

    # Users and their online status
    users_info = [{
        "username": _user["username"],
        "online": _user["online"]
    } for _user in db.users.find(projection=['username', 'online'])]

    # Channels the user is in
    if user["type"] == "ADMIN":
        channel_names = [c["name"] for c in db.channels.find(projection=['name'])]
    else:
        channel_names = user["channels"]

    # Channels and their messages
    # channels_cursor = (db.channels.find()
    #                    if user["type"] == "ADMIN"
    #                    else db.channels.find({"name": {"$in": user["channels"]}})
    #                    )
    # channels_info = [{
    #     "name": channel["name"],
    #     "users": channel["users"],
    #     "messages": channel.get("messages") if channel.get("messages") else []
    # } for channel in channels_cursor]

    # Serialize
    return json.dumps([
        "login_data",
        {
            "user_type": user["type"],
            "blocked_users": blocked_users if blocked_users else [],
            "friends": friends if friends else [],
            "friend_requests": friend_reqs if friend_reqs else [],
            "users": users_info,
            "channels": channel_names,
            "general_data": get_channel_data("General")
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
    print(f"{username} has logged in.")
    
    # Return data about state of application
    await websocket.send(login_data_event(user))
    return True

async def logout(username, websocket):
    # Update online status in DB
    db.users.update_one({"username": username}, {"$set": {"online": False}})

    # Remove info about this connection
    CLIENTS.pop(username)
    ADMIN_SET.discard(websocket)
    USER_SET.discard(websocket)
    print(f"{username} has logged out.")

    # Broadcast that this client is offline
    websockets.broadcast(CLIENTS.values(), user_update_event(username, False))

async def register(username, password, websocket):
    # Validate username
    if (not username) or (";" in username):
        await websocket.send(register_response_event(False))
        return
    
    # Get user from DB
    user = db.users.find_one({"username": username})

    # Only register if an account with this username doesn't exist
    if not user:
        # Insert entry into DB
        db.users.insert_one({
            "username": username,
            "password": password,
            "type": "USER",
            "online": False,
            "channels": ["General"]
        })

        print(f"User {username} created.")
        await websocket.send(register_response_event(True))

        # Tell all the clients a new user has registered
        websockets.broadcast(CLIENTS.values(), user_update_event(username, False))
    else:
        await websocket.send(register_response_event(False))
        

async def messages(websocket):
    username = ""

    async for message in websocket:
        req = json.loads(message)
        req_type = req[0]
        req_body = req[1]

        # The first request from a socket should always be either login or register
        if req_type == "login_req":
            if not (await login_res(req_body["username"], req_body["password"], websocket)):
                continue
            # Login was successful, store username for later
            username = req[1]["username"]
        elif req_type == "register_req":
            await register(req_body["username"], req_body["password"], websocket)
            continue

        # Ignore all requests other than login or register from unauthenticated sockets
        if not username:
            continue

        if req_type == "channel_data_req":
            channel_name = req_body["channel"]
            channel_data = get_channel_data(channel_name)
            await websocket.send(channel_data_response_event(channel_data))
            continue

        if req_type == "channel_message_req":
            # Add message to DB
            db.channels.update_one(
                {"name": req_body["channel"]}, 
                {"$push": {"messages": {
                    "from": req_body["from"],
                    "message": req_body["message"]
                }}}
            )

            # Broadcast the message to all online clients in the channel
            users_in_channel = db.channels.find_one({"name": req_body["channel"]}, ['users'])['users']
            out = [CLIENTS.get(name) for name in users_in_channel if CLIENTS.get(name)]
            websockets.broadcast(out, message)
            continue

        if req_type == "dm_data_req":
            convo_name = get_dm_convo_name(req_body["from"], req_body["friend"])
            convo_messages = db.dm_convos.find_one({"convo": convo_name}, ["messages"])["messages"]
            await websocket.send(dm_data_response_event(convo_messages))
            continue

        if req_type == "direct_message_req":
            convo_name = get_dm_convo_name(req_body["from"], req_body["to"])

            # Validate they are actually friends
            recipient_friends = db.users.find_one({"username": req_body["to"]}, ["friends"]).get("friends")
            if recipient_friends:
                if req_body["from"] not in recipient_friends:
                    continue


            # Add message to DB
            db.dm_convos.update_one(
                {"convo": convo_name}, 
                {"$push": {"messages": {
                    "from": req_body["from"],
                    "message": req_body["message"]
                }}}
            )

            # Broadcast the message to the two people involved
            out = [CLIENTS.get(name) for name in [req_body["from"], req_body["to"]] if CLIENTS.get(name)]
            websockets.broadcast(out, message)
            continue
        
        if req_type == "friend_request_req":
            # Check if the recipient has the sender blocked
            block_list = db.users.find_one({"username": req_body["to"]}, ["blocked"]).get("blocked")
            if block_list and (req_body["from"] in block_list):
                continue

            # User is not blocked at this point
            # Forward the request if recipient online, and store in DB
            recipient_sock = CLIENTS.get(req_body["to"])
            if recipient_sock:
                await recipient_sock.send(friend_request_event(req_body["from"], req_body["to"]))
            
            db.users.update_one(
                {"username": req_body["to"]}, 
                {"$push": {"incoming_friend_reqs": req_body["from"]}}
            )
    
    print("Connection closed.")
    # Logout if logged in
    if username:
        await logout(username, websocket)

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