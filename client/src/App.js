
import * as React from 'react';
import { Route, Routes } from 'react-router-dom';
import Base from './pages/Base.js';

const App = () => {
  return (
    <main>
      <Routes>
        <Route path="/" element={<Base page='login' />} />
        <Route path="/home" element={<Base page='home' />} />
        <Route path="/form" element={<Base page='form' />} />
        <Route path="/participant" element={<Base page='participant' />} />
        <Route path="/location" element={<Base page='location' />} />
        <Route path="/submission" element={<Base page='submission' />} />
      </Routes>
    </main>
  )
}
export default App;