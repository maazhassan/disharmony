import { useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import MessageWindow from "./messagewindow/MessageWindow";
import UserList from "../UserList";
import { useAppData } from "../App";
import "./main.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons/faUserGroup";
import { faArrowUpFromBracket } from "@fortawesome/free-solid-svg-icons";

const Main = () => {
  const [selected, setSelected] = useState("");

  const { username, loginData } = useAppData();

  const { sendJsonMessage } = useWebSocket(import.meta.env.VITE_WS_URL, {
    share: true,
    onMessage: m => {
      const event = JSON.parse(m.data);
      if (event.type === "users") {
        console.log(event);
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
    <div className="flex flex-col h-screen">
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

        <MessageWindow />

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