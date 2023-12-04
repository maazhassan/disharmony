import { useState } from 'react';
import { useAppData } from './App';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { handleClickLogin, connectionStatus } = useAppData();

  return (
    <div className="flex justify-center">
      <div className="flex flex-col mt-32 items-center h-[30rem] w-[25rem] bg-modal-color rounded-lg">
        <h2 className="text-white text-2xl mt-10">
          Login
        </h2>
        <input
            className="mt-10 indent-3 rounded w-72 h-10 border-none focus:outline-none"
            type='text'
            placeholder='Username...'
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
          onClick={() => handleClickLogin(name, password)}
          disabled={connectionStatus !== "Open" || name.length === 0}
        >
          Login
        </button>
        <div className="text-white mt-24">
          Don't have an account?&nbsp;
          <span
            className="text-app-pink underline hover:cursor-pointer hover:text-app-pink"
            onClick={() => navigate("/create")}
          >
            Click here!
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;