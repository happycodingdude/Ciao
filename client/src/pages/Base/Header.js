import React, { useLayoutEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth.js';

const Header = () => {
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
        <header>
            <a href='#'><img src='' alt='Logo here'></img></a>
            <nav className='main-menu'>
                <ul>
                    <li><a href='/' className='active'>Home</a></li>
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
                    : <a href='/login' className='cta-login'>Login</a>
            }
        </header>
    )
}

export default Header