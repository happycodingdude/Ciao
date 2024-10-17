import React, { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../hook/CustomHooks";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  console.log("AuthProvider rendering");

  const navigate = useNavigate();
  const [id, setId] = useLocalStorage("id");
  const [display, setDisplay] = useLocalStorage("display");
  const [token, setToken] = useLocalStorage("token");
  const [refresh, setRefresh] = useLocalStorage("refresh");
  const [user, setUser] = useState();
  const [valid, setValid] = useState(false);

  // useEffect(() => {
  //   if (token === null) {
  //     setId(null);
  //     setDisplay(null);
  //     setRefresh(null);
  //     setUser(null);
  //     return;
  //   }
  //   const controller = new AbortController();
  //   HttpRequest({
  //     method: "get",
  //     url: import.meta.env.VITE_ENDPOINT_INFO,
  //     token: token,
  //     controller: controller,
  //   })
  //     .then((res) => {
  //       setDisplay(res.data.name);
  //       setId(res.data.id);
  //       setUser(res.data);
  //       setValid(true);
  //     })
  //     .catch((err) => {
  //       if (err?.status === 401) {
  //         refreshToken();
  //       }
  //     });

  //   return () => {
  //     controller.abort();
  //   };
  // }, [token]);

  // const refreshToken = () => {
  //   HttpRequest({
  //     method: "post",
  //     url: import.meta.env.VITE_ENDPOINT_REFRESH,
  //     data: {
  //       refreshToken: refresh,
  //     },
  //   })
  //     .then((res) => {
  //       login(res.data.accessToken, res.data.refreshToken);
  //     })
  //     .catch((err) => {
  //       navigate("/authen", { replace: true });
  //     });
  // };

  const login = (newToken, refreshToken) => {
    setToken(newToken);
    setRefresh(refreshToken);
  };

  const logout = () => {
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, valid, id, display, user, login, logout, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
