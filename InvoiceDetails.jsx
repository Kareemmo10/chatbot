import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function InvoiceDetails() {
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
      <div className="flex justify-center items-center h-screen text-xl font-bold">
        جاري تحميل التفاصيل...
      </div>
    );

  if (error)
    return <p className="text-red-500 text-center text-xl mt-10">{error}</p>;

  const ai = invoice.aiData;

  return (
    <main className="flex-1 p-8 bg-[#f8f8f8]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-2 mb-6">
          <a
            className="text-gray-500  text-sm font-medium"
            href="#"
          >
            {" "}
            بوت بوت
          </a>
          <span className="text-gray-500  text-sm font-medium">
            /
          </span>
          <a
            className="text-gray-500  text-sm font-medium"
            href="#"
          >
            {" "}
            سجل الفواتير{" "}
          </a>
          <span className="text-gray-500  text-sm font-medium">
            /
          </span>
          <span className="text-gray-900  text-sm font-medium">
            {`${invoice.invoiceId}`}
          </span>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <p className="text-gray-900  text-3xl font-bold tracking-tight">
              تفاصيل الفاتورة {invoice.invoiceId}
            </p>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                invoice.status === "Completed"
                  ? "bg-green-100 text-green-700  "
                  : "bg-yellow-100 text-yellow-700 "
              }`}
            >
              {invoice.status === "Completed" ? "مدفوعة" : invoice.status}
            </span>
          </div>
        </div>
        

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white  p-6 rounded-xl border border-gray-200 ">
                <h3 className="text-lg font-semibold text-gray-900  mb-4">
                  من
                </h3>
                <div className="space-y-3 text-sm">
                  <p className="font-bold text-gray-800 ">
                    {ai.MerchantName}
                  </p>
                  <p className="text-gray-600 ">
                    {ai.MerchantAddress}
                  </p>
                  {ai.MerchantVat && (
                    <p className="text-gray-600 ">
                      VAT: {ai.MerchantVat}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white  p-6 rounded-xl border border-gray-200 ">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  إلى
                </h3>
                <div className="space-y-3 text-sm">
                  <p className="font-bold text-gray-800 ">
                    {ai.BuyerName}
                  </p>
                  <p className="text-gray-600">
                    {ai.BuyerAddress}
                  </p>
                  {ai.BuyerVat && (
                    <p className="text-gray-600 ">
                      VAT: {ai.BuyerVat}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white  p-6 rounded-xl border border-gray-200 ">
              <h3 className="text-lg font-semibold text-gray-900  mb-4">
                العناصر
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4 font-semibold text-gray-500 ">
                        #
                      </th>
                      <th className="py-3 px-4 font-semibold text-gray-500 ">
                        اسم العنصر
                      </th>
                      <th className="py-3 px-4 font-semibold text-gray-500  text-left">
                        الكمية
                      </th>
                      <th className="py-3 px-4 font-semibold text-gray-500  text-left">
                        سعر الوحدة
                      </th>
                      <th className="py-3 px-4 font-semibold text-gray-500  text-left">
                        الإجمالي
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 ">
                    {ai.Items.map((item) => (
                      <tr key={item.itemNo}>
                        <td className="py-4 px-4 text-gray-600">
                          {item.itemNo}
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-800 ">
                          {item.FullName}
                        </td>
                        <td className="py-4 px-4 text-gray-600  text-left">
                          {item.Qty}
                        </td>
                        <td className="py-4 px-4 text-gray-600  text-left">
                          {item.UnitPrice} {ai.Currency}
                        </td>
                        <td className="py-4 px-4 font-medium text-gray-800  text-left">
                          {item.LineTotal} {ai.Currency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="w-full bg-white  p-6 rounded-xl border border-gray-200 ">
              <h3 className="text-lg font-semibold text-gray-900  mb-4">
                صورة الفاتورة
              </h3>
              <div
                className="w-full gap-1 overflow-hidden aspect-[4/5] rounded-lg flex cursor-pointer"
                onClick={() => window.open(invoice.imagePath, "_blank")}
              >
                <div
                  className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-lg flex-1 border border-gray-200"
                  style={{ backgroundImage: `url(${invoice.imagePath})` }}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 ">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                التفاصيل
              </h3>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div className="flex flex-col gap-1 pl-2">
                  <p className="text-gray-500 dark:text-gray-400">
                    رقم الفاتورة
                  </p>
                  <p className="text-gray-800  font-medium">{`INV-${invoice.invoiceId}`}</p>
                </div>
                <div className="flex flex-col gap-1 pr-2">
                  <p className="text-gray-500 ">
                    نوع الفاتورة
                  </p>
                  <p className="text-gray-800  font-medium">
                    {ai.InvoiceType}
                  </p>
                </div>
                <div className="flex flex-col gap-1 pl-2">
                  <p className="text-gray-500 ">
                    تاريخ الإنشاء
                  </p>
                  <p className="text-gray-800  font-medium">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col gap-1 pr-2">
                  <p className="text-gray-500 ">الحالة</p>
                  <p className="text-gray-800  font-medium text-green-700 ">
                    {invoice.status === "Completed" ? "مدفوعة" : invoice.status}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white  p-6 rounded-xl border border-gray-200 ">
              <h3 className="text-lg font-semibold text-gray-900  mb-4">
                الملخص المالي
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 ">
                    عدد العناصر
                  </span>
                  <span className="font-medium text-gray-800 ">
                    {ai.ItemCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 ">
                    الإجمالي قبل الضريبة
                  </span>
                  <span className="font-medium text-gray-800 ">
                    {ai.TotalExcludingVAT} {ai.Currency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 ">
                    إجمالي الضريبة
                  </span>
                  <span className="font-medium text-gray-800 ">
                    {ai.TotalTax} {ai.Currency}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 ">
                    إجمالي الخصم
                  </span>
                  <span className="font-medium text-gray-800">
                    {ai.TotalDiscount} {ai.Currency}
                  </span>
                </div>
                <div className="border-t border-gray-200  my-3" />
                <div className="flex justify-between items-center text-base">
                  <span className="font-bold text-gray-900 ">
                    المبلغ الإجمالي النهائي
                  </span>
                  <span className="font-bold text-primary">
                    {ai.TotalAmount} {ai.Currency}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
