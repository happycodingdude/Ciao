import React from 'react';
import SubmitButton from './Button.jsx';
import './FlexBox.css';

const LoginForm = () => {
  return (
    <div className='box'>
      <input id='Username' type='text' />
      <input id='Password' type='text' />
      <SubmitButton />
    </div>
  )
}

export default LoginForm;