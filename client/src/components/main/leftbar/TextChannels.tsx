type TextChannelsProps = {
  channels: string[],
  selected: string,
  onSelect: (channel: string) => void
}

const TextChannels = ({ channels, selected, onSelect }: TextChannelsProps) => {
  return (
    <div className="h-[50vh]">
      <ul>
      {channels.map((channel: string, idx) => 
        <li key={idx}>
          <div
            className={`${selected === channel ? "text-app-pink" : "text-white"} text-xl font-medium hover:cursor-pointer indent-5 pt-2`}
            onClick={() => onSelect(channel)}
          >
            {channel}
          </div>
        </li>
      )}
      </ul>
    </div>
  );
}

export default TextChannels;