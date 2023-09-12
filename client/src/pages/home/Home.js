import React, { useRef } from 'react';
import '../../assets/Grid.css';
import { GridData } from '../../assets/GridData.js';
import '../../index.css';

const Home = () => {
  const loadingRef = useRef([]);
  const loadingPercentRef = useRef([]);

  let start = 0, end = 100, speed = 100;

  // let loadingProcess = setInterval(() => {
  //   start++;

  //   loadingRef.current.forEach(ref => {
  //     ref.style.background = `conic-gradient(from ${start * 3.6}deg, black, rgb(47, 255, 161))`;
  //   })
  //   loadingPercentRef.current.forEach(ref => {
  //     ref.textContent = `${start}%`;
  //   })

  //   if (start === end)
  //     clearInterval(loadingProcess);

  // }, speed);

  return (
    <div className='grid-container'>
      {
        GridData.map((item, i) => (
          <div
            className='grid-item'
            style={{ '--item-image': `url(${item.image})` }}>
            <div className='content'>
              <span className='champ-name'><p>cname</p></span>
              <div className='champ-avatar'></div>
              <div className='champ-skill'>
                <div className='skill-1'></div>
                <div className='skill-2'></div>
                <div className='skill-3'></div>
              </div>
              <div className='loading' ref={element => { loadingRef.current[i] = element }} >
                <span className='loading-percent' ref={element => { loadingPercentRef.current[i] = element }} >0%</span>
              </div>
              <div className='player-name'>pname</div>
            </div>
          </div>
        ))
      }
    </div >
  )
}

export default Home;