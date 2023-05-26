import React, { Component } from 'react';
import './Button.css';
import './Input.css';

class SubmitButton extends Component {
  render() {
    return (
      <div>
        <input type='text' id='username' className='input' />
        <button className='submit-button'>Submit</button>
      </div>
    )
  }
}

export default SubmitButton;