import { useState } from "react";
import { Menu, Item, useContextMenu } from "react-contexify";
import ReactModal from "react-modal";

type TextChannelsProps = {
  channels: string[],
  selected: string,
  userType: string,
  onSelect: (channel: string) => void,
  onUnselect: () => void,
  onCreateChannel: (name: string) => void,
  onDeleteChannel: (name: string) => void,
  onJoinChannel: (name: string) => void,
  onLeaveChannel: (name: string) => void
}

ReactModal.setAppElement("#root");

const TextChannels = ({
channels,
selected,
userType,
onSelect,
onUnselect,
onCreateChannel,
onLeaveChannel,
onJoinChannel,
onDeleteChannel
}: TextChannelsProps) => {
  const HEADER_MENU_ID = "create-channel-menu";
  const CHANNEL_MENU_ID = "join-channel-menu";

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [contextChannel, setContextChannel] = useState("");

  const { show } = useContextMenu()

  const displayChannelMenu = (e: React.MouseEvent<HTMLLIElement, MouseEvent>, name: string) => {
    setContextChannel(name);
    show({id: CHANNEL_MENU_ID, event: e});
  }

  const openModal = () => {
    setModalIsOpen(true);
  }

  const closeModal = () => {
    setModalIsOpen(false);
    setInputText("");
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.currentTarget.value);
  }

  const onSubmitModal = () => {
    if (userType === "ADMIN") {
      onCreateChannel(inputText);
      setInputText("");
    }
    else if (userType === "USER") {
      onJoinChannel(inputText);
      setInputText("");
    }
    setModalIsOpen(false);
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key == "Enter") {
      onSubmitModal();
    }
  }

  const onClick = (channel: string) => {
    if (channel === selected) {
      onUnselect();
    }
    else {
      onSelect(channel);
    }
  }

  return (
    <>
      <h2
        className="text-channels-h2 hover:cursor-default"
        onContextMenu={e => show({id: HEADER_MENU_ID, event: e})}
      >
        Text Channels
      </h2>
      <Menu id={HEADER_MENU_ID}>
        <Item onClick={() => openModal()} hidden={userType === "USER"}>
          Create Channel
        </Item>
        <Item onClick={() => openModal()} hidden={userType === "ADMIN"}>
          Join Channel
        </Item>
      </Menu>
      <div className="h-[50vh] overflow-auto">
        <ul>
        {channels.map((channel: string, idx) => 
          <li
            key={idx}
            onContextMenu={
              channel !== "General" ? e => displayChannelMenu(e, channel) : e => e.preventDefault()
            }
          >
            <div
              className={`${selected === channel ? "text-app-pink" : "text-white"} text-xl font-medium hover:cursor-pointer indent-5 pt-2 select-none`}
              onClick={() => onClick(channel)}
            >
              {channel}
            </div>
          </li>
        )}
        </ul>
      </div>
      <Menu id={CHANNEL_MENU_ID}>
        <Item onClick={() => onDeleteChannel(contextChannel)} hidden={userType === "USER"}>
          Delete Channel
        </Item>
        <Item onClick={() => onLeaveChannel(contextChannel)} hidden={userType === "ADMIN"}>
          Leave Channel
        </Item>
      </Menu>
      <ReactModal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className={"fixed w-72 h-32 bg-bg-color rounded-md outline-none top-20 left-48"}
        overlayClassName={"fixed top-0 left-0 right-0 bottom-0 bg-white/10"}
      >
        <div className="flex flex-row gap-2 mt-4 ml-4">
          <input
            className="bg-text-input-bg focus:outline-none rounded text-white py-1 px-1 placeholder:text-gray-200"
            placeholder="Name..."
            onKeyDown={e => onKeyDown(e)}
            onChange={e => onChange(e)}
            value={inputText}
            autoFocus={true}
          />
          <button
            className="py-1 px-2 bg-[#77E688] text-white border-none rounded font-semibold hover:cursor-pointer"
            onClick={onSubmitModal}
          >
            Go
          </button>
        </div>
        <button
          className="absolute bottom-3 right-0 left-0 w-fit mx-auto py-1 px-8 bg-app-pink text-white border-none rounded font-semibold hover:cursor-pointer"
          onClick={closeModal}
        >
          Close
        </button>
      </ReactModal>
    </>
  );
}

export default TextChannels;