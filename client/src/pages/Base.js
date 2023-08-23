import React from 'react';
import "react-datepicker/dist/react-datepicker.css";
import "react-datetime/css/react-datetime.css";
import { useLocation } from "react-router-dom";
import Home from './home/Home.js';
import Login from './login/Login.js';
import Form from './setting/Form.js';
import Location from './setting/Location.js';
import Participant from './setting/Participant.js';
import Submission from './setting/Submission.js';

const Base = ({ page }) => {
  const location = useLocation();
  const { token } = location.state || '';

  return (
    <>
      {page === 'login' ? <Login /> : ''}
      {page === 'home' ? <Home token={token} /> : ''}
      {page === 'form' ? <Form token={token} /> : ''}
      {page === 'submission' ? <Submission token={token} /> : ''}
      {page === 'participant' ? <Participant token={token} /> : ''}
      {page === 'location' ? <Location token={token} /> : ''}
    </>
  )
}

export default Base;