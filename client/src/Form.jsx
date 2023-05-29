import React, { Component } from 'react';
import SubmitButton from './Button.jsx';
import './FlexBox.css';

class LoginForm extends Component {
  render() {
    return (
      <div className='box'>
        <input id='Username' type='text' />
        <input id='Password' type='text' />
        <SubmitButton />
      </div>
    )
  }
}

export default LoginForm;