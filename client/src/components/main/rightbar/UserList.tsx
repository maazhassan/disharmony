import { User } from "../../../types/websocket.types";
import UserCard from "../common/UserCard";
import { Menu, Item, useContextMenu } from "react-contexify";

type UserListProps = {
  selectedUsers: Set<string>,
  users: User[],
  userType: string,
  username: string
}

const UserList = ({ selectedUsers, users, userType, username }: UserListProps) => {
  const MENU_ID = "user-card-menu";

  const { show } = useContextMenu({
    id: MENU_ID
  });

  const onKick = () => {
    console.log('kick')
  }

  const onBan = () => {
    console.log('ban')
  }

  const onFriendReq = () => {
    console.log('friend req')
  }

  const onBlock = () => {
    console.log('block')
  }

  return (
    <div className="w-[15%] bg-modal-color"> 
      <h2 className="users-channel-h2">Users</h2>
      <ul>
      {users.filter(user => selectedUsers.has(user.username)).map((user, idx) =>
        <li 
          key={idx}
          onContextMenu={
            user.username === username ? e => e.preventDefault() : e => show({event: e})
          }
        >
          <UserCard 
            name={user.username}
            online={user.online}
            className="ml-6 mt-2 text-white"
          />
          <Menu id={MENU_ID}>
            {
              userType === "ADMIN" &&
              <>
                <Item onClick={onKick}>
                  Kick User
                </Item>
                <Item onClick={onBan}>
                  Ban User
                </Item>
              </>
            }
            {
              userType === "USER" &&
              <Item onClick={onBlock}>
                Block User
              </Item>
            }
            <Item onClick={onFriendReq}>
              Friend Request
            </Item>
          </Menu>
        </li>
      )}
      </ul>
    </div>
  )
}

export default UserList;