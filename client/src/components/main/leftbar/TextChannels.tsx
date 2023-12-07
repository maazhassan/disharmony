import { faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Menu, Item, useContextMenu } from "react-contexify";
import ReactModal from "react-modal";

type TextChannelsProps = {
  channels: string[],
  selected: string,
  userType: string,
  bannedUsers: string[],
  onSelect: (channel: string) => void,
  onUnselect: () => void,
  onCreateChannel: (name: string) => void,
  onDeleteChannel: (name: string) => void,
  onJoinChannel: (name: string) => void,
  onLeaveChannel: (name: string) => void,
  onUnban: (user: string, channel: string) => void,
  getBannedUsers: (channel: string) => void
}

ReactModal.setAppElement("#root");

const TextChannels = ({
channels,
selected,
userType,
bannedUsers,
onSelect,
onUnselect,
onCreateChannel,
onLeaveChannel,
onJoinChannel,
onDeleteChannel,
onUnban,
getBannedUsers
}: TextChannelsProps) => {
  const HEADER_MENU_ID = "create-channel-menu";
  const CHANNEL_MENU_ID = "join-channel-menu";

  const [hmodalIsOpen, setHModalIsOpen] = useState(false);
  const [cmodalIsOpen, setCModalIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [contextChannel, setContextChannel] = useState("");

  const { show } = useContextMenu()

  const displayChannelMenu = (e: React.MouseEvent<HTMLLIElement, MouseEvent>, name: string) => {
    setContextChannel(name);
    show({id: CHANNEL_MENU_ID, event: e});
  }

  const openHModal = () => {
    setHModalIsOpen(true);
  }

  const closeHModal = () => {
    setHModalIsOpen(false);
    setInputText("");
  }

  const openCModal = () => {
    getBannedUsers(contextChannel);
    setCModalIsOpen(true);
  }

  const closeCModal = () => {
    setCModalIsOpen(false);
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.currentTarget.value);
  }

  const onSubmitHModal = () => {
    if (userType === "ADMIN") {
      onCreateChannel(inputText);
      setInputText("");
    }
    else if (userType === "USER") {
      onJoinChannel(inputText);
      setInputText("");
    }
    setHModalIsOpen(false);
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key == "Enter") {
      onSubmitHModal();
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
        <Item onClick={() => openHModal()} hidden={userType === "USER"}>
          Create Channel
        </Item>
        <Item onClick={() => openHModal()} hidden={userType === "ADMIN"}>
          Join Channel
        </Item>
      </Menu>
      <div className="h-[50vh] overflow-auto">
        <ul>
        {channels.map((channel: string, idx) => 
          <li
            key={idx}
            onContextMenu={e => displayChannelMenu(e, channel)}
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
        <Item onClick={() => onDeleteChannel(contextChannel)} hidden={
          userType === "USER" || contextChannel === "General"
        }>
          Delete Channel
        </Item>
        <Item onClick={() => onLeaveChannel(contextChannel)} hidden={userType === "ADMIN"}>
          Leave Channel
        </Item>
        <Item onClick={() => openCModal()} hidden={userType !== "ADMIN"}>
          Banned Users
        </Item>
      </Menu>
      <ReactModal
        isOpen={hmodalIsOpen}
        onRequestClose={closeHModal}
        className={"flex flex-row justify-center fixed w-80 h-20 bg-bg-color rounded-md outline-none top-20 left-48 pr-4"}
        overlayClassName={"fixed top-0 left-0 right-0 bottom-0 bg-white/10"}
      >
        <div className="flex flex-row gap-2 mt-4 ml-4">
          <input
            className="bg-text-input-bg focus:outline-none rounded text-white py-1 px-1 placeholder:text-gray-200 w-30 h-10"
            placeholder="Name..."
            onKeyDown={e => onKeyDown(e)}
            onChange={e => onChange(e)}
            value={inputText}
            autoFocus={true}
          />
          <button
            className="bg-[#77E688] text-white border-none rounded font-semibold hover:cursor-pointer h-10 w-14 mr-5"
            onClick={onSubmitHModal}
          >
            Go
          </button>
        </div>
        <FontAwesomeIcon
            icon={faSquareXmark}
            className="text-app-pink py-1 pt-3.5 h-5 hover:cursor-pointer"
            onClick={closeHModal}
          />
      </ReactModal>
      <ReactModal
        isOpen={cmodalIsOpen}
        onRequestClose={closeCModal}
        className={"fixed w-80 h-[28rem] bg-bg-color rounded-md outline-none top-20 left-52"}
        overlayClassName={"fixed top-0 left-0 right-0 bottom-0 bg-white/10"}
      >
        <ul className="h-[87%] overflow-auto">
          <li className="flex flex-row justify-center text-white text-lg font-medium mt-2 text-center">Banned Users: {contextChannel}</li>
          {bannedUsers.map((user, idx) =>
            <li key={idx} className="flex flex-row justify-center">
              <div className="relative bg-modal-color w-[90%] mt-2 rounded-md py-2">
                <span className="text-white text-xl font-medium ml-4">{user}</span>
                <FontAwesomeIcon
                  icon={faSquareXmark}
                  className="h-8 w-8 absolute right-4 text-app-pink hover:cursor-pointer" 
                  onClick={() => onUnban(user, contextChannel)}
                />
              </div>
            </li>
          )}
        </ul>
        <button
          onClick={closeCModal}
          className="absolute bottom-3 right-0 left-0 w-fit mx-auto py-1 px-8 bg-app-pink text-white border-none rounded font-semibold hover:cursor-pointer"
        >
          Close
        </button>
      </ReactModal>
    </>
  );
}

export default TextChannels;