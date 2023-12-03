import { useState } from "react";
import { User } from "../../../types/websocket.types";
import UserCard from "../common/UserCard";
import { Menu, Item, useContextMenu } from "react-contexify";

type UserListProps = {
  selectedUsers: Set<string>,
  users: User[],
  userType: string,
  username: string,
  friends: string[],
  blocked: string[],
  selectedFriend: string,
  onKick: (user: string) => void,
  onBan: (user: string) => void,
  onFriendReq: (to: string) => void,
  onBlock: (to: string) => void
}

const UserList = ({ 
selectedUsers,
users,
userType,
username,
friends,
blocked,
selectedFriend,
onKick,
onBan,
onFriendReq,
onBlock
}: UserListProps) => {
  const MENU_ID = "user-card-menu";

  const [contextUser, setContextUser] = useState("");
  const [contextUserType, setContextUserType] = useState<string | undefined>("");

  const { show } = useContextMenu({
    id: MENU_ID
  });

  const displayMenu = (e: React.MouseEvent<HTMLLIElement, MouseEvent>, name: string) => {
    setContextUser(name);
    setContextUserType(users.find(u => u.username === name)?.user_type)
    show({event: e});
  }

  return (
    <div className="w-[15%] bg-modal-color"> 
      <h2 className="users-channel-h2">Users</h2>
      <ul>
      {users.filter(user => selectedUsers.has(user.username)).map((user, idx) =>
        <li 
          key={idx}
          onContextMenu={
            (user.username === username || user.username === selectedFriend) ? 
            e => e.preventDefault() : 
            e => displayMenu(e, user.username)
          }
        >
          <UserCard 
            name={user.username}
            online={user.online}
            className="ml-6 mt-2 text-white"
          />
        </li>
      )}
      </ul>
      <Menu id={MENU_ID}>
        <Item onClick={() => onKick(contextUser)} hidden={
          userType !== "ADMIN" || contextUserType === "ADMIN"
        }>
          Kick User
        </Item>
        <Item onClick={() => onBan(contextUser)} hidden={
          userType !== "ADMIN" || contextUserType === "ADMIN"
        }>
          Ban User
        </Item>        
        <Item onClick={() => onBlock(contextUser)} hidden={
          friends.includes(contextUser) || blocked.includes(contextUser)
        }>
          Block User
        </Item>
        <Item onClick={() => onFriendReq(contextUser)} hidden={
          friends.includes(contextUser) || blocked.includes(contextUser)
        }>
          Friend Request
        </Item>
      </Menu>
    </div>
  )
}

export default UserList;