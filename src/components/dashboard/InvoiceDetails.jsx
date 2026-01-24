// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { useParams } from "react-router-dom";
// import InvoiceImage from "../invoice/InvoiceImage";

// export default function InvoiceDetails() {
//   const [isOpen, setIsOpen] = useState(false);
//   const { id } = useParams();
//   const [invoice, setInvoice] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchInvoice = async () => {
//       try {
//         setLoading(true);
//         const res = await fetch(
//           `https://nsaproject.runasp.net/api/Invoices/${id}`
//         );
//         if (!res.ok) throw new Error("فشل تحميل البيانات");
//         const data = await res.json();
//         setInvoice(data);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };


//     fetchInvoice();
//   }, [id]);

//   if (loading)
//     return (
//       <div className="flex justify-center items-center bg-[#101622] text-white h-screen text-xl font-bold">
//         جاري تحميل التفاصيل...
//       </div>
//     );

//   if (error)
//     return <p className="text-red-500 text-center text-xl mt-10">{error}</p>;

//   const ai = invoice.aiData;

//  const getStatusText = (status) => {
//   switch (status) {
//     case 1:
//       return "غير معروف";
//     case 2:
//       return "مراجعة AI";
//     case 3:
//       return "معتمد";
//     case 4:
//       return "مرفوض"; // أضفنا المرفوض
//     default:
//       return "غير معروف";
//   }
// };

// const getStatusClasses = (status) => {
//   switch (status) {
//     case 1:
//       return "bg-blue-700 text-blue-100";
//     case 2:
//       return "bg-yellow-700 text-yellow-100";
//     case 3:
//       return "bg-green-700 text-green-100";
//     case 4:
//       return "bg-red-700 text-red-100"; // ألوان المرفوض
//     default:
//       return "bg-gray-700 text-gray-100";
//   }
// };



//   return (
// <main className="flex-1 p-4 md:p-8 bg-[#101622] overflow-y-auto h-[calc(100vh-64px)]">
//   <div className="max-w-7xl mx-auto">
//     <div className="flex flex-wrap gap-2 mb-6 text-xs md:text-sm">
//       <Link className="text-gray-400 font-medium" to="/">بوت بوت</Link>
//       <span className="text-gray-400 font-medium">/</span>
//       <Link className="text-gray-400 font-medium" to="/invoices">سجل الفواتير</Link>
//       <span className="text-gray-400 font-medium">/</span>
//       <span className="text-white font-medium">{`${invoice.invoiceId}`}</span>
//     </div>

//     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
//       <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
//         <p className="text-white text-xl md:text-3xl font-bold tracking-tight">
//           تفاصيل الفاتورة {invoice.invoiceId}
//         </p>
//       <span
//   className={`inline-flex items-center rounded-full px-2 md:px-3 py-0.5 md:py-1 text-xs md:text-sm font-medium ${getStatusClasses(invoice.status)}`}
// >
//   {getStatusText(invoice.status)}
// </span>


//       </div>
//     </div>

//     <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
//       <div className="lg:col-span-2 space-y-4 md:space-y-8">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
//           <div className="bg-[#161a22] p-4 md:p-6 rounded-lg md:rounded-xl border border-[#282e39]">
//             <h3 className="text-base md:text-lg font-semibold text-white mb-4">من</h3>
//             <div className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-300">
//               <p className="font-bold text-white">{ai.MerchantName}</p>
//               <p>{ai.MerchantAddress}</p>
//               {ai.MerchantVat && <p>VAT: {ai.MerchantVat}</p>}
//             </div>
//           </div>

//           <div className="bg-[#161a22] p-4 md:p-6 rounded-lg md:rounded-xl border border-[#282e39]">
//             <h3 className="text-base md:text-lg font-semibold text-white mb-4">إلى</h3>
//             <div className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-300">
//               <p className="font-bold text-white">{ai.BuyerName}</p>
//               <p>{ai.BuyerAddress}</p>
//               {ai.BuyerVat && <p>VAT: {ai.BuyerVat}</p>}
//             </div>
//           </div>
//         </div>

//         <div className="bg-[#161a22] p-4 md:p-6 rounded-lg md:rounded-xl border border-[#282e39]">
//           <h3 className="text-base md:text-lg font-semibold text-white mb-4">العناصر</h3>
//           <div className="overflow-x-auto">
//             <table className="w-full text-right text-xs md:text-sm text-gray-300">
//               <thead className="border-b border-[#282e39]">
//                 <tr>
//                   <th className="py-2 md:py-3 px-2 md:px-4 font-semibold">#</th>
//                   <th className="py-2 md:py-3 px-2 md:px-4 font-semibold">اسم العنصر</th>
//                   <th className="py-2 md:py-3 px-2 md:px-4 font-semibold text-left">الكمية</th>
//                   <th className="py-2 md:py-3 px-2 md:px-4 font-semibold text-left">سعر الوحدة</th>
//                   <th className="py-2 md:py-3 px-2 md:px-4 font-semibold text-left">الإجمالي</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-[#282e39]">
//                 {ai.Items.map((item) => (
//                   <tr key={item.itemNo}>
//                     <td className="py-2 md:py-4 px-2 md:px-4">{item.itemNo}</td>
//                     <td className="py-2 md:py-4 px-2 md:px-4 font-medium">{item.FullName}</td>
//                     <td className="py-2 md:py-4 px-2 md:px-4 text-left">{item.Qty}</td>
//                     <td className="py-2 md:py-4 px-2 md:px-4 text-left">{item.UnitPrice} {ai.Currency}</td>
//                     <td className="py-2 md:py-4 px-2 md:px-4 font-medium text-left">{item.LineTotal} {ai.Currency}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       <div className="lg:col-span-1 space-y-4 md:space-y-8">
//         <div className="w-full bg-[#161a22] p-4 md:p-6 rounded-lg md:rounded-xl border border-[#282e39]">
//           <h3 className="text-base md:text-lg font-semibold text-white mb-4">صورة الفاتورة</h3>
//           <InvoiceImage imagePath={invoice.imagePath} />
//         </div>

//         <div className="bg-[#161a22] p-4 md:p-6 rounded-lg md:rounded-xl border border-[#282e39]">
//           <h3 className="text-base md:text-lg font-semibold text-white mb-4">التفاصيل</h3>
//           <div className="grid grid-cols-2 gap-y-3 md:gap-y-4 text-xs md:text-sm text-gray-300">
//             <div className="flex flex-col gap-1 pl-2">
//               <p>رقم الفاتورة</p>
//               <p className="font-medium text-white text-xs">{`INV-${invoice.invoiceId}`}</p>
//             </div>
//             <div className="flex flex-col gap-1 pr-2">
//               <p>نوع الفاتورة</p>
//               <p className="font-medium text-white text-xs">{ai.InvoiceType}</p>
//             </div>
//             <div className="flex flex-col gap-1 pl-2">
//               <p>تاريخ الإنشاء</p>
//               <p className="font-medium text-white text-xs">{new Date(invoice.createdAt).toLocaleDateString()}</p>
//             </div>
//             <div className="flex flex-col gap-1 pr-2">
//               <p>الحالة</p>
// <p className="font-medium text-green-500 text-xs">{getStatusText(invoice.status)}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-[#161a22] p-4 md:p-6 rounded-lg md:rounded-xl border border-[#282e39]">
//           <h3 className="text-base md:text-lg font-semibold text-white mb-4">الملخص المالي</h3>
//           <div className="space-y-2 md:space-y-3 text-xs md:text-sm text-gray-300">
//             <div className="flex justify-between">
//               <span>عدد العناصر</span>
//               <span className="font-medium text-white">{ai.ItemCount}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>الإجمالي قبل الضريبة</span>
//               <span className="font-medium text-white">{ai.TotalExcludingVAT} {ai.Currency}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>إجمالي الضريبة</span>
//               <span className="font-medium text-white">{ai.TotalTax} {ai.Currency}</span>
//             </div>
//             <div className="flex justify-between">
//               <span>إجمالي الخصم</span>
//               <span className="font-medium text-white">{ai.TotalDiscount} {ai.Currency}</span>
//             </div>
//             <div className="border-t border-[#282e39] my-2 md:my-3" />
//             <div className="flex justify-between text-sm md:text-base font-bold">
//               <span>المبلغ الإجمالي النهائي</span>
//               <span className="text-primary">{ai.TotalAmount} {ai.Currency}</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// </main>

//   );
// }
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import InvoiceImage from "../invoice/InvoiceImage";

export default function InvoiceDetails() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await fetch(`https://nsaproject.runasp.net/api/Invoices/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("فشل تحميل البيانات");
        const response = await res.json();
        // الـ API يرجع البيانات في response.data أو مباشرة
        const invoiceData = response.data || response;
        setInvoice(invoiceData);
      } catch (err) {
        setError(err.message);
        console.error("خطأ في تحميل الفاتورة:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchInvoice();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center bg-[#101622] text-white h-screen text-xl font-bold">
      جاري تحميل التفاصيل...
    </div>
  );

  if (error) return <p className="text-red-500 text-center text-xl mt-10">{error}</p>;

  // استخراج بيانات الـ AI
  const ai = invoice?.aiData || {};

  // 🔥 التعديل هنا: تصحيح الـ Mapping بناءً على أرقام الـ Enum في الباك إند
  // 0:Pending, 1:Processing, 2:NeedsReview, 3:Completed, 4:Failed, 5:Rejected
  const getStatusText = (status) => {
    switch (status) {
      case 0: return "قيد الانتظار";
      case 1: return "جاري المعالجة (AI)";
      case 2: return "يرجى المراجعة";
      case 3: return "معتمد";
      case 4: return "فشل المعالجة";
      case 5: return "مرفوض";
      default: return "غير معروف";
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 0: return "bg-gray-600 text-gray-100";   // Pending
      case 1: return "bg-blue-600 text-blue-100";   // Processing
      case 2: return "bg-yellow-600 text-yellow-100"; // NeedsReview
      case 3: return "bg-green-600 text-green-100"; // Completed
      case 4: return "bg-red-600 text-red-100";     // Failed
      case 5: return "bg-red-800 text-red-200";     // Rejected
      default: return "bg-gray-700 text-gray-100";
    }
  };

  return (
    <main className="flex-1 p-4 md:p-8 bg-[#101622] overflow-y-auto h-[calc(100vh-64px)]" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 mb-6 text-xs md:text-sm">
          <Link className="text-gray-400 font-medium" to="/">الرئيسية</Link>
          <span className="text-gray-400">/</span>
          <Link className="text-gray-400" to="/invoices">سجل الفواتير</Link>
          <span className="text-gray-400">/</span>
          <span className="text-white font-medium">فاتورة رقم {invoice?.invoiceId}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-white text-xl md:text-3xl font-bold tracking-tight">
              تفاصيل الفاتورة #{invoice?.invoiceId}
            </h1>
            
            {/* Status Badge */}
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(invoice?.status)}`}>
              {getStatusText(invoice?.status)}
            </span>

            {/* Confidence Score */}
            <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full border border-gray-600 shadow-sm">
                <span className="text-[10px] text-gray-400">دقة الـ AI :</span>
                <span className={`text-xs font-bold ${ (invoice?.confidenceScore || 0) > 0.8 ? 'text-green-400' : 'text-orange-400' }`}>
                    {((invoice?.confidenceScore || 0) * 100).toFixed(0)}%
                </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Vendor & Buyer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <div className="bg-[#161a22] p-6 rounded-xl border border-[#282e39]">
                <h3 className="text-gray-400 text-xs font-bold uppercase mb-4">البائع (من)</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p className="font-bold text-lg text-white">{invoice?.merchantName || "غير متوفر"}</p>
                  {/* استخدمنا بيانات الفاتورة المباشرة لو الـ AI داتا ناقصة */}
                  {invoice?.merchantVat && <p className="text-blue-400 font-mono">الرقم الضريبي: {invoice.merchantVat}</p>}
                </div>
              </div>

              <div className="bg-[#161a22] p-6 rounded-xl border border-[#282e39]">
                <h3 className="text-gray-400 text-xs font-bold uppercase mb-4">المشتري (إلى)</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p className="font-bold text-lg text-white">{invoice?.buyerName || "غير متوفر"}</p>
                  {invoice?.buyerVat && <p className="text-blue-400 font-mono">الرقم الضريبي: {invoice.buyerVat}</p>}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-[#161a22] p-6 rounded-xl border border-[#282e39]">
              <h3 className="text-lg font-semibold text-white mb-4">الأصناف المكتشفة ({ai?.Items?.length || 0})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm text-gray-300">
                  <thead className="border-b border-[#282e39] text-gray-400 uppercase text-xs">
                    <tr>
                      <th className="py-3 px-4">الصنف</th>
                      <th className="py-3 px-4">الكمية</th>
                      <th className="py-3 px-4">السعر</th>
                      <th className="py-3 px-4 text-left">الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#282e39]">
                    {/* fallback to empty array if no items */}
                    {(ai?.Items || []).map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#1c212b] transition-colors">
                        <td className="py-4 px-4 text-white font-medium">{item.FullName || item.Name || "صنف غير مسمى"}</td>
                        <td className="py-4 px-4">{item.Qty}</td>
                        <td className="py-4 px-4">{item.UnitPrice?.toFixed(2)} {ai?.Currency}</td>
                        <td className="py-4 px-4 text-left font-bold text-white">{item.LineTotal?.toFixed(2)} {ai?.Currency}</td>
                      </tr>
                    ))}
                    {(ai?.Items || []).length === 0 && (
                        <tr>
                            <td colSpan="4" className="py-4 text-center text-gray-500">لا توجد أصناف مسجلة في تفاصيل الـ AI</td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#161a22] p-6 rounded-xl border border-[#282e39]">
              <h3 className="text-lg font-semibold text-white mb-4">صورة الفاتورة</h3>
              {/* تأكدنا من تمرير الرابط بشكل صحيح */}
              <InvoiceImage imagePath={invoice?.imagePath} />
            </div>

            <div className="bg-[#161a22] p-6 rounded-xl border border-[#282e39]">
              <h3 className="text-lg font-semibold text-white mb-4">معلومات إضافية</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">تاريخ الفاتورة:</span>
                  <span className="text-white font-medium">
                    {invoice?.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString('ar-EG') : "غير متوفر"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">نوع العملية:</span>
                  <span className="text-white font-medium">
                    {invoice?.userInvoiceType === 'Sales' ? 'مبيعات' : (invoice?.userInvoiceType === 'Purchase' ? 'مشتريات' : invoice?.userInvoiceType || "غير محدد")}
                  </span>
                </div>
                {/* Confidence Reason */}
                {ai?.ConfidenceReason && (
                    <div className="pt-2 border-t border-[#282e39]">
                        <p className="text-[10px] text-gray-500 mb-1 italic">ملاحظة الـ AI:</p>
                        <p className="text-xs text-gray-400 leading-relaxed">{ai.ConfidenceReason}</p>
                    </div>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#161a22] p-6 rounded-xl border border-[#282e39] bg-gradient-to-b from-[#161a22] to-[#1a202a]">
              <h3 className="text-lg font-semibold text-white mb-4">الملخص المالي</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex justify-between text-blue-400">
                  <span>إجمالي الضريبة</span>
                  <span>{(invoice?.totalTax || 0).toFixed(2)} {invoice?.currency || "SAR"}</span>
                </div>
                <div className="border-t border-[#282e39] my-2" />
                <div className="flex justify-between text-xl font-bold text-white">
                  <span>الإجمالي النهائي</span>
                  <span className="text-green-500">{(invoice?.totalAmount || 0).toFixed(2)} {invoice?.currency || "SAR"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}