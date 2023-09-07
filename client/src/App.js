
import * as React from 'react';
import { useLayoutEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import useAuth from './hooks/useAuth.js';
import RequireAuth from './pages/RequireAuth.js';
import Home from './pages/home/Home.js';
import Login from './pages/login/Login.js';
import Form from './pages/setting/Form.js';
import Location from './pages/setting/Location.js';
import Participant from './pages/setting/Participant.js';
import Submission from './pages/setting/Submission.js';

const App = () => {
  const auth = useAuth();

  const [isLogin, setIsLogin] = useState(false);

  useLayoutEffect(() => {
    console.log(`user changed: ${auth.user}`);
    auth.user ? setIsLogin(true) : setIsLogin(false);
  }, [auth.user])

  const handleLogout = () => {
    auth.logout();
    setIsLogin(false);
  }

  return (
    <>
      <header>
        <a href='#'><img src='' alt='Logo here'></img></a>
        <nav className='main-menu'>
          <ul>
            <li><a href='/' className='active'>Home</a></li>
            <li><a href='/form'>Form</a></li>
            <li><a href='/participant'>Participant</a></li>
            <li><a href='/location'>Location</a></li>
            <li><a href='/submission'>Submission</a></li>
          </ul>
        </nav>
        {
          isLogin
            ? (
              <div className='user-info'>
                <a href='#' className='fa fa-user profile-icon'>  {auth.user}</a>
                <nav>
                  <ul className='profile-menu'>
                    <li><a href='#'>Profile</a></li>
                    <li><a href='#'>Change password</a></li>
                    <li><a href='#' onClick={handleLogout}>Logout</a></li>
                  </ul>
                </nav>
              </div>
            )
            : <a href='/login' className='cta-login'>Login</a>
        }
      </header>
      <main>
        <Home />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RequireAuth />}>
            <Route path="/form" element={<Form />} />
            <Route path="/participant" element={<Participant />} />
            <Route path="/location" element={<Location />} />
            <Route path="/submission" element={<Submission />} />
          </Route>
        </Routes>
      </main>
    </>
  )
}
export default App;