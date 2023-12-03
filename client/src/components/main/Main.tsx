import { useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import MessageWindow from "./messagewindow/MessageWindow";
import UserList from "./rightbar/UserList";
import { useAppData } from "../App";
import "./main.css";
import TextChannels from "./leftbar/TextChannels";
import { BlockRequest, ChannelDataRequest, ChannelDataResponse, ChannelMessageRequest, CreateChannelRequest, DeleteChannelRequest, DirectMessageDataRequest, DirectMessageDataResponse, DirectMessageRequest, FriendRequest, FriendRequestResponse, MainSocketEvents, MessageBase, RemoveFriend, UnblockRequest, UserUpdate } from "../../types/websocket.types";
import Friends from "./leftbar/Friends";
import Header from "./topbar/Header";

const Main = () => {
  const { username, loginData } = useAppData();
  const data = loginData[1];
  const USER_TYPE = data.user_type;

  const [selectedChannel, setSelectedChannel] = useState("General");
  const [selectedChannelUsers, setSelectedChannelUsers] = useState(data.general_data.users);
  const [selectedChannelMessages, setSelectedChannelMessages] = useState(data.general_data.messages);
  const [selectedFriend, setSelectedFriend] = useState("");
  const [selectedFriendMessages, setSelectedFriendMessages] = useState<MessageBase[]>([]);
  const [blockedUsers, setBlockedUsers] = useState(data.blocked_users);
  const [friends, setFriends] = useState(data.friends);
  const [friendRequests, setFriendRequests] = useState(data.friend_requests);
  const [users, setUsers] = useState(data.users);
  const [channels, setChannels] = useState(data.channels);

  const isChannelData = (event: MainSocketEvents): event is ChannelDataResponse => event[0] === "channel_data_res";
  const isChannelMessage = (event: MainSocketEvents): event is ChannelMessageRequest => event[0] === "channel_message_req";
  const isUserUpdate = (event: MainSocketEvents): event is UserUpdate => event[0] === "user_update";
  const isDMData = (event: MainSocketEvents): event is DirectMessageDataResponse => event[0] === "dm_data_res";
  const isDMMessage = (event: MainSocketEvents): event is DirectMessageRequest => event[0] === "direct_message_req";
  const isFriendReq = (event: MainSocketEvents): event is FriendRequest => event[0] === "friend_request_req";
  const isFriendReqRes = (event: MainSocketEvents): event is FriendRequestResponse => event[0] === "friend_request_res";
  const isRemoveFriend = (event: MainSocketEvents): event is RemoveFriend => event[0] === "remove_friend";
  const isCreateChannel = (event: MainSocketEvents): event is CreateChannelRequest => event[0] === "create_channel_req";
  const isDeleteChannel = (event: MainSocketEvents): event is DeleteChannelRequest => event[0] === "delete_channel_req";

  const { sendJsonMessage } = useWebSocket(import.meta.env.VITE_WS_URL, {
    share: true,
    onMessage: m => {
      const event = JSON.parse(m.data);
      if (isChannelData(event)) {
        const channelData = event[1].data;
        setSelectedChannelUsers(channelData.users);
        setSelectedChannelMessages(channelData.messages);
      }
      else if (isChannelMessage(event)) {
        const channelMessage = event[1];
        if (selectedChannel === channelMessage.channel) {
          setSelectedChannelMessages(
            [
              ...selectedChannelMessages,
              { from: channelMessage.from, message: channelMessage.message }
            ]
          );
        }
      }
      else if (isUserUpdate(event)) {
        const eventUser = event[1];
        let useridx = -1;
        for (let i = 0; i < users.length; i++) {
          if (users[i].username === eventUser.username) {
            useridx = i;
            break;
          }
        }
        if (useridx === -1) {
          setUsers(
            [
              ...users,
              eventUser
            ]
          );
        }
        else {
          setUsers(
            [...users.slice(0, useridx), eventUser, ...users.slice(useridx + 1)]
          );
        }
      }
      else if (isDMData(event)) {
        setSelectedFriendMessages(event[1].data);
      }
      else if (isDMMessage(event)) {
        const directMessage = event[1];
        if (selectedFriend === directMessage.from || selectedFriend === directMessage.to) {
          setSelectedFriendMessages(
            [
              ...selectedFriendMessages,
              { from: directMessage.from, message: directMessage.message }
            ]
          );
        }
      }
      else if (isFriendReq(event)) {
        const sender = event[1].from
        if (!friendRequests.includes(sender)) {
          setFriendRequests(
            [
              ...friendRequests,
              sender
            ]
          );
        }
      }
      else if (isFriendReqRes(event)) {
        const newFriend = event[1].from === username ? event[1].to : event[1].from;
        setFriends([...friends, newFriend]);
      }
      else if (isRemoveFriend(event)) {
        const friendToRemove = event[1].user1 === username ? event[1].user2 : event[1].user1;
        setFriends(friends.filter(f => f !== friendToRemove));
        if (selectedFriend === friendToRemove) {
          setSelectedFriend("");
          setSelectedChannel("General");
        }
      }
      else if (isCreateChannel(event)) {
        setChannels([...channels, event[1].name]);
      }
      else if (isDeleteChannel(event)) {
        setChannels(channels.filter(c => c !== event[1].name));
      }
    },
    filter: m => {
      const event = JSON.parse(m.data);
      const req_type = event[0];
      return (
        req_type === "channel_data_res" ||
        req_type === "channel_message_req" ||
        req_type === "user_update" ||
        req_type === "dm_data_res" ||
        req_type === "direct_message_req" ||
        req_type === "friend_request_req" ||
        req_type === "friend_request_res" ||
        req_type === "remove_friend" ||
        req_type === "create_channel_req"
      );
    }
  });

  const onSelectChannel = (channel: string) => {
    setSelectedChannel(channel);
    setSelectedFriend("");
    const channelDataReq: ChannelDataRequest = [
      "channel_data_req",
      {
        channel: channel
      }
    ];
    sendJsonMessage(channelDataReq);
  }

  const onSelectFriend = (friend: string) => {
    setSelectedFriend(friend);
    setSelectedChannel("");
    const dmDataReq: DirectMessageDataRequest = [
      "dm_data_req",
      {
        from: username,
        friend: friend
      }
    ];
    sendJsonMessage(dmDataReq);
  }

  const onSendMessage = (message: string) => {
    if (selectedChannel) {
      const channelMessageReq: ChannelMessageRequest = [
        "channel_message_req",
        {
          from: username,
          channel: selectedChannel,
          message: message
        }
      ];
      sendJsonMessage(channelMessageReq);
    }
    else {
      const directMessageRequest: DirectMessageRequest = [
        "direct_message_req",
        {
          from: username,
          to: selectedFriend,
          message: message
        }
      ];
      sendJsonMessage(directMessageRequest);
    }
  }

  const onKick = (user: string) => {
    console.log('kick ' + user);
  }

  const onBan = (user: string) => {
    console.log('ban ' + user)
  }

  const onSendFriendReq = (to: string) => {
    if (!friends.includes(to)) {
      const friendReq: FriendRequest = [
        "friend_request_req",
        {
          from: username,
          to: to
        }
      ];
      sendJsonMessage(friendReq);
    }
  }
  
  const onRespondFriendReq = (to: string, accepted: boolean) => {
    setFriendRequests(friendRequests.filter(f => f !== to));
    const friendReqRes: FriendRequestResponse = [
      "friend_request_res",
      {
        from: username,
        to: to,
        accepted: accepted
      }
    ];
    sendJsonMessage(friendReqRes);
  }

  const onRemoveFriend = (friend: string) => {
    const removeFriend: RemoveFriend = [
      "remove_friend",
      {
        user1: friend,
        user2: username
      }
    ];
    sendJsonMessage(removeFriend);
  }

  const onBlock = (to: string) => {
    setFriendRequests(friendRequests.filter(f => f !== to));
    setBlockedUsers([...blockedUsers, to]);
    const blockRequest: BlockRequest = [
      "block_req",
      {
        from: username,
        to: to
      }
    ];
    sendJsonMessage(blockRequest);
  }

  const onUnblock = (to: string) => {
    setBlockedUsers(blockedUsers.filter(u => u !== to));
    const unblockRequest: UnblockRequest = [
      "unblock_req",
      {
        from: username,
        to: to
      }
    ];
    sendJsonMessage(unblockRequest);
  }

  const onCreateChannel = (name: string) => {
    const createChannelRequest: CreateChannelRequest = [
      "create_channel_req",
      {
        name: name
      }
    ];
    sendJsonMessage(createChannelRequest);
  }

  const onDeleteChannel = (name: string) => {
    const deleteChannelRequest: DeleteChannelRequest = [
      "delete_channel_req",
      {
        name: name
      }
    ];
    sendJsonMessage(deleteChannelRequest);
  }

  const onJoinChannel = (name: string) => {
    console.log("join channel " + name)
  }

  const onLeaveChannel = (name: string) => {
    console.log("leave channel " + name)
  }

  return (
    <div className="flex flex-col h-screen">
      <Header 
        friendRequests={friendRequests}
        blocked={blockedUsers}
        onRespond={onRespondFriendReq}
        onUnblock={onUnblock}
        onBlock={onBlock}
        onFriendReq={onSendFriendReq}
      />

      <div className="cols-box">
        <div className="w-[15%] bg-modal-color flex flex-col">
          <TextChannels
            channels={channels}
            selected={selectedChannel}
            userType={USER_TYPE}
            onSelect={onSelectChannel}
            onCreateChannel={onCreateChannel}
            onLeaveChannel={onLeaveChannel}
            onJoinChannel={onJoinChannel}
            onDeleteChannel={onDeleteChannel}
          />
          <Friends
            friends={new Set(friends)}
            users={users}
            selected={selectedFriend}
            onSelect={onSelectFriend}
            onRemoveFriend={onRemoveFriend}
          />
        </div>

        <MessageWindow 
          selectedChannelMessages={selectedChannelMessages}
          selectedFriendMessages={selectedFriendMessages}
          selectedChannel={selectedChannel}
          selectedFriend={selectedFriend}
          username={username}
          onSendMessage={message => onSendMessage(message)}
        />

        <UserList 
          selectedUsers={selectedChannel ? new Set(selectedChannelUsers) : new Set([selectedFriend])}
          users={users}
          userType={USER_TYPE}
          username={username}
          friends={friends}
          blocked={blockedUsers}
          onKick={onKick}
          onBan={onBan}
          onBlock={onBlock}
          onFriendReq={onSendFriendReq}
        />
      </div>
    </div>
    // <div className="flex flex-row gap-6">
    //   <UserList
    //     users={users.filter(user => user !== username)}
    //     onSelect={name => onSelect(name)}
    //     selected={selected}
    //   />
    //   <MessageWindow 
    //     name={username}
    //     selected={selected}
    //   />
    // </div>
  );
}

export default Main;