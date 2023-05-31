import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Button.css';
import './FlexBox.css';

const HomePage = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const { token } = location.state || '';

  useEffect(() => {
    console.log(token);
    if (token === undefined) navigate('/');
  });

  return (
    <>
      <h1>Home page</h1>
      <ul>
        <li><Link to="/">Logout</Link></li>
        <li><Link to="/form" state={{ token: token }}>Form</Link></li>
        <li><Link to="/participant" state={{ token: token }}>Participant</Link></li>
        <li><Link to="/location" state={{ token: token }}>Location</Link></li>
      </ul>
    </>
  )
}

export default HomePage;