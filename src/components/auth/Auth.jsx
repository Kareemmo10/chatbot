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
  
  // حقول الـ Multi-tenant الجديدة
  const [isOwner, setIsOwner] = useState(true); 
  const [companyName, setCompanyName] = useState("");
  const [invitationCode, setInvitationCode] = useState("");

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
      const token = data.token || (data.result && data.result.token);

      if (token) {
        localStorage.setItem("token", token);
        login(data);
        toast.success("تم تسجيل الدخول بنجاح!");
        navigate("/");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // التحقق من الحقول الأساسية
    if (!fullName || !email || !password || !confirmPassword)
      return toast.error("يرجى ملء كل الحقول الأساسية");

    // التحقق من منطق الـ SaaS (يجب توفر اسم الشركة أو الكود)
    if (isOwner && !companyName) return toast.error("يرجى إدخال اسم الشركة لتأسيسها");
    if (!isOwner && !invitationCode) return toast.error("يرجى إدخال كود الدعوة للانضمام");

    if (password !== confirmPassword)
      return toast.error("كلمة السر وتأكيدها غير متطابقين");

    // تجهيز الـ Body حسب التحديث الجديد
    const requestBody = {
      fullName,
      email,
      password,
      confirmPassword,
      companyName: isOwner ? companyName : null,
      invitationCode: isOwner ? null : invitationCode,
    };

    try {
      const res = await fetch("https://nsaproject.runasp.net/api/Auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || "فشل إنشاء الحساب");
      }

      const data = await res.json();
      const token = data.token || (data.result && data.result.token);

      if (token) {
        localStorage.setItem("token", token);
        login(data);
        toast.success("تم إنشاء الحساب والشركة بنجاح!");
        navigate("/");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#101622] p-4 font-sans" dir="rtl">
      <div className="w-full md:w-[900px] h-auto md:min-h-[600px] bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row">

        {/* SIDE PANEL */}
        <div
          className={`
            hidden md:flex md:absolute md:top-0 md:h-full md:w-1/2
            bg-[#181B21] text-white
            flex-col justify-center items-center px-6 md:px-10 py-8 md:py-0
            transition-all duration-700 ease-in-out z-10
            ${isLogin ? "md:right-0" : "md:right-1/2"}
          `}
        >
          <h1 className="text-2xl md:text-4xl font-bold mb-3">
            {isLogin ? "مرحباً بعودتك!" : "أهلاً بك!"}
          </h1>
          <p className="text-center text-sm md:text-base opacity-90 mb-6">
            {isLogin
              ? "سجّل الدخول للتحدث إلي بوت الفواتير."
              : "أنشئ حساباً جديداً وابدأ إدارة فواتير شركتك."}
          </p>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="border-2 border-white px-8 md:px-12 py-2 rounded-full text-sm md:text-base font-semibold hover:bg-white hover:text-[#181B21] transition-all"
          >
            {isLogin ? "إنشاء حساب" : "تسجيل دخول"}
          </button>
        </div>

        {/* FORM WRAPPER */}
        <div
          className={`
            w-full md:absolute md:h-full md:flex md:items-center md:justify-center md:w-1/2
            transition-all duration-700 ease-in-out
            p-6 md:p-0
            ${isLogin ? "md:left-0" : "md:left-1/2"}
          `}
        >

          {/* LOGIN FORM */}
          <form
            onSubmit={handleLogin}
            className={`
              w-full md:w-[320px] transition-all duration-500
              ${isLogin ? "block opacity-100" : "hidden opacity-0 pointer-events-none"}
            `}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-[#181B21]">
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
              className="w-full py-3 bg-[#181B21] hover:bg-[#1f212b] text-white rounded-full font-semibold text-sm shadow-lg"
            >
              دخول
            </button>
            <div className="md:hidden text-center mt-6">
              <button type="button" onClick={() => setIsLogin(false)} className="text-blue-600 font-semibold text-sm">
                إنشاء حساب جديد
              </button>
            </div>
          </form>

          {/* REGISTER FORM */}
          <form
            onSubmit={handleRegister}
            className={`
              w-full md:w-[320px] transition-all duration-500
              ${!isLogin ? "block opacity-100" : "hidden opacity-0 pointer-events-none"}
            `}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-[#181B21]">
              إنشاء حساب
            </h2>

            {/* نظام التبديل (Tabs) لمتطلبات الـ SaaS */}
            <div className="flex bg-gray-100 rounded-full p-1 mb-4 border border-gray-200">
              <button
                type="button"
                onClick={() => setIsOwner(true)}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-full transition-all ${isOwner ? "bg-[#181B21] text-white shadow-md" : "text-gray-500"}`}
              >
                تأسيس شركة
              </button>
              <button
                type="button"
                onClick={() => setIsOwner(false)}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-full transition-all ${!isOwner ? "bg-[#181B21] text-white shadow-md" : "text-gray-500"}`}
              >
                انضمام بكود
              </button>
            </div>

            <input
              type="text"
              placeholder="الاسم الكامل"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2.5 bg-gray-100 rounded-full mb-3 text-xs outline-none"
            />
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-gray-100 rounded-full mb-3 text-xs outline-none"
            />
            
            {/* الحقل المتغير بناءً على الاختيار */}
            {isOwner ? (
              <input
                type="text"
                placeholder="اسم شركتك الجديدة"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2.5 bg-blue-50 border border-blue-100 rounded-full mb-3 text-xs outline-none"
              />
            ) : (
              <input
                type="text"
                placeholder="أدخل كود الدعوة (مثلاً: ABC-123)"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                className="w-full p-2.5 bg-green-50 border border-green-100 rounded-full mb-3 text-xs outline-none"
              />
            )}

            <div className="flex gap-2 mb-4">
              <input
                type="password"
                placeholder="كلمة السر"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-1/2 p-2.5 bg-gray-100 rounded-full text-xs outline-none"
              />
              <input
                type="password"
                placeholder="تأكيدها"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-1/2 p-2.5 bg-gray-100 rounded-full text-xs outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#181B21] hover:bg-[#1f212b] text-white rounded-full font-semibold text-sm shadow-lg"
            >
              إنشاء الحساب
            </button>

            <div className="md:hidden text-center mt-4">
              <button type="button" onClick={() => setIsLogin(true)} className="text-blue-600 font-semibold text-sm">
                تسجيل دخول
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}