import './App.css'

function App() {

  return (
    <div className='flex flex-col w-screen h-screen'>
      {/* Header */}
      <section className='flex justify-between items-center 
      px-[3rem] 
      sticky top-0 z-[2]
      bg-[var(--nav-bg-color)]'>
        <a href='#' className='fa fa-arrow-left'>     Chat</a>
        <div className='text-center'>
          <p className='font-bold'>Chat name</p>
          <p className='text-[#4E73F8]'>status</p>
        </div>
        <div className='flex gap-[3rem]'>
          <div className='flex gap-[.3rem] items-center'>
            <div className='w-[.5rem] aspect-square rounded-[50%] bg-[black]'></div>
            <div className='w-[.5rem] aspect-square rounded-[50%] bg-[black]'></div>
            <div className='w-[.5rem] aspect-square rounded-[50%] bg-[black]'></div>
          </div>
          <a href='#' className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-[black]'></a>
        </div>
      </section>

      <section className='flex grow'>
        {/* List Chat */}
        <div className='border-[.1rem] border-[black]'>
          <input type='text' placeholder='search' className='border-[black] border-[.1rem] rounded-[.5rem]'></input>
          <div className='flex flex-col'>
            <div className='flex justify-between'>
              <label>Friends</label>
              <a href='#' className='fa fa-arrow-up'></a>
            </div>
            <div className='hide-scrollbar overflow-y-scroll h-[15rem]'>
              <div className='flex justify-between'>
                <div className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-[black]'></div>
                <div>
                  <p>name 1</p>
                  <p>message</p>
                </div>
                <div className='flex flex-col items-end'>
                  <p>yesterday</p>
                  <div className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-[black]'></div>
                </div>
              </div>
              <div className='flex justify-between'>
                <div className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-[black]'></div>
                <div>
                  <p>name 2</p>
                  <p>message</p>
                </div>
                <div className='flex flex-col items-end'>
                  <p>yesterday</p>
                  <div className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-[black]'></div>
                </div>
              </div>
              <div className='flex justify-between'>
                <div className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-[black]'></div>
                <div>
                  <p>name 3</p>
                  <p>message</p>
                </div>
                <div className='flex flex-col items-end'>
                  <p>yesterday</p>
                  <div className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-[black]'></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chatbox */}
        <div className='border-[.1rem] border-[black] flex flex-col grow items-center' >
          <div className='w-full flex justify-between items-center'>
            <div className='flex gap-[8rem]'>
              <div className='flex relative'>
                <div className='w-[3rem] aspect-square rounded-[50%] bg-[red] absolute '></div>
                <div className='w-[3rem] aspect-square rounded-[50%] bg-[black]  absolute left-[2rem]'></div>
                <div className='w-[3rem] aspect-square rounded-[50%] bg-[yellow] absolute left-[4rem]'></div>
              </div>
              <a href='#' className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-[black] flex justify-center items-center fa fa-arrow-up'></a>
            </div>
            <div className='text-center'>
              <p className='font-bold'>Chat name</p>
              <p className='text-[#757dba]'>status</p>
            </div>
            <div className='flex gap-[1rem]'>
              <div className='fa fa-search'></div>
              <div className='flex gap-[.3rem] items-center'>
                <div className='w-[.5rem] aspect-square rounded-[50%] bg-[black]'></div>
                <div className='w-[.5rem] aspect-square rounded-[50%] bg-[black]'></div>
                <div className='w-[.5rem] aspect-square rounded-[50%] bg-[black]'></div>
              </div>
            </div>
          </div>
          <div className='hide-scrollbar overflow-y-scroll h-[20rem] grow'>
            <div className='flex'>
              <div className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-[black]'></div>
              <div className='flex flex-col'>
                <div className='flex'>
                  <h1>name</h1>
                  <p>20:00</p>
                  <div className='fa fa-arrow-up'></div>
                </div>
                <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Incidunt odio exercitationem aperiam officia, earum, fuga cupiditate odit enim consectetur alias sed recusandae dolorem nemo asperiores. Tempora animi rerum delectus dolore.</p>
              </div>
            </div>
            <div className='flex'>
              <div className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-[black]'></div>
              <div className='flex flex-col'>
                <div className='flex'>
                  <h1>name</h1>
                  <p>20:00</p>
                  <div className='fa fa-arrow-up'></div>
                </div>
                <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Incidunt odio exercitationem aperiam officia, earum, fuga cupiditate odit enim consectetur alias sed recusandae dolorem nemo asperiores. Tempora animi rerum delectus dolore.</p>
              </div>
            </div>
            <div className='flex'>
              <div className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-[black]'></div>
              <div className='flex flex-col'>
                <div className='flex'>
                  <h1>name</h1>
                  <p>20:00</p>
                  <div className='fa fa-arrow-up'></div>
                </div>
                <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Incidunt odio exercitationem aperiam officia, earum, fuga cupiditate odit enim consectetur alias sed recusandae dolorem nemo asperiores. Tempora animi rerum delectus dolore.</p>
              </div>
            </div>
            <div className='flex'>
              <div className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-[black]'></div>
              <div className='flex flex-col'>
                <div className='flex'>
                  <h1>name</h1>
                  <p>20:00</p>
                  <div className='fa fa-arrow-up'></div>
                </div>
                <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Incidunt odio exercitationem aperiam officia, earum, fuga cupiditate odit enim consectetur alias sed recusandae dolorem nemo asperiores. Tempora animi rerum delectus dolore.</p>
              </div>
            </div>
            <div className='flex'>
              <div className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-[black]'></div>
              <div className='flex flex-col'>
                <div className='flex'>
                  <h1>name</h1>
                  <p>20:00</p>
                  <div className='fa fa-arrow-up'></div>
                </div>
                <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Incidunt odio exercitationem aperiam officia, earum, fuga cupiditate odit enim consectetur alias sed recusandae dolorem nemo asperiores. Tempora animi rerum delectus dolore.</p>
              </div>
            </div>
            <div className='flex'>
              <div className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-[black]'></div>
              <div className='flex flex-col'>
                <div className='flex'>
                  <h1>name</h1>
                  <p>20:00</p>
                  <div className='fa fa-arrow-up'></div>
                </div>
                <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Incidunt odio exercitationem aperiam officia, earum, fuga cupiditate odit enim consectetur alias sed recusandae dolorem nemo asperiores. Tempora animi rerum delectus dolore.</p>
              </div>
            </div>
            <div className='flex'>
              <div className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-[black]'></div>
              <div className='flex flex-col'>
                <div className='flex'>
                  <h1>name</h1>
                  <p>20:00</p>
                  <div className='fa fa-arrow-up'></div>
                </div>
                <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Incidunt odio exercitationem aperiam officia, earum, fuga cupiditate odit enim consectetur alias sed recusandae dolorem nemo asperiores. Tempora animi rerum delectus dolore.</p>
              </div>
            </div>
            <div className='flex'>
              <div className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-[black]'></div>
              <div className='flex flex-col'>
                <div className='flex'>
                  <h1>name</h1>
                  <p>20:00</p>
                  <div className='fa fa-arrow-up'></div>
                </div>
                <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Incidunt odio exercitationem aperiam officia, earum, fuga cupiditate odit enim consectetur alias sed recusandae dolorem nemo asperiores. Tempora animi rerum delectus dolore.</p>
              </div>
            </div>
            <div className='flex'>
              <div className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-[black]'></div>
              <div className='flex flex-col'>
                <div className='flex'>
                  <h1>name</h1>
                  <p>20:00</p>
                  <div className='fa fa-arrow-up'></div>
                </div>
                <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Incidunt odio exercitationem aperiam officia, earum, fuga cupiditate odit enim consectetur alias sed recusandae dolorem nemo asperiores. Tempora animi rerum delectus dolore.</p>
              </div>
            </div>
            <div className='flex'>
              <div className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-[black]'></div>
              <div className='flex flex-col'>
                <div className='flex'>
                  <h1>name</h1>
                  <p>20:00</p>
                  <div className='fa fa-arrow-up'></div>
                </div>
                <p>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Incidunt odio exercitationem aperiam officia, earum, fuga cupiditate odit enim consectetur alias sed recusandae dolorem nemo asperiores. Tempora animi rerum delectus dolore.</p>
              </div>
            </div>
          </div>
          <div className='w-full flex justify-evenly'>
            <div>
              <a href='#'>image</a>
              <a href='#'>file</a>
            </div>
            <div>
              <input type='text' placeholder='text here' className='border-[black] border-[.1rem] rounded-[.5rem]'></input>
            </div>
            <div>
              <a href='#'>Send</a>
            </div>
          </div>
        </div >

        {/* Information */}
        <div className='border-[.1rem] border-[black]' >
          <div className='flex gap-[10rem]'>
            <p>Contact Information</p>
            <div className='flex gap-[.3rem] items-center'>
              <div className='w-[.5rem] aspect-square rounded-[50%] bg-[black]'></div>
              <div className='w-[.5rem] aspect-square rounded-[50%] bg-[black]'></div>
              <div className='w-[.5rem] aspect-square rounded-[50%] bg-[black]'></div>
            </div>
          </div>
          <div className='flex flex-col items-center'>
            <div className='w-[5rem] aspect-square rounded-[50%] border-[.2rem] border-[black]'></div>
            <p className='font-bold'>Chat name</p>
            <p className='text-[#757dba]'>13 members</p>
            <div className='flex justify-evenly w-full'>
              <a href='#' className='w-[8rem] aspect-[1/0.5] rounded-[1rem] border-[.2rem] border-[black] flex justify-center items-center fa fa-arrow-up'></a>
              <a href='#' className='w-[8rem] aspect-[1/0.5] rounded-[1rem] border-[.2rem] border-[black] flex justify-center items-center fa fa-arrow-up'></a>
            </div>
          </div>
          <div>
            <labe>username</labe>
            <p className='text-[#4E73F8]'>@user_name</p>
          </div>
          <div>
            <div>
              <label>File</label>
              <a href='#'>See all</a>
            </div>
          </div>
          <div className=''>
            <input type='checkbox' id='checkbox' className=''></input>
            <label for='checkbox' className='' >
            </label>
          </div>
          <div>
            <a href='#'>Delete chat</a>
          </div>
        </div>
      </section>
    </div >
  )
}

export default App
