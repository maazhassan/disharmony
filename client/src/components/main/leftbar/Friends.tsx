import { useState } from "react";
import { User } from "../../../types/websocket.types";
import UserCard from "../common/UserCard";
import { Menu, Item, useContextMenu } from "react-contexify";

type FriendsProps = {
  friends: Set<string>,
  users: User[],
  selected: string,
  onSelect: (channel: string) => void,
  onRemoveFriend: (friend: string) => void
}

const Friends = ({ friends, users, selected, onSelect, onRemoveFriend }: FriendsProps) => {
  const MENU_ID = "friend-menu";

  const [contextFriend, setContextFriend] = useState("");

  const { show } = useContextMenu({
    id: MENU_ID
  });

  const displayMenu = (e: React.MouseEvent<HTMLLIElement, MouseEvent>, name: string) => {
    setContextFriend(name);
    show({event: e});
  }

  return (
    <div className="flex-grow overflow-auto">
      <h3 className="text-white text-xl indent-5 font-medium border-t-2 border-black border-solid py-2">Friends</h3>
      <ul>
      {users.filter(user => friends.has(user.username)).map((user, idx) =>
        <li
          key={idx}
          onClick={() => onSelect(user.username)}
          onContextMenu={e => displayMenu(e, user.username)}
        >
          <UserCard 
            name={user.username}
            online={user.online}
            className={`ml-6 ${selected === user.username ? "text-app-pink" : "text-white"}`}
          />
        </li>
      )}
      </ul>
      <Menu id={MENU_ID}>
        <Item onClick={() => onRemoveFriend(contextFriend)}>
          Remove Friend
        </Item>
      </Menu>
    </div>
  );
}

export default Friends;