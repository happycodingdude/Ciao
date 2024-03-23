import React, { createContext, useEffect, useState } from "react";
import { HttpRequest } from "../common/Utility";
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
    const controller = new AbortController();
    const config = {
      method: "get",
      url: "api/auth/authenticate",
      token: token,
      controller: controller,
    };
    HttpRequest(config).then((res) => {
      if (!res) return;
      if (res.response?.status === 401) {
        console.log("Unauthen");
        setToken(null);
        return;
      }
      setDisplay(res.Name);
      setId(res.Id);
      setUser(res);
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
