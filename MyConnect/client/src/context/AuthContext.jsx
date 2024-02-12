import axios from "axios";
import React, { createContext, useEffect, useState } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  console.log("AuthProvider rendering");

  const [token, setToken] = useState(localStorage.getItem("token"));
  const [display, setDisplay] = useState(localStorage.getItem("display"));
  const [id, setId] = useState(localStorage.getItem("id"));
  const [user, setUser] = useState();

  useEffect(() => {
    if (token) {
      const cancelToken = axios.CancelToken.source();
      const headers = {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      };
      axios
        .get("api/auth/authenticate", {
          cancelToken: cancelToken.token,
          headers: headers,
        })
        .then((res) => {
          if (res.status !== 200) throw new Error(res.status);
          localStorage.setItem("token", token);
          localStorage.setItem("display", res.data.data.Name);
          localStorage.setItem("id", res.data.data.Id);

          setDisplay(res.data.data.Name);
          setId(res.data.data.Id);
          setUser(res.data.data);
        })
        .catch((err) => {
          console.log(err);
          if (err.code === "ERR_CANCELED") return;
          if (err.response?.status === 401) {
            console.log("Unauthen");
            localStorage.removeItem("token");
            localStorage.removeItem("display");
            localStorage.removeItem("id");
            setDisplay(null);
            setId(null);
            setUser(null);
          }
        });

      return () => {
        cancelToken.cancel();
      };
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("display");
      localStorage.removeItem("id");
      setDisplay(null);
      setId(null);
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
    <AuthContext.Provider
      value={{ token, display, id, user, login, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
