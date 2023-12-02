import { User } from "../../../types/websocket.types";
import UserCard from "../../common/UserCard";

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
        <li key={idx}>
          <UserCard 
            name={user.username}
            online={user.online}
            selected={selected === user.username}
            onSelect={friend => onSelect(friend)}
            className="ml-6"
          />
        </li>
      )}
      </ul>
    </div>
  );
}

export default Friends;