import axios from 'axios';
import React, { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import '../../index.css';
import Base from '../Base.js';

const Home = ({ token }) => {
  console.log(token);
  const navigate = useNavigate();

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    };
    axios.get('api/user/authenticate',
      { cancelToken: cancelToken.token, headers: headers })
      .then(res => {
        if (res.status !== 200) throw new Error(res.status);
      })
      .catch(err => {
        console.log(err);
        if (err.response?.status === 401) console.log('Unauthen');
      });

    return () => {
      cancelToken.cancel();
    }
  }, [token]);

  return (
    <>
      <header>
        <a href='#'><img src='' alt='Logo here'></img></a>
        <nav>
          <ul>
            <li><a href='/'>Home</a></li>
            <li><a href='/form'>Form</a></li>
            <li><a href='/participant'>Participant</a></li>
            <li><a href='/location'>Location</a></li>
            <li><a href='/submission'>Submission</a></li>
            <li><a href='/login'>Login</a></li>
          </ul>
        </nav>
        <a href='#' >Information</a>
      </header>
      <main>
        <Routes>
          <Route path="/login" element={<Base page='login' />} />
          <Route path="/form" element={<Base page='form' />} />
          <Route path="/participant" element={<Base page='participant' />} />
          <Route path="/location" element={<Base page='location' />} />
          <Route path="/submission" element={<Base page='submission' />} />
        </Routes>
      </main>
    </>
  )
}

export default Home;