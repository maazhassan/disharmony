# disharmony

## Deploying the Application

## Docker

The entire application comes packaged in a docker compose file. This is the easiest way to deploy the application and get up and running.

- With docker installed, simply navigate to the root directory of the project and run `docker compose up --build`
- Once the containers start up, the client will be available on `localhost:5173`.
- NOTE: for the image transfer messages to work correctly, use the local ipv4 address of your machine instead of localhost. This is because Imgur blocks API requests with `localhost` origins.
- The WebSocket server is exposed to localhost on port 8000
- The MongoDB database is exposed to localhost on port 27017

## Manual Deployment

### Running the Client
- `cd client`
- `npm i`
- `npm start`
- Client will be running on localhost:5173

### Running the Server
- `cd server`
- `pip install -r requirements.txt`
- `python server.py`
- Server will be running on ws://localhost:8000
### Running the Database
- Download the latest version of [MongoDB Community](https://www.mongodb.com/try/download/community) for your platform, if needed
- Also download the latest [mongosh](https://www.mongodb.com/try/download/shell) if needed, and add it to your PATH
- Start your MongoDB instance (by default it will be at mongodb://localhost:27017)
  - This step differs depending on how MongoDB is installed, see the [docs](https://www.mongodb.com/docs/manual/installation/)
- Navigate to the `docker-entrypoint-initdb.d` directory of the project, and run the `initTestData.js` script with `mongosh`
  - For example, with default MongoDB settings the command will be `mongosh --file initTestData.js`
  - This will initialize the database with some test data like users, channels, messages, etc.
