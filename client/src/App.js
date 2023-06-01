
import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import FormPage from './FormPage.jsx';
import HomePage from './HomePage.jsx';
import LocationPage from './LocationPage.jsx';
import LoginPage from './LoginPage.jsx';
import ParticipantPage from './ParticipantPage.jsx';
import SubmissionPage from './SubmissionPage.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/form" element={<FormPage />} />
      <Route path="/participant" element={<ParticipantPage />} />
      <Route path="/location" element={<LocationPage />} />
      <Route path="/submission" element={<SubmissionPage />} />
    </Routes>
  )
}
export default App;