import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // الحالة بتتشكل من أول تحميل
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem("token");
    return savedToken ? { token: savedToken } : null;
  });

  // login: يحفظ التوكين ويثبت اليوزر
  const login = (userData) => {
    if (userData.token) {
      localStorage.setItem("token", userData.token);
      setUser({ token: userData.token });
    }
  };

  // logout: يمسح التوكين ويمسح اليوزر
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // لما يحصل ريفريش يقرأ التوكين ويعيد اليوزر
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken && !user) {
      setUser({ token: savedToken });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
