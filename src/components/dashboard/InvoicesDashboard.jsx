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
  const statusMap = {
  completed: {
    label: "معتمد",
    className: "bg-green-700 text-green-100",
  },
  ai_processing: {
    label: "معالجة AI",
    className: "bg-yellow-700 text-yellow-100",
  },
  rejected: {
    label: "مرفوض",
    className: "bg-red-700 text-red-100",
  },
};




  return (
   <div className="flex-1 bg-[#101622] overflow-y-auto">
   <header className="top-0 left-0 w-full h-16 flex items-center justify-between px-4 md:px-6 bg-[#111318] border-b border-[#1f2430] z-50">
  <div>
    <h2 className="text-white text-base md:text-lg font-bold flex items-center gap-2">
       سجل الفواتير
    </h2>
  </div>
</header>
  <div className="bg-[#161a22] rounded-lg md:rounded-xl m-4 md:m-9 shadow-sm border border-gray-700 overflow-hidden">
      <table className="w-full text-right text-xs md:text-sm text-white">
        <thead className="bg-[#1c1f27]">
          <tr>
            <th className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap">رقم</th>
            <th className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap">النوع</th>
            <th className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap hidden sm:table-cell">التاريخ</th>
            <th className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap">المبلغ</th>
            <th className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap">الحالة</th>
            <th className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap">صورة</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {invoices.map((inv) => (
            <tr
              key={inv.id}
              className="cursor-pointer hover:bg-[#282e39] transition-colors"
              onClick={() => handleRowClick(inv)}
            >
              <td className="px-2 md:px-6 py-2 md:py-4 font-medium">#{inv.id}</td>
              <td className="px-2 md:px-6 py-2 md:py-4">{inv.type}</td>
              <td className="px-2 md:px-6 py-2 md:py-4 hidden sm:table-cell">{inv.date}</td>
              <td className="px-2 md:px-6 py-2 md:py-4">{inv.amount}</td>
            <td className="px-2 md:px-6 py-2 md:py-4">
  {statusMap[inv.status] ? (
    <span
      className={`inline-flex items-center rounded-full px-1.5 md:px-2 py-0.5 text-xs font-medium ${statusMap[inv.status].className}`}
    >
      {statusMap[inv.status].label}
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full px-1.5 md:px-2 py-0.5 text-xs font-medium bg-yellow-700 text-yellow-100">
      تحت المعالجة
    </span>
  )}
</td>


              <td className="px-2 md:px-6 py-2 md:py-4">
                {inv.imageUrl ? (
                  <img
                    src={inv.imageUrl}
                    className="w-8 h-8 md:w-10 md:h-10 rounded object-cover border border-gray-700"
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

  );
}
