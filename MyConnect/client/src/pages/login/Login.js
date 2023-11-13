import axios from 'axios';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../assets/Login.css';
import useAuth from '../../hooks/useAuth.js';
import useLogin from '../../hooks/useLogin.js';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  console.log(from);
  const auth = useAuth();

  const [isLogin, setIsLogin] = useState(false);
  useLayoutEffect(() => {
    if (auth.user) {
      setIsLogin(true);
      navigate('/', { replace: true });
    }
  }, []);

  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const errorMessageRef = useRef(null);
  const [retry, setRetry] = useState(0);

  const { username, password, handleUsernameChange, handlePasswordChange } = useLogin();

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
          errorMessageRef.current.classList.remove('active');
          auth.login(res.data.data.Token);
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 1000);
        }
        else throw new Error(res.status);
      })
      .catch(err => {
        console.log(err);
        if (err.response.data.error === 'WrongPassword') {
          setRetry(err.response.data.data.RemainRetry);
          errorMessageRef.current.classList.add('active');
        }
      });
  };

  return (
    <>
      {
        !isLogin
          ? (
            <section className='login-wrapper'>
              <div className='login'>
                <span className='title'><p>Login</p></span>

                <div className='user-input'>
                  <p>Username</p>
                  <input ref={inputRef} type='text' value={username} onChange={handleUsernameChange} placeholder='&#61447;   Type your username' />
                  <p>Password</p>
                  <input type='text' value={password} onChange={handlePasswordChange} placeholder='&#61475;   Type your password' />
                </div>

                <a href='#' className='forgot-password'>Forgot password?</a>

                <button className='cta-submit' onClick={handleSubmit}>LOGIN</button>
                <span ref={errorMessageRef} className='error-message'>Retry times remain: {retry}</span>

                <div className='other'>
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
                    <a href='#' className='cta-signup'>Sign Up</a>
                  </div>
                </div>
              </div>
            </section>
          )
          : ''
      }
    </>
  )
}

export default Login;