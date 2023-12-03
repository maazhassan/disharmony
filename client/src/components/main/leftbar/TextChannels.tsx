import { Menu, Item, useContextMenu } from "react-contexify";

type TextChannelsProps = {
  channels: string[],
  selected: string,
  userType: string,
  onSelect: (channel: string) => void
}

const TextChannels = ({ channels, selected, userType, onSelect }: TextChannelsProps) => {
  const MENU_ID = "create-channel-menu";

  const { show } = useContextMenu({
    id: MENU_ID
  });

  const onCreateChannel = () => {
    console.log("create channel")
    // const createChannelReq: CreateChannelRequest = [
    //   "create_channel_req",
    //   {

    //   }
    // ]
  }

  const onJoinChannel = () => {
    console.log("join channel")
  }

  return (
    <>
      <h2
        className="text-channels-h2 hover:cursor-default"
        onContextMenu={e => show({event: e})}
      >
        Text Channels
      </h2>
      <Menu id={MENU_ID}>
        {
          userType === "ADMIN" ?
          <Item onClick={onCreateChannel}>
            Create Channel
          </Item>
          :
          <Item onClick={onJoinChannel}>
            Join Channel
          </Item>
        }
      </Menu>
      <div className="h-[50vh] overflow-auto">
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
    </>
  );
}

export default TextChannels;