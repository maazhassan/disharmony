type MessageBubbleProps = {
  name: string,
  message: string,
  className?: string
}

const MessageBubble = ({ name, message, className }: MessageBubbleProps) => {
  return (
    <div className={`bg-modal-color rounded-md w-fit max-w-[16rem] p-3 ${className}`}>
      <p className="text-white font-bold">{name}</p>
      <p className="text-white mt-2">{message}</p>
    </div>
  );
}

export default MessageBubble