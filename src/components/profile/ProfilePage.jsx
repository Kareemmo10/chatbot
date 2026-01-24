import React, { useState, useEffect } from "react";
import {
  Camera,
  LogOut,
  Mail,
  Loader2Icon,
  Copy,
  RefreshCw,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "https://nsaproject.runasp.net/api";

export default function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  
  // تهيئة القيم بـ strings فارغة لتجنب تحذير React
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    companyName: "",
  });

  // Password change states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Invitations states
  const [invitations, setInvitations] = useState([]);
  const [targetEmail, setTargetEmail] = useState("");
  const [generatedCode, setGeneratedCode] = useState(null);
  const [invLoading, setInvLoading] = useState(false);
  const [invActionLoading, setInvActionLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  /* ================= PROFILE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.status === 401) {
            handleLogout(); // توجيه للخروج إذا انتهت الجلسة
            return;
        }

        if (!res.ok) throw new Error("فشل في جلب بيانات البروفايل");
        const data = await res.json();
        setProfile(data);
        setPersonalInfo({
          firstName: data.fullName?.split(" ")[0] || "",
          lastName: data.fullName?.split(" ")[1] || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          companyName: data.company?.name || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleSavePersonalInfo = async () => {
    try {
      const res = await fetch(`${API_BASE}/profile/update-info`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: `${personalInfo.firstName} ${personalInfo.lastName}`,
        }),
      });
      if (!res.ok) throw new Error("فشل في تحديث المعلومات");
      const data = await res.json();
      setProfile((prev) => ({
        ...prev,
        fullName: `${personalInfo.firstName} ${personalInfo.lastName}`,
      }));
      setIsEditingPersonalInfo(false);
      toast.success(data.message || "تم حفظ التعديلات بنجاح");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUploadAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/profile/upload-avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      setProfile((prev) => ({ ...prev, profilePictureUrl: data.url }));
      toast.success(data.message);
    } catch {
      toast.error("فشل رفع الصورة");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword)
      return toast.error("يرجى ملء جميع الحقول");
    if (newPassword !== confirmPassword)
      return toast.error("كلمة المرور الجديدة وتأكيدها غير متطابقين");

    setChangingPassword(true);
    try {
      const res = await fetch(`${API_BASE}/Auth/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        // 🔥🔥🔥 التعديل الجوهري هنا: تصحيح أسماء الحقول لتطابق الـ Backend DTO
        body: JSON.stringify({ 
            currentPassword: currentPassword, 
            newPassword: newPassword, 
            confirmNewPassword: confirmPassword // كان confirmPassword وتصحح لـ confirmNewPassword
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // التعامل مع أنواع الأخطاء المختلفة
        let errorMsg = data.message || "حدث خطأ أثناء تغيير كلمة المرور";

        if (typeof data === "string") {
          errorMsg = data; // الرسالة النصية المباشرة (مثل: ممنوع التكرار)
        } else if (Array.isArray(data)) {
          errorMsg = data.map((e) => e.description).join("\n"); // أخطاء Identity
        } else if (data.errors) {
          errorMsg = Object.values(data.errors).flat().join("\n"); // أخطاء Validation
        }

        throw new Error(errorMsg);
      }

      toast.success(data.message || "تم تغيير كلمة المرور بنجاح");
      // تصفير الحقول
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setChangingPassword(false);
    }
  };

  /* ================= INVITATIONS ================= */
  const fetchInvitations = async () => {
    if (!token) return;
    setInvLoading(true);
    try {
      const res = await fetch(`${API_BASE}/Invitations/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInvitations(Array.isArray(data) ? data : []);
      }
    } catch {
      toast.error("فشل تحميل سجل الدعوات");
    } finally {
      setInvLoading(false);
    }
  };

  const handleGenerateInvitation = async (e) => {
    e.preventDefault();
    if (!targetEmail) return toast.warn("يرجى إدخال البريد الإلكتروني");

    setInvActionLoading(true);
    setGeneratedCode(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/Invitations/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("تم إنشاء الدعوة بنجاح");
        setGeneratedCode(data.code);
        setTargetEmail("");
        fetchInvitations();
      } else {
        toast.error(data.message || (typeof data === 'string' ? data : "فشل إنشاء الدعوة"));
      }
    } catch (err) {
      console.error(err);
      toast.error("خطأ في الاتصال بالسيرفر");
    } finally {
      setInvActionLoading(false);
    }
  };

  const handleCancelInvitation = async (id) => {
    if (!confirm("هل أنت متأكد من إلغاء هذه الدعوة؟")) return;
    try {
      const res = await fetch(`${API_BASE}/Invitations/cancel/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("تم إلغاء الدعوة");
        fetchInvitations();
      } else toast.error("فشل الإلغاء");
    } catch {
      toast.error("خطأ في الاتصال");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.info("تم نسخ الكود");
  };
  const getStatusBadge = (inv) => {
    const isExpired = new Date(inv.expiresAt) < new Date();
    if (inv.isUsed)
      return (
        <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-full text-xs">
          <CheckCircle2 size={12} /> تم الاستخدام
        </span>
      );
    if (isExpired)
      return (
        <span className="flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded text-xs">
          <XCircle size={12} /> منتهية
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full text-xs">
        <Clock size={12} /> نشطة
      </span>
    );
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#101622]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#101622] text-red-500">
        {error}
      </div>
    );
  if (!profile) return null;

  return (
    <div className="flex w-full h-screen bg-[#101622] text-white">
      <ToastContainer />

      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 overflow-y-auto p-4 border-r border-[#282e39] sticky top-0 h-screen">
        <div className="bg-[#111318] rounded-xl border border-[#282e39] p-4 space-y-6">
          <div className="flex gap-3 mb-6 p-2">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-12 h-12 border-2 border-blue-500"
              style={{
                backgroundImage: `url(${profile.profilePictureUrl || ""})`,
              }}
            ></div>
            <div className="flex flex-col">
              <h1 className="text-white font-bold text-base">
                {profile.fullName}
              </h1>
              <p className="text-[#9da6b9] text-xs font-normal">
                {profile.role}
              </p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === "info" ? "bg-blue-600/20 text-blue-500" : "text-[#9da6b9] hover:bg-[#282e39]"}`}
            >
              المعلومات الشخصية
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === "security" ? "bg-blue-600/20 text-blue-500" : "text-[#9da6b9] hover:bg-[#282e39]"}`}
            >
              الأمان و كلمة المرور
            </button>
            <button
              onClick={() => {
                setActiveTab("invitations");
                fetchInvitations();
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === "invitations" ? "bg-blue-600/20 text-blue-500" : "text-[#9da6b9] hover:bg-[#282e39]"}`}
            >
              دعوة أعضاء
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 border rounded-full text-red-500 bg-red-900/10 hover:bg-red-900/20 transition-all mt-4 w-full justify-center"
            >
              <LogOut size={16} /> تسجيل الخروج
            </button>
          </nav>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-6 p-6 md:p-8 overflow-y-auto">
        {/* Header */}
        <section className="bg-[#111318] rounded-xl border border-[#282e39] p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-24 h-24 border-4 border-[#1c1f27] shadow-xl"
              style={{
                backgroundImage: `url(${profile.profilePictureUrl || ""})`,
              }}
            ></div>
            <input
              type="file"
              className="hidden"
              id="avatarInput"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) handleUploadAvatar(file);
              }}
            />
            <label
              htmlFor="avatarInput"
              className="absolute bottom-0 left-0 bg-blue-600 p-2 rounded-full cursor-pointer"
            >
              <Camera size={16} />
            </label>
          </div>
          <div className="flex flex-col justify-center gap-1">
            <h2 className="text-2xl font-bold">{profile.fullName}</h2>
            <p className="text-[#9da6b9]">{profile.email}</p>
            <p className="text-slate-500 dark:text-[#9da6b9] text-xs font-normal">
              عضو منذ يناير 2026
            </p>
          </div>
        </section>

        {/* Tabs Content */}
        {activeTab === "info" && (
          <section className="bg-[#111318] rounded-xl border border-[#282e39] ">
            <div className="px-6 py-4 border-b border-[#282e39] bg-[#1c1f27]">
              <h2 className="text-white text-xl font-bold">
                المعلومات الشخصية
              </h2>
            </div>
            <div className="p-6">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-white text-sm font-semibold">
                    الاسم الأول
                  </label>
                  <input
                    type="text"
                    disabled={!isEditingPersonalInfo}
                    value={personalInfo.firstName || ""} 
                    onChange={(e) =>
                      setPersonalInfo({
                        ...personalInfo,
                        firstName: e.target.value,
                      })
                    }
                    placeholder="أدخل اسمك الأول"
                    className="w-full rounded-lg border border-[#3b4354] bg-[#1c1f27] text-white h-12 px-4 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Last Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-white text-sm font-semibold">
                    اسم الثاني
                  </label>
                  <input
                    type="text"
                    disabled={!isEditingPersonalInfo}
                    value={personalInfo.lastName || ""}
                    onChange={(e) =>
                      setPersonalInfo({
                        ...personalInfo,
                        lastName: e.target.value,
                      })
                    }
                    placeholder="أدخل اسم العائلة"
                    className="w-full rounded-lg border border-[#3b4354] bg-[#1c1f27] text-white h-12 px-4 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label className="text-white text-sm font-semibold">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    dir="ltr"
                    disabled={!isEditingPersonalInfo}
                    value={personalInfo.email || ""}
                    onChange={(e) =>
                      setPersonalInfo({
                        ...personalInfo,
                        email: e.target.value,
                      })
                    }
                    placeholder="email@example.com"
                    className="w-full rounded-lg border border-[#3b4354] bg-[#1c1f27] text-white h-12 px-4 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <label className="text-white text-sm font-semibold">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    dir="ltr"
                    disabled={!isEditingPersonalInfo}
                    value={personalInfo.phoneNumber || ""}
                    onChange={(e) =>
                      setPersonalInfo({
                        ...personalInfo,
                        phoneNumber: e.target.value,
                      })
                    }
                    placeholder="+966 5x xxx xxxx"
                    className="w-full rounded-lg border border-[#3b4354] bg-[#1c1f27] text-white h-12 px-4 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Company Name */}
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-white text-sm font-semibold">
                    اسم الشركة
                  </label>
                  <input
                    type="text"
                    disabled={
                      !isEditingPersonalInfo || profile.role !== "CompanyAdmin"
                    }
                    value={personalInfo.companyName || ""}
                    onChange={(e) =>
                      setPersonalInfo({
                        ...personalInfo,
                        companyName: e.target.value,
                      })
                    }
                    placeholder="أدخل اسم شركتك"
                    className="w-full rounded-lg border border-[#3b4354] bg-[#1c1f27] text-white h-12 px-4 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </form>
            </div>
            <div className="px-6 py-4 bg-[#1c1f27] flex justify-end gap-3 border-t border-[#282e39]">
              {isEditingPersonalInfo ? (
                <>
                  <button
                    onClick={() => setIsEditingPersonalInfo(false)}
                    className="px-6 h-10 rounded-lg text-[#9da6b9] font-bold hover:bg-[#282e39] transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSavePersonalInfo}
                    className="px-8 h-10 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
                  >
                    حفظ التغييرات
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditingPersonalInfo(true)}
                  className="px-8 h-10 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
                >
                  تعديل
                </button>
              )}
            </div>{" "}
          </section>
        )}

        {activeTab === "security" && (
          <section className="bg-[#111318] rounded-xl border border-[#282e39] ">
            <div className="px-6 py-4 border-b border-[#282e39] bg-[#1c1f27]">
              <h2 className="text-white text-xl font-bold">
                الأمان و كلمة المرور
              </h2>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-white font-bold mb-1">تغيير كلمة المرور</p>
                  <p className="text-[#9da6b9] text-sm">
                    نوصي بتغيير كلمة المرور بانتظام لحماية حسابك.
                  </p>
                </div>

                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="w-full md:w-auto px-6 h-10 rounded-lg border border-blue-600 text-blue-500 font-bold hover:bg-blue-600/10 transition-all whitespace-nowrap"
                >
                  تحديث كلمة المرور
                </button>
              </div>

              {showPasswordForm && (
                <div className="flex flex-col gap-4 mt-4">
                  <input
                    type="password"
                    placeholder="كلمة المرور الحالية"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-lg border border-[#3b4354] bg-[#1c1f27] text-white h-12 px-4 focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="كلمة المرور الجديدة"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-[#3b4354] bg-[#1c1f27] text-white h-12 px-4 focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="تأكيد كلمة المرور الجديدة"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-[#3b4354] bg-[#1c1f27] text-white h-12 px-4 focus:ring-2 focus:ring-blue-500"
                  />

                  <div className="flex gap-3  justify-end">
                    <button
                      onClick={() => setShowPasswordForm(false)}
                      className="px-6 h-10 rounded-lg text-[#9da6b9] font-bold hover:bg-[#282e39] transition-all"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword}
                      className="px-8 h-10 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all"
                    >
                      {changingPassword ? "جاري التحديث..." : "حفظ"}
                    </button>
                  </div>
                </div>
              )}
            </div>{" "}
          </section>
        )}

        {activeTab === "invitations" && (
          <section className="bg-[#111318] rounded-xl border border-[#282e39] p-6">
            {/* ================= INVITATIONS UI ================= */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#161a22] border border-white/5 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-4">إنشاء دعوة جديدة</h3>
                <form onSubmit={handleGenerateInvitation} className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">
                      البريد الإلكتروني للموظف
                    </label>
                    <div className="relative">
                      <Mail
                        className="absolute right-3 top-2.5 text-gray-500"
                        size={16}
                      />
                      <input
                        type="email"
                        value={targetEmail}
                        onChange={(e) => setTargetEmail(e.target.value)}
                        required
                        className="w-full bg-[#1c1f27] border border-[#282e39] rounded-lg py-2 pr-10 pl-4 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="employee@company.com"
                      />
                    </div>
                  </div>
                  <button
                    disabled={invActionLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    {invActionLoading ? (
                      <Loader2Icon className="animate-spin" size={18} />
                    ) : (
                      "إرسال الدعوة"
                    )}
                  </button>
                </form>
              </div>

              <div className="bg-[#161a22] border border-white/5 p-6 rounded-2xl flex flex-col justify-center items-center text-center relative overflow-hidden">
                {!generatedCode ? (
                  <div className="text-gray-500 flex flex-col items-center gap-2">
                    <Mail size={40} className="opacity-20" />
                    <p className="text-sm">سيظهر كود الدعوة هنا بعد الإنشاء</p>
                  </div>
                ) : (
                  <div className="w-full animate-in fade-in zoom-in duration-300">
                    <h3 className="text-green-400 font-bold mb-1">
                      تم الإنشاء بنجاح!
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">
                      يمكنك نسخ الكود وإرساله يدوياً
                    </p>
                    <div className="bg-[#0f172a] border border-green-500/30 p-4 rounded-xl flex items-center justify-between gap-4">
                      <code className="text-xl font-mono tracking-widest text-white">
                        {generatedCode}
                      </code>
                      <button
                        onClick={() => copyToClipboard(generatedCode)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                        title="نسخ الكود"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* History Table */}
            <div className="bg-[#161a22] border border-white/5 rounded-2xl overflow-hidden mt-6">
              <div className="p-5 border-b border-[#282e39] flex justify-between items-center">
                <h3 className="font-semibold flex items-center gap-2">
                  <History size={18} className="text-blue-400" /> سجل الدعوات
                  السابقة
                </h3>
                <button
                  onClick={fetchInvitations}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <RefreshCw
                    size={16}
                    className={invLoading ? "animate-spin" : ""}
                  />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-[#1c1f27] text-gray-400">
                    <tr>
                      <th className="p-4 font-medium">البريد الإلكتروني</th>
                      <th className="p-4 font-medium">كود الدعوة</th>
                      <th className="p-4 font-medium">تاريخ الإنشاء</th>
                      <th className="p-4 font-medium">تاريخ الانتهاء</th>
                      <th className="p-4 font-medium">الحالة</th>
                      <th className="p-4 font-medium text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#282e39]">
                    {invLoading ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="p-8 text-center text-gray-500"
                        >
                          <Loader2Icon className="animate-spin mx-auto" /> جاري
                          التحميل...
                        </td>
                      </tr>
                    ) : invitations.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="p-8 text-center text-gray-500"
                        >
                          لا يوجد دعوات سابقة
                        </td>
                      </tr>
                    ) : (
                      invitations.map((inv) => (
                        <tr
                          key={inv.id}
                          className="hover:bg-[#1c1f27]/50 transition-colors"
                        >
                          <td className="p-4 font-medium text-white">
                            {inv.targetEmail}
                          </td>
                          <td className="p-4 font-mono text-blue-300 select-all">
                            {inv.invitationCode}
                          </td>
                          <td className="p-4 text-gray-400">
                            {new Date(inv.createdAt).toLocaleDateString(
                              "ar-EG"
                            )}
                          </td>
                          <td className="p-4 text-gray-400">
                            {new Date(inv.expiresAt).toLocaleDateString(
                              "ar-EG"
                            )}
                          </td>
                          <td className="p-4">{getStatusBadge(inv)}</td>
                          <td className="p-4 text-center">
                            {!inv.isUsed && (
                              <button
                                onClick={() => handleCancelInvitation(inv.id)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}