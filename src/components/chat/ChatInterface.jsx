import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Image as ImageIcon, SearchIcon, ArrowBigDown, ArrowDownCircle, ChevronDown, Bell } from "lucide-react";
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
  <div className="flex items-center gap-1 px-4 py-2 bg-[#282E39] rounded-2xl w-fit shadow-sm">
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDuration: "0.8s" }}></span>
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDuration: "0.8s", animationDelay: "0.15s" }}></span>
    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDuration: "0.8s", animationDelay: "0.3s" }}></span>
  </div>
);

// --- المكون الرئيسي للشات ---
export default function ChatInterface({ messages, setMessages, addInvoice }) {
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const hasWelcomed = useRef(false);

  // --- رسالة ترحيب ---
  useEffect(() => {
  const welcomed = localStorage.getItem("hasWelcomedChat");
  if (!welcomed) {
    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: "bot",
        text: "أهلاً بك! أنا مساعدك الذكي لإدارة الفواتير. يمكنك رفع صورة الفاتورة وسأقوم باستخراج البيانات منها وتصنيفها لك.",
        type: "text",
      },
    ]);
    localStorage.setItem("hasWelcomedChat", "true");
  }
}, []);


  // --- السكول أوتوماتيك ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // --- متابعة السكول لإظهار زر الرجوع للأسفل ---
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setShowScrollDown(scrollTop + clientHeight < scrollHeight - 100);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage = { id: Date.now(), sender: "user", text: inputText, type: "text", timestamp: new Date() };
    setMessages(prev => [...prev, newMessage]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: "bot", text: " هذا الشات مخصص فقط لرفع صور الفواتير. من فضلك ارسل صورة فاتورة للمعالجة. ⚠️", type: "text" },
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

  const sendPreviewImage = () => {
    if (!previewImage || !selectedFile) return;
    setMessages(prev => [...prev, { id: Date.now(), sender: "user", image: previewImage, type: "image" }]);
    const tempImage = previewImage;
    setPreviewImage(null);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: "bot", text: "تم استلام الصورة. من فضلك حدد نوع الفاتورة لبدء المعالجة:", type: "options", relatedImage: tempImage },
      ]);
    }, 600);
  };

  const handleOptionClick = async (option, relatedImage) => {
    setMessages(prev => [...prev, { id: Date.now(), sender: "user", text: `تم اختيار: ${option}`, type: "text" }]);

    if (!selectedFile) {
      toast.error("حدث خطأ: فقدنا ملف الصورة، يرجى الرفع مرة أخرى.");
      return;
    }

    setIsTyping(true);

    try {
      const token = localStorage.getItem("token"); 
      if (!token) {
        toast.error("يجب تسجيل الدخول أولاً!");
        setIsTyping(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("invoiceType", option);

      const response = await fetch("https://nsaproject.runasp.net/api/Invoices/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error(await response.text() || "فشل الاتصال بالخادم");

      const data = await response.json();
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now() + 10, sender: "bot", text: `${data.message} ( رقم الفاتورة: ${data.invoiceId}). يتم الآن تحليل البيانات... ✅`, type: "text" }]);
      toast.success("تم الرفع بنجاح!");
    } catch (error) {
      console.error("Upload Error:", error);
      setIsTyping(false);
      toast.error(`فشل الرفع: ${error.message}`);
      setMessages(prev => [...prev, { id: Date.now() + 10, sender: "bot", text: "❌ حدث خطأ أثناء إرسال الفاتورة للخادم.", type: "text" }]);
    } finally {
      setSelectedFile(null);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full">
      <header className="h-16 flex items-center justify-between px-6 shrink-0 bg-[#111318] border-b border-[#1f2430]">
        <h2 className="text-white text-lg font-bold">بوت الفواتير</h2>
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center size-10 rounded-full hover:bg-[#282e39] text-[#9da6b9] hover:text-white transition-colors">
            <span className="material-symbols-outlined"><SearchIcon/></span>
          </button>
          <button className="flex items-center justify-center size-10 rounded-full hover:bg-[#282e39] text-[#9da6b9] hover:text-white transition-colors">
            <span className="material-symbols-outlined"><Bell/> </span>
          </button>
        </div>
      </header>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 md:px-8 space-y-6 bg-[#101622] custom-scrollbar"
      >
        {/* الرسائل + معاينة الصور */}
        {previewImage && (
          <div className="fixed bottom-16 left-0 w-full flex justify-center px-4 z-50">
            <div className="flex flex-col items-center bg-[#111318] p-4 rounded-xl shadow-2xl w-full max-w-lg animate-slideIn">
              <div className="w-full border border-gray-10 rounded-lg overflow-hidden shadow-lg">
                <img src={previewImage} alt="معاينة" className="w-full h-auto max-h-96 object-contain" />
              </div>
              <div className="flex gap-3 w-full mt-3">
                <button onClick={sendPreviewImage} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 transition">تأكيد وإرسال</button>
                <button onClick={() => { setPreviewImage(null); setSelectedFile(null); }} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition">إلغاء</button>
              </div>
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit",hour12:true}) : new Date().toLocaleTimeString("ar-EG",{hour:"2-digit",minute:"2-digit",hour12:true});
          return (
            <div key={msg.id} className={`flex w-full ${msg.sender==="user"?"justify-end":"justify-start"}`}>
              <div className={`flex max-w-[85%] md:max-w-[70%] ${msg.sender==="user"?"flex-row-reverse":"flex-row"} gap-3`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender==="user"?"bg-white":"bg-[#155DFC]"}`}>
                  {msg.sender==="user"?<User size={18} className="text-black"/>:<Bot size={20} className="text-white"/>}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-white">{msg.sender==="user"?"أنت":"البوت"}</span>
                    <span className="text-[#9da6b9]">{time}</span>
                  </div>
                  <div className={`p-3 rounded-2xl text-sm ${msg.sender==="user"?"bg-blue-600 text-white rounded-tl-none shadow-md":"bg-[#282E39] text-white rounded-tr-none shadow-sm"}`}>
                    {msg.type==="text" && (msg.sender==="bot"?<AnimatedText text={msg.text}/>:<p>{msg.text}</p>)}
                    {msg.type==="image" && <img src={msg.image} alt="Uploaded" className="max-w-full rounded-lg max-h-60 object-cover"/>}
                    {msg.type==="options" && (
                      <div className="space-y-3">
                        <p className="mb-2 font-medium">{msg.text}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {["فاتورة مبيعات","فاتورة مشتريات","أخرى"].map(opt=>(
                            <button key={opt} onClick={()=>handleOptionClick(opt,msg.relatedImage)} className="bg-white hover:bg-emerald-100 text-blue-700 border border-blue py-2 px-3 rounded-lg text-sm font-medium">{opt}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex w-full justify-start">
            <div className="flex max-w-[85%] md:max-w-[70%] gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-[#155DFC]"><Bot size={18} className="text-white"/></div>
              <TypingBubble/>
            </div>
          </div>
        )}

        <div ref={messagesEndRef}/>
      </div>

      {/* زر النزول للأسفل */}
{/* زر النزول للأسفل فوق مكان الكتابة */}
{showScrollDown && (
  <div className="absolute left-1/2 transform -translate-x-1/2 bottom-30 z-50">
    <button 
      onClick={scrollToBottom} 
      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg"
    >
      <ChevronDown size={18} />
    </button>
  </div>
)}




      {/* إدخال النص + رفع الصور */}
      <div className="p-6 pt-2 flex justify-center w-full border-[#1f2430] bg-[#101622]">
        <div className="w-full max-w-4xl">
          <div className="relative flex items-center bg-[#181b21] border border-[#1f2430] rounded-xl shadow-lg outline-none focus:outline-none">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden"/>

            <button onClick={()=>fileInputRef.current?.click()} className="p-3 text-[#9da6b9] hover:text-white transition-colors"><ImageIcon size={22}/></button>

            <input type="text" value={inputText} onChange={e=>setInputText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSend()} placeholder="اكتب رسالتك..." className="flex-1 bg-transparent border-none text-white placeholder-[#5e6676] focus:ring-0 py-4 h-14 outline-none"/>
<div className="flex items-center pr-2 pl-3 gap-1">
              <button onClick={handleSend} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors flex items-center justify-center"><Send size={20}/></button>

            </div>
          </div>
          <p className="text-center text-[#5e6676] text-xs mt-3">مساعدك الذكي لفهم وتحليل الفواتير بسرعة وبدقة</p>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop rtl pauseOnHover draggable/>
    </div>
  );
}
