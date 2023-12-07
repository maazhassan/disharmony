import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import MessageWindow from "./messagewindow/MessageWindow";
import UserList from "./UserList";
import "../main.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons/faUserGroup";
import { faArrowUpFromBracket } from "@fortawesome/free-solid-svg-icons";

type MainProps = {
  name: string
}

const Main = ({ name }: MainProps) => {
  const [users, setUsers] = useState([""]);
  const [selected, setSelected] = useState("");
  const readyRef = useRef(false);

  useEffect(() => {
    if (readyRef.current) return;
    readyRef.current = true;
    sendJsonMessage({"ready": 1});
  });

  const { sendJsonMessage } = useWebSocket(import.meta.env.VITE_WS_URL, {
    share: true,
    onMessage: m => {
      const event = JSON.parse(m.data);
      if (event.type === "users") {
        console.log(event);
        setUsers(event.value);
        if (!event.value.includes(selected)) {
          setSelected('');
        }
      }
    },
    filter: m => {
      const event = JSON.parse(m.data);
      return event.type === "users";
    }
  });

  const onSelect = (user: string) => {
    if (selected === user) setSelected('');
    else setSelected(user);
  }

  return (
  <>
    <div className="title-box">
      <h2 className="disharmony-title">Disharmony</h2>
      <FontAwesomeIcon icon={faUserGroup} className="friends-icon"/>
    </div>
    
    <div className="cols-box">

      <div className="txt-channel">
        <h2 className="text-channels-h2">Text Channels</h2>
        <div className="column-1">
          <div className="text-channels">
            <h3>General</h3>
          </div>
        </div>

        <div className="friends-list">
          <h3>Friends</h3>
        </div>
      </div>

      <div className="chat-window">
        <h2 className="general-channel-h2">General Channel</h2>

        <div className="send-msg">
          <input type="text" className="chat-input" placeholder="Send a message..." />
        </div>
        
        
      </div>

      <div className="user-window"> 
        <h2 className="users-channel-h2">Users</h2>
      </div>
  </div>
  </>
  );
}

export default Main;