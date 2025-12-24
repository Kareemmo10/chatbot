import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function InvoicesDashboard({ invoices: initialInvoices }) {
  const [invoices, setInvoices] = useState(initialInvoices || []);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://nsaproject.runasp.net/api/Invoices", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

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

  if (!initialInvoices || initialInvoices.length === 0) {
    fetchInvoices();
  }
}, [initialInvoices]);


  const handleRowClick = (invoice) => navigate(`/invoice/${invoice.id}`);

  return (
    <div className="flex-1 bg-gray-50 p-4 md:p-8 overflow-y-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">سجل الفواتير</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50">
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
}
