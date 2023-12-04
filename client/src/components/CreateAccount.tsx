import { useState, KeyboardEvent } from 'react';
import { useAppData } from './App';


const CreateAccount = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const { handleClickCreate, connectionStatus, registerMessage } = useAppData();

  const filterSpecialChars = (e: KeyboardEvent<HTMLInputElement>) => {
    const disallowed = new Set([';', "'"]);
    if (disallowed.has(e.key)) {
      e.preventDefault();
    }
  }

  return (
    <div className="flex justify-center">
      <div className="flex flex-col mt-32 items-center h-[25rem] w-[25rem] bg-modal-color rounded-lg">
        <h2 className="text-white text-2xl mt-10">
          Create Account
        </h2>
        <input
            className="mt-10 indent-3 rounded w-72 h-10 border-none focus:outline-none"
            type='text'
            placeholder='Username...'
            onKeyDown={e => filterSpecialChars(e)}
            onChange={e => setName(e.target.value)}
          />
          <input
            className="mt-10 indent-3 rounded w-72 h-10 border-none focus:outline-none"
            type="password"
            placeholder="Password..."
            onChange={e => setPassword(e.target.value)}
          >
          </input>
        <button 
          className="py-2 px-8 mt-12 bg-app-pink text-white border-none rounded font-semibold hover:cursor-pointer"
          onClick={() => handleClickCreate(name, password)}
          disabled={connectionStatus !== "Open" || name.length === 0}
        >
          Create
        </button>
        <span className="mt-8 text-red-500">
          {registerMessage !== "" ? registerMessage : null}
        </span>
      </div>
    </div>
  );
}

export default CreateAccount;