
import React, { useEffect, useState } from "react";
import { AlertCircle, Loader2, Loader2Icon, Plus, Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = "https://nsaproject.runasp.net/api";

export default function InvoiceReviewPage() {
  const token = localStorage.getItem("token");

  const [invoicesToReview, setInvoicesToReview] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  /* ================= helpers ================= */
  const calculateLineTotal = (item) =>
    Number(item.quantity) * Number(item.price);

  const calculateSubtotal = () =>
    selectedInvoice?.items.reduce(
      (sum, i) => sum + calculateLineTotal(i),
      0
    ) || 0;

  // داخل الكومبوننت، بعد تحديد selectedInvoice
const subtotal = calculateSubtotal();
const tax = Number(selectedInvoice?.totalTax || 0);
const grandTotal = subtotal + tax;



  /* ================= API ================= */
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch(`${API_BASE}/Invoices/review-list`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setInvoicesToReview(Array.isArray(data) ? data : []);
      } catch {
        toast.error("فشل تحميل قائمة الفواتير");
      }
    };
    if (token) fetchInvoices();
  }, [token]);

  const loadInvoiceDetails = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/Invoices/${id}/review-details`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();

      // جمع كل المنتجات الجديدة المقترحة
      setAllProducts((prev) => {
        const suggestedProds = (data.items || [])
          .filter((i) => i.suggestedProductId)
          .map((i) => ({
            id: i.suggestedProductId,
            name: i.suggestedProductName,
          }));
        const ids = new Set(prev.map((p) => p.id));
        return [...prev, ...suggestedProds.filter((p) => !ids.has(p.id))];
      });

      setSelectedInvoice({
  id: data.invoiceId,
  invoiceNumber: data.invoiceNumber || "",
  invoiceDate: data.invoiceDate?.split("T")[0] || "",
  merchantName: data.merchantName || "",
  merchantVat: data.merchantVat || "",
  currency: data.currency || "USD",
  imagePath: data.imagePath,
  validationWarnings: data.validationWarnings || [],
  totalTax: data.totalTax || 0, // <-- هنا
  items: (data.items || []).map((i) => ({
    id: i.id,
    rawName: i.rawName,
    productId: i.suggestedProductId || "",
    aiName: i.suggestedProductName || "",
    quantity: i.qty ?? 1,
    price: i.unitPrice ?? 0,
  })),
});

    } catch {
      toast.error("خطأ في تحميل الفاتورة");
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (itemId, field, value) => {
    setSelectedInvoice((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.id === itemId ? { ...i, [field]: value } : i
      ),
    }));
  };

  const handleQuickCreate = async (itemId) => {
    const name = prompt("اسم المنتج الجديد:");
    if (!name) return;
    const payload = { name, price: 0, code: `AUTO-${Math.floor(Math.random() * 10000)}` };
    try {
      const res = await fetch(`${API_BASE}/Products/quick-create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const newProduct = await res.json();
        setAllProducts((prev) => [...prev, newProduct]);
        handleItemChange(itemId, "productId", newProduct.id);
        toast.success("تم إنشاء المنتج");
      } else toast.error("فشل إنشاء المنتج");
    } catch {
      toast.error("خطأ في الاتصال بالسيرفر");
    }
  };

  const handleDeleteItem = (itemId) => {
    setSelectedInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== itemId),
    }));
  };

 const handleApprove = async () => {
  if (!selectedInvoice) return;

  const invalidItems = selectedInvoice.items.filter(i => !i.productId);
  if (invalidItems.length > 0) {
    toast.error("كل عنصر يجب أن يكون له منتج محدد");
    return;
  }

  setActionLoading(true);

  try {
    const payload = {
      invoiceNumber: selectedInvoice.invoiceNumber,
      merchantName: selectedInvoice.merchantName,
      merchantVat: selectedInvoice.merchantVat,
      buyerName: "Internal Buyer", // أو من عندك
      buyerVat: "0000000000",
      invoiceDate: new Date(selectedInvoice.invoiceDate).toISOString(),
      totalAmount: Number(grandTotal),
      totalTax: Number(selectedInvoice.totalTax),
      items: selectedInvoice.items.map(i => ({
        productId: Number(i.productId),
        fullName: i.rawName,
        qty: Number(i.quantity),
        unitPrice: Number(i.price),
      })),
    };

    console.log("APPROVE PAYLOAD", payload);

    const res = await fetch(
      `${API_BASE}/Invoices/${selectedInvoice.id}/approve`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      toast.success("تم اعتماد الفاتورة بنجاح");
      setInvoicesToReview(p => p.filter(i => i.id !== selectedInvoice.id));
      setSelectedInvoice(null);
    } else {
      const err = await res.json();
      toast.error(err.message || "فشل الاعتماد");
    }
  } catch {
    toast.error("مشكلة في الاتصال بالسيرفر");
  } finally {
    setActionLoading(false);
  }
};

const handleReject = async () => {
  if (!selectedInvoice) return;

  setActionLoading(true);

  try {
    const res = await fetch(
      `${API_BASE}/Invoices/${selectedInvoice.id}/reject`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      toast.success("تم رفض الفاتورة");
      setInvoicesToReview((p) =>
        p.filter((i) => i.id !== selectedInvoice.id)
      );
      setSelectedInvoice(null);
    } else {
      const err = await res.json();
      toast.error(err.message || "فشل رفض الفاتورة");
    }
  } catch {
    toast.error("مشكلة اتصال بالسيرفر");
  } finally {
    setActionLoading(false);
  }
};




  /* ================= UI ================= */
  return (
    <div className="min-h-screen flex bg-[#0f172a] text-white" dir="rtl">
      <ToastContainer position="top-left" />

      {/* ===== Review List ===== */}
      <div className="w-35 bg-[#111318] border-r border-[#282e39] overflow-y-auto">
        <div className="p-5 font-bold border-b border-[#282e39]">فواتير المراجعة</div>
        {invoicesToReview.map((inv) => (
          <div
            key={inv.id}
            onClick={() => loadInvoiceDetails(inv.id)}
            className="p-4 cursor-pointer hover:bg-[#282e39]"
          >
            <div className="text-xs font-semibold">#{inv.id}</div>
            <div className="text-[11px] text-[#9da6b9]">{inv.invoiceNumber}</div>
          </div>
        ))}
      </div>

      {/* ===== Main ===== */}
      <main className="flex-1 p-9 overflow-y-auto">
       {!selectedInvoice ? (
  <div className="h-full flex flex-col items-center justify-center text-[#9da6b9] gap-3">
    <Loader2Icon className="animate-spin text-gray-400" size={40} />
    <p className="text-sm font-medium">اختر فاتورة للمراجعة</p>
  </div>
) : loading ? (
  <div className="h-full flex items-center justify-center">
    <Loader2Icon className="animate-spin" size={48} />
  </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Invoice Image */}
            <div className="hidden xl:block">
              <div className="sticky top-6 bg-[#161a22] border border-white/5 rounded-2xl p-4">
                <h3 className="mb-3 font-bold text-sm text-gray-300">صورة الفاتورة</h3>
                <img src={selectedInvoice.imagePath} alt="Invoice" className="w-full max-h-[70vh] object-contain rounded-lg"/>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="xl:col-span-2 space-y-6">
              {selectedInvoice.validationWarnings.length > 0 && (
                <div className="bg-red-500/10 border border-red-500 rounded-2xl p-4 space-y-2">
                  {selectedInvoice.validationWarnings.map((w,i)=>(
                    <div key={i} className="flex items-center gap-2 text-sm text-red-400">
                      <AlertCircle size={16}/><span>{w.message}</span>
                    </div>
                  ))}
                </div>
              )}

             <div className="grid md:grid-cols-2 gap-4">
  <div className="bg-[#161a22] p-4 rounded-xl">
    <h3 className="mb-2 font-semibold text-sm">معلومات عامة</h3>
    <label className="text-xs text-gray-400">رقم الفاتورة</label>
    <input
      className="w-full bg-[#1c1f27] p-2 rounded mb-2 text-sm"
      value={selectedInvoice.invoiceNumber}
      onChange={(e) =>
        setSelectedInvoice({
          ...selectedInvoice,
          invoiceNumber: e.target.value,
        })
      }
    />
    <label className="text-xs text-gray-400">تاريخ الفاتورة</label>
    <input
  type="date"
  className="w-full bg-[#1c1f27] p-2 rounded text-sm date-white"
  value={selectedInvoice.invoiceDate}
/>

  </div>

  <div className="bg-[#161a22] p-4 rounded-xl">
    <h3 className="mb-2 font-semibold text-sm">المورد</h3>
    <label className="text-xs text-gray-400">اسم المورد</label>
    <input
      className="w-full bg-[#1c1f27] p-2 rounded mb-2 text-sm"
      value={selectedInvoice.merchantName}
      onChange={(e) =>
        setSelectedInvoice({
          ...selectedInvoice,
          merchantName: e.target.value,
        })
      }
    />
    <label className="text-xs text-gray-400">الرقم الضريبي</label>
    <input
      className="w-full bg-[#1c1f27] p-2 rounded text-sm"
      value={selectedInvoice.merchantVat}
      onChange={(e) =>
        setSelectedInvoice({
          ...selectedInvoice,
          merchantVat: e.target.value,
        })
      }
    />
  </div>
</div>



              {/* Items Table */}
              <div className="bg-[#1c1f27] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#282e39]">
                    <tr>
                      <th className="p-2 text-right">الوصف</th>
                      <th className="p-2">المنتج</th>
                      <th className="p-2">الكمية</th>
                      <th className="p-2">السعر</th>
                      <th className="p-2">الإجمالي</th>
                      <th className="p-2">حذف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item)=>(
                      <tr key={item.id} className="border-t border-[#282e39]">
                        <td className="p-2">{item.rawName}</td>
                        <td className="p-2">
  <div className="flex gap-1 items-center">
    <select
      value={item.productId}
      onChange={(e) => handleItemChange(item.id, "productId", e.target.value)}
      className="bg-[#161a22] p-1 rounded flex-1 min-w-[100px] max-w-[150px]"
    >
      <option value="">-- اختر --</option>
      {allProducts.map((p) => (
        <option key={p.id} value={p.id}>{p.name}</option>
      ))}
    </select>
    <button
      onClick={() => handleQuickCreate(item.id)}
      className="p-2  text-white rounded"
    >
      <Plus size={14}/>
    </button>
  </div>
</td>

                        <td className="p-2 text-center">
                          <input type="number" value={item.quantity} onChange={(e)=>handleItemChange(item.id,'quantity',e.target.value)} className="bg-transparent w-16 text-center"/>
                        </td>
                        <td className="p-2 text-center">
                          <input type="number" value={item.price} onChange={(e)=>handleItemChange(item.id,'price',e.target.value)} className="bg-transparent w-20 text-center"/>
                        </td>
                        <td className="p-2 text-center">{calculateLineTotal(item).toFixed(2)}</td>
                        <td className="p-2 text-center">
                          <button onClick={()=>handleDeleteItem(item.id)} className="bg-red-500/10 text-red-500 p-1 rounded">
                            <Trash2 size={14}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              {/* Totals */}
<div className="max-w-sm ms-auto space-y-2 bg-[#1c1f27]/80 p-4 rounded-lg">
  <div className="flex justify-between">
    <span>المجموع</span>
    <span>{calculateSubtotal().toFixed(2)} {selectedInvoice.currency}</span>
  </div>
  <div className="flex justify-between">
    <span>الضريبة</span>
    <span>{tax.toFixed(2)} {selectedInvoice.currency}</span>
  </div>
  
  <div className="flex justify-between font-bold text-base bg-[#282E39] p-2 rounded">
    <span>الإجمالي</span>
    <span>{grandTotal.toFixed(2)} {selectedInvoice.currency}</span>
  </div>
</div>
                    


              {/* Actions */}
              <div className="flex justify-end gap-4">
                <button
  disabled={actionLoading}
  onClick={handleReject}
  className="px-6 py-2 bg-red-500/10 border border-red-500 text-red-400 rounded-lg"
>
  {actionLoading ? "..." : "رفض"}
</button>

                <button disabled={actionLoading} onClick={handleApprove} className="px-8 py-2 bg-blue-600/80 rounded-lg font-bold">
                  {actionLoading ? "..." : "اعتماد ومعالجة"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
