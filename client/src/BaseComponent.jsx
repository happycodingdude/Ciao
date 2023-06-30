import React from 'react';
//import Pagination from 'react-bootstrap/Pagination';
import "react-datepicker/dist/react-datepicker.css";
import "react-datetime/css/react-datetime.css";
import { useLocation } from "react-router-dom";
import './Button.css';
import './FlexBox.css';
import FormPage from './FormPage';
import SubmissionPage from './SubmissionPage';

const BaseComponent = ({ page }) => {
  const location = useLocation();
  const { token } = location.state || '';

  return (
    <>
      {page === 'form' ? <FormPage token={token} /> : ''}
      {page === 'submission' ? <SubmissionPage token={token} /> : ''}
    </>
  )
}

export default BaseComponent;