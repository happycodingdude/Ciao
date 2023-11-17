import axios from 'axios';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import useAuth from '../hook/useAuth';

const Chatbox = ({ conversation }) => {
    console.log('Chatbox calling');
    const auth = useAuth();

    const refChatInput = useRef();
    const refChatContent = useRef();

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

                    setTimeout(() => {
                        refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
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
    }, [conversation]);

    const scrollChatContentToBottom = () => {
        refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
    }

    const sendMessage = () => {
        const cancelToken = axios.CancelToken.source();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + auth.token
        };
        const body = {
            Type: 'text',
            Content: refChatInput.current.value,
            ContactId: auth.id,
            ConversationId: conversation.Id
        };
        axios.post(`api/messages`,
            body,
            { cancelToken: cancelToken.token, headers: headers })
            .then(res => {
                if (res.status === 200) {
                    console.log(res.data.data);
                    refChatInput.current.value = '';
                    setMessages([...messages, res.data.data]);
                    setTimeout(() => {
                        refChatContent.current.scrollTop = refChatContent.current.scrollHeight;
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
    }

    const handlePressKey = (e) => {
        if (e.key === 'Enter')
            sendMessage();
    }

    return (
        <>
            <div className='my-[1rem] items-center flex flex-col gap-[1rem] grow'>
                <div className='relative w-full grow bg-white rounded-[1rem] flex flex-col overflow-hidden [&>*]:px-[2rem]'>
                    <div className='cursor-pointer w-[3rem] aspect-square rounded-[1rem] bg-gray-300 text-gray-500 fa fa-arrow-down font-normal flex justify-center items-center
                        absolute bottom-[1rem] right-[1rem]'
                        onClick={scrollChatContentToBottom}></div>
                    <div className='flex justify-between items-center border-b-[.1rem] border-b-gray-400'>
                        <div className='flex items-center gap-[8rem] h-full relative'>
                            {
                                participants?.map((item, i) => (
                                    i < 3
                                        ? <div className={`h-[70%] aspect-square rounded-[50%] bg-[red] absolute border-[.2rem] border-white
                                            left-[${i * 2}rem]`}></div>
                                        : ''
                                ))
                            }
                            <a href='#' className='absolute left-[9rem] h-[70%] aspect-square text-[130%] rounded-[50%] border-[.2rem] border-gray-500 border-dashed flex justify-center items-center fa fa-plus font-normal'></a>
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
                    <div ref={refChatContent} className='hide-scrollbar overflow-y-scroll scroll-smooth flex flex-col gap-[2rem] my-[2rem]'>
                        {
                            messages?.map((date) => (
                                <>
                                    <div className='text-center flex items-center
                                    before:bg-gray-400 before:grow before:h-[.1rem] before:mr-[2rem]
                                    after:bg-gray-400 after:grow  after:h-[.1rem] after:ml-[2rem]'>
                                        {moment(date.Date).format('DD/MM/YYYY')}
                                    </div>
                                    {
                                        date.Messages.map((message) => (
                                            <div className='flex items-center gap-[2rem]'>
                                                <div className='w-[5rem] aspect-square rounded-[50%] self-start bg-orange-400'></div>
                                                <div className='flex flex-col w-full'>
                                                    <div className='flex items-center gap-[1rem]'>
                                                        <h1 className='font-semibold'>{message.ContactId === auth.id ? 'You' : participants?.find(item => item.ContactId === message.ContactId)?.Contact.Name}</h1>
                                                        {
                                                            participants?.find(item => item.ContactId === message.ContactId)?.IsModerator
                                                                ? <div className='bg-orange-400 rounded-[.8rem] text-[var(--text-morderator-color)] px-[.5rem] py-[.1rem]'>
                                                                    Moderator
                                                                </div>
                                                                : ''
                                                        }
                                                        <p className='text-blue-400'>{moment(message.CreatedTime).format('HH:mm')}</p>
                                                        <img src='../src/img/double-check.svg' className='w-[2rem]'></img>
                                                    </div>
                                                    <p className=' text-gray-400'>{message.Content}</p>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </>
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
                        <input ref={refChatInput} type='text' placeholder='Text here'
                            className='border-gray-400 focus:outline-none border-[.1rem] rounded-[.5rem] w-full'
                            onKeyDown={handlePressKey}></input>
                    </div>
                    <div className='grow flex justify-center items-center'>
                        <a href='#' className='w-[4rem] aspect-square rounded-[1rem] bg-blue-500 fa fa-paper-plane text-white font-normal flex justify-center items-center'
                            onClick={sendMessage}></a>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Chatbox