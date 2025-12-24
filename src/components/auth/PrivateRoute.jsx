import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

// كمبوننت يحمي الصفحات
export default function PrivateRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />; // لو مش مسجل دخول يروح لصفحة Auth
  }

  return children; // لو مسجل دخول، يسمح بالدخول للصفحة
}
