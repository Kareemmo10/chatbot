import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("يرجى إدخال البريد وكلمة السر");

    try {
      const res = await fetch("https://nsaproject.runasp.net/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "فشل تسجيل الدخول");
      }

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
      } else if (data.result && data.result.token) {
        localStorage.setItem("token", data.result.token);
      }

      login(data);
      toast.success("تم تسجيل الدخول بنجاح!");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword)
      return toast.error("يرجى ملء كل الحقول");

    if (password !== confirmPassword)
      return toast.error("كلمة السر وتأكيدها غير متطابقين");

    try {
      const res = await fetch("https://nsaproject.runasp.net/api/Auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, confirmPassword }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "فشل إنشاء الحساب");
      }

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
      } else if (data.result && data.result.token) {
        localStorage.setItem("token", data.result.token);
      }

      login({ token: data.token });
      toast.success("تم إنشاء الحساب بنجاح!");
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#101622] p-4">
      <div className="w-full md:w-[900px] h-auto md:h-[550px] bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row">

        {/* SIDE PANEL */}
        <div
          className={`
            hidden md:flex md:absolute md:top-0 md:h-full md:w-1/2
            bg-[#181B21] text-white
            flex-col justify-center items-center px-6 md:px-10 py-8 md:py-0
            transition-all duration-700 ease-in-out
            ${isLogin ? "md:left-0" : "md:left-1/2"}
          `}
        >
          <h1 className="text-2xl md:text-4xl font-bold mb-3">
            {isLogin ? "مرحباً بعودتك!" : "أهلاً بك!"}
          </h1>

          <p className="text-center text-sm md:text-base opacity-90 mb-6">
            {isLogin
              ? "سجّل الدخول للتحدث الي بوت الفواتير ."
              : "أنشئ حساباً جديداً للتحدث مع بوت الفواتير ."}
          </p>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="border-2 border-white px-8 md:px-12 py-2 rounded-full text-sm md:text-base font-semibold hover:bg-white hover:text-blue-700 transition-all"
          >
            {isLogin ? "إنشاء حساب" : "تسجيل دخول"}
          </button>
        </div>

        {/* WHITE FORM WRAPPER */}
        <div
          className={`
            w-full md:absolute md:h-full md:flex md:items-center md:justify-center md:w-1/2
            transition-all duration-700 ease-in-out
            p-6 md:p-0
            ${isLogin ? "md:right-0" : "md:left-0"}
          `}
        >

          {/* LOGIN FORM */}
          <form
            onSubmit={handleLogin}
            className={`
              w-full md:w-[320px] transition-all duration-500
              ${isLogin ? "block md:opacity-100" : "hidden md:opacity-0 md:pointer-events-none"}
            `}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-7 text-[#181B21]">
              تسجيل دخول
            </h2>

            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-100 rounded-full mb-4 text-sm outline-none"
            />

            <input
              type="password"
              placeholder="كلمة السر"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-100 rounded-full mb-6 text-sm outline-none"
            />

            <button
              type="submit"
              className="w-full py-3 bg-[#181B21] hover:bg-[#1f212b] text-white rounded-full font-semibold text-sm md:text-base"
            >
              دخول
            </button>

            {/* Mobile Toggle */}
            <div className="md:hidden text-center mt-6">
              <p className="text-gray-600 text-sm mb-3">أو</p>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 font-semibold text-sm hover:text-blue-800"
              >
                إنشاء حساب جديد
              </button>
            </div>
          </form>

          {/* REGISTER FORM */}
          <form
            onSubmit={handleRegister}
            className={`
              w-full md:absolute md:w-[320px] transition-all duration-500
              ${!isLogin ? "block md:opacity-100" : "hidden md:opacity-0 md:pointer-events-none"}
            `}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-7 text-[#181B21]">
              إنشاء حساب
            </h2>

            <input
              type="text"
              placeholder="الاسم الكامل"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 bg-gray-100 rounded-full mb-4 text-sm outline-none"
            />

            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-100 rounded-full mb-4 text-sm outline-none"
            />

            <input
              type="password"
              placeholder="كلمة السر"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-100 rounded-full mb-4 text-sm outline-none"
            />

            <input
              type="password"
              placeholder="تأكيد كلمة السر"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-gray-100 rounded-full mb-6 text-sm outline-none"
            />

            <button
              type="submit"
              className="w-full py-3 bg-[#181B21] hover:bg-[#1f212b] text-white rounded-full font-semibold text-sm md:text-base"
            >
              إنشاء حساب
            </button>

            {/* Mobile Toggle */}
            <div className="md:hidden text-center mt-6">
              <p className="text-gray-600 text-sm mb-3">أو</p>
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 font-semibold text-sm hover:text-blue-800"
              >
                تسجيل الدخول
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
