import { useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import MessageWindow from "./messagewindow/MessageWindow";
import UserList from "../UserList";
import { useAppData } from "../App";
import "./main.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons/faUserGroup";
import { faArrowUpFromBracket } from "@fortawesome/free-solid-svg-icons";
import TextChannels from "./leftbar/TextChannels";
import { ChannelDataRequest, ChannelDataResponse, ChannelMessageRequest, MainSocketEvents, MessageBase } from "../../types/websocket.types";

const Main = () => {
  const { username, loginData } = useAppData();
  const data = loginData[1];

  const [selectedChannel, setSelectedChannel] = useState("General");
  const [selectedChannelUsers, setSelectedChannelUsers] = useState(data.general_data.users);
  const [selectedChannelMessages, setSelectedChannelMessages] = useState(data.general_data.messages);
  const [selectedFriend, setSelectedFriend] = useState("");
  const [selectedFriendMessages, setSelectedFriendMessages] = useState<MessageBase[]>([]);
  const [userType, setUserType] = useState(data.user_type);
  const [blockedUsers, setBlockedUsers] = useState(data.blocked_users);
  const [friends, setFriends] = useState(data.friends);
  const [friendRequests, setFriendRequests] = useState(data.friend_requests);
  const [users, setUsers] = useState(data.users);
  const [channels, setChannels] = useState(data.channels);

  const isChannelData = (event: MainSocketEvents): event is ChannelDataResponse => event[0] === "channel_data_res";

  const { sendJsonMessage } = useWebSocket(import.meta.env.VITE_WS_URL, {
    share: true,
    onMessage: m => {
      const event = JSON.parse(m.data);
      if (isChannelData(event)) {
        const channelData = event[1].data;
        setSelectedChannelUsers(channelData.users);
        setSelectedChannelMessages(channelData.messages);
      }
    },
    filter: m => {
      const event = JSON.parse(m.data);
      const req_type = event[0];
      return (req_type === "channel_data_res");
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
  }

  const onSendMessage = message => {
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

    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="title-box">
        <h2 className="disharmony-title">Disharmony</h2>
        <FontAwesomeIcon icon={faUserGroup} className="friends-icon"/>
      </div>

      <div className="cols-box">
        <div className="txt-channel">
          <h2 className="text-channels-h2">Text Channels</h2>

          <TextChannels
            channels={channels}
            selected={selectedChannel}
            onSelect={channel => onSelectChannel(channel)}
          />

          <div className="friends-list">
            <h3>Friends</h3>
          </div>

        </div>

        <MessageWindow 
          selectedChannelMessages={selectedChannelMessages}
          selectedFriendMessages={selectedFriendMessages}
          isChannelSelected={true}
          username={username}
        />

        <div className="user-window"> 
          <h2 className="users-channel-h2">Users</h2>
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