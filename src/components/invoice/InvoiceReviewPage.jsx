

import React, { useState, useEffect } from "react";
import { Plus, Save, AlertCircle, Loader2, PackagePlus, ArrowRight } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InvoiceReviewPage = () => {
  const [invoicesToReview, setInvoicesToReview] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [allProducts, setAllProducts] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const API_BASE = "https://nsaproject.runasp.net/api";
  const token = localStorage.getItem("token");

  // 1. جلب قائمة الفواتير
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch(`${API_BASE}/Invoices/review-list`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setInvoicesToReview(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        toast.error("فشل في تحميل قائمة الفواتير");
      }
    };
    if (token) fetchInvoices();
  }, [token]);

  // 2. تحميل تفاصيل الفاتورة
  const loadInvoiceDetails = async (invoiceId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/Invoices/${invoiceId}/review-details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      const suggestedProds = (data.items || [])
        .filter(i => i.suggestedProductId)
        .map(i => ({ id: i.suggestedProductId, name: i.suggestedProductName }));

      setAllProducts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newOnes = suggestedProds.filter(p => !existingIds.has(p.id));
        return [...prev, ...newOnes];
      });

      setSelectedInvoice({
        id: invoiceId,
        merchantName: data.merchantName || "",
        invoiceNumber: data.invoiceNumber || "",
        items: (data.items ?? []).map(item => ({
          id: item.id || Math.random(), 
          rawName: item.rawName,
          quantity: item.qty ?? 1,
          price: item.unitPrice ?? 0,
          productId: item.suggestedProductId || "", 
        }))
      });
    } catch (err) {
      toast.error("خطأ في جلب بيانات الفاتورة");
    } finally {
      setLoading(false);
    }
  };

  // 3. إضافة منتج سريع - تم التعديل بناءً على الـ Schema الجديدة
  const handleQuickCreate = async (itemId) => {
    const name = prompt("اسم المنتج الجديد:");
    if (!name) return;
    
    // إنشاء كود عشوائي وسعر افتراضي بناءً على الـ Schema المطلوبة
    const payload = {
      name: name,
      price: 0, 
      code: "AUTO-" + Math.floor(Math.random() * 10000)
    };

    try {
      const res = await fetch(`${API_BASE}/Products/quick-create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const newProduct = await res.json();
        setAllProducts(prev => [...prev, newProduct]);
        handleItemChange(itemId, "productId", newProduct.id);
        toast.success("تم تسجيل المنتج بنجاح");
      } else {
        const errorData = await res.json();
        console.error("Quick Create Error:", errorData);
        toast.error("فشل في إضافة المنتج - راجع المتطلبات");
      }
    } catch (err) {
      toast.error("فشل في الاتصال أثناء إضافة المنتج");
    }
  };

  // 4. الاعتماد النهائي
  const handleConfirmInvoice = async () => {
    if (selectedInvoice.items.some(i => !i.productId)) {
      toast.warn("يجب ربط جميع الأصناف بمنتجات النظام");
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        MerchantName: selectedInvoice.merchantName,
        InvoiceNumber: selectedInvoice.invoiceNumber,
        Items: selectedInvoice.items.map(i => {
          const product = allProducts.find(p => p.id.toString() === i.productId.toString());
          return {
            ProductId: Number(i.productId),
            Quantity: Number(i.quantity),
            UnitPrice: Number(i.price),
            FullName: product ? product.name : i.rawName 
          };
        })
      };

      const res = await fetch(`${API_BASE}/Invoices/${selectedInvoice.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast.success("تم اعتماد الفاتورة بنجاح");
        setInvoicesToReview(prev => prev.filter(inv => inv.id !== selectedInvoice.id));
        setSelectedInvoice(null);
      } else {
        const errorData = await res.json();
        console.error("Approve Errors:", errorData.errors);
        toast.error("خطأ في البيانات المرسلة");
      }
    } catch (err) {
      toast.error("فشل في الاتصال بالسيرفر");
    } finally {
      setActionLoading(false);
    }
  };

  const handleItemChange = (itemId, field, value) => {
    setSelectedInvoice(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotal = () => {
    return selectedInvoice?.items.reduce((sum, i) => sum + (Number(i.price) * Number(i.quantity)), 0) || 0;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8" dir="rtl">
      <ToastContainer position="top-left" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        
        {/* قائمة الفواتير */}
        <div className="col-span-12 lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[80vh]">
          <div className="p-4 bg-slate-50 border-b font-black text-slate-800 flex items-center gap-2">
            <AlertCircle size={20} className="text-orange-500" />
            فواتير المراجعة
          </div>
          <div className="flex-1 overflow-y-auto font-medium">
            {invoicesToReview.map(inv => (
              <div 
                key={inv.id} 
                onClick={() => loadInvoiceDetails(inv.id)}
                className={`p-4 cursor-pointer border-b hover:bg-blue-50 transition-all ${selectedInvoice?.id === inv.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''}`}
              >
                <div className="font-bold text-slate-700">{inv.merchantName || "مورد مجهول"}</div>
                <div className="text-xs text-slate-500 mt-1 flex justify-between">
                  <span>رقم: {inv.invoiceNumber}</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* منطقة المراجعة */}
        <div className="col-span-12 lg:col-span-9 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[80vh]">
          {!selectedInvoice ? (
            <div className="m-auto text-slate-400 font-medium">اختر فاتورة لبدء المراجعة</div>
          ) : loading ? (
            <div className="m-auto text-center"><Loader2 className="animate-spin text-blue-600 mb-2 m-auto" size={40} /><p>تحميل...</p></div>
          ) : (
            <>
              <div className="p-6 border-b grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <input className="w-full p-2.5 border rounded-xl font-bold bg-slate-50" value={selectedInvoice.merchantName} onChange={(e) => setSelectedInvoice({...selectedInvoice, merchantName: e.target.value})} placeholder="اسم المورد" />
                  <input className="w-full p-2.5 border rounded-xl font-mono bg-slate-50" value={selectedInvoice.invoiceNumber} onChange={(e) => setSelectedInvoice({...selectedInvoice, invoiceNumber: e.target.value})} placeholder="رقم الفاتورة" />
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center flex flex-col justify-center">
                  <span className="text-emerald-600 text-xs font-bold">إجمالي الفاتورة المراجعة</span>
                  <div className="text-3xl font-black text-emerald-700">{calculateTotal().toLocaleString()} <small className="text-sm">ج.م</small></div>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-right text-slate-400 text-xs font-bold border-b">
                      <th className="pb-4">الصنف المستخرج</th>
                      <th className="pb-4">المنتج في النظام</th>
                      <th className="pb-4 w-20 text-center">الكمية</th>
                      <th className="pb-4 w-28 text-center">السعر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {selectedInvoice.items.map(item => (
                      <tr key={item.id}>
                        <td className="py-4 text-sm text-slate-700">{item.rawName}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <select value={item.productId} onChange={(e) => handleItemChange(item.id, "productId", e.target.value)} className={`flex-1 p-2 border rounded-xl text-sm ${!item.productId ? 'border-orange-300 bg-orange-50' : 'border-slate-200'}`}>
                              <option value="">-- اختر --</option>
                              {allProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <button onClick={() => handleQuickCreate(item.id)} className="p-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Plus size={20} /></button>
                          </div>
                        </td>
                        <td className="py-4 px-2"><input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, "quantity", e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl text-center" /></td>
                        <td className="py-4 px-2"><input type="number" value={item.price} onChange={(e) => handleItemChange(item.id, "price", e.target.value)} className="w-full p-2 border border-slate-200 rounded-xl text-center font-mono" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 bg-slate-50 border-t flex justify-end gap-3 rounded-b-2xl">
                <button onClick={() => setSelectedInvoice(null)} className="px-6 py-2.5 text-slate-500 font-bold">إلغاء</button>
                <button disabled={actionLoading} onClick={handleConfirmInvoice} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2 disabled:bg-blue-400 transition-all">
                  {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  حفظ واعتماد
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceReviewPage;