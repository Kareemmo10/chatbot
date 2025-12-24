// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import { useAuth } from "./AuthContext";

// export default function Auth() {
//   const [isLogin, setIsLogin] = useState(true);
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     if (!email || !password) return toast.error("يرجى إدخال البريد وكلمة السر");

//     try {
//       const res = await fetch("https://nsaproject.runasp.net/api/Auth/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });
      
//       if (!res.ok) {
//         // قراءة رسالة الخطأ من السيرفر لو موجودة
//         const errorData = await res.text(); 
//         throw new Error(errorData || "فشل تسجيل الدخول");
//       }

//       const data = await res.json();

//       // +++++++++++++++ [التعديل هنا] +++++++++++++++
//       // 1. اطبع الداتا عشان نتأكد شكلها إيه
//       console.log("Login Response Data:", data); 

//       // 2. احفظ التوكين في localStorage باسم "token"
//       // ملاحظة: لو السيرفر مسميه "jwt" أو "accessToken" غير كلمة data.token
//       if (data.token) {
//           localStorage.setItem("token", data.token);
//       } else if (data.result && data.result.token) { 
//           // أحياناً التوكين بيكون جوه اوبجكت result
//           localStorage.setItem("token", data.result.token);
//       }

//       login(data);
//       toast.success("تم تسجيل الدخول بنجاح!");
//       navigate("/");
//     } catch (err) {
//       console.error(err);
//       toast.error(err.message);
//     }
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     if (!fullName || !email || !password || !confirmPassword)
//       return toast.error("يرجى ملء كل الحقول");

//     if (password !== confirmPassword)
//       return toast.error("كلمة السر وتأكيدها غير متطابقين");

//     try {
//       const res = await fetch("https://nsaproject.runasp.net/api/Auth/register", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ fullName, email, password, confirmPassword }),
//       });

//       if (!res.ok) {
//          const errorData = await res.text();
//          throw new Error(errorData || "فشل إنشاء الحساب");
//       }

//       const data = await res.json();

//       console.log("Register Response Data:", data);
      
//       if (data.token) {
//           localStorage.setItem("token", data.token);
//       } else if (data.result && data.result.token) {
//           localStorage.setItem("token", data.result.token);
//       }

//       login({ token: data.token });
//       toast.success("تم إنشاء الحساب بنجاح!");
//       navigate("/");
//     } catch (err) {
//       console.error(err);
//       toast.error(err.message);
//     }
//   };
//   return (
//     <div className="flex justify-center items-center h-screen bg-gray-100">
//       <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
//         {/* Tabs */}
//         <div className="flex justify-center mb-6 gap-4">
//           <button
//             onClick={() => setIsLogin(true)}
//             className={`px-4 py-2 rounded-t-xl font-semibold ${
//               isLogin ? "bg-blue-600 text-white" : "bg-gray-200"
//             }`}
//           >
//             تسجيل دخول
//           </button>
//           <button
//             onClick={() => setIsLogin(false)}
//             className={`px-4 py-2 rounded-t-xl font-semibold ${
//               !isLogin ? "bg-blue-600 text-white" : "bg-gray-200"
//             }`}
//           >
//             إنشاء حساب
//           </button>
//         </div>

//         {/* Form */}
//         {isLogin ? (
//           <form onSubmit={handleLogin} className="space-y-4">
//             <input
//               type="email"
//               placeholder="البريد الإلكتروني"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-3 border rounded"
//             />
//             <input
//               type="password"
//               placeholder="كلمة السر"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-3 border rounded"
//             />
//             <button
//               type="submit"
//               className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
//             >
//               تسجيل الدخول
//             </button>
//           </form>
//         ) : (
//           <form onSubmit={handleRegister} className="space-y-4">
//             <input
//               type="text"
//               placeholder="الاسم الكامل"
//               value={fullName}
//               onChange={(e) => setFullName(e.target.value)}
//               className="w-full p-3 border rounded"
//             />
//             <input
//               type="email"
//               placeholder="البريد الإلكتروني"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-3 border rounded"
//             />
//             <input
//               type="password"
//               placeholder="كلمة السر"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-3 border rounded"
//             />
//             <input
//               type="password"
//               placeholder="تأكيد كلمة السر"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               className="w-full p-3 border rounded"
//             />
//             <button
//               type="submit"
//               className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700"
//             >
//               إنشاء حساب
//             </button>
//           </form>
//         )}

//         <p className="text-center mt-4 text-gray-500 text-sm">
//           {isLogin ? "لا تمتلك حساب؟" : "هل لديك حساب؟"}{" "}
//           <span
//             onClick={() => setIsLogin(!isLogin)}
//             className="text-blue-600 cursor-pointer font-semibold"
//           >
//             {isLogin ? "إنشاء حساب" : "تسجيل دخول"}
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// }
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
        <div className="flex justify-center items-center h-screen bg-[#e8efff] p-4">

      <div className="w-[900px] h-[550px] bg-white rounded-3xl overflow-hidden shadow-2xl relative flex">

        {/* BLUE SIDE PANEL */}
        <div
          className={`
            absolute top-0 h-full w-1/2
            bg-gradient-to-br from-blue-500 to-blue-700 text-white
            flex flex-col justify-center items-center px-10
            transition-all duration-700 ease-in-out
            ${isLogin ? "left-0" : "left-1/2"}
          `}
        >
          <h1 className="text-4xl font-bold mb-3">
            {isLogin ? "مرحباً بعودتك!" : "أهلاً بك!"}
          </h1>

          <p className="text-center opacity-90 mb-6">
            {isLogin
              ? "سجّل الدخول لإتمام مشترياتك الطبية."
              : "أنشئ حساباً جديداً للتسوق بسهولة"}
          </p>

          <img src="/doctor.png" alt="" className="w-40 drop-shadow-2xl mb-6" />

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="border-2 border-white px-12 py-2 rounded-full font-semibold hover:bg-white hover:text-blue-700 transition-all"
          >
            {isLogin ? "إنشاء حساب" : "تسجيل دخول"}
          </button>
        </div>

        {/* WHITE FORM WRAPPER */}
        <div
          className={`
            absolute h-full flex items-center justify-center w-1/2
            transition-all duration-700 ease-in-out
            ${isLogin ? "right-0" : "left-0"}
          `}
        >

          {/* LOGIN FORM */}
          <form
            onSubmit={handleLogin}
            className={`
              w-[320px] transition-all duration-500
              ${isLogin ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
          >
            <h2 className="text-3xl font-bold text-center mb-7 text-gray-700">
              تسجيل دخول
            </h2>

            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-100 rounded-full mb-4 outline-none"
            />

            <input
              type="password"
              placeholder="كلمة السر"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-100 rounded-full mb-6 outline-none"
            />

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-800 text-white rounded-full font-semibold"
            >
              دخول
            </button>
          </form>

          {/* REGISTER FORM */}
          <form
            onSubmit={handleRegister}
            className={`
              absolute w-[320px] transition-all duration-500
              ${!isLogin ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
          >
            <h2 className="text-3xl font-bold text-center mb-7 text-gray-700">
              إنشاء حساب
            </h2>

            <input
              type="text"
              placeholder="الاسم الكامل"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 bg-gray-100 rounded-full mb-4 outline-none"
            />

            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-gray-100 rounded-full mb-4 outline-none"
            />

            <input
              type="password"
              placeholder="كلمة السر"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-gray-100 rounded-full mb-4 outline-none"
            />

            <input
              type="password"
              placeholder="تأكيد كلمة السر"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-gray-100 rounded-full mb-6 outline-none"
            />

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-800 text-white rounded-full font-semibold"
            >
              إنشاء حساب
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
