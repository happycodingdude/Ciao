import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import useAuth from '../hook/useAuth';

const Chatbox = ({ conversation }) => {
    console.log('Chatbox calling');
    const auth = useAuth();

    const [participants, setParticipants] = useState();
    const [messages, setMessages] = useState();

    useEffect(() => {
        const cancelToken = axios.CancelToken.source();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + auth.token
        };
        axios.get(`api/conversations/${conversation?.Id}/participants`,
            { cancelToken: cancelToken.token, headers: headers })
            .then(res => {
                if (res.status === 200) {
                    console.log(res.data.data);
                    setParticipants(res.data.data);
                }
                else throw new Error(res.status);
            })
            .catch(err => {
                console.log(err);
            });
        axios.get(`api/conversations/${conversation?.Id}/messages`,
            { cancelToken: cancelToken.token, headers: headers })
            .then(res => {
                if (res.status === 200) {
                    console.log(res.data.data);
                    setMessages(res.data.data);
                }
                else throw new Error(res.status);
            })
            .catch(err => {
                console.log(err);
            });

        return () => {
            cancelToken.cancel();
        }
    }, [conversation]);

    return (
        <>
            <div className='my-[1rem] items-center flex flex-col gap-[1rem] grow'>
                <div className='w-full grow bg-white rounded-[1rem] flex flex-col overflow-hidden [&>*]:px-[2rem]'>
                    <div className='flex justify-between items-center border-b-[.1rem] border-b-gray-400'>
                        <div className='flex gap-[8rem]'>
                            <div className='flex relative'>
                                {
                                    participants?.map((item) => (
                                        <div className='w-[3rem] aspect-square rounded-[50%] bg-[red] absolute '></div>
                                    ))
                                }
                                {/* <div className='w-[3rem] aspect-square rounded-[50%] bg-[red] absolute '></div>
                                <div className='w-[3rem] aspect-square rounded-[50%] bg-gray-400  absolute left-[2rem]'></div>
                                <div className='w-[3rem] aspect-square rounded-[50%] bg-[yellow] absolute left-[4rem]'></div> */}
                            </div>
                            <a href='#' className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-gray-500 border-dashed flex justify-center items-center fa fa-plus font-normal'></a>
                        </div>
                        <div className='text-center'>
                            <p className='font-bold'>{conversation?.Title}</p>
                            <p className='text-gray-400'>status</p>
                        </div>
                        <div className='flex gap-[1rem]'>
                            <div className='fa fa-search font-normal text-gray-500'></div>
                            <div className='flex gap-[.3rem] items-center'>
                                <div className='w-[.5rem] aspect-square rounded-[50%] bg-gray-500'></div>
                                <div className='w-[.5rem] aspect-square rounded-[50%] bg-gray-500'></div>
                                <div className='w-[.5rem] aspect-square rounded-[50%] bg-gray-500'></div>
                            </div>
                        </div>
                    </div>
                    <div className='hide-scrollbar overflow-y-scroll flex flex-col gap-[2rem] my-[2rem]'>
                        {
                            messages?.map((message) => (
                                <div className='flex items-center gap-[1rem]'>
                                    <div className='w-[5rem] aspect-square rounded-[50%] self-start bg-orange-400'></div>
                                    <div className='flex flex-col w-full'>
                                        <div className='flex items-center gap-[1rem]'>
                                            {
                                                participants?.map((item) => {
                                                    if (item.ContactId === message.ContactId)
                                                        if (item.ContactId === auth.id) {
                                                            return (
                                                                <>
                                                                    <h1 className='font-bold'>You</h1>
                                                                    <p className='text-blue-400'>{moment(message.CreatedTime).format('DD/MM/YYYY HH:mm:ss')}</p>
                                                                </>
                                                            )
                                                        } else {
                                                            return (
                                                                <>
                                                                    <h1 className='font-bold'>{item.Contact.Name}</h1>
                                                                    <p className='text-gray-400'>{moment(message.CreatedTime).format('DD/MM/YYYY HH:mm:ss')}</p>
                                                                </>
                                                            )
                                                        }
                                                })
                                            }
                                            <img src='../src/img/double-check.svg' className='w-[2rem]'></img>
                                        </div>
                                        <p className=' text-gray-400'>{message.Content}</p>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className='bg-white r rounded-[1rem]  w-full flex justify-evenly items-center py-[.3rem]'>
                    <div className='grow flex justify-evenly items-center'>
                        <a href='#' className='fa fa-image font-normal text-gray-500'></a>
                        <a href='#' className='fa fa-file font-normal text-gray-500'></a>
                    </div>
                    <div className='grow-[2]'>
                        <input type='text' placeholder='Text here' className='border-gray-400 focus:outline-none border-[.1rem] rounded-[.5rem] w-full'></input>
                    </div>
                    <div className='grow flex justify-center items-center'>
                        <a href='#' className='w-[4rem] aspect-square rounded-[1rem] bg-blue-500 fa fa-paper-plane text-white font-normal flex justify-center items-center'></a>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Chatbox