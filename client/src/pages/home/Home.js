import axios from 'axios';
import React, { useLayoutEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../assets/Button.css';
import '../../assets/FlexBox.css';

const Home = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const { token } = location.state || '';

  useLayoutEffect(() => {
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
      <h1>Home page</h1>
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