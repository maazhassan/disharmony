import { useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import MessageWindow from "./messagewindow/MessageWindow";
import UserList from "./rightbar/UserList";
import { useAppData } from "../App";
import "./main.css";
import TextChannels from "./leftbar/TextChannels";
import { BanRequest, BannedUsersRequest, BannedUsersResponse, BlockRequest, ChannelDataRequest, ChannelDataResponse, ChannelMessageRequest, CreateChannelRequest, DeleteChannelRequest, DirectMessageDataRequest, DirectMessageDataResponse, DirectMessageRequest, FriendRequest, FriendRequestResponse, JoinChannelRequest, KickRequest, LeaveChannelRequest, MainSocketEvents, MessageBase, RemoveFriend, UnbanRequest, UnblockRequest, UserUpdate } from "../../types/websocket.types";
import Friends from "./leftbar/Friends";
import Header from "./topbar/Header";

const Main = () => {
  const { username, loginData } = useAppData();
  const data = loginData[1];
  const USER_TYPE = data.user_type;

  const [selectedChannel, setSelectedChannel] = useState(data.channels.length > 0 ? data.channels[0] : "");
  const [selectedChannelUsers, setSelectedChannelUsers] = useState(data.initial_data.users);
  const [selectedChannelMessages, setSelectedChannelMessages] = useState(data.initial_data.messages);
  const [selectedFriend, setSelectedFriend] = useState("");
  const [selectedFriendMessages, setSelectedFriendMessages] = useState<MessageBase[]>([]);
  const [blockedUsers, setBlockedUsers] = useState(data.blocked_users);
  const [friends, setFriends] = useState(data.friends);
  const [friendRequests, setFriendRequests] = useState(data.friend_requests);
  const [users, setUsers] = useState(data.users);
  const [channels, setChannels] = useState(data.channels);
  const [bannedUsers, setBannedUsers] = useState([""]);

  //DELETE LATER ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  const [isOpen, setIsOpen] = useState(false);
  const [isChannelsOpen, setIsChannelsOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggleChannels = () => {
    setIsChannelsOpen(!isChannelsOpen);
  };
  
  const toggleFriends = () => {
    setIsFriendsOpen(!isFriendsOpen);
  };
  
  const toggleRequests = () => {
    setIsRequestsOpen(!isRequestsOpen);
  };
  
  const toggleUsers = () => {
    setIsUsersOpen(!isUsersOpen);
  };
  //DELETE LATER ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

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
  const isJoinChannel = (event: MainSocketEvents): event is JoinChannelRequest => event[0] === "join_channel_req";
  const isLeaveChannel = (event: MainSocketEvents): event is LeaveChannelRequest => event[0] === "leave_channel_req";
  const isBannedUsers = (event: MainSocketEvents): event is BannedUsersResponse => event[0] === "banned_users_res";

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
          if (selectedChannel === "General") {
            setSelectedChannelUsers([...selectedChannelUsers, eventUser.username]);
          }
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
        if (selectedFriend === friendToRemove) {
          setSelectedChannel("");
        }
        setFriends(friends.filter(f => f !== friendToRemove));
      }
      else if (isCreateChannel(event)) {
        setChannels([...channels, event[1].name]);
      }
      else if (isDeleteChannel(event)) {
        if (selectedChannel === event[1].name) {
          setSelectedChannel("");
        }
        setChannels(channels.filter(c => c !== event[1].name));
      }
      else if (isJoinChannel(event)) {
        if (event[1].from === username) {
          setChannels([...channels, event[1].channel]);
        }
        if (selectedChannel === event[1].channel) {
          setSelectedChannelUsers([...selectedChannelUsers, event[1].from]);
        }
      }
      else if (isLeaveChannel(event)) {
        if (selectedChannel === event[1].channel) {
          if (event[1].from === username) {
            setSelectedChannel("");
          }
          else {
            setSelectedChannelUsers(selectedChannelUsers.filter(u => u !== event[1].from));
          }
        }
        if (event[1].from === username) {
          setChannels(channels.filter(c => c !== event[1].channel));
        }
      }
      else if (isBannedUsers(event)) {
        setBannedUsers(event[1].users);
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
        req_type === "create_channel_req" ||
        req_type === "delete_channel_req" ||
        req_type === "join_channel_req" ||
        req_type === "leave_channel_req" ||
        req_type === "banned_users_res"
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

  const onUnselect = () => {
    setSelectedFriend("");
    setSelectedChannel("");
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
    else if (selectedFriend) {
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
    const kickRequest: KickRequest = [
      "kick_req",
      {
        user: user,
        channel: selectedChannel
      }
    ];
    sendJsonMessage(kickRequest);
  }

  const onBan = (user: string) => {
    const banRequest: BanRequest = [
      "ban_req",
      {
        user: user,
        channel: selectedChannel
      }
    ];
    sendJsonMessage(banRequest);
  }

  const onUnban = (user: string, channel: string) => {
    setBannedUsers(bannedUsers.filter(u => u !== user));
    const unbanRequest: UnbanRequest = [
      "unban_req",
      {
        user: user,
        channel: channel
      }
    ];
    sendJsonMessage(unbanRequest);
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
    const joinChannelRequest: JoinChannelRequest = [
      "join_channel_req",
      {
        from: username,
        channel: name
      }
    ];
    sendJsonMessage(joinChannelRequest);
  }

  const onLeaveChannel = (name: string) => {
    const leaveChannelRequest: LeaveChannelRequest = [
      "leave_channel_req",
      {
        from: username,
        channel: name
      }
    ];
    sendJsonMessage(leaveChannelRequest);
  }

  const getBannedUsers = (channel: string) => {
    const bannedUsersRequest: BannedUsersRequest = [
      "banned_users_req",
      {
        channel: channel
      }
    ];
    sendJsonMessage(bannedUsersRequest);
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
            bannedUsers={bannedUsers}
            onSelect={onSelectChannel}
            onUnselect={onUnselect}
            onCreateChannel={onCreateChannel}
            onLeaveChannel={onLeaveChannel}
            onJoinChannel={onJoinChannel}
            onDeleteChannel={onDeleteChannel}
            onUnban={onUnban}
            getBannedUsers={getBannedUsers}
          />
          <Friends
            friends={new Set(friends)}
            users={users}
            selected={selectedFriend}
            onSelect={onSelectFriend}
            onUnselect={onUnselect}
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
          selectedFriend={selectedFriend}
          onKick={onKick}
          onBan={onBan}
          onBlock={onBlock}
          onFriendReq={onSendFriendReq}
        />
      </div>

{/* Mobile version content MOVE LATER----------------------------------------------------------------------------------------------------------------------------------------------*/}

      <div className="flex flex-col h-screen unique-class">
    <div className="mobile-header">
    <span className="triple-bar-icon" onClick={handleClick}>&#9776;</span>
      <div className="channel-name">
        {selectedChannel}
      </div>
    </div>

    {isOpen && (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '50%',
      height: '100%',
      overflow: 'auto',
      backgroundColor: '#332B38', 
      zIndex: 1000, 
    }}>
      <div>
      <span className = "dropdown-title" onClick={toggleChannels}>Text channels &#x25BC;</span>
        {isChannelsOpen && (
        <div>
          {channels.map((channel, index) => (
          <div className = "channel" key={index}>{channel}</div>
          ))}
        </div>
        )}

        <div>
        <span className = "dropdown-title" onClick={toggleFriends}>Friends &#x25BC;</span>
          {isFriendsOpen && (
        <div>
          {friends.map((friend, index) => (
          <div className="friend" key={index}>{friend}</div>
          ))}
        </div>
        )}

        <div>
        <span className = "dropdown-title" onClick={toggleRequests}>Friend requests &#x25BC;</span>
        {isRequestsOpen && (
        <div>
        {friendRequests.map((request, index) => (
        <div className="request" key={index}>{request}</div>
        ))}
        </div>
        )}

        <div>
        <span className = "dropdown-title" onClick={toggleUsers}>Users &#x25BC;</span>
        {isUsersOpen && (
        <div>
        {users.map((user, index) => (
        <div className="user" key={index}>{user.username}</div>
      ))}
        </div>
      )}
    </div>
    </div>     
    </div>
    </div>
    </div>
  )}

    <div className="mobile-messages">
      <MessageWindow 
        selectedChannelMessages={selectedChannelMessages}
        selectedFriendMessages={selectedFriendMessages}
        selectedChannel={selectedChannel}
        selectedFriend={selectedFriend}
        username={username}
        onSendMessage={message => onSendMessage(message)}
      />
    </div>
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