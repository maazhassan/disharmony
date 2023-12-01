import Register from './Register';
import Main from './Main';
import { useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import MessageBoard from './MessageBoard';

const App = () => {
  const [userID, setUserID] = useState(-1);
  const [name, setName] = useState("");
  const { sendJsonMessage, readyState } = useWebSocket(import.meta.env.VITE_WS_URL, {
    share: true,
    onOpen: () => {
      console.log("Websocket connection established.");
    },
    onMessage: m => {
      const event = JSON.parse(m.data);
      if (event.type === "register") {
        console.log(event);
        setUserID(event.id);
      }
    },
    filter: m => {
      const event = JSON.parse(m.data);
      return event.type === "register";
    },
    shouldReconnect: () => true,
  });

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  const handleClickLogin = (u: string, p: string) => {
    sendJsonMessage({username: u, password: p});
    setName(u);
  }


  return (
    <div className={`h-screen ${userID < 0 ? "bg-bg-color" : "bg-white"}`}>
      <Main/>
    </div>
  );
}

export default App;
