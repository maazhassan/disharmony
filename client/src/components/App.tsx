import { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { 
  useNavigate,
  Outlet,
  useOutletContext,
  useLocation
} from 'react-router-dom';

type ContextType = {
  userID: number,
  name: string,
  connectionStatus: string
  handleClickLogin: (u: string, p: string) => void,
  handleClickCreate: (u: string, p: string) => void
}

const App = () => {
  const [userID, setUserID] = useState(-1);
  const [name, setName] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      if (userID < 0) navigate("/login");
      else navigate("/main");
    }
  }, [userID, location, navigate])

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

  const handleClickCreate = (u: string, p: string) => {
    sendJsonMessage({username: u, password: p});
    setName(u);
  }

  return (
    <div className={`h-screen ${userID < 0 ? "bg-bg-color" : "bg-white"}`}>
      <Outlet context={{
        userID: userID,
        name: name,
        connectionStatus: connectionStatus,
        handleClickLogin: (u: string, p: string) => handleClickLogin(u, p),
        handleClickCreate: (u: string, p: string) => handleClickCreate(u, p)
      } satisfies ContextType} />
    </div>
  );

}

export function useAppData() {
  return useOutletContext<ContextType>();
}

export default App;
