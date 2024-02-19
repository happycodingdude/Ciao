import axios from "axios";
import React, { createContext, useEffect, useState } from "react";
import { useLocalStorage } from "../hook/CustomHooks";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  console.log("AuthProvider rendering");

  const [token, setToken] = useLocalStorage("token");
  const [display, setDisplay] = useLocalStorage("display");
  const [id, setId] = useLocalStorage("id");
  const [user, setUser] = useState();

  useEffect(() => {
    if (token === null) {
      setDisplay(null);
      setId(null);
      setUser(null);
      return;
    }
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
        setToken(token);
        setDisplay(res.data.data.Name);
        setId(res.data.data.Id);
        setUser(res.data.data);
      })
      .catch((err) => {
        console.log(err);
        if (err.code === "ERR_CANCELED") return;
        if (err.response?.status === 401) {
          console.log("Unauthen");
          setToken(null);
          setDisplay(null);
          setId(null);
          setUser(null);
        }
      });

    return () => {
      cancelToken.cancel();
    };
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
