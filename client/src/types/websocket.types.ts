export type LoginRequest = [
  "login_req",
  {
    username: string,
    password: string
  }
];

export type LoginResponse = [
  "login_res",
  {
    user_type: string,
    direct_messages: DirectMessage[],
    channel_messages: ChannelMessage[],
    blocked_users: string[],
    friends: string[],
    friend_requests: string[]
  }
];

export type RegisterRequest = [
  "register_req",
  {
    username: string,
    password: string,
  }
];

export type DirectMessage = {
  from: string,
  to: string,
  message: string,
  timestamp: string
};

export type ChannelMessage = {
  from: string,
  channel: string,
  message: string,
  timestamp: string
}

export type DirectMessageRequest = [
  "direct_message_req",
  DirectMessage
];

export type ChannelMessageRequest = [
  "channel_message_req",
  ChannelMessage
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
]

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
    user1: string,
    user2: string
  }
];

export type ErrorRes = [
  "error",
  {
    message: string
  }
];