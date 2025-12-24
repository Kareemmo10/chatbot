import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle, XCircle, Trash2, Search, AlertCircle, Package } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const InvoiceReviewPage = ({ products, currentUser }) => {
  const [invoicesToReview, setInvoicesToReview] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- جلب الفواتير من الباك إند ---
  useEffect(() => {
    const fetchInvoices = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("https://nsaproject.runasp.net/api/Invoices/review-list", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setInvoicesToReview(data);
      } catch (err) {
        toast.error(err.message);
      }
    };
    fetchInvoices();
  }, []);

  // --- فلترة البحث مع حماية من null ---
  const filteredInvoices = useMemo(() => {
    return invoicesToReview.filter(inv =>
      (inv.invoiceNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (inv.vendor?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  }, [invoicesToReview, searchTerm]);

  // --- تعديل عنصر في الفاتورة ---
  const handleItemChange = async (invoiceId, itemId, field, value) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`https://nsaproject.runasp.net/api/invoices/${invoiceId}/items/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: value })
      });
      setInvoicesToReview(prev =>
        prev.map(inv =>
          inv.id === invoiceId
            ? {
                ...inv,
                extractedItems: inv.extractedItems.map(item =>
                  item.id === itemId ? { ...item, [field]: value } : item
                ),
              }
            : inv
        )
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  // --- ربط عنصر بمنتج ---
  const handleMatchProduct = async (invoiceId, itemId, productId) => {
    const matchedProduct = products.find(p => p.id === productId);
    setInvoicesToReview(prev =>
      prev.map(inv =>
        inv.id === invoiceId
          ? {
              ...inv,
              extractedItems: inv.extractedItems.map(item =>
                item.id === itemId
                  ? {
                      ...item,
                      matchedProductId: productId,
                      name: matchedProduct?.name || item.name,
                      price: matchedProduct?.price || item.price,
                    }
                  : item
              ),
            }
          : inv
      )
    );
    // هنا ممكن تبعت API call لو محتاج تحديث في الباك إند
  };

  // --- إضافة عنصر جديد ---
  const handleAddItem = (invoiceId) => {
    setInvoicesToReview(prev =>
      prev.map(inv =>
        inv.id === invoiceId
          ? {
              ...inv,
              extractedItems: [
                ...inv.extractedItems,
                { id: Date.now() + Math.random(), name: '', quantity: 1, price: 0, recognized: false },
              ],
            }
          : inv
      )
    );
  };

  // --- مسح عنصر ---
  const handleRemoveItem = (invoiceId, itemId) => {
    setInvoicesToReview(prev =>
      prev.map(inv =>
        inv.id === invoiceId
          ? {
              ...inv,
              extractedItems: inv.extractedItems.filter(item => item.id !== itemId),
            }
          : inv
      )
    );
  };

  // --- تأكيد الفاتورة ---
  const handleConfirmInvoice = async (invoiceId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://nsaproject.runasp.net/api/invoices/${invoiceId}/approve`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(await res.text());
      setInvoicesToReview(prev => prev.filter(inv => inv.id !== invoiceId));
      setSelectedInvoice(null);
      toast.success("تم تأكيد الفاتورة بنجاح!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // --- رفض الفاتورة ---
  const handleRejectInvoice = async (invoiceId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://nsaproject.runasp.net/api/invoices/${invoiceId}/reject`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(await res.text());
      setInvoicesToReview(prev => prev.filter(inv => inv.id !== invoiceId));
      setSelectedInvoice(null);
      toast.info("تم رفض الفاتورة بنجاح!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-gray-50">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* قائمة الفواتير */}
        <div className="md:col-span-1 bg-white rounded-xl p-4 border max-h-[80vh] overflow-y-auto">
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="ابحث عن فاتورة"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-2 pr-10 border rounded-lg"
            />
          </div>
          {filteredInvoices.length ? (
            <ul className="space-y-2">
              {filteredInvoices.map(inv => (
                <li
                  key={inv.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedInvoice?.id === inv.id ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 hover:bg-gray-100'}`}
                  onClick={() => setSelectedInvoice(inv)}
                >
                  <p className="font-semibold">{inv.vendor}</p>
                  <p className="text-sm">{inv.invoiceNumber} - {inv.date}</p>
                  <p className="text-xs text-gray-500">درجة الثقة: {(inv.confidenceScore * 100).toFixed(0)}%</p>
                  <div className="flex justify-end mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertCircle size={14} className="mr-1" /> تحتاج مراجعة
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto mb-2" />
              <p>لا توجد فواتير للمراجعة</p>
            </div>
          )}
        </div>

        {/* تفاصيل الفاتورة */}
        <div className="md:col-span-2 bg-white rounded-xl p-6 border max-h-[80vh] overflow-y-auto">
          {selectedInvoice ? (
            <>
              <div className="flex justify-between items-center mb-4 pb-4 border-b">
                <div>
                  <h2 className="text-xl font-bold">{selectedInvoice.vendor}</h2>
                  <p>رقم الفاتورة: {selectedInvoice.invoiceNumber}</p>
                  <p>المجموع: {selectedInvoice.totalAmount}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleConfirmInvoice(selectedInvoice.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <CheckCircle size={18} /> تأكيد
                  </button>
                  <button onClick={() => handleRejectInvoice(selectedInvoice.id)} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <XCircle size={18} /> رفض
                  </button>
                </div>
              </div>

              {/* العناصر */}
              <div className="space-y-4">
                {selectedInvoice.extractedItems.map(item => (
                  <div key={item.id} className="border p-3 rounded-lg flex flex-col sm:flex-row sm:items-center gap-3">
                    <input type="text" value={item.name} onChange={e => handleItemChange(selectedInvoice.id, item.id, 'name', e.target.value)} className="flex-1 p-1 border rounded-md" />
                    <input type="number" value={item.quantity} onChange={e => handleItemChange(selectedInvoice.id, item.id, 'quantity', parseInt(e.target.value) || 0)} className="w-24 p-1 border rounded-md" />
                    <input type="number" value={item.price} onChange={e => handleItemChange(selectedInvoice.id, item.id, 'price', parseFloat(e.target.value) || 0)} className="w-24 p-1 border rounded-md" />
                    <select value={item.matchedProductId || ''} onChange={e => handleMatchProduct(selectedInvoice.id, item.id, e.target.value)} className="w-48 p-1 border rounded-md">
                      <option value="">اختر منتج</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button onClick={() => handleRemoveItem(selectedInvoice.id, item.id)} className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={() => handleAddItem(selectedInvoice.id)} className="bg-gray-200 px-3 py-1 rounded-lg hover:bg-gray-300 mt-2">إضافة عنصر</button>
            </>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Package size={48} className="mx-auto mb-2" />
              <p>اختر فاتورة للمراجعة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceReviewPage;
