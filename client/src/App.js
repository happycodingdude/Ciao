
import * as React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Base from './pages/Base.js';

const App = ({ token }) => {
  const location = useLocation();
  // const { token } = location.state || '';
  console.log(token);

  return (
    <>
      <header>
        <a href='#'><img src='' alt='Logo here'></img></a>
        <nav>
          <ul>
            <li><a href='/'>Home</a></li>
            <li><a href='/form'>Form</a></li>
            <li><a href='/participant'>Participant</a></li>
            <li><a href='/location'>Location</a></li>
            <li><a href='/submission'>Submission</a></li>
            <li><a href='/login'>Login</a></li>
          </ul>
        </nav>
        <a href='#' >Information</a>
      </header>
      <main>
        <Routes>
          <Route path="/login" element={<Base page='login' />} />
          <Route path="/form" element={<Base page='form' />} />
          <Route path="/participant" element={<Base page='participant' />} />
          <Route path="/location" element={<Base page='location' />} />
          <Route path="/submission" element={<Base page='submission' />} />
        </Routes>
      </main>
    </>
  )
}
export default App;