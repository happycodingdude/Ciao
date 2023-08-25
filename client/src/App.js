
import * as React from 'react';
import { useContext } from 'react';
import { Route, Routes } from 'react-router-dom';
import AuthContext from './context/AuthContext.js';
import Login from './pages/login/Login.js';
import Form from './pages/setting/Form.js';
import Location from './pages/setting/Location.js';
import Participant from './pages/setting/Participant.js';
import Submission from './pages/setting/Submission.js';

const App = () => {
  const { token, user } = useContext(AuthContext);
  console.log(token);
  console.log(user.current);

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
          <Route path="/login" element={<Login />} />
          <Route path="/form" element={<Form />} />
          <Route path="/participant" element={<Participant />} />
          <Route path="/location" element={<Location />} />
          <Route path="/submission" element={<Submission />} />
        </Routes>
      </main>
    </>
  )
}
export default App;