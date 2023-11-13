import axios from 'axios';
import React, { createContext, useEffect, useState } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    console.log('AuthProvider rendering')
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [user, setUser] = useState(() => localStorage.getItem('user'));

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);

            const cancelToken = axios.CancelToken.source();
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            };
            axios.get('api/user/authenticate',
                { cancelToken: cancelToken.token, headers: headers })
                .then(res => {
                    if (res.status === 200) {
                        localStorage.setItem('user', res.data.data.Username);
                        setUser(res.data.data.Username);
                    }
                    else throw new Error(res.status);
                })
                .catch(err => {
                    console.log(err);
                    if (err.response?.status === 401) {
                        console.log('Unauthen');
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setUser(null);
                    }
                });

            return () => {
                cancelToken.cancel();
            }
        }
        else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
        }
    }, [token]);

    const login = (newToken) => {
        setToken(newToken);
    }

    const logout = () => {
        setToken(null);
    }

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext