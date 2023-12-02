import { useRef, useState } from "react";
import { useWebSocket } from "react-use-websocket/dist/lib/use-websocket";
import { MessageWindowPropsOLD } from "./MessageWindow";

interface MessageInputProps extends MessageWindowPropsOLD {}

const MessageInput = ({ name, selected }: MessageInputProps) => {
  const [text, setText] = useState<string | null>('');

  const textAreaRef = useRef(document.createElement("div"));

  const { sendJsonMessage } = useWebSocket(import.meta.env.VITE_WS_URL, {
    share: true,
    filter: () => {
      return false;
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

  return (
    <div className={`flex flex-row mt-2 ${selected ? '' : 'pointer-events-none'}`}>
      <div
        className="border border-black focus:bg-gray-100 focus:outline-none rounded max-h-36 w-[90%] overflow-auto whitespace-pre-wrap"
        contentEditable={true}
        onInput={e => setText((e.target as HTMLElement).textContent)}
        ref={textAreaRef}
        onKeyDown={e => handleEnter(e)}
      />
      <button 
        className="border border-black rounded bg-blue-300 ml-2 disabled:bg-gray-300 grow self-start"
        onClick={() => sendMessage()}
        disabled={text?.length === 0}
      >
        Send
      </button>
    </div>
  )
}

export default MessageInput;