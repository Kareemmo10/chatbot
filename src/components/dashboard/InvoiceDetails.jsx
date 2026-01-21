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
        const res = await fetch(`https://nsaproject.runasp.net/api/Invoices/${id}`);
        if (!res.ok) throw new Error("فشل تحميل البيانات");
        const data = await res.json();
        setInvoice(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center bg-[#101622] text-white h-screen text-xl font-bold">
      جاري تحميل التفاصيل...
    </div>
  );

  if (error) return <p className="text-red-500 text-center text-xl mt-10">{error}</p>;

  const ai = invoice.aiData || {};

  const getStatusText = (status) => {
    const statuses = { 1: "غير معروف", 2: "مراجعة AI", 3: "معتمد", 4: "مرفوض" };
    return statuses[status] || "غير معروف";
  };

  const getStatusClasses = (status) => {
    const classes = {
      1: "bg-blue-700 text-blue-100",
      2: "bg-yellow-700 text-yellow-100",
      3: "bg-green-700 text-green-100",
      4: "bg-red-700 text-red-100"
    };
    return classes[status] || "bg-gray-700 text-gray-100";
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
          <span className="text-white font-medium">فاتورة رقم {invoice.invoiceId}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-white text-xl md:text-3xl font-bold tracking-tight">
 تفاصيل الفاتورة {invoice.invoiceId}            </h1>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(invoice.status)}`}>
              {getStatusText(invoice.status)}
            </span>
            {/* عرض درجة الثقة (Confidence Score) */}
            <div className="flex items-center gap-1 bg-gray-800 px-3 py-1 rounded-full border border-gray-600">
                <span className="text-[10px] text-gray-400">دقة الـ AI :</span>
                <span className={`text-xs font-bold ${ai.ConfidenceScore > 0.8 ? 'text-green-400' : 'text-orange-400'}`}>
                    {(ai.ConfidenceScore * 100).toFixed(0)}%
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
                  <p className="font-bold text-lg text-white">{ai.MerchantName || "غير متوفر"}</p>
                  <p className="opacity-80">{ai.MerchantAddress || "العنوان غير متوفر"}</p>
                  {ai.MerchantVat && <p className="text-blue-400">الرقم الضريبي: {ai.MerchantVat}</p>}
                </div>
              </div>

              <div className="bg-[#161a22] p-6 rounded-xl border border-[#282e39]">
                <h3 className="text-gray-400 text-xs font-bold uppercase mb-4">المشتري (إلى)</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p className="font-bold text-lg text-white">{ai.BuyerName || "غير متوفر"}</p>
                  <p className="opacity-80">{ai.BuyerAddress || "العنوان غير متوفر"}</p>
                  {ai.BuyerVat && <p className="text-blue-400">الرقم الضريبي: {ai.BuyerVat}</p>}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-[#161a22] p-6 rounded-xl border border-[#282e39]">
              <h3 className="text-lg font-semibold text-white mb-4">الأصناف المكتشفة ({ai.Items?.length || 0})</h3>
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
                    {ai.Items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#1c212b] transition-colors">
                        <td className="py-4 px-4 text-white font-medium">{item.FullName || item.Name}</td>
                        <td className="py-4 px-4">{item.Qty} {item.Unit}</td>
                        <td className="py-4 px-4">{item.UnitPrice?.toFixed(2)} {ai.Currency}</td>
                        <td className="py-4 px-4 text-left font-bold text-white">{item.LineTotal?.toFixed(2)} {ai.Currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-[#161a22] p-6 rounded-xl border border-[#282e39]">
              <h3 className="text-lg font-semibold text-white mb-4">صورة الفاتورة</h3>
              <InvoiceImage imagePath={invoice.imagePath} />
            </div>

            <div className="bg-[#161a22] p-6 rounded-xl border border-[#282e39]">
              <h3 className="text-lg font-semibold text-white mb-4">معلومات إضافية</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">تاريخ الفاتورة:</span>
                  <span className="text-white font-medium">{ai.InvoiceDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">طريقة الدفع:</span>
                  <span className="text-white font-medium">{ai.PaymentMethod || "كاش"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">نوع العملية:</span>
                  <span className="text-white font-medium">{ai.InvoiceType === 'Sales' ? 'مبيعات' : 'مشتريات'}</span>
                </div>
                <div className="pt-2 border-t border-[#282e39]">
                    <p className="text-[10px] text-gray-500 mb-1 italic">ملاحظة الـ AI:</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{ai.ConfidenceReason}</p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-[#161a22] p-6 rounded-xl border border-[#282e39] bg-gradient-to-b from-[#161a22] to-[#1a202a]">
              <h3 className="text-lg font-semibold text-white mb-4">الملخص المالي</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex justify-between italic">
                  <span>الإجمالي (بدون ضريبة)</span>
                  <span>{ai.TotalExcludingVAT?.toFixed(2)} {ai.Currency}</span>
                </div>
                <div className="flex justify-between text-blue-400">
                  <span>إجمالي الضريبة (15%)</span>
                  <span>{ai.TotalTax?.toFixed(2)} {ai.Currency}</span>
                </div>
                <div className="border-t border-[#282e39] my-2" />
                <div className="flex justify-between text-xl font-bold text-white">
                  <span>الإجمالي النهائي</span>
                  <span className="text-green-500">{ai.TotalAmount?.toFixed(2)} {ai.Currency}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}