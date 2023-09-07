import React from 'react';
import '../../assets/Grid.css';
import { GridData } from '../../assets/GridData.js';
import '../../index.css';

const Home = () => {
  console.log(GridData);
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
              <div className='loading'></div>
              <div className='player-name'>pname</div>
            </div>
          </div>
        ))
      }
    </div >
  )
}

export default Home;