import { User } from "../../../types/websocket.types";
import UserCard from "../common/UserCard";

type FriendsProps = {
  friends: Set<string>,
  users: User[],
  selected: string,
  onSelect: (channel: string) => void
}

const Friends = ({ friends, users, selected, onSelect }: FriendsProps) => {
  return (
    <div className="flex-grow overflow-auto">
      <h3 className="text-white text-xl indent-5 font-medium border-t-2 border-black border-solid py-2">Friends</h3>
      <ul>
      {users.filter(user => friends.has(user.username)).map((user, idx) =>
        <li
          key={idx}
          onClick={() => onSelect(user.username)}
        >
          <UserCard 
            name={user.username}
            online={user.online}
            className={`ml-6 ${selected === user.username ? "text-app-pink" : "text-white"}`}
          />
        </li>
      )}
      </ul>
    </div>
  );
}

export default Friends;