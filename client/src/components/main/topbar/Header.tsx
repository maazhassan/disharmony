import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons/faUserGroup";
import { useState } from "react";
import ReactModal from "react-modal";
import { faBan, faSquareCheck, faSquareXmark } from "@fortawesome/free-solid-svg-icons";

type HeaderProps = {
  friendRequests: string[],
  blocked: string[],
  onRespond: (to: string, accepted: boolean) => void,
  onUnblock: (to: string) => void,
  onFriendReq: (to: string) => void,
  onBlock: (to: string) => void
}

ReactModal.setAppElement("#root");

const Header = ({ friendRequests, blocked, onRespond, onUnblock, onFriendReq, onBlock }: HeaderProps) => {
  const [fmodalIsOpen, setFModalIsOpen] = useState(false);
  const [bmodalIsOpen, setBModalIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");

  const openFModal = () => {
    setFModalIsOpen(true);
  }

  const closeFModal = () => {
    setFModalIsOpen(false);
    setInputText("");
  }

  const openBModal = () => {
    setBModalIsOpen(true);
  }

  const closeBModal = () => {
    setBModalIsOpen(false);
    setInputText("");
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.currentTarget.value);
  }

  const onKeyDown = (e: React.KeyboardEvent, type: string) => {
    if (e.key == "Enter") {
      if (type === "friend") {
        onFriendReq(inputText);
        setInputText("");
      }
      else if (type === "block") {
        onBlock(inputText);
        setInputText("");
      }
    }
  }

  return (
    <div className="title-box">
      <h2 className="disharmony-title">Disharmony</h2>
      <div className="flex flex-row">
        <div className="mr-8 scale-[2]" onClick={openBModal}>
          <FontAwesomeIcon icon={faBan} className="text-white hover:text-[#1f1827] hover:cursor-pointer"/>
        </div>
        <div className="mr-12 scale-[2]" onClick={openFModal}>
          <FontAwesomeIcon icon={faUserGroup} className="text-white hover:text-[#1f1827] hover:cursor-pointer"/>
          {
            friendRequests.length > 0 &&
            <svg height="10" width="10" className="absolute top-0 right-0 scale-50">
              <circle cx="5" cy="5" r="5" fill="red" />
            </svg>
          }
        </div>
      </div>
      <ReactModal
        isOpen={fmodalIsOpen}
        onRequestClose={closeFModal}
        className={"fixed w-80 h-[30rem] bg-bg-color rounded-md outline-none top-10 right-16"}
        overlayClassName={"fixed top-0 left-0 right-0 bottom-0 bg-white/10"}
      >
        <ul className="h-[79%] overflow-auto">
          <li className="flex flex-row justify-center text-white text-xl font-medium mt-2">Friend Requests</li>
          {friendRequests.map((user, idx) =>
            <li key={idx} className="flex flex-row justify-center">
              <div className="relative bg-modal-color w-[90%] mt-2 rounded-md py-2">
                <span className="text-white text-xl font-medium ml-4">{user}</span>
                <FontAwesomeIcon
                  icon={faSquareCheck}
                  className="h-8 w-8 absolute right-14 text-[#77E688] hover:cursor-pointer"
                  onClick={() => onRespond(user, true)}
                />
                <FontAwesomeIcon
                  icon={faSquareXmark}
                  className="h-8 w-8 absolute right-4 text-app-pink hover:cursor-pointer" 
                  onClick={() => onRespond(user, false)}
                />
              </div>
            </li>
          )}
        </ul>
        <input
          className="absolute bottom-14 right-0 left-0 w-fit mx-auto bg-text-input-bg focus:outline-none rounded text-white py-1 px-1 placeholder:text-gray-200"
          placeholder="Search..."
          onKeyDown={e => onKeyDown(e, "friend")}
          onChange={e => onChange(e)}
          value={inputText}
        />
        <button
          onClick={closeFModal}
          className="absolute bottom-3 right-0 left-0 w-fit mx-auto py-1 px-8 bg-app-pink text-white border-none rounded font-semibold hover:cursor-pointer"
        >
          Close
        </button>
      </ReactModal>
      <ReactModal
        isOpen={bmodalIsOpen}
        onRequestClose={closeBModal}
        className={"fixed w-80 h-[27rem] bg-bg-color rounded-md outline-none top-10 right-28"}
        overlayClassName={"fixed top-0 left-0 right-0 bottom-0 bg-white/10"}
      >
        <ul className="h-[79%] overflow-auto">
          <span className="flex flex-row justify-center">
            <div></div>
            <li className="flex flex-row justify-center text-white text-xl font-medium mt-2">Blocked Users</li>
            <FontAwesomeIcon 
              icon={faSquareXmark}
              className="h-8 w-8 pt-2 absolute right-2.5 hover:cursor-pointer"
              onClick={closeBModal}
            />
          </span>
          {blocked.map((user, idx) =>
            <li key={idx} className="flex flex-row justify-center">
              <div className="relative bg-modal-color w-[90%] mt-2 rounded-md py-2">
                <span className="text-white text-xl font-medium ml-4">{user}</span>
                <FontAwesomeIcon
                  icon={faSquareXmark}
                  className="h-8 w-8 absolute right-5 text-app-pink hover:cursor-pointer" 
                  onClick={() => onUnblock(user)}
                />
              </div>
            </li>
          )}
        </ul>
        <input
          className="absolute bottom-9 right-0 left-0 w-fit mx-auto bg-text-input-bg focus:outline-none rounded text-white py-1 px-1 placeholder:text-gray-200"
          placeholder="Search..."
          onKeyDown={e => onKeyDown(e, "friend")}
          onChange={e => onChange(e)}
          value={inputText}
        />
      </ReactModal>
    </div>
  );
}

export default Header;