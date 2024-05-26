import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HttpRequest } from "../common/Utility";
import { useLocalStorage } from "../hook/CustomHooks";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  console.log("AuthProvider rendering");

  const navigate = useNavigate();
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
    const controller = new AbortController();
    HttpRequest({
      method: "get",
      url: import.meta.env.VITE_ENDPOINT_INFO,
      token: token,
      controller: controller,
    })
      .then((res) => {
        // if (res.response?.status === 401) {
        //   console.log("Unauthen");
        //   setToken(null);
        //   return;
        // }
        setDisplay(res.data.name);
        setId(res.data.id);
        setUser(res.data);
      })
      .catch((err) => {
        if (err?.status === 401) {
          logout();
          navigate("/authen", { replace: true });
        }
      });

    return () => {
      controller.abort();
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
