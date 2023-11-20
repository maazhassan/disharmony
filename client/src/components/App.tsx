import Register from './Register';
import Main from './Main';
import { useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

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

  const handleClickRegister = (n: string) => {
    sendJsonMessage({name: n});
    setName(n);
  }


  return (
    <div className="ml-2 mt-4">
    {
      userID < 0 ? (
        <Register
          handleClickRegister={n => handleClickRegister(n)}
          connectionStatus={connectionStatus}
          duplicate={userID === -2}
        />
      ) : (
        <Main
          name={name}
        />
      )
    }
    </div>
  );
}

export default App;
