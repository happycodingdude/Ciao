import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import RequireAuth from './pages/RequireAuth.js';
import Home from './pages/home/Home.js';
import Login from './pages/login/Login.js';
import Form from './pages/setting/Form.js';
import Location from './pages/setting/Location.js';
import Participant from './pages/setting/Participant.js';
import Submission from './pages/setting/Submission.js';

const App = () => {
  console.log('App rendering');
  const refMain = useRef(null);
  const [scroll, setScroll] = useState('');

  const [backgroundSize, setBackgroundSize] = useState(100);

  (function (timer) {
    window.addEventListener('load', function () {
      var el = document.querySelector('.scrollbar');
      el.addEventListener('scroll', function (e) {
        (function (el) {
          el.classList.add('scroll');
          clearTimeout(timer);
          timer = setTimeout(function () {
            el.classList.remove('scroll');
          }, 100);
        })(el);
      })
    })
  })();

  // The scroll listener
  const handleScroll = useCallback(() => {
    // 50 is height of header
    if (refMain.current.scrollTop >= 50)
      setScroll('scroll');
    else
      setScroll('');

    setBackgroundSize(100 - -refMain.current.scrollTop / 50);
  }, []);
  // const handleScroll = () => {
  //   // 50 is height of header
  //   if (refMain.current.scrollTop >= 50)
  //     setScroll('scroll');
  //   else
  //     setScroll('');

  //   setBackgroundSize(100 - -refMain.current.scrollTop / 50);
  // };

  // Attach the scroll listener to window element
  window.scrollTo(0, 0);
  useEffect(() => {
    console.log('scrolling to 0,0');

    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    }
  }, [handleScroll]);

  // Scroll to the top of page
  const scrollToTop = useCallback(() => {
    refMain.current.scrollTo(0, 0);
  }, []);

  return (
    // <div className='wrapper'
    //   style={{ '--width': `${backgroundSize}%` }}
    // >
    <>
      {/* <Background /> */}
      {/* <Header
        scroll={scroll}
        scrollToTop={scrollToTop}
      /> */}
      <main className='wrapper' ref={refMain}>
        <div className='scrollbar'>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />

            <Route element={<RequireAuth />}>
              <Route path="/form" element={<Form />} />
              <Route path="/participant" element={<Participant />} />
              <Route path="/location" element={<Location />} />
              <Route path="/submission" element={<Submission />} />
            </Route>
          </Routes>
        </div>
      </main>
    </>
    // </div>
  )
}
export default App;