
import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './HomePage.jsx';
import LoginPage from './LoginPage.jsx';
//import SubmissionPage from './SubmissionPage.jsx';
import BaseComponent from './BaseComponent.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/form" element={<BaseComponent page='form' />} />
      <Route path="/participant" element={<BaseComponent page='participant' />} />
      <Route path="/location" element={<BaseComponent page='location' />} />
      <Route path="/submission" element={<BaseComponent page='submission' />} />
    </Routes>
  )
}
export default App;