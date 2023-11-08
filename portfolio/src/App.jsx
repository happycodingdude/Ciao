import { useRef } from 'react';

function App() {
  const refMain = useRef(null);
  const scrollToTop = () => {
    refMain.current.scrollTo(0, 0);
  }

  const toggleDarkMode = () => {
    document.querySelector(':root').classList.toggle('dark');
  }

  return (
    <div className="wrapper text-[clamp(1.5rem,1.5vw,2.5rem)]" ref={refMain}>
      {/* Navbar */}
      <nav className='      
      h-[clamp(4rem,6vh,7rem)]
      bg-[var(--nav-bg-color)]
      sticky top-0
      z-[2]
      flex justify-between items-center
      shadow-[0_3px_5px_var(--box-shadow-color)]
      px-[1rem]
      duration-[var(--transition-duration)]'>
        <h1 className='cursor-pointer'>Name</h1>
        <ul className='flex gap-[10px] p-0 m-0 h-[70%]'>
          <div className='flex flex-col justify-evenly cursor-pointer'>
            <div className='burder-div'></div>
            <div className='burder-div'></div>
            <div className='burder-div'></div>
          </div>
          <div className='flex gap-[10px]'>
            <li><a href='#about' className='relative before:absolute before:bg-red-600 before:bottom-0 before:w-[50%] before:h-[.2rem]'>About</a></li>
            <li><a href='#skills' >Skills</a></li>
            <li><a href='#projects' >Project</a></li>
            <li><a href='#contact' >Contact</a></li>
          </div>
          <div className='relative flex items-center'>
            <input type='checkbox' id='checkbox' className='absolute opacity-0 peer' onChange={toggleDarkMode} />
            <label for='checkbox' className='
            block
            text-[clamp(1.5rem,1.3vw,2rem)]
            w-[clamp(6rem,4.5vw,8rem)] h-[90%]
            bg-black
            rounded-[5rem]
            relative
            cursor-pointer
            before:h-full
            before:aspect-square
            before:bg-[#a9a9a9]
            before:rounded-[50%]
            before:border-[.2rem]
            before:border-[var(--darkmode-toggle-bd-color)]
            before:absolute
            before:z-[2]            
            before:duration-[var(--transition-duration)]
            before:peer-checked:translate-x-[140%]            
            peer-checked:bg-white            
            duration-[var(--transition-duration)]' >
              <i class="fa fa-moon absolute top-1/2 translate-y-[-50%] translate-x-[50%] text-[#ffd700]"></i>
              <i class="fa fa-sun absolute top-1/2 translate-y-[-50%] right-0 translate-x-[-50%] text-[#ffd700]"></i>
            </label>
          </div>
        </ul>
      </nav>

      {/* Hero */}
      <section className='w-full flex flex-col items-center justify-evenly' id='hero'>
        {/* <div className='profile-image'></div> */}
        <img src='../src/img/hanoi4.jpg' className='w-[clamp(45rem,80%,60rem)] p-[2rem]'></img>
        <div className='w-[clamp(40rem,50%,60rem)] p-[.5rem] rounded-[.5rem] shadow-[0_0_10px_var(--box-shadow-color)]'>
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

export default App
