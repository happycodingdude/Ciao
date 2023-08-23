import axios from 'axios';
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = ({ token }) => {
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
        if (err.response?.status === 401) navigate('/');
      });

    return () => {
      cancelToken.cancel();
    }
  });

  return (
    <>
      <h1>Home</h1>
      <ul>
        <li><Link to="/">Logout</Link></li>
        <li><Link to="/form" state={{ token: token }}>Form</Link></li>
        <li><Link to="/participant" state={{ token: token }}>Participant</Link></li>
        <li><Link to="/location" state={{ token: token }}>Location</Link></li>
        <li><Link to="/submission" state={{ token: token }}>Submission</Link></li>
      </ul>
    </>
  )
}

export default Home;