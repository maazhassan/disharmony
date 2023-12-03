import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons/faUserGroup";
import { useState } from "react";
import ReactModal from "react-modal";
import { faSquareCheck, faSquareXmark } from "@fortawesome/free-solid-svg-icons";

type HeaderProps = {
  friendRequests: string[]
}

ReactModal.setAppElement("#root");

const Header = ({ friendRequests }: HeaderProps) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModal = () => {
    setModalIsOpen(true);
  }

  const closeModal = () => {
    setModalIsOpen(false);
  }

  return (
    <div className="title-box">
      <h2 className="disharmony-title">Disharmony</h2>
      <div className="relative mr-12 scale-[2]" onClick={openModal}>
        <FontAwesomeIcon icon={faUserGroup} className="text-white hover:text-[#1f1827] hover:cursor-pointer"/>
        {
          friendRequests.length > 0 &&
          <svg height="10" width="10" className="absolute top-0 right-0 scale-50">
            <circle cx="5" cy="5" r="5" fill="red" />
          </svg>
        }
      </div>
      <ReactModal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className={"fixed w-80 h-[28rem] bg-bg-color rounded-md overflow-auto outline-none top-10 right-20"}
        overlayClassName={"fixed top-0 left-0 right-0 bottom-0 bg-white/10"}
      >
        <ul>
        {friendRequests.map((user, idx) =>
          <li key={idx} className="flex flex-row justify-center">
            <div className="relative bg-modal-color w-[90%] mt-2 rounded-md py-2">
              <span className="text-white text-xl font-medium ml-4">{user}</span>
              <FontAwesomeIcon icon={faSquareCheck} className="h-8 w-8 absolute right-14 text-[#77E688] hover:cursor-pointer" />
              <FontAwesomeIcon icon={faSquareXmark} className="h-8 w-8 absolute right-4 text-app-pink hover:cursor-pointer" />
            </div>
          </li>  
        )}
        </ul>
        <button
          onClick={closeModal}
          className="absolute bottom-3 right-0 left-0 w-fit mx-auto py-1 px-8 bg-app-pink text-white border-none rounded font-semibold hover:cursor-pointer"
        >
          Close
        </button>
      </ReactModal>
    </div>
  );
}

export default Header;