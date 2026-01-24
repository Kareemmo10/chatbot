import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import * as Yup from "yup";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOwner, setIsOwner] = useState(true); 
  const [companyName, setCompanyName] = useState("");
  const [invitationCode, setInvitationCode] = useState("");

  const [errors, setErrors] = useState({}); // <--- هنا نخزن كل أخطاء validation وAPI

  const navigate = useNavigate();
  const { login } = useAuth();

  // ===== SCHEMA VALIDATION باستخدام Yup =====
  const loginSchema = Yup.object({
    email: Yup.string().email("صيغة البريد الإلكتروني غير صحيحة").required("البريد الإلكتروني مطلوب"),
    password: Yup.string().min(6, "كلمة السر قصيرة جداً").required("كلمة السر مطلوبة"),
  });

  const registerSchema = Yup.object({
    fullName: Yup.string().required("الاسم الكامل مطلوب"),
    email: Yup.string().email("صيغة البريد الإلكتروني غير صحيحة").required("البريد الإلكتروني مطلوب"),
    password: Yup.string().min(6, "كلمة السر قصيرة جداً").required("كلمة السر مطلوبة"),
    confirmPassword: Yup.string().oneOf([Yup.ref("password")], "كلمة السر وتأكيدها لا تتطابق").required("تأكيد كلمة السر مطلوب"),
    companyName: isOwner ? Yup.string().required("اسم الشركة مطلوب") : Yup.string(),
    invitationCode: !isOwner ? Yup.string().required("كود الدعوة مطلوب") : Yup.string(),
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({}); // مسح أي أخطاء قديمة

    try {
      await loginSchema.validate({ email, password }, { abortEarly: false });

      const res = await fetch("https://nsaproject.runasp.net/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        setErrors({ email: errorData || "فشل تسجيل الدخول" }); // نعرض الرسالة تحت البريد
        return;
      }

      const data = await res.json();
      const token = data.token || (data.result && data.result.token);

      if (token) {
        localStorage.setItem("token", token);
        login(data);
        navigate("/");
      }
    } catch (err) {
      if (err.inner) {
        // أخطاء Yup
        const yupErrors = {};
        err.inner.forEach(e => {
          yupErrors[e.path] = e.message;
        });
        setErrors(yupErrors);
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await registerSchema.validate({ fullName, email, password, confirmPassword, companyName, invitationCode }, { abortEarly: false });

      const requestBody = {
        fullName,
        email,
        password,
        confirmPassword,
        companyName: isOwner ? companyName : null,
        invitationCode: isOwner ? null : invitationCode,
      };

      const res = await fetch("https://nsaproject.runasp.net/api/Auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorData = await res.text();
        setErrors({ general: errorData || "فشل إنشاء الحساب" }); // رسالة عامة تظهر فوق الفورم
        return;
      }

      const data = await res.json();
      const token = data.token || (data.result && data.result.token);

      if (token) {
        localStorage.setItem("token", token);
        login(data);
        navigate("/");
      }
    } catch (err) {
      if (err.inner) {
        const yupErrors = {};
        err.inner.forEach(e => {
          yupErrors[e.path] = e.message;
        });
        setErrors(yupErrors);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#101622] p-4 font-sans" dir="rtl">
      <div className="w-full md:w-[900px] h-auto md:min-h-[550px] bg-[#14171D] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row border border-[#232731]">

        {/* SIDE PANEL */}
        <div
          className={`hidden md:flex md:absolute md:top-0 md:h-full md:w-1/2
            bg-[#0F1116] text-white
            flex-col justify-center items-center px-6 md:px-10 py-8 md:py-0
            transition-all duration-700 ease-in-out z-10
            ${isLogin ? "md:right-0" : "md:right-1/2"}`}
        >
          <h1 className="text-2xl md:text-4xl font-bold mb-3">
            {isLogin ? "مرحباً بعودتك!" : "أهلاً بك!"}
          </h1>
          <p className="text-center text-sm md:text-base text-gray-300 mb-6">
            {isLogin ? "سجّل الدخول للتحدث إلي بوت الفواتير." : "أنشئ حساباً جديداً وابدأ إدارة فواتير شركتك."}
          </p>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="border border-white px-8 md:px-12 py-2 rounded-full text-sm md:text-base font-semibold hover:bg-white hover:text-[#0F1116] transition-all"
          >
            {isLogin ? "إنشاء حساب" : "تسجيل دخول"}
          </button>
        </div>

        {/* FORM WRAPPER */}
        <div
          className={`w-full md:absolute md:h-full md:flex md:items-center md:justify-center md:w-1/2
            transition-all duration-700 ease-in-out
            p-6 md:p-0
            ${isLogin ? "md:left-0" : "md:left-1/2"}`}
        >

          {/* LOGIN FORM */}
          <form
            onSubmit={handleLogin}
            className={`w-full md:w-[320px] transition-all duration-500
              ${isLogin ? "block opacity-100" : "hidden opacity-0 pointer-events-none"}`}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-white">
              تسجيل دخول
            </h2>

            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-[#1C1F26] text-white rounded-full mb-4 text-sm outline-none border border-[#262B34]"
            />
            {errors.email && <p className="text-red-500 text-xs mb-4">{errors.email}</p>}

            <input
              type="password"
              placeholder="كلمة السر"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[#1C1F26] text-white rounded-full mb-4 text-sm outline-none border border-[#262B34]"
            />
            {errors.password && <p className="text-red-500 text-xs mb-4">{errors.password}</p>}

            {errors.general && <p className="text-red-500 text-xs mb-4">{errors.general}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-[#0F1116] hover:bg-[#181B21] text-white rounded-full font-semibold text-sm shadow-lg"
            >
              دخول
            </button>

            <div className="md:hidden text-center mt-6">
              <button type="button" onClick={() => setIsLogin(false)} className="text-blue-400 font-semibold text-sm">
                إنشاء حساب جديد
              </button>
            </div>
          </form>

          {/* REGISTER FORM */}
          <form
            onSubmit={handleRegister}
            className={`w-full md:w-[320px] transition-all duration-500
              ${!isLogin ? "block opacity-100" : "hidden opacity-0 pointer-events-none"}`}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-white">
              إنشاء حساب
            </h2>

            <div className="flex bg-[#1C1F26] rounded-full p-1 mb-4 border border-[#2A2F39]">
              <button
                type="button"
                onClick={() => setIsOwner(true)}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-full transition-all ${
                  isOwner ? "bg-[#0F1116] text-white shadow-md" : "text-gray-400"
                }`}
              >
                تأسيس شركة
              </button>
              <button
                type="button"
                onClick={() => setIsOwner(false)}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-full transition-all ${
                  !isOwner ? "bg-[#0F1116] text-white shadow-md" : "text-gray-400"
                }`}
              >
                انضمام بكود
              </button>
            </div>

            <input
              type="text"
              placeholder="الاسم الكامل"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2.5 bg-[#1C1F26] text-white rounded-full mb-3 text-xs outline-none border border-[#262B34]"
            />
            {errors.fullName && <p className="text-red-500 text-xs mb-2">{errors.fullName}</p>}

            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-[#1C1F26] text-white rounded-full mb-3 text-xs outline-none border border-[#262B34]"
            />
            {errors.email && <p className="text-red-500 text-xs mb-2">{errors.email}</p>}

            {isOwner ? (
              <>
                <input
                  type="text"
                  placeholder="اسم شركتك الجديدة"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full p-2.5 bg-[#16202B] text-white border border-[#243244] rounded-full mb-3 text-xs outline-none"
                />
                {errors.companyName && <p className="text-red-500 text-xs mb-2">{errors.companyName}</p>}
              </>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="كود الدعوة (مثلاً: ABC-123)"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                  className="w-full p-2.5 bg-[#162B24] text-white border border-[#24443A] rounded-full mb-3 text-xs outline-none"
                />
                {errors.invitationCode && <p className="text-red-500 text-xs mb-2">{errors.invitationCode}</p>}
              </>
            )}

            <div className="flex gap-2 mb-4">
              <input
                type="password"
                placeholder="كلمة السر"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-1/2 p-2.5 bg-[#1C1F26] text-white rounded-full text-xs outline-none border border-[#262B34]"
              />
              {errors.password && <p className="text-red-500 text-xs mb-2">{errors.password}</p>}

              <input
                type="password"
                placeholder="تأكيدها"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-1/2 p-2.5 bg-[#1C1F26] text-white rounded-full text-xs outline-none border border-[#262B34]"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mb-2">{errors.confirmPassword}</p>}
            </div>

            {errors.general && <p className="text-red-500 text-xs mb-2">{errors.general}</p>}

            <button
              type="submit"
              className="w-full py-3 bg-[#0F1116] hover:bg-[#181B21] text-white rounded-full font-semibold text-sm shadow-lg"
            >
              إنشاء الحساب
            </button>

            <div className="md:hidden text-center mt-4">
              <button type="button" onClick={() => setIsLogin(true)} className="text-blue-400 font-semibold text-sm">
                تسجيل دخول
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
