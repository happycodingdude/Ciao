import React, { memo, useLayoutEffect, useState } from 'react';
import '../../../src/assets/Header.css';
import useAuth from '../../hooks/useAuth.js';

const Header = (props) => {
    console.log('Header rendering');

    const { scroll, scrollToTop } = props;

    const auth = useAuth();
    const [isLogin, setIsLogin] = useState(false);

    useLayoutEffect(() => {
        console.log(`user changed: ${auth.user}`);
        auth.user ? setIsLogin(true) : setIsLogin(false);
    }, [auth.user])

    const handleLogout = () => {
        auth.logout();
        setIsLogin(false);
    }

    return (
        <header className={scroll}>
            <a href='/'><img src='' alt='Logo here'></img></a>
            <nav className='main-menu' >
                <ul>
                    <li><a href='/home'>Home</a></li>
                    <li><a href='/form'>Form</a></li>
                    <li><a href='/participant'>Participant</a></li>
                    <li><a href='/location'>Location</a></li>
                    <li><a href='/submission'>Submission</a></li>
                </ul>
            </nav>
            {
                isLogin
                    ? (
                        <div className='user-info'>
                            <a href='#' className='fa fa-user profile-icon'>  {auth.user}</a>
                            <nav>
                                <ul className='profile-menu'>
                                    <li><a href='#'>Profile</a></li>
                                    <li><a href='#'>Change password</a></li>
                                    <li><a href='#' onClick={handleLogout}>Logout</a></li>
                                </ul>
                            </nav>
                        </div>
                    )
                    : <a href='/login' className={`cta-login ${scroll}`}>Login</a>
            }
            <a href='#'
                className={`fa fa-arrow-up scroll-to-top ${scroll}`}
                onClick={scrollToTop}
            ></a>
        </header>
    )
}

export default memo(Header)