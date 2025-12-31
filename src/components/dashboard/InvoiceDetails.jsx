import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import InvoiceImage from "../invoice/InvoiceImage";

export default function InvoiceDetails() {
  const [isOpen, setIsOpen] = useState(false);
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://nsaproject.runasp.net/api/Invoices/${id}`
        );
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

  if (loading)
    return (
      <div className="flex justify-center items-center bg-[#101622] text-white h-screen text-xl font-bold">
        جاري تحميل التفاصيل...
      </div>
    );

  if (error)
    return <p className="text-red-500 text-center text-xl mt-10">{error}</p>;

  const ai = invoice.aiData;

 const getStatusText = (status) => {
  switch (status) {
    case 1:
            return "غير معروف";

    case 2:
      return "مراجعة AI";
    default:
            return "مكتمل"; // أو "مدفوع" حسب ما تحب

  }
};

const getStatusClasses = (status) => {
  switch (status) {
    case 1:
            return "bg-blue-700 text-blue-100"; 

    case 2:
      return "bg-yellow-700 text-yellow-100";
    case 3:
            return "bg-green-700 text-green-100";

    default:
      return "bg-gray-700 text-gray-100";
  }
};


  return (
<main className="flex-1 p-8 bg-[#101622] overflow-y-auto h-[calc(100vh-64px)]">
  <div className="max-w-7xl mx-auto">
    <div className="flex flex-wrap gap-2 mb-6">
      <Link className="text-gray-400 text-sm font-medium" to="/">بوت بوت</Link>
      <span className="text-gray-400 text-sm font-medium">/</span>
      <Link className="text-gray-400 text-sm font-medium" to="/invoices">سجل الفواتير</Link>
      <span className="text-gray-400 text-sm font-medium">/</span>
      <span className="text-white text-sm font-medium">{`${invoice.invoiceId}`}</span>
    </div>

    <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
      <div className="flex items-center gap-4">
        <p className="text-white text-3xl font-bold tracking-tight">
          تفاصيل الفاتورة {invoice.invoiceId}
        </p>
       <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusClasses(invoice.status)}`}>
  {getStatusText(invoice.status)}
</span>

      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#161a22] p-6 rounded-xl border border-[#282e39]">
            <h3 className="text-lg font-semibold text-white mb-4">من</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <p className="font-bold text-white">{ai.MerchantName}</p>
              <p>{ai.MerchantAddress}</p>
              {ai.MerchantVat && <p>VAT: {ai.MerchantVat}</p>}
            </div>
          </div>

          <div className="bg-[#161a22] p-6 rounded-xl border border-[#282e39]">
            <h3 className="text-lg font-semibold text-white mb-4">إلى</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <p className="font-bold text-white">{ai.BuyerName}</p>
              <p>{ai.BuyerAddress}</p>
              {ai.BuyerVat && <p>VAT: {ai.BuyerVat}</p>}
            </div>
          </div>
        </div>

        <div className="bg-[#161a22] p-6 rounded-xl border border-[#282e39]">
          <h3 className="text-lg font-semibold text-white mb-4">العناصر</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-gray-300">
              <thead className="border-b border-[#282e39]">
                <tr>
                  <th className="py-3 px-4 font-semibold">#</th>
                  <th className="py-3 px-4 font-semibold">اسم العنصر</th>
                  <th className="py-3 px-4 font-semibold text-left">الكمية</th>
                  <th className="py-3 px-4 font-semibold text-left">سعر الوحدة</th>
                  <th className="py-3 px-4 font-semibold text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#282e39]">
                {ai.Items.map((item) => (
                  <tr key={item.itemNo}>
                    <td className="py-4 px-4">{item.itemNo}</td>
                    <td className="py-4 px-4 font-medium">{item.FullName}</td>
                    <td className="py-4 px-4 text-left">{item.Qty}</td>
                    <td className="py-4 px-4 text-left">{item.UnitPrice} {ai.Currency}</td>
                    <td className="py-4 px-4 font-medium text-left">{item.LineTotal} {ai.Currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 space-y-8">
        <div className="w-full bg-[#161a22] p-6 rounded-xl border border-[#282e39]">
          <h3 className="text-lg font-semibold text-white mb-4">صورة الفاتورة</h3>
          <InvoiceImage imagePath={invoice.imagePath} />
        </div>

        <div className="bg-[#161a22] p-6 rounded-xl border border-[#282e39]">
          <h3 className="text-lg font-semibold text-white mb-4">التفاصيل</h3>
          <div className="grid grid-cols-2 gap-y-4 text-sm text-gray-300">
            <div className="flex flex-col gap-1 pl-2">
              <p>رقم الفاتورة</p>
              <p className="font-medium text-white">{`INV-${invoice.invoiceId}`}</p>
            </div>
            <div className="flex flex-col gap-1 pr-2">
              <p>نوع الفاتورة</p>
              <p className="font-medium text-white">{ai.InvoiceType}</p>
            </div>
            <div className="flex flex-col gap-1 pl-2">
              <p>تاريخ الإنشاء</p>
              <p className="font-medium text-white">{new Date(invoice.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex flex-col gap-1 pr-2">
              <p>الحالة</p>
<p className="font-medium text-green-500">{getStatusText(invoice.status)}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#161a22] p-6 rounded-xl border border-[#282e39]">
          <h3 className="text-lg font-semibold text-white mb-4">الملخص المالي</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex justify-between">
              <span>عدد العناصر</span>
              <span className="font-medium text-white">{ai.ItemCount}</span>
            </div>
            <div className="flex justify-between">
              <span>الإجمالي قبل الضريبة</span>
              <span className="font-medium text-white">{ai.TotalExcludingVAT} {ai.Currency}</span>
            </div>
            <div className="flex justify-between">
              <span>إجمالي الضريبة</span>
              <span className="font-medium text-white">{ai.TotalTax} {ai.Currency}</span>
            </div>
            <div className="flex justify-between">
              <span>إجمالي الخصم</span>
              <span className="font-medium text-white">{ai.TotalDiscount} {ai.Currency}</span>
            </div>
            <div className="border-t border-[#282e39] my-3" />
            <div className="flex justify-between text-base font-bold">
              <span>المبلغ الإجمالي النهائي</span>
              <span className="text-primary">{ai.TotalAmount} {ai.Currency}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

  );
}
