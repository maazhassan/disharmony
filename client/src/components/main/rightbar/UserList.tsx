import { User } from "../../../types/websocket.types";
import UserCard from "../common/UserCard";

type UserListProps = {
  selectedUsers: Set<string>,
  users: User[],
  selected: string
  onSelect: (user: string) => void
}

const UserList = ({ selectedUsers, users, selected, onSelect }: UserListProps) => {
  return (
    <div className="w-[15%] bg-modal-color"> 
      <h2 className="users-channel-h2">Users</h2>
      <ul>
      {users.filter(user => selectedUsers.has(user.username)).map((user, idx) =>
        <li key={idx}>
          <UserCard 
            name={user.username}
            online={user.online}
            selected={selected === user.username}
            onSelect={user => onSelect(user)}
            className="ml-6 mt-2"
          />
        </li>
      )}
      </ul>
    </div>
    // <div>
    //   <span>Online users: </span>
    //   <ul>
    //   {users.map((user: string, idx) => 
    //     <li key={idx}>
    //       <button
    //         className={`border border-black rounded mt-1 ${selected === user ? 'bg-green-300' : 'bg-gray-300'}`}
    //         onClick={() => onSelect(user)}
    //       >
    //         {user}
    //       </button>
    //     </li>
    //   )}
    //   </ul>
    // </div>
  )
}

export default UserList;