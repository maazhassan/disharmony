import MessageDisplay from "./MessageDisplay";
import MessageInput from "./MessageInput";

export interface MessageWindowProps {
  name: string,
  selected: string
}

const MessageWindow = ({ name, selected }: MessageWindowProps) => {
  return (
    <div className="w-[435px]">
      <MessageDisplay 
        name={name}
        selected={selected}
      />
      <MessageInput 
        name={name}
        selected={selected}
      />
    </div>
    
  )
}

export default MessageWindow;