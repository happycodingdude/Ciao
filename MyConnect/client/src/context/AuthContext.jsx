import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  console.log("AuthProvider rendering");

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => localStorage.getItem("user"));
  const [id, setId] = useState(() => localStorage.getItem("id"));

  useEffect(() => {
    if (token) {
      const cancelToken = axios.CancelToken.source();
      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      };
      axios
        .get("api/user/authenticate", {
          cancelToken: cancelToken.token,
          headers: headers,
        })
        .then((res) => {
          if (res.status === 200) {
            localStorage.setItem("token", token);
            localStorage.setItem("user", res.data.data.Username);
            localStorage.setItem("id", res.data.data.Id);

            setUser(res.data.data.Username);
            setId(res.data.data.Id);
          } else throw new Error(res.status);
        })
        .catch((err) => {
          console.log(err);
          if (err.response?.status === 401) {
            console.log("Unauthen");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("id");
            setUser(null);
            setId(null);
          }
        });

      return () => {
        cancelToken.cancel();
      };
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("id");
      setUser(null);
    }
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, id, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
