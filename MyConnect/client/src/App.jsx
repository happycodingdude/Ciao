import './App.css';

function App() {

  const friends = ['friend 1', 'friend 2', 'friend 3', 'friend 4', 'friend 5', 'friend 6', 'friend 7', 'friend 8', 'friend 9', 'friend 10'];

  return (
    <div className='text-[clamp(1.5rem,1.5vw,2.5rem)] flex flex-col [&>*]:px-[2rem]
    bg-gradient-to-r from-purple-100 to-blue-100'>
      {/* Header */}
      <section className='h-[clamp(5rem,6vh,7rem)] sticky top-0 z-[2] bg-[var(--nav-bg-color)] flex'>
        {/* Phone, Tablet */}
        <div className=' flex justify-between items-center laptop:hidden'>
          <a href='#' className='fa fa-arrow-left text-lg'>&ensp;Chat</a>
          <div className='text-center'>
            <p className='font-bold text-xl'>Chat name</p>
            <p className='text-blue-500 text-lg'>status</p>
          </div>
          <div className='flex gap-[3rem]'>
            <div className='flex gap-[.3rem] items-center'>
              <div className='w-[.5rem] aspect-square rounded-[50%] bg-gray-400'></div>
              <div className='w-[.5rem] aspect-square rounded-[50%] bg-gray-400'></div>
              <div className='w-[.5rem] aspect-square rounded-[50%] bg-gray-400'></div>
            </div>
            <a href='#' className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-gray-400'></a>
          </div>
        </div>
        {/* Laptop, Desktop */}
        <div className=' flex justify-between items-center grow'>
          <a href='#' className='text-2xl'>Messenger</a>
          <div className='flex items-center gap-[3rem]'>
            <a href='#' className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-gray-400'></a>
            <div className='text-left'>
              <p className='text-lg'>Chat name</p>
              <p className='text-blue-500 text-base'>status</p>
            </div>
            <a href='#' className='w-[3rem] aspect-square rounded-[1rem] bg-gray-300 text-gray-500 fa fa-arrow-down font-normal flex justify-center items-center'></a>
          </div>
        </div>
      </section>

      <section className='flex overflow-hidden'>
        {/* List Chat */}
        <div className='shrink-0 w-[clamp(30rem,20vw,40rem)] flex flex-col m-[1rem] [&>*]:m-[1rem] shrink-0 w-[clamp(30rem,20vw,40rem)]'>
          <input type='text' placeholder='search' className='rounded-[.5rem]'></input>
          <div className='flex flex-col overflow-hidden'>
            <div className='flex justify-between items-center h-[clamp(5rem,10vh,7rem)]'>
              <label>Friends</label>
              <a href='#' className='fa fa-arrow-up'></a>
            </div>
            <div className='hide-scrollbar overflow-y-scroll h-[clamp(30rem,50vh,50rem)] flex flex-col gap-[2rem]'>
              {
                friends.map((item) => (
                  <div className='flex p-[1rem] cursor-pointer hover:bg-red-100'>
                    <div className='flex items-start grow gap-[1rem]'>
                      <div className='w-[4rem] aspect-square rounded-[50%] border-[.2rem] border-gray-400'></div>
                      <div className='grow'>
                        <p className='text-lg font-bold'>{item}</p>
                        <p className='text-base'>message</p>
                      </div>
                    </div>
                    <div className='flex flex-col items-end'>
                      <p>yesterday</p>
                      <div className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-gray-400'></div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Chatbox */}
        <div className='my-[1rem] items-center flex flex-col gap-[1rem]' >
          <div className='bg-white rounded-[1rem] flex flex-col overflow-hidden [&>*]:px-[2rem]'>
            <div className='w-full flex justify-between items-center border-b-[.1rem] border-b-gray-400'>
              <div className='flex gap-[8rem]'>
                <div className='flex relative'>
                  <div className='w-[3rem] aspect-square rounded-[50%] bg-[red] absolute '></div>
                  <div className='w-[3rem] aspect-square rounded-[50%] bg-gray-400  absolute left-[2rem]'></div>
                  <div className='w-[3rem] aspect-square rounded-[50%] bg-[yellow] absolute left-[4rem]'></div>
                </div>
                <a href='#' className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-gray-400 border-dashed flex justify-center items-center fa fa-plus font-normal'></a>
              </div>
              <div className='text-center'>
                <p className='text-lg font-bold'>Chat name</p>
                <p className='text-base text-gray-400'>status</p>
              </div>
              <div className='flex gap-[1rem]'>
                <div className='fa fa-search font-normal'></div>
                <div className='flex gap-[.3rem] items-center'>
                  <div className='w-[.5rem] aspect-square rounded-[50%] bg-gray-400'></div>
                  <div className='w-[.5rem] aspect-square rounded-[50%] bg-gray-400'></div>
                  <div className='w-[.5rem] aspect-square rounded-[50%] bg-gray-400'></div>
                </div>
              </div>
            </div>
            <div className='hide-scrollbar overflow-y-scroll flex flex-col gap-[2rem] my-[2rem]'>
              {
                friends.map((item) => (
                  <div className='flex items-center gap-[1rem]'>
                    <div className='w-[5rem] aspect-square rounded-[50%] border-[.2rem] border-gray-400 self-start'></div>
                    <div className='flex flex-col w-full'>
                      <div className='flex items-center gap-[1rem] text-base'>
                        <h1 className='font-bold'>{item}</h1>
                        <p>20:00</p>
                        <img src='../src/img/double-check.svg' className='w-[2rem]'></img>
                      </div>
                      <p className='text-base text-gray-400'>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Incidunt odio exercitationem aperiam officia, earum, fuga cupiditate odit enim consectetur alias sed recusandae dolorem nemo asperiores. Tempora animi rerum delectus dolore.</p>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          <div className='bg-white r rounded-[1rem]  w-full flex justify-evenly items-center py-[.3rem]'>
            <div className='grow flex justify-evenly items-center'>
              <a href='#' className='fa fa-image font-normal'></a>
              <a href='#' className='fa fa-file font-normal'></a>
            </div>
            <div className='grow-[2]'>
              <input type='text' placeholder='text here' className='border-gray-400 border-[.1rem] rounded-[.5rem] w-full'></input>
            </div>
            <div className='grow flex justify-center items-center'>
              <a href='#' className='w-[4rem] aspect-square rounded-[1rem] bg-blue-500 fa fa-paper-plane text-white font-normal flex justify-center items-center'></a>
            </div>
          </div>
        </div >

        {/* Information */}
        <div className='bg-white shrink-0 w-[clamp(30rem,20vw,40rem)] rounded-[1rem] m-[1rem] [&>*]:px-[1rem] [&>*]:pb-[1rem] [&>*:not(:first-child)]:mt-[2rem]' >
          <div className='flex justify-between pt-[1rem] border-b-[.1rem] border-b-gray-400'>
            <p className='text-lg font-bold'>Contact Information</p>
            <div className='flex gap-[.3rem] items-center'>
              <div className='w-[.5rem] aspect-square rounded-[50%] bg-gray-400'></div>
              <div className='w-[.5rem] aspect-square rounded-[50%] bg-gray-400'></div>
              <div className='w-[.5rem] aspect-square rounded-[50%] bg-gray-400'></div>
            </div>
          </div>
          <div className='flex flex-col gap-[1rem] border-b-[.1rem] border-b-gray-400'>
            <div className='flex flex-col items-center'>
              <div className='w-[5rem] aspect-square rounded-[50%] border-[.2rem] border-gray-400'></div>
              <p className='text-lg font-bold'>Chat name</p>
              <p className='text-base text-gray-400'>13 members</p>
            </div>
            <div className='flex justify-evenly w-full'>
              <a href='#' className='w-[7rem] aspect-[1/0.5] rounded-[1rem] border-[.1rem] border-gray-400 flex justify-center items-center fa fa-phone font-normal text-blue-500'></a>
              <a href='#' className='w-[7rem] aspect-[1/0.5] rounded-[1rem] border-[.1rem] border-gray-400 flex justify-center items-center fa fa-video font-normal text-blue-500'></a>
            </div>
          </div>
          <div className=' border-b-[.1rem] border-b-gray-400'>
            <label className='text-[#757dba] text-base uppercase'>username</label>
            <p className='text-blue-500'>@user_name</p>
          </div>
          <div className=' border-b-[.1rem] border-b-gray-400'>
            <div className='flex justify-between'>
              <label>Files</label>
              <a href='#' className='text-blue-500'>See all</a>
            </div>
          </div>
          <div className='flex justify-between  border-b-[.1rem] border-b-gray-400'>
            <label className='fa fa-bell font-normal'>&ensp;Notification</label>
            <div className='relative'>
              <input type='checkbox' id='checkbox' className='absolute opacity-0 peer'></input>
              <label for='checkbox' className='
                block
                text-[clamp(1.5rem,1.3vw,2rem)]
                w-[clamp(4rem,3.5vw,5rem)] h-[100%]
                bg-[#a9a9a9]
                rounded-[5rem]
                relative
                cursor-pointer
                duration-[.3s]
                peer-checked:bg-blue-500
                before:h-full
                before:aspect-square
                before:bg-white
                before:rounded-[50%]
                before:border-[.2rem]
                before:border-[var(--darkmode-toggle-bd-color)]
                before:absolute
                before:z-[2]
                before:duration-[.3s]
                before:peer-checked:translate-x-[93%]
                laptop:before:peer-checked:translate-x-[130%]'>
              </label>
            </div>
          </div>
          <div>
            <a href='#' className='fa fa-trash font-normal text-red-500'>&ensp;Delete chat</a>
          </div>
        </div>
      </section >
    </div >
  )
}

export default App
