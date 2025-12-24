import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Image as ImageIcon } from "lucide-react";
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

// --- المكون الرئيسي للشات ---
export default function ChatInterface({ messages, setMessages, addInvoice }) {
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
const hasWelcomed = useRef(false);

useEffect(() => {
  if (!hasWelcomed.current) {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: "bot",
        text: "أهلاً بك! أنا مساعدك الذكي لإدارة الفواتير. يمكنك رفع صورة الفاتورة وسأقوم باستخراج البيانات منها وتصنيفها لك.",
        type: "text",
      },
    ]);
    hasWelcomed.current = true;
  }
}, []); 



  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);



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

  // --- رفع الصور + معاينة ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
    e.target.value = null;
  };

  // --- إرسال الصورة للمعاينة ---
  const sendPreviewImage = () => {
    if (!previewImage || !selectedFile) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", image: previewImage, type: "image" },
    ]);

    const tempImage = previewImage;
    setPreviewImage(null);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          text: "تم استلام الصورة. من فضلك حدد نوع الفاتورة لبدء المعالجة:",
          type: "options",
          relatedImage: tempImage,
        },
      ]);
    }, 600);
  };

  // --- رفع الصورة الفعلية عند اختيار النوع ---
  const handleOptionClick = async (option, relatedImage) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", text: `تم اختيار: ${option}`, type: "text" },
    ]);

    if (!selectedFile) {
      toast.error("حدث خطأ: فقدنا ملف الصورة، يرجى الرفع مرة أخرى.");
      return;
    }

    setIsTyping(true);

    try {
      // 1. هات التوكين من التخزين المحلي (تأكد من الاسم اللي انت مخزنه بيه)
      const token = localStorage.getItem("token"); 

      if (!token) {
        toast.error("يجب تسجيل الدخول أولاً!");
        setIsTyping(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("invoiceType", option);

      // 2. ضيف الهيدر الخاص بالتوكين هنا
      const response = await fetch("https://nsaproject.runasp.net/api/Invoices/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`, // الربط بيحصل هنا
          // ملحوظة مهمة: اوعى تكتب Content-Type: multipart/form-data
          // المتصفح بيحطها أوتوماتيك مع الـ Boundary عشان الـ FormData تشتغل صح
        },
        body: formData,
      });

      if (!response.ok) throw new Error(await response.text() || "فشل الاتصال بالخادم");

      const data = await response.json();
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
      // addInvoice(data)  // حسب منطقك
    } catch (error) {
      console.error("Upload Error:", error);
      setIsTyping(false);
      toast.error(`فشل الرفع: ${error.message}`);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 10, sender: "bot", text: "❌ حدث خطأ أثناء إرسال الفاتورة للخادم.", type: "text" },
      ]);
    } finally {
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
        {previewImage && (
          <div className="fixed bottom-16 left-0 w-full flex justify-center px-4 z-50">
            <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-2xl w-full max-w-lg animate-slideIn">
              <div className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                <img src={previewImage} alt="معاينة" className="w-full h-auto max-h-96 object-contain" />
              </div>
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
          <div key={msg.id} className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex max-w-[85%] md:max-w-[70%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"} gap-3`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === "user" ? "bg-blue-600" : "bg-emerald-600"}`}>
                {msg.sender === "user" ? <User size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
              </div>

              <div className="flex flex-col gap-1">
                <div className={`p-3 rounded-2xl text-sm ${msg.sender === "user" ? "bg-blue-600 text-white rounded-tl-none shadow-md" : "bg-white text-gray-800 border border-gray-100 rounded-tr-none shadow-sm"}`}>
                  {msg.type === "text" && (msg.sender === "bot" ? <AnimatedText text={msg.text} /> : <p>{msg.text}</p>)}
                  {msg.type === "image" && <img src={msg.image} alt="Uploaded" className="max-w-full rounded-lg max-h-60 object-cover" />}
                  {msg.type === "options" && (
                    <div className="space-y-3">
                      <p className="mb-2 font-medium">{msg.text}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {["فاتورة مبيعات", "فاتورة مشتريات", "أخرى"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handleOptionClick(opt, msg.relatedImage)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-2 px-3 rounded-lg text-sm font-medium"
                          >
                            {opt}
                          </button>
                        ))}
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
        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-blue-600">
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
          <button onClick={handleSend} className="p-2 bg-gray-900 text-white rounded-full">
            <Send size={20} />
          </button>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop rtl pauseOnHover draggable />
    </div>
  );
}
