import { Send, Bot, LogOut, AlertCircle, Menu, Package } from "lucide-react"; // أضفنا أيقونة المراجعة
import React, { useState } from "react";

import { useAuth } from "../auth/AuthContext"; 
import { useLocation, Link } from "react-router-dom";


export default function Sidebar({ activeTab, setActiveTab }) {
  const { logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
const toggleSidebar = () => setIsOpen(!isOpen);

  

  return (
<aside
  className={`h-screen flex flex-col justify-between
    bg-[#111318] border-l border-[#1f2430] text-white
    transition-all duration-300
${isOpen ? "fixed top-0 right-0 w-50 z-40" : "relative w-20"}  `}
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
        <Menu size={18} />
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
        <Send size={18} />
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
        <Bot size={18} />
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
        <AlertCircle size={18} />
        {isOpen && <span className="text-sm font-medium">مراجعة الفواتير</span>}
      </Link>
      <Link
        to="/prodacts"
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
          ${
            location.pathname === "/review"
              ? "bg-[#282e39] text-white"
              : "text-[#9da6b9] hoItemer:bg-[#282e39] hover:text-white"
          }`}
      >
        <Package size={18} />
        {isOpen && <span className="text-sm font-medium">المنتجات</span>}
      </Link>
      <Link
        to="/dashbord"
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
          ${
            location.pathname === "/review"
              ? "bg-[#282e39] text-white"
              : "text-[#9da6b9] hoItemer:bg-[#282e39] hover:text-white"
          }`}
      >
        <Package size={18} />
        {isOpen && <span className="text-sm font-medium">الادارة</span>}
      </Link>
    </nav>
  </div>

  {/* Footer */}
  <div className="p-4 border-t border-[#1f2430]">
    <button
      onClick={logout}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full
        text-[#9da6b9] hover:bg-[#282e39] hover:text-white transition-colors"
    >
      <LogOut size={18} />
      {isOpen && <span className="text-sm font-medium">تسجيل الخروج</span>}
    </button>
  </div>
</aside>


  );
}
