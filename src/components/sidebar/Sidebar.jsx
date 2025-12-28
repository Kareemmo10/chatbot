import { Send, Bot, LogOut, AlertCircle } from "lucide-react"; // أضفنا أيقونة المراجعة
import { useAuth } from "../auth/AuthContext"; 
import { useLocation, Link } from "react-router-dom";


export default function Sidebar({ activeTab, setActiveTab }) {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <aside className="w-20 md:w-64 bg-slate-900 text-white flex flex-col shadow-xl sticky top-0 h-screen">
      <div className="p-4 md:p-6 flex items-center gap-3 border-b border-slate-700">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Bot size={24} className="text-white" />
        </div>
        <h1 className="hidden md:block font-bold text-lg">بوت الفواتير</h1>
      </div>

      <nav className="flex-1 p-4 gap-2 flex flex-col">
      <Link
        to="/chat"
        className={`flex items-center gap-3 p-3 rounded-xl ${
          location.pathname === "/chat" ? "bg-blue-600 text-white" : "text-slate-400"
        }`}
      >
        <Send size={20} /> المحادثة الذكية
      </Link>

      <Link
        to="/invoices"
        className={`flex items-center gap-3 p-3 rounded-xl ${
          location.pathname === "/invoices" ? "bg-blue-600 text-white" : "text-slate-400"
        }`}
      >
        <Bot size={20} /> سجل الفواتير
      </Link>

      <Link
        to="/review"
        className={`flex items-center gap-3 p-3 rounded-xl ${
          location.pathname === "/review" ? "bg-blue-600 text-white" : "text-slate-400"
        }`}
      >
        <AlertCircle size={20} /> مراجعة الفواتير
      </Link>
    </nav>

      <div className="p-4 border-t border-slate-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 p-3 rounded-xl w-full text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="hidden md:block font-medium">تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
