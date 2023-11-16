import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import useAuth from '../hook/useAuth';

const ListChat = ({ setConversation }) => {
    const auth = useAuth();

    // States
    const [chats, setChats] = useState([]);
    const refChatItem = useRef([]);

    // Get all data first render
    useEffect(() => {
        const cancelToken = axios.CancelToken.source();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + auth.token
        };
        axios.get('api/conversations',
            { cancelToken: cancelToken.token, headers: headers })
            .then(res => {
                if (res.status === 200) {
                    setChats(res.data.data);
                    console.log(res.data.data);

                    setTimeout(() => {
                        handleSetConversation(res.data.data[0]);
                    }, 100);
                }
                else throw new Error(res.status);
            })
            .catch(err => {
                console.log(err);
            });

        return () => {
            cancelToken.cancel();
        }
    }, []);

    const handleSetConversation = (item) => {
        setConversation(item);
        refChatItem.current.forEach(ref => {
            if (ref.dataset.key === item.Id) {
                ref.classList.add('item-active');
            } else {
                ref.classList.remove('item-active');
            }
        })
    }

    return (
        <div div className='shrink-0 w-[clamp(30rem,20vw,40rem)] flex flex-col m-[1rem] [&>*]:m-[1rem]' >
            <input type='text' placeholder='Search here' className='focus:outline-none rounded-[.5rem]'></input>
            <div className='flex flex-col overflow-hidden'>
                <div className='flex justify-between items-center h-[clamp(5rem,10vh,7rem)]'>
                    <label>Friends</label>
                    <a href='#' className='fa fa-arrow-up text-gray-500'></a>
                </div>
                <div className='hide-scrollbar overflow-y-scroll h-[clamp(30rem,50vh,50rem)] flex flex-col gap-[2rem]'>
                    {
                        chats.map((item, i) => (
                            <div data-key={item.Id} ref={element => { refChatItem.current[i] = element }}
                                className='group flex p-[1rem] cursor-pointer rounded-[1rem] 
                                hover:bg-blue-500 hover:text-white'
                                onClick={() => { handleSetConversation(item) }}>
                                <div className='flex items-start grow gap-[1rem]'>
                                    <div className='w-[4rem] aspect-square rounded-[50%] bg-orange-400'></div>
                                    <div className='grow'>
                                        <p className='font-bold'>{item.Title}</p>
                                        <p className=''>message</p>
                                    </div>
                                </div>
                                <div className='flex flex-col items-end'>
                                    <p>yesterday</p>
                                    <div className='w-[3rem] aspect-square rounded-[50%] flex justify-center items-center
                                        bg-blue-500 text-white
                                        group-hover:bg-white group-hover:text-blue-500
                                        group-[.item-active]:bg-white group-[.item-active]:text-blue-500'>5+</div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default ListChat