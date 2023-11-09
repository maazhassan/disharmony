type UserListProps = {
    users: string[],
    onSelect: (name: any) => void,
    selected: string
  }
  
  const UserList = ({ users, onSelect, selected }: UserListProps) => {
    return (
      <div>
        <span>Online users: </span>
        <ul>
        {users.map((user: string, idx) => 
          <li key={idx}>
            <button
              className={`border border-black rounded mt-1 ${selected === user ? 'bg-green-300' : 'bg-gray-300'}`}
              onClick={() => onSelect(user)}
            >
              {user}
            </button>
          </li>
        )}
        </ul>
      </div>
    )
  }
  
  export default UserList;