import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import '../../assets/Button.css';
import '../../assets/FlexBox.css';
import '../../assets/Login.css';
import useLogin from '../../hooks/useLogin.js';

const Login = () => {
  const { username, password, handleUsernameChange, handlePasswordChange } = useLogin();
  const navigate = useNavigate();

  const [retry, setRetry] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  const handleSubmit = () => {
    const headers = {
      'Content-Type': 'application/json'
    };
    const body = JSON.stringify({
      Username: username,
      Password: password
    });
    axios.post('api/user/login',
      body,
      { headers: headers })
      .then(res => {
        if (res.status === 200) {
          navigate('/home', {
            state: {
              token: res.data.data.Token
            }
          });
        }
        else throw new Error(res.status);
      })
      .catch(err => {
        console.log(err);
        if (err.response.data.error === 'WrongPassword') {
          setRetry(err.response.data.data.RemainRetry);
          setShowWarning(true);
        }
      });
  };

  return (
    <div className='login'>
      <input type='text' value={username} onChange={handleUsernameChange} />
      <input type='text' value={password} onChange={handlePasswordChange} />
      <button className='submit-button' onClick={handleSubmit}>Login</button>
      {/* <div style={{ visibility: showWarning ? 'visible' : 'hidden' }}>Retry times remain: {retry}</div> */}
    </div>
  )
}

export default Login;