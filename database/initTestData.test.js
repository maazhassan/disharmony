const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let mongoClient;
let db;

beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  mongoClient = new MongoClient(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  await mongoClient.connect();
  db = mongoClient.db('disharmony');
});

afterAll(async () => {
  await mongoClient.close();
  await mongoServer.stop();
});

describe('MongoDB Setup', () => {
  test('should insert documents into users collection', async () => {
    // Insert documents into the users collection
    const usersCollection = db.collection('users');
    await usersCollection.insertMany([
      // ... (insert documents as in your original code)
    ]);

    // Check if documents are inserted successfully
    const usersCount = await usersCollection.countDocuments();
    expect(usersCount).toBeGreaterThan(0);
  });

  test('should create an index on the username field in the users collection', async () => {
    // Create an index on the username field in the users collection
    const usersCollection = db.collection('users');
    const indexes = await usersCollection.indexes();
    
    // Check if the index is created successfully
    const indexExists = indexes.some(index => index.key.username === 1);
    expect(indexExists).toBe(true);
  });

  test('should insert documents into channels collection', async () => {
    // Insert documents into the channels collection
    const channelsCollection = db.collection('channels');
    await channelsCollection.insertMany([
      // ... (insert documents as in your original code)
    ]);

    // Check if documents are inserted successfully
    const channelsCount = await channelsCollection.countDocuments();
    expect(channelsCount).toBeGreaterThan(0);
  });

  test('should create an index on the name field in the channels collection', async () => {
    // Create an index on the name field in the channels collection
    const channelsCollection = db.collection('channels');
    const indexes = await channelsCollection.indexes();
    
    // Check if the index is created successfully
    const indexExists = indexes.some(index => index.key.name === 1);
    expect(indexExists).toBe(true);
  });

  test('should insert a document into dm_convos collection', async () => {
    // Insert a document into the dm_convos collection
    const dmConvosCollection = db.collection('dm_convos');
    await dmConvosCollection.insertOne({
      // ... (insert document as in your original code)
    });

    // Check if the document is inserted successfully
    const dmConvosCount = await dmConvosCollection.countDocuments();
    expect(dmConvosCount).toBeGreaterThan(0);
  });
});
