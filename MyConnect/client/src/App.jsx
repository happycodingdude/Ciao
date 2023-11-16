import { Route, Routes } from 'react-router-dom';
import RequireAuth from '../src/context/RequireAuth';
import './App.css';
import Home from './Home';
import Header from './components/Header';

function App() {

  return (
    <div className='text-[clamp(1.6rem,1.3vw,2rem)] flex flex-col w-full [&>*]:px-[2rem]
    bg-gradient-to-r from-purple-100 to-blue-100'>
      <Header />
      <Routes>
        <Route element={<RequireAuth />}>
          <Route path="/home" element={<Home />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
