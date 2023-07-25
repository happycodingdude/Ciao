import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../assets/Button.css';
import '../../assets/FlexBox.css';

const Home = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const { token } = location.state || '';

  useEffect(() => {
    const requestOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    };
    fetch('api/user/authenticate', requestOptions)
      .then(res => {
        if (res.ok) return res.json();
        else if (res.status === 401) navigate('/');
        else throw new Error(res.status);
      })
      .catch(err => console.log(err));
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