import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Button.css';
import './FlexBox.css';

const useInstance = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  return {
    username,
    password,
    handleUsernameChange,
    handlePasswordChange
  };
}

const LoginPage = () => {

  const navigate = useNavigate();
  const { username, password, handleUsernameChange, handlePasswordChange } = useInstance();

  const handleSubmit = (event) => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        Username: username,
        Password: password
      })
    };
    fetch('api/user/login', requestOptions)
      .then(res => {
        if (res.ok) return res.json();
        else throw new Error(res.status);
      })
      .then(data => {
        console.log(data.Token);
        navigate('/home', {
          state: {
            token: data.Token
          }
        });
      })
      .catch(err => console.log(err));
  };

  return (
    <div className='box'>
      <input type='text' value={username} onChange={handleUsernameChange} />
      <input type='text' value={password} onChange={handlePasswordChange} />
      <button className='submit-button' onClick={handleSubmit}>Login</button>
    </div>
  )
}

export default LoginPage;