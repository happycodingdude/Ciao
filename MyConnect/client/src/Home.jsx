import React, { useState } from 'react';
import Chatbox from './components/Chatbox';
import Information from './components/Information';
import ListChat from './components/ListChat';

const Home = () => {
    const [conversation, setConversation] = useState();

    return (
        <section className='grow flex overflow-hidden'>
            <ListChat setConversation={setConversation} />
            <Chatbox conversation={conversation} />
            <Information conversation={conversation} />
        </section >
    )
}

export default Home