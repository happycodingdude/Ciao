import { useRef } from 'react';
import './App.css';

function App1() {
  const refMain = useRef(null);
  const scrollToTop = () => {
    refMain.current.scrollTo(0, 0);
  }

  const toggleDarkMode = () => {
    document.querySelector(':root').classList.toggle('dark');
  }

  return (
    <div className="wrapper" ref={refMain}>
      {/* Navbar */}
      <nav>
        <h1>Name</h1>
        <ul className="navigation">
          <div className='burger-menu'>
            <div></div>
            <div></div>
            <div></div>
          </div>
          <div className='main-menu'>
            <li><a href='#more-about' >About</a></li>
            <li><a href='#skills' >Skills</a></li>
            <li><a href='#projects' >Project</a></li>
            <li><a href='#contact' >Contact</a></li>
          </div>
          <div className='dark-mode-wrapper'>
            <input type='checkbox' id='checkbox' className='dark-mode' onChange={toggleDarkMode} />
            <label for='checkbox' className='dark-mode-label' >
              <i class="fa fa-moon"></i>
              <i class="fa fa-sun"></i>
            </label>
          </div>
        </ul>
      </nav>

      {/* Hero */}
      <section className='hero' id='hero'>
        {/* <div className='profile-image'></div> */}
        <img src='../src/img/hanoi4.jpg' className='profile-image'></img>
        <div className='introduction'>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Ut voluptatibus corporis veniam blanditiis nulla eaque facilis et distinctio sit, natus, qui optio magnam, quam repellendus excepturi autem praesentium vero. Distinctio.
        </div>
      </section>

      {/* About */}
      <section className='about' id='about'>
        <h2>About me</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cupiditate accusantium, aperiam ipsum optio, quasi quam inventore vel similique cumque rerum tenetur minima deleniti ea omnis cum repellendus harum, expedita ullam!</p>
      </section>

      {/* Skills section */}
      <section className='skills' id='skills'>
        <h2>My top skills</h2>
        <div className='skill-set'>
          <div className='skill'></div>
          <div className='skill'></div>
          <div className='skill'></div>
        </div>
        <div className='skill-set'>
          <div className='skill'></div>
          <div className='skill'></div>
          <div className='skill'></div>
        </div>
      </section>

      {/* Projects section */}
      <section className='projects' id='projects'>
        <h2>My projects</h2>
        <div className='projects-wrapper'>
          <div className='project-content'>
            <div className='project' id='project1'>
              <div className='project-detail'>
                <div className='project-image'></div>
                <h2>Project 1</h2>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                <a href='#' className='live-demo'>Live demo</a>
              </div>
              <a href='#project3' className='fa fa-arrow-left back-project'></a>
              <a href='#project2' className='fa fa-arrow-right next-project'></a>
            </div>
            <div className='project' id='project2'>
              <div className='project-detail'>
                <div className='project-image'></div>
                <h2>Project 2</h2>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                <a href='#' className='live-demo'>Live demo</a>
              </div>
              <a href='#project1' className='fa fa-arrow-left back-project'></a>
              <a href='#project3' className='fa fa-arrow-right next-project'></a>
            </div>
            <div className='project' id='project3'>
              <div className='project-detail'>
                <div className='project-image'></div>
                <h2>Project 3</h2>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                <a href='#' className='live-demo'>Live demo</a>
              </div>
              <a href='#project2' className='fa fa-arrow-left back-project'></a>
              <a href='#project1' className='fa fa-arrow-right next-project'></a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact section */}

      {/* Social accounts - Fixed to the right */}

      {/* Scroll to top */}
      <a href='#' className='fa fa-arrow-up scroll-to-top' onClick={scrollToTop}></a>

      {/* Footer section */}

      {/* Website scripts */}
    </div>
  )
}

export default App1;
