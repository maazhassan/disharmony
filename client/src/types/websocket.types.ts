export type LoginRequest = [
  "login_req",
  {
    username: string,
    password: string
  }
];

export type User = {
  username: string,
  online: boolean
}

export type LoginData = [
  "login_data",
  {
    user_type: string,
    direct_messages: {
      friend: string,
      messages: MessageBase[]
    }[],
    blocked_users: string[],
    friends: string[],
    friend_requests: string[],
    users: User[],
    channels: {
      name: string,
      users: string[],
      messages: MessageBase[]
    }[]
  }
];

export type LoginError = [
  "login_err",
  {
    message: string
  }
];

export type LoginResponse = LoginData | LoginError;

export type UserUpdate = [
  "user_update",
  User
]

export type RegisterRequest = [
  "register_req",
  {
    username: string,
    password: string,
  }
];

export type MessageBase = {
  from: string,
  message: string
}

export type DirectMessage = MessageBase & {to: string}

export type ChannelMessage = MessageBase & {channel: string}

export type DirectMessageRequest = [
  "direct_message_req",
  DirectMessage
];

export type ChannelMessageRequest = [
  "channel_message_req",
  ChannelMessage
];

export type CreateChannelRequest = [
  "create_channel_req",
  {
    name: string
  }
];

export type FriendRequest = [
  "friend_request_req",
  {
    from: string,
    to: string
  }
];

export type FriendRequestResponse = [
  "friend_request_res",
  {
    from: string,
    to: string,
    accepted: boolean
  }
];

export type KickRequest = [
  "kick_req",
  {
    user: string,
    channel:string
  }
];

export type BanRequest = [
  "ban_req",
  {
    user: string,
    channel: string
  }
];

export type BlockRequest = [
  "block_req",
  {
    from: string,
    to: string
  }
];

export type UnblockRequest = [
  "unblock_req",
  {
    from: string,
    to: string
  }
];