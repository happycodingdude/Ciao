
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
      <Route path="/form" element={<BaseComponent apiEndpoint='api/form' httpVerb='GET' />} />
      <Route path="/participant" element={<BaseComponent apiEndpoint='api/participant' httpVerb='GET' />} />
      <Route path="/location" element={<BaseComponent apiEndpoint='api/location' httpVerb='GET' />} />
      <Route path="/submission" element={<BaseComponent apiEndpoint='api/submission/search' httpVerb='POST' />} />
    </Routes>
  )
}
export default App;