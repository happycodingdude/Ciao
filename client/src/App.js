
import React, { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import Background from './pages/Base/Background.js';
import Header from './pages/Base/Header.js';
import RequireAuth from './pages/RequireAuth.js';
import Home from './pages/home/Home.js';
import Login from './pages/login/Login.js';
import Form from './pages/setting/Form.js';
import Location from './pages/setting/Location.js';
import Participant from './pages/setting/Participant.js';
import Submission from './pages/setting/Submission.js';

const App = () => {
  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = (event) => {
      // if (event.currentTarget.scrollTop >= 53)
      //   console.log(event.currentTarget.scrollTop);
      console.log(document.body.scrollTop);
      console.log(window);
    };

    window.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    }
  }, []);

  // const handleScroll = (event) => {
  //   event.currentTarget.classList.add('active-scrollbar');
  //   const func = setInterval(() => {
  //     event.currentTarget.classList.remove('active-scrollbar');
  //   }, 500);
  //   clearInterval(func);
  // }

  return (
    <>
      <Background />
      <Header />
      <main>
        <Home />
        <Login />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<RequireAuth />}>
            <Route path="/form" element={<Form />} />
            <Route path="/participant" element={<Participant />} />
            <Route path="/location" element={<Location />} />
            <Route path="/submission" element={<Submission />} />
          </Route>
        </Routes>
      </main>
    </>
  )
}
export default App;