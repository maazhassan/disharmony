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

export type ChannelData = {
  name: string,
  users: string[],
  messages: MessageBase[]
}

export type LoginData = [
  "login_data",
  {
    user_type: string,
    blocked_users: string[],
    friends: string[],
    friend_requests: string[],
    users: User[],
    channels: string[],
    general_data: ChannelData
  }
];

export type ChannelDataRequest = [
  "channel_data_req",
  {
    channel: string
  }
];

export type ChannelDataResponse = [
  "channel_data_res",
  {
    data: ChannelData
  }
];

export type DirectMessageDataRequest = [
  "dm_data_req",
  {
    from: string,
    friend: string
  }
];

export type DirectMessageDataResponse = [
  "dm_data_res",
  {
    data: MessageBase[]
  }
]

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

export type RegisterResponse = [
  "register_res",
  {
    success: boolean
  }
]

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

export type JoinChannelRequest = [
  "join_channel_req",
  {
    user: string,
    channel: string
  }
]

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

export type MainSocketEvents = 
  ChannelDataResponse | 
  ChannelMessageRequest |
  UserUpdate |
  DirectMessageDataResponse |
  DirectMessageRequest;