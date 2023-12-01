import { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { 
  useNavigate,
  Outlet,
  useOutletContext,
  useLocation
} from 'react-router-dom';
import { LoginData, LoginError, LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../types/websocket.types';

type ContextType = {
  username: string,
  connectionStatus: string,
  registerMessage: string
  handleClickLogin: (u: string, p: string) => void,
  handleClickCreate: (u: string, p: string) => void
}

const App = () => {
  const [username, setName] = useState("");
  const [regMes, setRegMes] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/") {
      if (username === "") navigate("/login");
      else navigate("/main");
    }
  }, [username, location, navigate])

  const isData = (event: LoginResponse | RegisterResponse): event is LoginData => event[0] === "login_data";
  const isLoginError = (event: LoginError | RegisterResponse): event is LoginError => event[0] === "login_err";

  const { sendJsonMessage, readyState } = useWebSocket(import.meta.env.VITE_WS_URL, {
    share: true,
    onOpen: () => {
      console.log("Websocket connection established.");
    },
    onMessage: m => {
      const event: LoginResponse | RegisterResponse = JSON.parse(m.data);
      if (isData(event)) {
        console.log(event);
        navigate("/main");
      }
      else if (isLoginError(event)) {
        console.log(event[1].message);
      }
      else {
        if (event[1].success) {
          navigate("/login");
        }
        else {
          setRegMes("Registration failed. This username is taken.");
        }
      }
    },
    filter: m => {
      const event = JSON.parse(m.data);
      const req_type = event[0];
      return (req_type === "login_data" || 
      req_type === "login_err" ||
      req_type === "register_res");
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
    const loginReq: LoginRequest = [
      "login_req",
      {
        username: u,
        password: p
      }
    ];
    sendJsonMessage(loginReq);
    setName(u);
  }

  const handleClickCreate = (u: string, p: string) => {
    const regReq: RegisterRequest = [
      "register_req",
      {
        username: u,
        password: p
      }
    ];
    sendJsonMessage(regReq);
  }

  return (
    <div className={`h-screen ${username === "" ? "bg-bg-color" : "bg-white"}`}>
      <Outlet context={{
        username: username,
        connectionStatus: connectionStatus,
        registerMessage: regMes,
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
