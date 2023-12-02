import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { MessageWindowProps } from "./MessageWindow";
import { DirectMessage } from "../../../types/websocket.types";

interface MessageDisplayProps extends MessageWindowProps {}



const MessageDisplay = ({ name, selected }: MessageDisplayProps) => {
  const [messageHistory, setMessageHistory] = useState<DirectMessage[]>([]);

  const displayRef = useRef(document.createElement("div"));

  useEffect(() => {
    displayRef.current.scrollTop = displayRef.current.scrollHeight;
    console.log("scrolled")
  }, [messageHistory, selected]);

  useWebSocket(import.meta.env.VITE_WS_URL, {
    share: true,
    onMessage: m => {
      const event = JSON.parse(m.data);
      if (event.type === "message") {
        console.log(event);
        setMessageHistory(
          [
            ...messageHistory,
            { from: event.from, to: event.to, message: event.message }
          ]
        );
      }
    },
    filter: m => {
      const event = JSON.parse(m.data);
      return event.type === "message";
    }
  });

  const displayFilter = (m: DirectMessage) => {
    return (m.from === selected && m.to === name)
    || (m.from === name && m.to === selected);
  }

  return (
    <div className="border border-black rounded h-[250px] overflow-auto" ref={displayRef}>
      <ul>
        {messageHistory.filter(displayFilter).map((m, i) => 
          <li key={i}>
            <span className={`${m.from === name ? 'text-blue-700' : 'text-red-700'} break-all whitespace-pre-wrap`}>
              {m.from}: {m.message}
            </span>
          </li>
        )}
      </ul>
    </div>
  )
}

export default MessageDisplay;