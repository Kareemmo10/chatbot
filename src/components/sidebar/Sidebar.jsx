import { Send, Bot, LogOut, AlertCircle, Menu, Package, LayoutDashboard } from "lucide-react"; // أضفنا أيقونة المراجعة
import React, { useState, useEffect } from "react";

import { useAuth } from "../auth/AuthContext"; 
import { useLocation, Link } from "react-router-dom";


export default function Sidebar({ activeTab, setActiveTab }) {
  const { logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const toggleSidebar = () => setIsOpen(!isOpen);

  // Fetch Profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://nsaproject.runasp.net/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  

  return (
<aside
  className={`h-screen flex flex-col justify-between
    bg-[#111318] border-l border-[#1f2430] text-white
    transition-all duration-300
${isOpen ? "fixed top-0 right-0 w-44 z-40" : "relative w-18"}  `}
>
  {/* الجزء العلوي */}
  <div>
    {/* Header */}
    <div className="p-3 flex flex-col  gap-3 border-b border-[#1f2430]">
       <button
        onClick={toggleSidebar}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg
           "
      >
        <Menu size={16} />
      </button>

      

      {/* <div className="flex flex-row"> 
        
        <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <Bot size={18} />
      </div>
      
      {isOpen && (
        <h1 className="font-bold text-sm tracking-tight">
          بوت الفواتير
        </h1>
      )}
      </div> */}


      
      
    </div>

    {/* Menu */}
    <nav className="p-4 flex flex-col gap-2">
      {/* Toggle */}
     

      {/* Chat */}
      <Link
        to="/chat"
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
          ${
            location.pathname === "/chat"
              ? "bg-[#282e39] text-white"
              : "text-[#9da6b9] hover:bg-[#282e39] hover:text-white"
          }`}
      >
        <Send size={16} />
        {isOpen && <span className="text-sm font-medium">الشات</span>}
      </Link>

      {/* Invoices */}
      <Link
        to="/invoices"
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
          ${
            location.pathname === "/invoices"
              ? "bg-[#282e39] text-white"
              : "text-[#9da6b9] hover:bg-[#282e39] hover:text-white"
          }`}
      >
        <Bot size={16} />
        {isOpen && <span className="text-sm font-medium">سجل الفواتير</span>}
      </Link>

      {/* Review */}
      <Link
        to="/review"
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
          ${
            location.pathname === "/review"
              ? "bg-[#282e39] text-white"
              : "text-[#9da6b9] hover:bg-[#282e39] hover:text-white"
          }`}
      >
        <AlertCircle size={16} />
        {isOpen && <span className="text-sm font-medium">مراجعة الفواتير</span>}
      </Link>
      <Link
        to="/prodacts"
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
          ${
            location.pathname === "/prodacts"
              ? "bg-[#282e39] text-white"
              : "text-[#9da6b9] hover:bg-[#282e39] hover:text-white"
          }`}
      >
        <Package size={16} />
        {isOpen && <span className="text-sm font-medium">المنتجات</span>}
      </Link>
      <Link
        to="/dashbord"
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
          ${
            location.pathname === "/dashbord"
              ? "bg-[#282e39] text-white"
              : "text-[#9da6b9] hover:bg-[#282e39] hover:text-white"
          }`}
      >
        <LayoutDashboard size={16} />
        {isOpen && <span className="text-sm font-medium">الادارة</span>}
      </Link>
      
      
    </nav>
  </div>

  {/* Footer */}
  <div className="p-4 border-t border-[#1f2430]">
   <Link
  to="/profile"
  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
    ${
      location.pathname === "/profile" && isOpen
        ? "bg-[#282e39] text-white"
        : "text-[#9da6b9]"
    }`}
>
  {profile?.profilePictureUrl ? (
    <div
      className={`w-7 h-7 rounded-full bg-center bg-cover flex-shrink-0`}
      style={{ backgroundImage: `url(${profile.profilePictureUrl})` }}
    ></div>
  ) : (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
        isOpen ? "bg-blue-600" : "bg-transparent"
      }`}
    >
      {profile?.fullName?.charAt(0) || "U"}
    </div>
  )}

  {isOpen && (
    <span className="text-sm font-medium">{profile?.fullName || "البروفايل"}</span>
  )}
</Link>

  </div>
</aside>


  );
}
