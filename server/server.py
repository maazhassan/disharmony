import asyncio
import websockets
import json
from pymongo import MongoClient
from pymongo.errors import DuplicateKeyError

ADMIN_SET = set()
USER_SET = set()
CLIENTS = {}
db = MongoClient("db", 27017).disharmony

def error_event(type, message):
    return json.dumps([type, {"message": message}])

def user_update_event(username, online, user_type):
    return json.dumps([
        "user_update",
        {
            "username": username,
            "online": online,
            "user_type": user_type
        }
    ])

def register_response_event(success):
    return json.dumps(["register_res", {"success": success}])

def channel_data_response_event(data):
    return json.dumps(["channel_data_res", {"data": data}])

def dm_data_response_event(data):
    return json.dumps(["dm_data_res", {"data": data}])

def friend_request_event(_from, to):
    return json.dumps(["friend_request_req", {"from": _from, "to": to}])

def leave_channel_event(_from, channel):
    return json.dumps(["leave_channel_req", {"from": _from, "channel": channel}])

def banned_users_response_event(data):
    return json.dumps(["banned_users_res", {"users": data}])

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
    # Friends
    friends = user.get("friends")
    
    # Blocked users
    blocked_users = user.get("blocked")

    # Incoming friend requests
    friend_reqs = user.get("incoming_friend_reqs")

    # Users and their online status
    users_info = [{
        "username": _user["username"],
        "online": _user["online"],
        "user_type": _user["type"]
    } for _user in db.users.find(projection=['username', 'online', 'type'])]

    # Channels the user is in
    if user["type"] == "ADMIN":
        channel_names = [c["name"] for c in db.channels.find(projection=['name'])]
    else:
        channel_names = user.get("channels") if user.get("channels") else []

    # Initial data if the user is in at least one channel
    if len(channel_names) == 0:
        initial_data = {"name": "none", "users": [], "messages": []}
    else:
        initial_data = get_channel_data(channel_names[0])

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
            "initial_data": initial_data
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
    websockets.broadcast(CLIENTS.values(), user_update_event(username, True, user["type"]))

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
    # Get the user_type from the DB
    logout_user_type = db.users.find_one({"username": username}, ["type"])["type"]

    # Update online status in DB
    db.users.update_one({"username": username}, {"$set": {"online": False}})

    # Remove info about this connection
    CLIENTS.pop(username)
    ADMIN_SET.discard(websocket)
    USER_SET.discard(websocket)
    print(f"{username} has logged out.")

    # Broadcast that this client is offline
    websockets.broadcast(CLIENTS.values(), user_update_event(username, False, logout_user_type))

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

        # Add to general channel users
        db.channels.update_one(
            {"name": "General"},
            {"$push": {"users": username}}
        )

        print(f"User {username} created.")
        await websocket.send(register_response_event(True))

        # Tell all the clients a new user has registered
        websockets.broadcast(CLIENTS.values(), user_update_event(username, False, "USER"))
    else:
        await websocket.send(register_response_event(False))

def remove_user_from_channel(user, channel):
    # Admins cannot leave channels
    leave_user = db.users.find_one({"username": user}, ["type"])
    if leave_user and leave_user["type"] == "ADMIN":
        return

    # Get the list of users in the channel if it exists
    leave_chan = db.channels.find_one({"name": channel}, ["users"])
    if not leave_chan:
        return
    
    leave_chan_users = leave_chan["users"]

    # Remove the channel from the user's channels list
    db.users.update_one(
        {"username": user},
        {"$pull": {"channels": channel}}
    )

    # Remove the user from the channel's user list
    db.channels.update_one(
        {"name": channel},
        {"$pull": {"users": user}}
    )

    # Broadcast the user leaving to everyone in the channel
    out = [CLIENTS.get(u) for u in leave_chan_users if CLIENTS.get(u)]
    websockets.broadcast(out, leave_channel_event(user, channel))
        

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
            
            # Validate that the user is actually in the channel
            if not db.channels.find_one({"name": req_body["channel"], "users": username}, ["users"]):
                continue

            channel_data = get_channel_data(channel_name)
            await websocket.send(channel_data_response_event(channel_data))
            continue

        if req_type == "channel_message_req":
            # Check if channel exists
            message_chan = db.channels.find_one({"name": req_body["channel"]})
            if not message_chan:
                continue

            # Check if user is actually in channel
            if username not in message_chan["users"]:
                continue

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
            convo_messages = db.dm_convos.find_one({"convo": convo_name}, ["messages"])
            if not convo_messages:
                convo_messages = []
            else:
                convo_messages = convo_messages["messages"]
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
                }}},
                upsert=True
            )

            # Broadcast the message to the two people involved
            out = [CLIENTS.get(name) for name in [req_body["from"], req_body["to"]] if CLIENTS.get(name)]
            websockets.broadcast(out, message)
            continue
        
        if req_type == "friend_request_req":
            # Check if user exists
            if not db.users.find_one({"username": req_body["to"]}):
                continue

            # Check if one person has the other blocked
            block_list = db.users.find_one({"username": req_body["to"]}, ["blocked"]).get("blocked")
            if block_list and (req_body["from"] in block_list):
                continue

            block_list = db.users.find_one({"username": req_body["from"]}, ["blocked"]).get("blocked")
            if block_list and (req_body["to"] in block_list):
                continue

            # Check if they are already friends
            friend_list = db.users.find_one({"username": req_body["to"]}, ["friends"]).get("friends")
            if friend_list and (req_body["from"] in friend_list):
                continue

            # Forward the request if recipient online, and store in DB
            recipient_sock = CLIENTS.get(req_body["to"])
            if recipient_sock:
                await recipient_sock.send(friend_request_event(req_body["from"], req_body["to"]))
            
            db.users.update_one(
                {"username": req_body["to"]}, 
                {"$push": {"incoming_friend_reqs": req_body["from"]}}
            )
            continue
        
        if req_type == "friend_request_res":
            # Remove incoming friend request
            db.users.update_one(
                {"username": req_body["from"]}, 
                {"$pull": {"incoming_friend_reqs": req_body["to"]}}
            )

            # Check if user is blocked
            block_list = db.users.find_one({"username": req_body["to"]}, ["blocked"]).get("blocked")
            if block_list and (req_body["from"] in block_list):
                continue

            if req_body["accepted"]:
                # Add friends in the DB
                db.users.update_one(
                    {"username": req_body["to"]}, 
                    {"$push": {"friends": req_body["from"]}}
                )
                db.users.update_one(
                    {"username": req_body["from"]}, 
                    {"$push": {"friends": req_body["to"]}}
                )

                # Broadcast result to both clients if online
                out = [CLIENTS.get(name) for name in [req_body["from"], req_body["to"]] if CLIENTS.get(name)]
                websockets.broadcast(out, message)
            continue
        
        if req_type == "remove_friend":
            # Remove from DB
            db.users.update_one(
                {"username": req_body["user1"]}, 
                {"$pull": {"friends": req_body["user2"]}}
            )
            db.users.update_one(
                {"username": req_body["user2"]}, 
                {"$pull": {"friends": req_body["user1"]}}
            )

            # Broadcast message to both clients if online
            out = [CLIENTS.get(name) for name in [req_body["user1"], req_body["user2"]] if CLIENTS.get(name)]
            websockets.broadcast(out, message)
            continue

        if req_type == "block_req":
            # Remove incoming friend requests from blocked person
            db.users.update_one(
                {"username": req_body["from"]}, 
                {"$pull": {"incoming_friend_reqs": req_body["to"]}}
            )

            # Add user to blocked list
            db.users.update_one(
                {"username": req_body["from"]},
                {"$addToSet": {"blocked": req_body["to"]}}
            )
            continue
        
        if req_type == "unblock_req":
            # Remove user from blocked list
            db.users.update_one(
                {"username": req_body["from"]},
                {"$pull": {"blocked": req_body["to"]}}
            )
            continue

        if req_type == "create_channel_req":
            # Only authenticated admins can make this type of request
            if websocket not in ADMIN_SET:
                continue

            admins_list = [user["username"] for user in db.users.find({"type": "ADMIN"}, ["username"])]

            # Try adding the channel to the DB
            try:
                db.channels.insert_one({
                    "name": req_body["name"],
                    "users": admins_list
                })
            except DuplicateKeyError:
                continue

            # Broadcast to all admins
            websockets.broadcast(ADMIN_SET, message)
            continue

        if req_type == "delete_channel_req":
            # Only for admins
            if websocket not in ADMIN_SET:
                continue

            # General channel cannot be deleted
            if req_body["name"] == "General":
                continue

            # Get the list of users in the channel if it exists
            del_chan = db.channels.find_one({"name": req_body["name"]}, ["users"])
            if not del_chan:
                continue
            
            del_chan_users = del_chan["users"]

            # Remove the channel from the channels list for all users
            db.users.update_many(
                {"type": {"$ne": "ADMIN"}},
                {"$pull": {"channels": req_body["name"]}}
            )

            # Remove the channel from the DB
            db.channels.delete_one({"name": req_body["name"]})

            # Broadcast the deletion to everyone who was in the channel
            out = [CLIENTS.get(u) for u in del_chan_users if CLIENTS.get(u)]
            websockets.broadcast(out, message)
            continue

        if req_type == "join_channel_req":
            # Check if channel exists
            join_chan = db.channels.find_one({"name": req_body["channel"]})
            if not join_chan:
                continue

            # Make sure user isn't already in the channel
            if username in join_chan["users"]:
                continue

            # Check if user is banned
            if join_chan.get("banned") and username in join_chan["banned"]:
                continue

            # Add user to channel in DB
            db.channels.update_one(
                {"name": req_body["channel"]},
                {"$push": {"users": username}}
            )
            db.users.update_one(
                {"username": username},
                {"$push": {"channels": req_body["channel"]}}
            )

            # Broadcast the user joining to everyone who is in the channel
            out = [CLIENTS.get(u) for u in join_chan["users"] if CLIENTS.get(u)]
            out.append(websocket)
            websockets.broadcast(out, message)
            continue

        if req_type == "leave_channel_req":
            remove_user_from_channel(username, req_body["channel"])
            continue

        if req_type == "kick_req":
            if websocket not in ADMIN_SET:
                continue
            
            remove_user_from_channel(req_body["user"], req_body["channel"])
            continue

        if req_type == "ban_req":
            if websocket not in ADMIN_SET:
                continue
            
            remove_user_from_channel(req_body["user"], req_body["channel"])

            # Add user to channel's banned list
            db.channels.update_one(
                {"name": req_body["channel"]},
                {"$push": {"banned": req_body["user"]}}
            )
            continue
        
        if req_type == "unban_req":
            if websocket not in ADMIN_SET:
                continue
            
            # Remove user from channel's banned list
            db.channels.update_one(
                {"name": req_body["channel"]},
                {"$pull": {"banned": req_body["user"]}}
            )
            continue

        if req_type == "banned_users_req":
            if websocket not in ADMIN_SET:
                continue
            
            b_chan = db.channels.find_one({"name": req_body["channel"]}, ["banned"])
            if b_chan and b_chan.get("banned"):
                banned_users = b_chan.get("banned")
            else:
                banned_users = []

            await websocket.send(banned_users_response_event(banned_users))
            continue
    
    print("Connection closed.")
    # Logout if logged in
    if username:
        await logout(username, websocket)

async def main():
    async with websockets.serve(messages, "0.0.0.0", 8000):
        await asyncio.Future()  # run forever

asyncio.run(main())