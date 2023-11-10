import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import MessageWindow from "./messagewindow/MessageWindow";
import UserList from "./UserList";

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
    <div className="flex flex-row gap-6">
      <UserList
        users={users.filter(user => user !== name)}
        onSelect={name => onSelect(name)}
        selected={selected}
      />
      <MessageWindow 
        name={name}
        selected={selected}
      />
    </div>
  );
}

export default Main;