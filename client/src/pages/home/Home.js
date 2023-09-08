import React from 'react';
import '../../assets/Grid.css';
import { GridData } from '../../assets/GridData.js';
import '../../index.css';

const Home = () => {

  let loadingSpin = document.querySelector('.loading'),
    loadingPercent = document.querySelector('.loading-percent');

  let start = 0, end = 100, speed = 100;

  let loadingProcess = setInterval(() => {
    start++;

    document.querySelector('.loading-percent').textContent = `${start}%`;
    document.querySelector('.loading').style.background = `conic-gradient(greenyellow ${start * 3.6}deg, black 0)`;

    if (start === end)
      clearInterval(loadingProcess);

  }, speed);

  return (
    <div className='grid-container'>
      {
        GridData.map((item) => (
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
              <div className='loading'><span className='loading-percent'>0%</span></div>
              <div className='player-name'>pname</div>
            </div>
          </div>
        ))
      }
    </div >
  )
}

export default Home;