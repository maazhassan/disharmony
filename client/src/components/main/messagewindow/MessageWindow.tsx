import { useLayoutEffect, useRef, useState } from "react";
import { MessageBase } from "../../../types/websocket.types";
// import useWebSocket from "react-use-websocket";
import useResizeObserver from "@react-hook/resize-observer";
import MessageBubble from "./MessageBubble";

export interface MessageWindowPropsOLD {
  name: string,
  selected: string
}

type MessageWindowProps = {
  selectedChannelMessages: MessageBase[],
  selectedFriendMessages: MessageBase[],
  selectedChannel: string,
  selectedFriend: string,
  username: string,
  onSendMessage: (message: string) => void
}

const MessageWindow = ({ 
  selectedChannelMessages,
  selectedFriendMessages,
  selectedChannel,
  selectedFriend,
  username,
  onSendMessage
}: MessageWindowProps) => {
  const [text, setText] = useState("");

  const displayRef = useRef(document.createElement("div"));
  const textAreaRef = useRef(document.createElement("div"));

  useLayoutEffect(() => {
    setTimeout(() => {
      displayRef.current.scrollTop = displayRef.current.scrollHeight;
    }, 5)
  }, [selectedChannelMessages, selectedFriendMessages]);

  const sendMessage = () => {
    if (text?.length !== 0) {
      onSendMessage(text);
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
        selectedChannelMessages.map((message, idx) => 
          <MessageBubble
            key={idx}
            name={message.from}
            message={message.message}
            className={`m-4 p-3 ${message.from === username ? "ml-auto" : ""}`}
          />
        )
      )
    }
    else if (selectedFriend) {
      return (
        selectedFriendMessages.map((message, idx) => 
          <MessageBubble
            key={idx}
            name={message.from}
            message={message.message}
            className={`m-4 p-3 ${message.from === username ? "ml-auto" : ""}`}
          />
        )
      )
    }
    else {
      return null;
    }
  }

  useResizeObserver(textAreaRef, entry => {
    const size = entry.borderBoxSize[0].blockSize;
    const top = displayRef.current.getBoundingClientRect().top;
    displayRef.current.style.height = `${window.innerHeight - top - (size+30)}px`
  });

  return (
    <div className="flex flex-col w-[70%] relative">
      <h2 className="general-channel-h2">
        {selectedChannel ? selectedChannel : selectedFriend || <span>&#8203;</span>}
      </h2>
      <div className="w-full overflow-auto" id="lol" ref={displayRef}>
        {filterMessages()}
      </div>
      <div
        className="bg-text-input-bg text-white focus:outline-none rounded max-h-36 w-[98%] px-2 overflow-auto whitespace-pre-wrap absolute bottom-6 left-0 right-0 mx-auto py-2"
        contentEditable={true}
        onInput={e => setText((e.target as HTMLElement).textContent || '')}
        ref={textAreaRef}
        onKeyDown={e => handleEnter(e)}
      />
    </div>
  )
}

export default MessageWindow;