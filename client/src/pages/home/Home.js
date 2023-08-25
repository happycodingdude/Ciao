import React, { useContext, useMemo } from 'react';
import { Route, Routes } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import '../../index.css';
import Login from '../login/Login.js';
import Form from '../setting/Form.js';
import Location from '../setting/Location.js';
import Participant from '../setting/Participant.js';
import Submission from '../setting/Submission.js';

const Home = () => {
  const { auth } = useContext(AuthContext);
  console.log(auth);
  const token = useMemo(() => {
    return auth.token;
  });
  console.log(token);

  // console.log(token);
  // const navigate = useNavigate();

  // useEffect(() => {
  //   const cancelToken = axios.CancelToken.source();
  //   const headers = {
  //     'Content-Type': 'application/json',
  //     'Authorization': 'Bearer ' + token
  //   };
  //   axios.get('api/user/authenticate',
  //     { cancelToken: cancelToken.token, headers: headers })
  //     .then(res => {
  //       if (res.status !== 200) throw new Error(res.status);
  //     })
  //     .catch(err => {
  //       console.log(err);
  //       if (err.response?.status === 401) console.log('Unauthen');
  //     });

  //   return () => {
  //     cancelToken.cancel();
  //   }
  // }, [token]);

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
          {/* <Route path="/home" element={<Home />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/form" element={<Form />} />
          <Route path="/participant" element={<Participant />} />
          <Route path="/location" element={<Location />} />
          <Route path="/submission" element={<Submission />} />
          {/* </Route> */}
        </Routes>
      </main>
    </>
  )
}

export default Home;