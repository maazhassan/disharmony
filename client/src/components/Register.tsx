import { useState } from 'react';

type RegisterProps = {
  handleClickRegister: (n: string) => void,
  connectionStatus: string,
  duplicate: boolean
}

const Register = ({ handleClickRegister, connectionStatus, duplicate }: RegisterProps) => {
  const [name, setName] = useState('');

  return (
    <>
      <label>Name: </label>
      <input
        className="border border-black rounded"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <button 
        className="border border-black rounded bg-green-400 ml-1 disabled:bg-red-400"
        onClick={() => handleClickRegister(name)}
        disabled={connectionStatus !== "Open" || name.length === 0}
      >
        Register
      </button>
      {duplicate &&
        <span className="ml-2 text-red-600 font-bold">
          A client with this name is already connected. Try again.
        </span>
      }
      <p className={`${connectionStatus === "Open" ? "text-green-600" : "text-red-600"}`}>
        {connectionStatus === "Open" ? "Connected." : "Connecting..."}
      </p>
    </>
  );
}

export default Register;