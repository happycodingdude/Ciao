import { useRef, useState } from 'react';

function App() {
  const refMain = useRef(null);
  const scrollToTop = () => {
    refMain.current.scrollTo(0, 0);
  }

  const [dark, setDark] = useState(false);
  const toggleDarkMode = () => {
    setDark(val => {
      val = !val;
      document.querySelector('html').setAttribute('data-theme', val ? 'dark' : 'light');
      return val;
    });
  }

  return (
    <div className="text-[clamp(1.5rem,1.5vw,2.5rem)] [&>*:not(first)]:px-[2rem]" ref={refMain}>
      {/* Navbar */}
      <nav className='      
      h-[clamp(4rem,6vh,7rem)]
      bg-[var(--nav-bg-color)]
      sticky top-0
      z-[2]
      flex justify-between items-center
      shadow-[0_3px_5px_var(--box-shadow-color)]      
      duration-[var(--transition-duration)]'>
        <h1 className='cursor-pointer text-3xl'>Name</h1>
        <ul className='flex gap-[10px] p-0 m-0 h-[70%] relative'>
          <div className='flex flex-col justify-evenly cursor-pointer 
          laptop:hidden'>
            <div className='burder-div'></div>
            <div className='burder-div'></div>
            <div className='burder-div'></div>
          </div>
          <div className='flex gap-[10px]
          flex-col
          absolute
          top-[4rem] left-[-2.5rem]
          bg-[var(--box-shadow-color)]
          scale-y-1
          duration-[.5s]
          origin-top          
          laptop:flex-row'>
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
      <section id='about'>
        <h2 className='text-3xl'>About me</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cupiditate accusantium, aperiam ipsum optio, quasi quam inventore vel similique cumque rerum tenetur minima deleniti ea omnis cum repellendus harum, expedita ullam!</p>
      </section>

      {/* Skills section */}
      <section className='flex flex-col items-center gap-[2.5rem]' id='skills'>
        <h2 className='text-3xl'>My top skills</h2>
        <div className='flex gap-[2.5rem]'>
          <div className='w-[clamp(18rem,15vw,30rem)] aspect-square rounded-[1rem] shadow-[0_0_10px_var(--box-shadow-color)]'></div>
          <div className='w-[clamp(18rem,15vw,30rem)] aspect-square rounded-[1rem] shadow-[0_0_10px_var(--box-shadow-color)]'></div>
          <div className='w-[clamp(18rem,15vw,30rem)] aspect-square rounded-[1rem] shadow-[0_0_10px_var(--box-shadow-color)]'></div>
        </div>
        <div className='flex gap-[2.5rem]'>
          <div className='w-[clamp(18rem,15vw,30rem)] aspect-square rounded-[1rem] shadow-[0_0_10px_var(--box-shadow-color)]'></div>
          <div className='w-[clamp(18rem,15vw,30rem)] aspect-square rounded-[1rem] shadow-[0_0_10px_var(--box-shadow-color)]'></div>
          <div className='w-[clamp(18rem,15vw,30rem)] aspect-square rounded-[1rem] shadow-[0_0_10px_var(--box-shadow-color)]'></div>
        </div>
      </section>

      {/* Projects section */}
      <section className='flex flex-col items-center' id='projects'>
        <h2 className='text-3xl'>My projects</h2>
        <div className='w-[clamp(40rem,50%,60rem)] overflow-hidden p-[1rem]'>
          <div className='flex gap-[2rem] duration-[.5s] overflow-x-scroll snap-mandatory scroll-smooth scrollbar'>
            <div className='
            flex flex-col shrink-0
            items-center
            rounded-[1rem]
            border-[.2rem]
            border-[var(--box-shadow-color)]            
            w-[clamp(10rem,100%,60rem)]
            h-[100%]
            px-[5rem] py-[1rem]
            origin-center
            snap-center
            relative
            'id='project1'>
              <div className='flex flex-col items-center gap-[2rem]'>
                <div className='w-[clamp(10rem,60%,30rem)] aspect-[1/0.5] border-[.2rem] border-[var(--box-shadow-color)]'></div>
                <h2 className='text-2xl'>Project 1</h2>
                <p className='text-center'>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                <a href='#' className={`text-xl mt-[2rem] ${dark ? `text-shadow-[0_0_7px_#fff,0_0_10px_#fff,0_0_21px_#fff,0_0_42px_#0fa,0_0_82px_#0fa,0_0_92px_#0fa,0_0_102px_#0fa,0_0_151px_#0fa]` : ``} `}
                  onClick={(e) => { e.preventDefault(); window.open('https://google.com') }}>Live demo</a>
              </div>
              <a href='#project3' className='fa fa-arrow-left absolute top-[50%] left-[5%]'></a>
              <a href='#project2' className='fa fa-arrow-right absolute top-[50%] right-[5%]'></a>
            </div>
            <div className='
            flex flex-col shrink-0
            items-center
            rounded-[1rem]
            border-[.2rem]
            border-[var(--box-shadow-color)]            
            w-[clamp(10rem,100%,60rem)]
            h-[100%]
            px-[5rem] py-[1rem]
            origin-center
            snap-center
            relative
            'id='project2'>
              <div className='flex flex-col items-center gap-[2rem]'>
                <div className='w-[clamp(10rem,60%,30rem)] aspect-[1/0.5] border-[.2rem] border-[var(--box-shadow-color)]'></div>
                <h2 className='text-2xl'>Project 1</h2>
                <p className='text-center'>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                <a href='#' className={`text-xl mt-[2rem] ${dark ? `text-shadow-[0_0_7px_#fff,0_0_10px_#fff,0_0_21px_#fff,0_0_42px_#0fa,0_0_82px_#0fa,0_0_92px_#0fa,0_0_102px_#0fa,0_0_151px_#0fa]` : ``} `}
                  onClick={(e) => { e.preventDefault(); window.open('https://google.com') }}>Live demo</a>
              </div>
              <a href='#project1' className='fa fa-arrow-left absolute top-[50%] left-[5%]'></a>
              <a href='#project3' className='fa fa-arrow-right absolute top-[50%] right-[5%]'></a>
            </div>
            <div className='
            flex flex-col shrink-0
            items-center
            rounded-[1rem]
            border-[.2rem]
            border-[var(--box-shadow-color)]            
            w-[clamp(10rem,100%,60rem)]
            h-[100%]
            px-[5rem] py-[1rem]
            origin-center
            snap-center
            relative
            'id='project3'>
              <div className='flex flex-col items-center gap-[2rem]'>
                <div className='w-[clamp(10rem,60%,30rem)] aspect-[1/0.5] border-[.2rem] border-[var(--box-shadow-color)]'></div>
                <h2 className='text-2xl'>Project 1</h2>
                <p className='text-center'>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
                <a href='#' className={`text-xl mt-[2rem] ${dark ? `text-shadow-[0_0_7px_#fff,0_0_10px_#fff,0_0_21px_#fff,0_0_42px_#0fa,0_0_82px_#0fa,0_0_92px_#0fa,0_0_102px_#0fa,0_0_151px_#0fa]` : ``} `}
                  onClick={(e) => { e.preventDefault(); window.open('https://google.com') }}>Live demo</a>
              </div>
              <a href='#project2' className='fa fa-arrow-left absolute top-[50%] left-[5%]'></a>
              <a href='#project1' className='fa fa-arrow-right absolute top-[50%] right-[5%]'></a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact section */}

      {/* Social accounts - Fixed to the right */}

      {/* Scroll to top */}
      <a href='#' className='fa fa-arrow-up
      scroll-to-top
      w-[5rem] aspect-square
      sticky
      bottom-[2rem] left-[95%]
      border-[.2rem] border-[var(--box-shadow-color)]
      rounded-[50%]
      flex
      items-center
      justify-center
      cursor-pointer
      duration-[1s]
      ' onClick={scrollToTop}></a>

      {/* Footer section */}

      {/* Website scripts */}
    </div>
  )
}

export default App
