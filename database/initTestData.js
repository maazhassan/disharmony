db = new Mongo().getDB("disharmony");

db.users.insertMany([
  {
    username: 'Admin',
    password: 'adminpass',
    type: 'ADMIN',
    online: false
  },
  {
    username: 'OtherAdmin',
    password: 'admin2pass',
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
    users: ['Admin', 'OtherAdmin', 'John', 'Carol', 'Santa', 'Adele']
  },
  {
    name: 'Another One',
    messages: [
      {
        from: 'John',
        message: "It's pretty empty here..."
      }
    ],
    users: ['Admin', 'OtherAdmin', 'John', 'Carol']
  },
  {
    name: 'Another One Part 2',
    users: ['Admin', 'OtherAdmin']
  }
]);

db.channels.createIndex({name: 1}, {unique: true});

db.dm_convos.insertOne({
  convo: 'Carol;John',
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
});