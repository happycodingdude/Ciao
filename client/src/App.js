
import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/home/Home.js';
import Login from './pages/login/Login.js';
//import SubmissionPage from './SubmissionPage.jsx';
import Base from './pages/Base.js';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/form" element={<Base page='form' />} />
      <Route path="/participant" element={<Base page='participant' />} />
      <Route path="/location" element={<Base page='location' />} />
      <Route path="/submission" element={<Base page='submission' />} />
    </Routes>
  )
}
export default App;