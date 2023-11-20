import asyncio
import websockets
import json

CLIENTS = {}
numClients = 0
currID = 0

def register_event(id):
    return json.dumps({"type": "register", "id": id})

def users_event():
    return json.dumps({"type": "users", "value": list(CLIENTS)})

async def messages(websocket):
    global CLIENTS, numClients, currID
    print("A client has connected. Waiting for name...")
    try:
        # Check the name and register if unique
        name = ""
        name = await websocket.recv()
        name = json.loads(name)["name"]
        if (name in CLIENTS.keys()):
            await websocket.send(register_event(-2))
            print(f"Duplicate client {name}. Closing connection...")
            name = ""
            return
        
        print(f"Registering new client {name}.")
        CLIENTS[name] = websocket
        numClients += 1
        print(f"{numClients} clients online.")
        await websocket.send(register_event(currID))
        ready = await websocket.recv()
        ready = json.loads(ready)["ready"]
        if (ready):
            websockets.broadcast(CLIENTS.values(), users_event())
        currID += 1
        
        # Listen to incoming messages
        async for message in websocket:
            print(f"recieved message from {name}: {message}")
            out = [CLIENTS[name], CLIENTS[json.loads(message)["to"]]]
            websockets.broadcast(out, message)
    
    except websockets.exceptions.ConnectionClosedOK:
        print("Connection closed without errors.")

    except websockets.exceptions.ConnectionClosedError:
        print("Connection closed with an error.")
        
    finally:
        if (name in CLIENTS.keys()):
            print(f"Client {name} has disconnected.")
            CLIENTS.pop(name)
            websockets.broadcast(CLIENTS.values(), users_event())
            numClients -= 1
        print(f"{numClients} clients online.")

async def main():
    async with websockets.serve(messages, "localhost", 8000):
        await asyncio.Future()  # run forever

asyncio.run(main())