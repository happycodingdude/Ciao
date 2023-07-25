import React from 'react';
//import Pagination from 'react-bootstrap/Pagination';
import "react-datepicker/dist/react-datepicker.css";
import "react-datetime/css/react-datetime.css";
import { useLocation } from "react-router-dom";
import '../assets/Button.css';
import '../assets/FlexBox.css';
import Form from './setting/Form.js';
import Submission from './setting/Submission.js';

const Base = ({ page }) => {
  const location = useLocation();
  const { token } = location.state || '';

  return (
    <>
      {page === 'form' ? <Form token={token} /> : ''}
      {page === 'submission' ? <Submission token={token} /> : ''}
    </>
  )
}

export default Base;