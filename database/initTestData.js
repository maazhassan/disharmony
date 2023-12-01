db = new Mongo().getDB("disharmony");

db.users.insertMany([
  {
    username: 'Admin',
    password: 'adminpass',
    type: 'ADMIN',
    online: false
  },
  {
    username: 'John',
    password: 'johnpass',
    type: 'USER',
    online: false,
    channels: ['General', 'Another One'],
    friends: ['Carol']
  },
  {
    username: 'Carol',
    password: 'carolpass',
    type: 'USER',
    online: false,
    channels: ['General', 'Another One'],
    friends: ['John']
  },
  {
    username: 'Santa',
    password: 'santapass',
    type: 'USER',
    online: false,
    channels: ['General'],
    incoming_friend_reqs: ['Adele'],
    blocked: ['John']
  },
  {
    username: 'Adele',
    password: 'adelepass',
    type: 'USER',
    online: false,
    channels: ['General'],
    banned_channels: ['Another One']
  }
]);

db.users.createIndex({username: 1}, {unique: true});

db.channels.insertMany([
  {
    name: 'General',
    messages: [
      {
        from: 'Santa',
        message: "Merry Christmas!"
      },
      {
        from: 'John',
        message: "You too Santa!"
      },
      {
        from: 'Adele',
        message: "Rolling in the deeeeeeeeeeep"
      }
    ],
    users: ['Admin', 'John', 'Carol', 'Santa', 'Adele']
  },
  {
    name: 'Another One',
    messages: [
      {
        from: 'John',
        message: "It's pretty empty here..."
      }
    ],
    users: ['Admin', 'John', 'Carol']
  },
  {
    name: 'Another One Part 2',
    users: ['Admin']
  }
]);

db.dm_convos.insertOne([
  {
    convo: 'John;Carol',
    messages: [
      {
        from: 'John',
        message: "Hi Carol!"
      },
      {
        from: 'Carol',
        message: "Hi John!"
      }
    ]
  }
]);