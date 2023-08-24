import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
          // navigate('/', {
          //   state: {
          //     token: res.data.data.Token
          //   }
          // });
          navigate(-1, {
            state: {
              token: res.data.data.Token
            }
          });
        }
        else throw new Error(res.status);
      })
      .catch(err => {
        console.log(err);
        // if (err.response.data.error === 'WrongPassword') {
        //   setRetry(err.response.data.data.RemainRetry);
        //   setShowWarning(true);
        // }
      });
  };

  return (
    <section className='login-wrapper'>
      <div className='login'>
        <span className='title'><h1><strong>Login</strong></h1></span>
        <div className='user-input'>
          <p>Username</p>
          <input type='text' value={username} onChange={handleUsernameChange} placeholder='&#61447;   Type your username' />
          <p>Password</p>
          <input type='text' value={password} onChange={handlePasswordChange} placeholder='&#61475;   Type your password' />
        </div>
        <a href='#' className='forgot-password'>Forgot password?</a>
        <button className='submit-button' onClick={handleSubmit}>LOGIN</button>

        <div className='other-login'>
          <p>Or login with</p>
          <div className='icon'>
            <a href='#' className='facebook'>
              <i className='fa fa-facebook'></i>
            </a>
            <a href='#' className='twitter'>
              <i className=' fa fa-twitter'></i>
            </a>
            <a href='#' className='google'>
              <i className=' fa fa-google'></i>
            </a>
          </div>
          {/* <div style={{ visibility: showWarning ? 'visible' : 'hidden' }}>Retry times remain: {retry}</div> */}
        </div>

        <div className='signup'>
          <p>Don't have an account?</p>
          <a href='#' className='signup-button'>Sign Up</a>
        </div>
      </div>
    </section>
  )
}

export default Login;