import React, { useState, useRef, useEffect } from "react";
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";

import {
  Bot,
  Send,
  Image as ImageIcon,
  User,
  X,
  RefreshCcw,
  Download,
} from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


// --- كتابة تدريجية ---
const AnimatedText = ({ text, speed = 25 }) => {
  const [shown, setShown] = useState("");
  useEffect(() => {
    let i = 0;
    setShown("");
    const interval = setInterval(() => {
      setShown(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  return <p>{shown}</p>;
};

// --- فقاعات التحميل ---
const TypingBubble = () => (
  <div className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-2xl w-fit shadow-sm">
    <span
      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
      style={{ animationDuration: "0.8s" }}
    ></span>
    <span
      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
      style={{ animationDuration: "0.8s", animationDelay: "0.15s" }}
    ></span>
    <span
      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
      style={{ animationDuration: "0.8s", animationDelay: "0.3s" }}
    ></span>
  </div>
);

// --- المكون الرئيسي للتطبيق ---
const Home = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const [invoices, setInvoices] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "أهلاً بك! أنا مساعدك الذكي لإدارة الفواتير. يمكنك رفع صورة الفاتورة وسأقوم باستخراج البيانات منها وتصنيفها لك.",
      type: "text",
    },
  ]);

  const addInvoice = (invoiceData) => {
    setInvoices((prev) => [invoiceData, ...prev]);
  };

  return (
    <div
      dir="rtl"
      className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden"
    >
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 flex flex-col h-full relative">
        {activeTab === "chat" ? (
          <ChatInterface
            messages={messages}
            setMessages={setMessages}
            addInvoice={addInvoice}
          />
        ) : (
          <InvoicesDashboard invoices={invoices} />
        )}
      </main>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={true}
        pauseOnHover
        draggable
      />
    </div>
  );
};

// --- شريط جانبي ---
const Sidebar = ({ activeTab, setActiveTab }) => (
  <div className="w-20 md:w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20 transition-all duration-300">
    <div className="p-4 md:p-6 flex items-center gap-3 border-b border-slate-700">
      <div className="bg-blue-600 p-2 rounded-lg">
        <Bot size={24} className="text-white" />
      </div>
      <h1 className="hidden md:block font-bold text-lg">بوت الفواتير</h1>
    </div>
    <nav className="flex-1 p-4 gap-2 flex flex-col">
      <button
        onClick={() => setActiveTab("chat")}
        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
          activeTab === "chat"
            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
      >
        <Send size={20} />
        <span className="hidden md:block font-medium">المحادثة الذكية</span>
      </button>
      <button
        onClick={() => setActiveTab("invoices")}
        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
          activeTab === "invoices"
            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
      >
        <Bot size={20} />
        <span className="hidden md:block font-medium">سجل الفواتير</span>
      </button>
    </nav>
  </div>
);

// --- واجهة الشات (تم التعديل لإضافة الـ API) ---
const ChatInterface = ({ messages, setMessages, addInvoice }) => {
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [previewImage, setPreviewImage] = useState(null); // للمعاينة (Base64)
  const [selectedFile, setSelectedFile] = useState(null); // الملف الفعلي للإرسال للـ API
  const [pendingInvoiceId, setPendingInvoiceId] = useState(null); // لتخزين الـ ID القادم من الـ API مؤقتاً
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now(),
      sender: "user",
      text: inputText,
      type: "text",
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "⚠️ هذا الشات مخصص فقط لرفع صور الفواتير. من فضلك ارسل صورة فاتورة للمعالجة.",
          type: "text",
        },
      ]);
    }, 1500);
  };

  // --- رفع الصور مع المعاينة ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // حفظ الملف الفعلي لإرساله للـ API لاحقاً
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result;
      setPreviewImage(imageUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  // --- دالة إرسال الصورة للـ API ---
  // --- تعديل: دالة عرض الصورة وسؤال المستخدم (بدون رفع) ---
  const sendPreviewImage = () => {
    if (!previewImage || !selectedFile) return;

    // 1. عرض الصورة في الشات فوراً كرسالة من المستخدم
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", image: previewImage, type: "image" },
    ]);

    // إخفاء المعاينة
    const tempImage = previewImage; // نحتفظ بها للعرض لو احتجنا
    setPreviewImage(null);
    
    // ملاحظة: لا تقم بمسح selectedFile هنا! سنحتاجه في الخطوة القادمة
    // setSelectedFile(null); <--- شيلنا السطر ده

    setIsTyping(true);

    // 2. البوت يسأل عن النوع (محاكاة)
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "تم استلام الصورة. من فضلك حدد نوع الفاتورة لبدء المعالجة:",
          type: "options", // ده هيظهر الأزرار
          relatedImage: tempImage,
        },
      ]);
    }, 600);
  };

  // --- تعديل: دالة الرفع الحقيقية عند اختيار النوع ---
  const handleOptionClick = async (option, relatedImage) => {
    // 1. عرض اختيار المستخدم في الشات
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "user",
        text: `تم اختيار: ${option}`,
        type: "text",
      },
    ]);

    // 2. التأكد من وجود ملف للرفع
    if (!selectedFile) {
        toast.error("حدث خطأ: فقدنا ملف الصورة، يرجى الرفع مرة أخرى.");
        return;
    }

    setIsTyping(true); // إظهار جاري التحميل

    try {
      // 3. تحضير الداتا (الملف + النوع)
      const formData = new FormData();
      formData.append("file", selectedFile); 
      formData.append("invoiceType", option); // <--- هنا بنبعت النوع اللي اليوزر داس عليه

      // 4. استدعاء الـ API
      const response = await fetch("https://nsaproject.runasp.net/api/Invoices/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.text();
        throw new Error(errData || "فشل الاتصال بالخادم");
      }

      const data = await response.json();
      console.log("API Success:", data);

      // 5. الرد الناجح من البوت
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 10,
          sender: "bot",
          text: `${data.message} ( رقم الفاتورة: ${data.invoiceId}). يتم الآن تحليل البيانات... ✅`,

          type: "text",
        },
      ]);

      toast.success("تم الرفع بنجاح!");
      
      // إضافة الفاتورة للقائمة المحلية (اختياري حسب منطقك)
      // addInvoice(...) 

    } catch (error) {
      console.error("Upload Error:", error);
      setIsTyping(false);
      toast.error(`فشل الرفع: ${error.message}`);
      
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 10,
          sender: "bot",
          text: "❌ حدث خطأ أثناء إرسال الفاتورة للخادم.",
          type: "text",
        },
      ]);
    } finally {
        // 6. تنظيف الملف بعد الانتهاء تماماً
        setSelectedFile(null);
    }
  };


  return (
    <div className="flex flex-col h-full bg-white">
      <header className="bg-white p-4 shadow-sm flex items-center justify-between">
        <h2 className="font-bold text-gray-700 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          المساعد الذكي
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {/* --- منطقة المعاينة أسفل الشات مباشرة --- */}
        {previewImage && (
          <div className="fixed bottom-16 left-0 w-full flex justify-center px-4 z-50">
            <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-2xl w-full max-w-lg animate-slideIn">
              {/* معاينة الصورة */}
              <div className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={previewImage}
                  alt="معاينة"
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>

              {/* أزرار الإرسال والإلغاء */}
              <div className="flex gap-3 w-full mt-3">
                <button
                  onClick={sendPreviewImage}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition"
                >
                  تأكيد وإرسال
                </button>
                <button
                  onClick={() => {
                    setPreviewImage(null);
                    setSelectedFile(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex max-w-[85%] md:max-w-[70%] ${
                msg.sender === "user" ? "flex-row-reverse" : "flex-row"
              } gap-3`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.sender === "user" ? "bg-blue-600" : "bg-emerald-600"
                }`}
              >
                {msg.sender === "user" ? (
                  <span className="text-white font-bold">
                    <User size={18} />
                  </span>
                ) : (
                  <Bot size={18} className="text-white" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div
                  className={`p-3 rounded-2xl text-sm ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-tl-none shadow-md"
                      : "bg-white text-gray-800 border border-gray-100 rounded-tr-none shadow-sm"
                  }`}
                >
                  {msg.type === "text" &&
                    (msg.sender === "bot" ? (
                      <AnimatedText text={msg.text} />
                    ) : (
                      <p>{msg.text}</p>
                    ))}
                  {msg.type === "image" && (
                    <img
                      src={msg.image}
                      alt="Uploaded"
                      className="max-w-full rounded-lg max-h-60 object-cover"
                    />
                  )}
                  {msg.type === "options" && (
                    <div className="space-y-3">
                      <p className="mb-2 font-medium">{msg.text}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {["فاتورة مبيعات", "فاتورة مشتريات", "أخرى"].map(
                          (opt) => (
                            <button
                              key={opt}
                              onClick={() =>
                                handleOptionClick(opt, msg.relatedImage)
                              }
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-2 px-3 rounded-lg text-sm font-medium"
                            >
                              {opt}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex w-full justify-start">
            <div className="flex max-w-[85%] md:max-w-[70%] gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-emerald-600">
                <Bot size={18} className="text-white" />
              </div>
              <TypingBubble />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white">
        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl ">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-blue-600"
          >
            <ImageIcon size={20} />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="اكتب رسالتك..."
            className="flex-1 bg-transparent border-none outline-none px-2"
          />
          <button
            onClick={handleSend}
            className="p-2 bg-gray-900 text-white rounded-full"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- لوحة التحكم مع Modal ---

const InvoicesDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const navigate = useNavigate();

  const handleRowClick = (invoice) => {
    navigate(`/invoice/${invoice.id}`);
  };


  // --- Fetch invoices from API
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch("https://nsaproject.runasp.net/api/Invoices");
        const data = await res.json();
        // هنا بنستخدم data.data عشان الفواتير موجودة جوا property اسمها data
        const formattedInvoices = data.data.map((inv) => ({
          id: inv.invoiceId,
          type: inv.invoiceType,
          date: new Date(inv.createdAt).toLocaleDateString("ar-EG"),
          amount: inv.totalAmount,
          status: inv.status.toLowerCase(),
          imageUrl: inv.imagePath,
        }));
        setInvoices(formattedInvoices);
      } catch (err) {
        console.error("فشل تحميل الفواتير:", err);
      }
    };

    fetchInvoices();
  }, []);

  return (
    <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-y-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">سجل الفواتير</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 ">
              <tr>
                <th className="px-6 py-4">رقم</th>
                <th className="px-6 py-4">النوع</th>
                <th className="px-6 py-4">التاريخ</th>
                <th className="px-6 py-4">المبلغ</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">صورة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleRowClick(inv)}
                  >
                  <td className="px-6 py-4">#{inv.id}</td>
                  <td className="px-6 py-4">{inv.type}</td>
                  <td className="px-6 py-4">{inv.date}</td>
                  <td className="px-6 py-4">{inv.amount}</td>
                  <td className="px-6 py-4">
                    {inv.status === "completed" ? (
                      <span className="text-green-600">مكتمل</span>
                    ) : (
                      <span className="text-green-700">معالجة AI</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {inv.imageUrl ? (
                      <img
                        src={inv.imageUrl}
                        className="w-10 h-10 rounded object-cover border"
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;