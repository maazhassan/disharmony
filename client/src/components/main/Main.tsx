import { useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import MessageWindow from "./messagewindow/MessageWindow";
import UserList from "./rightbar/UserList";
import { useAppData } from "../App";
import "./main.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons/faUserGroup";
import { faArrowUpFromBracket } from "@fortawesome/free-solid-svg-icons";
import TextChannels from "./leftbar/TextChannels";
import { ChannelDataRequest, ChannelDataResponse, ChannelMessageRequest, DirectMessageDataRequest, DirectMessageDataResponse, DirectMessageRequest, MainSocketEvents, MessageBase, User, UserUpdate } from "../../types/websocket.types";
import Friends from "./leftbar/Friends";

const Main = () => {
  const { username, loginData } = useAppData();
  const data = loginData[1];
  const USER_TYPE = data.user_type;

  const [selectedChannel, setSelectedChannel] = useState("General");
  const [selectedChannelUsers, setSelectedChannelUsers] = useState(data.general_data.users);
  const [selectedChannelMessages, setSelectedChannelMessages] = useState(data.general_data.messages);
  const [selectedFriend, setSelectedFriend] = useState("");
  const [selectedFriendMessages, setSelectedFriendMessages] = useState<MessageBase[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
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
            [
              ...users.filter((_, i) => i !== useridx),
              eventUser
            ]
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
    },
    filter: m => {
      const event = JSON.parse(m.data);
      const req_type = event[0];
      return (
        req_type === "channel_data_res" ||
        req_type === "channel_message_req" ||
        req_type === "user_update" ||
        req_type === "dm_data_res"
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

  const onSelectUser = (user: string) => {
    setSelectedUser(user);
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

  return (
    <div className="flex flex-col h-screen">
      <div className="title-box">
        <h2 className="disharmony-title">Disharmony</h2>
        <FontAwesomeIcon icon={faUserGroup} className="friends-icon"/>
      </div>

      <div className="cols-box">
        <div className="w-[15%] bg-modal-color flex flex-col">
          <h2 className="text-channels-h2">Text Channels</h2>

          <TextChannels
            channels={channels}
            selected={selectedChannel}
            onSelect={channel => onSelectChannel(channel)}
          />

          <Friends
            friends={new Set(friends)}
            users={users}
            selected={selectedFriend}
            onSelect={friend => onSelectFriend(friend)}
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
          selected={selectedUser}
          onSelect={user => onSelectUser(user)}
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