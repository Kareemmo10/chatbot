import React, { useState, useEffect } from "react";
import { Plus, Search, ChevronLeft, ChevronRight, Package, FileEdit, Trash2, Loader2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Products() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 15;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const [formData, setFormData] = useState({ name: "", code: "", price: "" });

  // Fetch Products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(
        `https://nsaproject.runasp.net/api/Products?pageNumber=${page}&pageSize=${pageSize}&search=${search || ""}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const result = await res.json();
      setData(result.data);
      setTotalPages(result.totalPages);
      setTotalRecords(result.totalRecords);
    } catch (err) {
      console.error(err);
      toast.error("فشل في تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  // Handlers
  const handleOpenAdd = () => {
    setCurrentProduct(null);
    setFormData({ name: "", code: "", price: "" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (product) => {
    setCurrentProduct(product);
    setFormData({ name: product.name, code: product.code || "", price: product.defaultPrice });
    setIsDialogOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = { name: formData.name, code: formData.code, price: parseFloat(formData.price) || 0 };
      if (currentProduct) {
        await fetch(`https://nsaproject.runasp.net/api/Products/${currentProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        toast.success("تم تحديث المنتج ✅");
      } else {
        await fetch(`https://nsaproject.runasp.net/api/Products/quick-create`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        toast.success("تم إضافة المنتج 🎉");
      }
      setIsDialogOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error("حدث خطأ أثناء الحفظ ❌");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`https://nsaproject.runasp.net/api/Products/${productToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("تم حذف المنتج 🗑");
      setProductToDelete(null);
      if (data.length === 1 && page > 1) setPage(page - 1);
      else fetchProducts();
    } catch (err) {
      toast.error("لا يمكن حذف المنتج (قد يكون مرتبط بفواتير)");
    }
  };

  return (
    <div className="flex flex-col flex-1 min-w-0 h-full bg-[#101622] text-white min-h-screen font-sans">
      <header className="h-16 flex items-center justify-between px-6 bg-[#111318] border-b border-[#1f2430]">
        <h2 className="text-white text-lg font-bold flex items-center gap-2">
          <Package className="text-blue-500" /> إدارة المنتجات
        </h2>
        <button
  onClick={handleOpenAdd}
  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5"
>
  <Plus size={14} /> إضافة منتج جديد
</button>

      </header>

      <main className="flex-1 overflow-y-auto p-6 md:px-8 space-y-6">
<div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#181b21] p-2.5 rounded-xl border border-[#1f2430]">
          <div className="relative w-full sm:max-w-md">
  <Search className="absolute right-3 top-3.5 h-4 w-4 text-[#9da6b9]" />
  <input
  type="text"
  placeholder="ابحث باسم المنتج أو الكود..."
  value={search}
  onChange={(e) => {
    setSearch(e.target.value);
    setPage(1);
  }}
  className="bg-[#101622] text-white border border-[#1f2430] rounded-lg py-2 px-4 pr-10 pl-10 focus:outline-none focus:border-none placeholder-[#5e6676]"
/>


</div>

          <div className="text-[#9da6b9] text-sm font-medium">
            إجمالي المنتجات: <span className="text-white font-bold">{totalRecords}</span>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-[#181b21] rounded-xl border border-[#1f2430] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-[#111318] text-[#9da6b9] text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">اسم المنتج</th>
                  <th className="px-6 py-4">الكود (SKU)</th>
                  <th className="px-6 py-4">السعر</th>
                  <th className="px-6 py-4">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2430]">
                {loading
                  ? [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-3"><div className="h-4 bg-[#282e39] rounded w-32"></div></td>
                        <td className="px-4 py-3"><div className="h-4 bg-[#282e39] rounded w-20"></div></td>
                        <td className="px-4 py-3"><div className="h-4 bg-[#282e39] rounded w-16"></div></td>
                        <td className="px-4 py-3"></td>
                      </tr>
                    ))
                  : data.length > 0
                  ? data.map((product) => (
                      <tr key={product.id} className="hover:bg-[#282e39]/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                          {/* <div className="w-8 h-8 rounded-full bg-[#1f2430] flex items-center justify-center text-blue-500">
                            <Package size={16} />
                          </div> */}
                          {product.name}
                        </td>
                        <td className="px-6 py-4">{product.code || <span className="text-[#5e6676] italic">--</span>}</td>
                        <td className="px-6 py-4 text-emerald-400 font-bold">{product.defaultPrice?.toFixed(2)} SAR</td>
                        <td className="px-6 py-4  flex gap-2">
                          <button onClick={() => handleOpenEdit(product)} className="bg-blue-600 px-2 py-1 rounded text-white text-sm hover:bg-blue-700">تعديل</button>
                          <button onClick={() => setProductToDelete(product)} className="bg-red-600 px-2 py-1 rounded text-white text-sm hover:bg-red-700">حذف</button>
                        </td>
                      </tr>
                    ))
                  : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-[#5e6676]">
                        لا توجد منتجات مطابقة للبحث
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-[#111318] px-6 py-4 border-t border-[#1f2430] flex items-center justify-between">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading} className="text-sm text-[#9da6b9] hover:text-white">السابق</button>
            <span className="text-sm text-[#5e6676]">صفحة <span className="text-white font-bold">{page}</span> من <span className="text-white font-bold">{totalPages}</span></span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading} className="text-sm text-[#9da6b9] hover:text-white">التالي</button>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#181b21] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-white text-lg font-bold mb-4">{currentProduct ? "تعديل المنتج" : "إضافة منتج"}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm text-[#9da6b9]">اسم المنتج</label>
                <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#101622] border border-[#1f2430] rounded p-2 text-white" required />
              </div>
              <div>
                <label className="text-sm text-[#9da6b9]">الكود (اختياري)</label>
                <input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="w-full bg-[#101622] border border-[#1f2430] rounded p-2 text-white" placeholder="SKU-123" />
              </div>
              <div>
                <label className="text-sm text-[#9da6b9]">السعر</label>
                <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-[#101622] border border-[#1f2430] rounded p-2 text-white" required />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setIsDialogOpen(false)} className="bg-[#282e39] text-white px-4 py-2 rounded hover:bg-[#323846]">إلغاء</button>
                <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2">{isSaving && <Loader2 className="animate-spin w-4 h-4"/>} حفظ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#181a21] rounded-xl p-6 w-full max-w-sm text-center">
            <h3 className="text-white text-lg font-bold mb-2">هل أنت متأكد؟</h3>
            <p className="text-[#9da6b9] mb-4">سيتم حذف المنتج <span className="font-bold text-white">{productToDelete.name}</span> نهائياً.</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setProductToDelete(null)} className="bg-[#282e39] text-white px-4 py-2 rounded hover:bg-[#323846]">إلغاء</button>
              <button onClick={handleDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">حذف</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" theme="dark" autoClose={3000} />
    </div>
  );
}
