// import React, { useState, useRef, useEffect } from "react";
// import {
//   Bot,
//   Send,
//   Image as ImageIcon,
//   User,
//   X,
//   RefreshCcw,
//   Download,
// } from "lucide-react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";

// // --- كتابة تدريجية ---
// const AnimatedText = ({ text, speed = 25 }) => {
//   const [shown, setShown] = useState("");
//   useEffect(() => {
//     let i = 0;
//     setShown("");
//     const interval = setInterval(() => {
//       setShown(text.slice(0, i));
//       i++;
//       if (i > text.length) clearInterval(interval);
//     }, speed);
//     return () => clearInterval(interval);
//   }, [text, speed]);
//   return <p>{shown}</p>;
// };

// // --- فقاعات التحميل ---
// const TypingBubble = () => (
//   <div className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-2xl w-fit shadow-sm">
//     <span
//       className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//       style={{ animationDuration: "0.8s" }}
//     ></span>
//     <span
//       className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//       style={{ animationDuration: "0.8s", animationDelay: "0.15s" }}
//     ></span>
//     <span
//       className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
//       style={{ animationDuration: "0.8s", animationDelay: "0.3s" }}
//     ></span>
//   </div>
// );

// // --- المكون الرئيسي للتطبيق ---
// const App = () => {
//   const [activeTab, setActiveTab] = useState("chat");
//   const [invoices, setInvoices] = useState([]);
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       sender: "bot",
//       text: "أهلاً بك! أنا مساعدك الذكي لإدارة الفواتير. يمكنك رفع صورة الفاتورة وسأقوم باستخراج البيانات منها وتصنيفها لك.",
//       type: "text",
//     },
//   ]);

//   const addInvoice = (invoiceData) => {
//     setInvoices((prev) => [invoiceData, ...prev]);
//   };

//   return (
//     <div
//       dir="rtl"
//       className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden"
//     >
//       <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
//       <main className="flex-1 flex flex-col h-full relative">
//         {activeTab === "chat" ? (
//           <ChatInterface
//             messages={messages}
//             setMessages={setMessages}
//             addInvoice={addInvoice}
//           />
//         ) : (
//           <InvoicesDashboard invoices={invoices} />
//         )}
//       </main>

//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop={true}
//         closeOnClick
//         rtl={true}
//         pauseOnHover
//         draggable
//       />
//     </div>
//   );
// };

// // --- شريط جانبي ---
// const Sidebar = ({ activeTab, setActiveTab }) => (
//   <div className="w-20 md:w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20 transition-all duration-300">
//     <div className="p-4 md:p-6 flex items-center gap-3 border-b border-slate-700">
//       <div className="bg-blue-600 p-2 rounded-lg">
//         <Bot size={24} className="text-white" />
//       </div>
//       <h1 className="hidden md:block font-bold text-lg">بوت الفواتير</h1>
//     </div>
//     <nav className="flex-1 p-4 gap-2 flex flex-col">
//       <button
//         onClick={() => setActiveTab("chat")}
//         className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
//           activeTab === "chat"
//             ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
//             : "text-slate-400 hover:bg-slate-800 hover:text-white"
//         }`}
//       >
//         <Send size={20} />
//         <span className="hidden md:block font-medium">المحادثة الذكية</span>
//       </button>
//       <button
//         onClick={() => setActiveTab("invoices")}
//         className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
//           activeTab === "invoices"
//             ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
//             : "text-slate-400 hover:bg-slate-800 hover:text-white"
//         }`}
//       >
//         <Bot size={20} />
//         <span className="hidden md:block font-medium">سجل الفواتير</span>
//       </button>
//     </nav>
//   </div>
// );

// // --- واجهة الشات ---
// const ChatInterface = ({ messages, setMessages, addInvoice }) => {
//   const [inputText, setInputText] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [previewImage, setPreviewImage] = useState(null); // للمعاينة قبل الإرسال
//   const messagesEndRef = useRef(null);
//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, isTyping]);

//   const handleSend = () => {
//     if (!inputText.trim()) return;
//     const newMessage = {
//       id: Date.now(),
//       sender: "user",
//       text: inputText,
//       type: "text",
//     };
//     setMessages((prev) => [...prev, newMessage]);
//     setInputText("");
//     setIsTyping(true);

//     setTimeout(() => {
//       setIsTyping(false);
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: Date.now() + 1,
//           sender: "bot",
//           text: "شكراً لرسالتك. هل ترغب في رفع فاتورة جديدة؟",
//           type: "text",
//         },
//       ]);
//     }, 1500);
//   };

//   // --- رفع الصور مع المعاينة ---
//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       const imageUrl = reader.result;
//       setPreviewImage(imageUrl); // عرض المعاينة بدلاً من الإرسال مباشرة
//     };
//     reader.readAsDataURL(file);
//     e.target.value = null;
//   };

//   const sendPreviewImage = () => {
//     if (!previewImage) return;
//     setMessages((prev) => [
//       ...prev,
//       { id: Date.now(), sender: "user", image: previewImage, type: "image" },
//     ]);
//     setIsTyping(true);
//     const tempImage = previewImage;
//     setPreviewImage(null);

//     setTimeout(() => {
//       setIsTyping(false);
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: Date.now() + 1,
//           sender: "bot",
//           text: "تم استلام الصورة. حدد نوع الفاتورة:",
//           type: "options",
//           relatedImage: tempImage,
//         },
//       ]);
//     }, 1000);
//   };

//   const handleOptionClick = (option, relatedImage) => {
//     setMessages((prev) => [
//       ...prev,
//       {
//         id: Date.now(),
//         sender: "user",
//         text: `تم اختيار: ${option}`,
//         type: "text",
//       },
//     ]);
//     setIsTyping(true);

//     setTimeout(() => {
//       setMessages((prev) => [
//         ...prev,
//         {
//           id: Date.now() + 10,
//           sender: "bot",
//           text: `جارِ تحليل ${option}...`,
//           type: "text",
//         },
//       ]);

//       setTimeout(() => {
//         setIsTyping(false);
//         const newInvoice = {
//           id: Math.floor(Math.random() * 10000),
//           type: option,
//           date: new Date().toISOString().split("T")[0],
//           status: "completed",
//           amount: Math.floor(Math.random() * 1000) + " جنيه",
//           imageUrl: relatedImage,
//         };
//         addInvoice(newInvoice);
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: Date.now() + 20,
//             sender: "bot",
//             text: 'تم إرسال الصورة للمعالجة. تابع الحالة في "سجل الفواتير".',
//             type: "text",
//           },
//         ]);
//         toast.success("تحليل الفاتورة تم بنجاح!");
//       }, 2000);
//     }, 800);
//   };

//   return (
//     <div className="flex flex-col h-full bg-white">
//       <header className="bg-white p-4 shadow-sm flex items-center justify-between">
//         <h2 className="font-bold text-gray-700 flex items-center gap-2">
//           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
//           المساعد الذكي
//         </h2>
//       </header>

//       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
//         {/* --- منطقة المعاينة أسفل الشات مباشرة --- */}
//         {previewImage && (
//           <div className="fixed bottom-16 left-0 w-full flex justify-center px-4 z-50">
//             <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-2xl w-full max-w-lg animate-slideIn">
//               {/* معاينة الصورة */}
//               <div className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-lg">
//                 <img
//                   src={previewImage}
//                   alt="معاينة"
//                   className="w-full h-auto max-h-96 object-contain"
//                 />
//               </div>

//               {/* أزرار الإرسال والإلغاء */}
//               <div className="flex gap-3 w-full mt-3">
//                 <button
//                   onClick={sendPreviewImage}
//                   className="flex-1 bg-blue-600 text-white px-4 py-2 rounded"
//                 >
//                   إرسال
//                 </button>
//                 <button
//                   onClick={() => setPreviewImage(null)}
//                   className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded"
//                 >
//                   إلغاء
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {messages.map((msg) => (
//           <div
//             key={msg.id}
//             className={`flex w-full ${
//               msg.sender === "user" ? "justify-end" : "justify-start"
//             }`}
//           >
//             <div
//               className={`flex max-w-[85%] md:max-w-[70%] ${
//                 msg.sender === "user" ? "flex-row-reverse" : "flex-row"
//               } gap-3`}
//             >
//               <div
//                 className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
//                   msg.sender === "user" ? "bg-blue-600" : "bg-emerald-600"
//                 }`}
//               >
//                 {msg.sender === "user" ? (
//                   <span className="text-white font-bold">
//                     <User size={18} />
//                   </span>
//                 ) : (
//                   <Bot size={18} className="text-white" />
//                 )}
//               </div>
//               <div className="flex flex-col gap-1">
//                 <div
//                   className={`p-3 rounded-2xl text-sm ${
//                     msg.sender === "user"
//                       ? "bg-blue-600 text-white rounded-tl-none shadow-md"
//                       : "bg-white text-gray-800 border border-gray-100 rounded-tr-none shadow-sm"
//                   }`}
//                 >
//                   {msg.type === "text" &&
//                     (msg.sender === "bot" ? (
//                       <AnimatedText text={msg.text} />
//                     ) : (
//                       <p>{msg.text}</p>
//                     ))}
//                   {msg.type === "image" && (
//                     <img
//                       src={msg.image}
//                       alt="Uploaded"
//                       className="max-w-full rounded-lg max-h-60 object-cover"
//                     />
//                   )}
//                   {msg.type === "options" && (
//                     <div className="space-y-3">
//                       <p className="mb-2 font-medium">{msg.text}</p>
//                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
//                         {["فاتورة مبيعات", "فاتورة مشتريات", "أخرى"].map(
//                           (opt) => (
//                             <button
//                               key={opt}
//                               onClick={() =>
//                                 handleOptionClick(opt, msg.relatedImage)
//                               }
//                               className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-2 px-3 rounded-lg text-sm font-medium"
//                             >
//                               {opt}
//                             </button>
//                           )
//                         )}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         ))}

//         {isTyping && (
//           <div className="flex w-full justify-start">
//             <div className="flex max-w-[85%] md:max-w-[70%] gap-3">
//               <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-emerald-600">
//                 <Bot size={18} className="text-white" />
//               </div>
//               <TypingBubble />
//             </div>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       <div className="p-3 bg-white">
//         <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl ">
//           <input
//             type="file"
//             ref={fileInputRef}
//             onChange={handleFileUpload}
//             accept="image/*"
//             className="hidden"
//           />
//           <button
//             onClick={() => fileInputRef.current?.click()}
//             className="p-2 text-gray-500 hover:text-blue-600"
//           >
//             <ImageIcon size={20} />
//           </button>
//           <input
//             type="text"
//             value={inputText}
//             onChange={(e) => setInputText(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleSend()}
//             placeholder="اكتب رسالتك..."
//             className="flex-1 bg-transparent border-none outline-none px-2"
//           />
//           <button
//             onClick={handleSend}
//             className="p-2 bg-gray-900 text-white rounded-full"
//           >
//             <Send size={20} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // --- لوحة التحكم مع Modal ---
// const InvoicesDashboard = ({ invoices }) => {
//   const [selectedInvoice, setSelectedInvoice] = useState(null);

//   const handleRowClick = (invoice) => setSelectedInvoice(invoice);
//   const handleCloseModal = () => setSelectedInvoice(null);

//   const handleReanalyze = () => {
//     if (!selectedInvoice) return;
//     toast.info(`جارِ إعادة تحليل الفاتورة رقم #${selectedInvoice.id}`);
//   };

//   const handleDownloadPDF = async () => {
//     if (!selectedInvoice) return;
//     const element = document.getElementById(`invoice-${selectedInvoice.id}`);
//     if (!element) return;

//     const canvas = await html2canvas(element, {
//       scale: 2,
//       useCORS: true,
//       scrollY: -window.scrollY,
//     });
//     const imgData = canvas.toDataURL("image/png");

//     const pdf = new jsPDF({
//       orientation: "portrait",
//       unit: "mm",
//       format: "a4",
//     });
//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
//     pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
//     pdf.save(`Invoice_${selectedInvoice.id}.pdf`);
//   };

//   return (
//     <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-y-auto">
//       <h1 className="text-2xl font-bold text-gray-800 mb-6">سجل الفواتير</h1>
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-right">
//             <thead className="bg-gray-50 ">
//               <tr>
//                 <th className="px-6 py-4">رقم</th>
//                 <th className="px-6 py-4">النوع</th>
//                 <th className="px-6 py-4">التاريخ</th>
//                 <th className="px-6 py-4">المبلغ</th>
//                 <th className="px-6 py-4">الحالة</th>
//                 <th className="px-6 py-4">صورة</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {invoices.map((inv) => (
//                 <tr
//                   key={inv.id}
//                   className="cursor-pointer hover:bg-gray-100 transition-colors"
//                   onClick={() => handleRowClick(inv)}
//                 >
//                   <td className="px-6 py-4">#{inv.id}</td>
//                   <td className="px-6 py-4">{inv.type}</td>
//                   <td className="px-6 py-4">{inv.date}</td>
//                   <td className="px-6 py-4">{inv.amount}</td>
//                   <td className="px-6 py-4">
//                     {inv.status === "completed" ? (
//                       <span className="text-green-600">مكتمل</span>
//                     ) : (
//                       <span className="text-green-700">معالجة AI</span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4">
//                     {inv.imageUrl ? (
//                       <img
//                         src={inv.imageUrl}
//                         className="w-10 h-10 rounded object-cover border"
//                       />
//                     ) : (
//                       "-"
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {selectedInvoice && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white w-[90%] md:w-2/3 lg:w-1/2 rounded-xl shadow-lg relative p-6">
//             <button
//               onClick={handleCloseModal}
//               className="absolute top-4 left-4 p-2 bg-gray-200 rounded-full"
//             >
//               <X size={20} />
//             </button>

//             <div
//               id={`invoice-${selectedInvoice.id}`}
//               style={{
//                 fontFamily: "Cairo, sans-serif",
//                 direction: "rtl",
//                 padding: "10px",
//               }}
//             >
//               <h2 className="text-xl font-bold mb-4">
//                 تفاصيل الفاتورة #{selectedInvoice.id}
//               </h2>
//               {selectedInvoice.imageUrl && (
//                 <img
//                   src={selectedInvoice.imageUrl}
//                   className="w-full max-h-96 object-contain rounded-lg mb-4 border"
//                 />
//               )}
//               <div className="space-y-2 mb-4">
//                 <p>
//                   <strong>النوع:</strong> {selectedInvoice.type}
//                 </p>
//                 <p>
//                   <strong>التاريخ:</strong> {selectedInvoice.date}
//                 </p>
//                 <p>
//                   <strong>المبلغ:</strong> {selectedInvoice.amount}
//                 </p>
//                 <p>
//                   <strong>الحالة:</strong>{" "}
//                   {selectedInvoice.status === "completed"
//                     ? "مكتمل"
//                     : "معالجة AI"}
//                 </p>
//               </div>
//               <div className="flex gap-3">
//                 <button
//                   onClick={handleReanalyze}
//                   className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
//                 >
//                   <RefreshCcw size={16} /> إعادة التحليل
//                 </button>
//                 <button
//                   onClick={handleDownloadPDF}
//                   className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
//                 >
//                   <Download size={16} /> تنزيل PDF
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default App;


import React, { useState, useRef, useEffect } from "react";
import { Bot, Send, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // إرسال رسالة نصية
  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "تم استلام رسالتك 👌" },
      ]);
    }, 600);

    setInput("");
  };

  // اختيار صورة
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const tempUrl = URL.createObjectURL(file);

    setMessages((prev) => [
      ...prev,
      { sender: "user", image: tempUrl, text: "📄 صورة فاتورة" },
    ]);

    uploadToAPI(file);
  };

  // رفع الصورة للباك
  const uploadToAPI = async (file) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file); // صححنا اسم البراميتر

    try {
      const response = await fetch(
        "https://corrected-item-wilderness-acquisition.trycloudflare.com/api/Invoices/upload",
        { method: "POST", body: formData }
      );

      const text = await response.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {
        console.log("Response is not JSON, using raw text");
      }

      console.log("Response Status:", response.status);
      console.log("Response Data:", data);

      if (!response.ok || data.errors) {
        const errorMsg = data.title || JSON.stringify(data);
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: `❌ خطأ من الباك: ${errorMsg}` },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "✔ تم رفع الفاتورة ومعالجتها بنجاح" },
        ]);

        setInvoices((prev) => [
          ...prev,
          {
            id: data.id || Date.now(),
            type: data.type || "غير محدد",
            amount: data.amount || "غير معروف",
            status: data.status || "Completed",
            date: data.date || new Date().toISOString().split("T")[0],
            imageUrl: data.imageUrl || null,
          },
        ]);
      }
    } catch (err) {
      console.log("Upload Error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ حدث خطأ أثناء الاتصال بالباك." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar – Record */}
      <div className="w-72 bg-white shadow-lg p-5 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">📁 سجل الفواتير</h2>

        {invoices.length === 0 && (
          <p className="text-gray-500 text-sm">لا يوجد فواتير بعد.</p>
        )}

        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="p-3 mb-3 bg-gray-50 rounded-lg border shadow-sm"
          >
            <p>
              <strong>النوع:</strong> {inv.type}
            </p>
            <p>
              <strong>المبلغ:</strong> {inv.amount}
            </p>
            <p>
              <strong>التاريخ:</strong> {inv.date}
            </p>
            <p>
              <strong>الحالة:</strong> {inv.status}
            </p>

            {inv.imageUrl && (
              <img
                src={inv.imageUrl}
                alt="invoice"
                className="mt-2 rounded border"
              />
            )}
          </div>
        ))}
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="p-4 border-b bg-white shadow flex items-center gap-2">
          <Bot className="text-blue-600" />
          <h1 className="text-xl font-bold">Invoice AI Assistant</h1>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex mb-3 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`p-3 max-w-xs rounded-xl shadow ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white border"
                  }`}
                >
                  {msg.image && (
                    <img
                      src={msg.image}
                      alt="upload"
                      className="rounded mb-2 border"
                    />
                  )}
                  <p>{msg.text}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <div ref={chatEndRef}></div>
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current.click()}
            className="p-2 bg-gray-200 rounded-full"
          >
            <ImageIcon />
          </button>

          <input
            type="file"
            hidden
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelect}
          />

          <input
            className="flex-1 p-2 bg-gray-100 rounded border"
            placeholder="اكتب رسالة…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button
            onClick={sendMessage}
            className="p-2 bg-blue-600 text-white rounded-full"
          >
            <Send />
          </button>
        </div>
      </div>
    </div>
  );
}
