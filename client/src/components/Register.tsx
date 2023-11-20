import React, { useState } from 'react';
import '../login.css'

type RegisterProps = {
  handleClickRegister: (n: string) => void,
  connectionStatus: string,
  duplicate: boolean
}


const Register = ({ handleClickRegister, connectionStatus, duplicate }: RegisterProps) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const handlePasswordChange = (event : React.ChangeEvent<HTMLInputElement>) => {
    console.log(event.target.value);
    setPassword(event.target.value);
  }
  
  

  return (
    <div className='box'>
      <div className='login-container'>
        <div className='login-modal'>
          <h2>
            Login
          </h2>
          <input
              className="border border-black rounded"
              type='text'
              placeholder='Username...'
              onChange={e => setName(e.target.value)}
            />
            <input
              value={password}
              type="password"
              placeholder="Password"
              onChange={e => handlePasswordChange(e)}
            >
            </input>
          <button 
            className="border border-black rounded bg-green-400 ml-1 disabled:bg-red-400"
            onClick={() => handleClickRegister(name)}
            disabled={connectionStatus !== "Open" || name.length === 0}
          >
            Login
          </button>
          <div className='make-acc-link'>
            Don't have an account? <span>Click here</span>
          </div>
        </div>
      </div>

      {duplicate &&
        <span className="ml-2 text-red-600 font-bold">
          A client with this name is already connected. Try again.
        </span>
      }
      <p className={`${connectionStatus === "Open" ? "text-green-600" : "text-red-600"}`}>
        {connectionStatus === "Open" ? "Connected." : "Connecting..."}
      </p>
    </div>
  );
}

export default Register;