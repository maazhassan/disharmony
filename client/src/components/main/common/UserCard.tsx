type UserProps = {
  name: string,
  online: boolean,
  className?: string,
}

const UserCard = ({ name, online, className }: UserProps) => {
  return (
    <div
      className={`flex flex-row hover:cursor-pointer relative ${className}`}
      
    >
      <svg height="10" width="10" className="absolute my-auto top-0 bottom-0">
        <circle cx="5" cy="5" r="5" fill={`${online ? "#34eb43" : "red"}`} />
      </svg>
      <span className="text-xl font-medium ml-6 select-none">
        {name}
      </span>
    </div>
  );
}

export default UserCard;