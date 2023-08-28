import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../assets/Login.css';
import useAuth from '../../hooks/useAuth';
import useLogin from '../../hooks/useLogin.js';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const auth = useAuth();

  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { username, password, handleUsernameChange, handlePasswordChange } = useLogin();

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
          auth.login(res.data.data.Token);
          navigate(from, { replace: true });
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
          <input ref={inputRef} type='text' value={username} onChange={handleUsernameChange} placeholder='&#61447;   Type your username' />
          <p>Password</p>
          <input type='text' value={password} onChange={handlePasswordChange} placeholder='&#61475;   Type your password' />
        </div>

        <a href='#' className='forgot-password'>Forgot password?</a>

        <button className='submit-button' onClick={handleSubmit}>LOGIN</button>
        <span className='error-message'>Retry times remain: {retry}</span>

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