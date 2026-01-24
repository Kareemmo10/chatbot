import React, { useState, useEffect } from "react";
import { Camera, LogOut } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
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

  const token = localStorage.getItem("token");

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("https://nsaproject.runasp.net/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("فشل في جلب بيانات البروفايل");
        const data = await res.json();
        setProfile(data);
        setPersonalInfo({
          firstName: data.fullName.split(" ")[0] || "",
          lastName: data.fullName.split(" ")[1] || "",
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
      const res = await fetch(
        "https://nsaproject.runasp.net/api/profile/update-info",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fullName: `${personalInfo.firstName} ${personalInfo.lastName}` }),
        }
      );
      if (!res.ok) throw new Error("فشل في تحديث المعلومات");
      const data = await res.json();
      setProfile((prev) => ({ ...prev, fullName: `${personalInfo.firstName} ${personalInfo.lastName}` }));
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
      const res = await fetch(
        "https://nsaproject.runasp.net/api/profile/upload-avatar",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await res.json();
      setProfile((prev) => ({ ...prev, profilePictureUrl: data.url }));
      toast.success(data.message);
    } catch (err) {
      toast.error("فشل رفع الصورة");
    }
  };

  const handleUploadCompanyLogo = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
        "https://nsaproject.runasp.net/api/profile/upload-company-logo",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const data = await res.json();
      setProfile((prev) => ({
        ...prev,
        company: { ...prev.company, logoUrl: data.url },
      }));
      toast.success(data.message);
    } catch (err) {
      toast.error("فشل رفع شعار الشركة");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("كلمة المرور الجديدة وتأكيدها غير متطابقين");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("https://nsaproject.runasp.net/api/Auth/change-password", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "حدث خطأ");
      toast.success(data.message || "تم تغيير كلمة المرور بنجاح");
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
              style={{ backgroundImage: `url(${profile.profilePictureUrl || ""})` }}
            ></div>
            <div className="flex flex-col">
              <h1 className="text-white font-bold text-base">{profile.fullName}</h1>
              <p className="text-[#9da6b9] text-xs font-normal">{profile.role}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === "info" ? "bg-blue-600/20 text-blue-500" : "text-[#9da6b9] hover:bg-[#282e39]"
              }`}
            >
              المعلومات الشخصية
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === "security" ? "bg-blue-600/20 text-blue-500" : "text-[#9da6b9] hover:bg-[#282e39]"
              }`}
            >
              الأمان
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 border rounded-full text-red-500 bg-red-900/10 hover:bg-red-900/20 transition-all mt-4 w-full justify-center"
            >
              <LogOut size={16} />
              تسجيل الخروج
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
              style={{ backgroundImage: `url(${profile.profilePictureUrl || ""})` }}
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
            <label htmlFor="avatarInput" className="absolute bottom-0 left-0 bg-blue-600 p-2 rounded-full cursor-pointer">
              <Camera size={16} />
            </label>
          </div>

          <div className="flex flex-col justify-center gap-1">
            <h2 className="text-2xl font-bold">{profile.fullName}</h2>
            <p className="text-[#9da6b9]">{profile.email}</p>
            <p className="text-slate-500 dark:text-[#9da6b9] text-xs font-normal">عضو منذ يناير 2026</p>
          </div>
        </section>

        {/* Tabs */}
        {activeTab === "info" && (
          <section className="bg-[#111318] rounded-xl border border-[#282e39] ">
            <div className="px-6 py-4 border-b border-[#282e39] bg-[#1c1f27]">
              <h2 className="text-white text-xl font-bold">المعلومات الشخصية</h2>
            </div>

            <div className="p-6">
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-white text-sm font-semibold">الاسم الأول</label>
                  <input
                    type="text"
                    disabled={!isEditingPersonalInfo}
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                    placeholder="أدخل اسمك الأول"
                    className="w-full rounded-lg border border-[#3b4354] bg-[#1c1f27] text-white h-12 px-4 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Last Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-white text-sm font-semibold">اسم الثاني</label>
                  <input
                    type="text"
                    disabled={!isEditingPersonalInfo}
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                    placeholder="أدخل اسم العائلة"
                    className="w-full rounded-lg border border-[#3b4354] bg-[#1c1f27] text-white h-12 px-4 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <label className="text-white text-sm font-semibold">البريد الإلكتروني</label>
                  <input
                    type="email"
                    dir="ltr"
                    disabled={!isEditingPersonalInfo}
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full rounded-lg border border-[#3b4354] bg-[#1c1f27] text-white h-12 px-4 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-2">
                  <label className="text-white text-sm font-semibold">رقم الهاتف</label>
                  <input
                    type="tel"
                    dir="ltr"
                    disabled={!isEditingPersonalInfo}
                    value={personalInfo.phoneNumber}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phoneNumber: e.target.value })}
                    placeholder="+966 5x xxx xxxx"
                    className="w-full rounded-lg border border-[#3b4354] bg-[#1c1f27] text-white h-12 px-4 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Company Name */}
                <div className="md:col-span-2 flex flex-col gap-2">
                  <label className="text-white text-sm font-semibold">اسم الشركة</label>
                  <input
                    type="text"
                    disabled={!isEditingPersonalInfo || profile.role !== "CompanyAdmin"}
                    value={personalInfo.companyName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, companyName: e.target.value })}
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
            </div>
          </section>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <section className="bg-[#111318] rounded-xl border border-[#282e39] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#282e39] bg-[#1c1f27]">
              <h2 className="text-white text-xl font-bold">الأمان وكلمة المرور</h2>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-white font-bold mb-1">تغيير كلمة المرور</p>
                  <p className="text-[#9da6b9] text-sm">نوصي بتغيير كلمة المرور بانتظام لحماية حسابك.</p>
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

                  <div className="flex gap-3 justify-end">
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
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
