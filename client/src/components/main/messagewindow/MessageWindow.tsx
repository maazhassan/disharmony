import { useEffect, useRef, useState } from "react";
import { ChannelsData, DirectMessage, DirectMessageData } from "../../../types/websocket.types";
import useWebSocket from "react-use-websocket";
import useResizeObserver from "@react-hook/resize-observer";
import MessageBubble from "./MessageBubble";

export interface MessageWindowPropsOLD {
  name: string,
  selected: string
}

type MessageWindowProps = {
  selectedChannel: string,
  selectedFriend: string,
  channels: ChannelsData[],
  directMessages: DirectMessageData[],
  username: string
}

const MessageWindow = ({ 
  selectedChannel,
  selectedFriend,
  channels,
  directMessages,
  username
}: MessageWindowProps) => {
  const [messageHistory, setMessageHistory] = useState<DirectMessage[]>([]);
  const [text, setText] = useState<string | null>('');

  const displayRef = useRef(document.createElement("div"));
  const textAreaRef = useRef(document.createElement("div"));

  useEffect(() => {
    displayRef.current.scrollTop = displayRef.current.scrollHeight;
  }, [messageHistory]);

  const { sendJsonMessage } = useWebSocket(import.meta.env.VITE_WS_URL, {
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

  const sendMessage = () => {
    if (text?.length !== 0) {
      sendJsonMessage({type: "message", from: name, to: selected, message: text});
      textAreaRef.current.textContent = "";
      setText("");
      textAreaRef.current.focus();
    }
  }

  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    return;
  }

  const filterMessages = () => {
    if (selectedChannel) {
      return (
        channels.find(channel => channel.name === selectedChannel)?.messages
        .map(message => 
          <MessageBubble 
            name={message.from}
            message={message.message}
            className={`m-4 ${message.from === username ? "ml-auto" : ""}`}
          />
        )
      )
    }
    else {
      return (
        directMessages.find(convo => convo.friend === selectedFriend)?.messages
        .map(message => 
          <MessageBubble 
            name={message.from}
            message={message.message}
            className={`m-4 ${message.from === username ? "ml-auto" : ""}`}
          />
        )
      )
    }
  }

  useResizeObserver(textAreaRef, entry => {
    const size = entry.borderBoxSize[0].blockSize;
    const top = displayRef.current.getBoundingClientRect().top;
    displayRef.current.style.height = `${window.innerHeight - top - (size+48)}px`
  });

  return (
    <div className="flex flex-col w-[70%] relative">
      <h2 className="general-channel-h2">General Channel</h2>
      <div className="w-full overflow-auto" id="lol" ref={displayRef}>
        {filterMessages()}
      </div>
      <div
        className="bg-text-input-bg text-white focus:outline-none rounded max-h-36 w-[98%] px-2 overflow-auto whitespace-pre-wrap absolute bottom-6 left-0 right-0 mx-auto py-2"
        contentEditable={true}
        onInput={e => setText((e.target as HTMLElement).textContent)}
        ref={textAreaRef}
        onKeyDown={e => handleEnter(e)}
      />
    </div>
  )
}

export default MessageWindow;