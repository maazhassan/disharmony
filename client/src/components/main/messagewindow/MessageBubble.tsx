type MessageBubbleProps = {
  name: string,
  message: string,
  className?: string
}

const MessageBubble = ({ name, message, className }: MessageBubbleProps) => {
  const isImgurLink = /https:\/\/i\.imgur\.com\/[a-zA-Z0-9]+\.([a-zA-Z]{3,4})/.test(message);

  return (
    <div className={`bg-modal-color rounded-md w-fit max-w-[40rem] ${className}`}>
      <p className="text-white font-bold">{name}</p>
      {
        isImgurLink ?
        <img
          src={message}
          alt="imgur"
          className="mt-2 w-full hover:cursor-pointer"
          onClick={() => window.open(message, "_blank")}
        /> :
        <p className="text-white mt-2 break-words">{message}</p>
      }
    </div>
  );
}

export default MessageBubble