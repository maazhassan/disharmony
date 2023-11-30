# disharmony

## Running the Client
- `cd client`
- `npm i`
- `npm start`
- Client will be running on localhost:5173

## Running the Server
- `cd server`
- `pip install websockets`
- `python server.py`
- Server will be running on localhost:8000

## Running the Database
- Download the latest version of [MongoDB Community](https://www.mongodb.com/try/download/community) for your platform, if needed
- Also download the latest [mongosh](https://www.mongodb.com/try/download/shell) if needed, and add it to your PATH
- Start your MongoDB instance (by default it will be at mongodb://localhost:27017)
  - This step differs depending on how MongoDB is installed, see the [docs](https://www.mongodb.com/docs/manual/installation/)
- Navigate to the `database` directory of the project, and run the `initTestData.js` script with `mongosh`
  - For example, with default MongoDB settings the command will be `mongosh --file initTestData.js`
  - This will initialize the database with some test data like users, channels, messages, etc.
