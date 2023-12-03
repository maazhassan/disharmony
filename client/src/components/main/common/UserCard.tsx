type UserProps = {
  name: string,
  online: boolean,
  selected: boolean,
  className?: string,
  onSelect?: (name: string) => void
}

const UserCard = ({ name, online, selected, className, onSelect }: UserProps) => {
  return (
    <div
      className={`flex flex-row hover:cursor-pointer relative ${className}`}
      onClick={onSelect ? () => onSelect(name) : undefined}
    >
      <svg height="10" width="10" className="absolute my-auto top-0 bottom-0">
        <circle cx="5" cy="5" r="5" fill={`${online ? "#34eb43" : "red"}`} />
      </svg>
      <span className={`${selected ? "text-app-pink" : "text-white"} text-xl font-medium ml-6`}>
        {name}
      </span>
    </div>
  );
}

export default UserCard;