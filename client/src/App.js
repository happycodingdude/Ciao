import React, { useEffect, useRef, useState } from 'react';
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
  // console.log('App rendering');
  const refMain = useRef(null);
  const [scroll, setScroll] = useState('');
  const [backgroundSize, setBackgroundSize] = useState(100);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [currentScrollY, setCurrentScrollY] = useState(0);
  const maxScaleBackgroundSize = 150;

  var scrollDebounce = true;

  // The scroll listener
  const handleScroll = () => {
    // 53 is height of header
    if (refMain.current.scrollTop >= 53)
      setScroll('scroll');
    else
      setScroll('');

    // Handle scale background image
    if (scrollDebounce) {
      scrollDebounce = false;

      setCurrentScrollY(refMain.current.scrollTop);

      // setBackgroundSize(prev => prev + 5);

      setTimeout(() => {
        scrollDebounce = true;
      }, 500);
    }
  }

  // Attach the scroll listener to window element
  useEffect(() => {
    console.log('scrolling to 0,0');
    window.scrollTo(0, 0);

    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    }
  }, [handleScroll]);

  useEffect(() => {
    // Store last scroll position
    console.log(lastScrollY);
    console.log(currentScrollY);
    if (lastScrollY === 0) {
      console.log('scrolling down');
    } else {
      if (lastScrollY < currentScrollY) {
        console.log('scrolling down');
      } else {
        console.log('scrolling up');
      }
    }
    setLastScrollY(currentScrollY);
  }, [currentScrollY]);

  // Scroll to the top of page
  const scrollToTop = () => {
    refMain.current.scrollTo(0, 0);
  }

  return (
    <div className='wrapper'
      style={{ '--width': `${backgroundSize}%` }}
    >
      <Background />
      <Header
        scroll={scroll}
        scrollToTop={scrollToTop}
      />
      <main ref={refMain}>
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
    </div>
  )
}
export default App;