import React, { useState, useEffect } from "react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend 
} from 'recharts';

// 1. مكونات مساعدة
const StatCard = ({ title, value, color = "text-white" }) => (
  <div className="bg-[#181b21] p-6 rounded-xl border border-[#1f2430] shadow-sm">
    <p className="text-[#9da6b9] text-sm font-medium mb-2">{title}</p>
    <h3 className={`text-3xl font-bold ${color}`}>{value}</h3>
  </div>
);

const getStatusBadge = (statusId) => {
  const statuses = {
    0: { label: "Pending", color: "text-gray-400 bg-gray-500/10" },
    1: { label: "Processing", color: "text-blue-400 bg-blue-500/10" },
    2: { label: "Review", color: "text-amber-400 bg-amber-500/10" },
    3: { label: "Completed", color: "text-emerald-400 bg-emerald-500/10" },
    4: { label: "Failed", color: "text-red-400 bg-red-500/10" },
    5: { label: "Rejected", color: "text-red-600 bg-red-600/10" }
  };
  return statuses[statusId] || statuses[0];
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        // 👇 التعديل: استخدمنا الرابط الحقيقي بدل localhost
        const response = await fetch("https://nsaproject.runasp.net/api/Dashboard/summary", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
           if(response.status === 401) throw new Error("انتهت الجلسة، يرجى تسجيل الدخول");
           throw new Error("فشل في جلب البيانات من السيرفر");
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 bg-[#101622] flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-[#101622] flex items-center justify-center h-screen text-red-500">
        خطأ: {error}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex-1 bg-[#101622]  text-white ">

     <header className=" top-0 left-0 w-full h-16 flex items-center justify-between px-6 bg-[#111318] border-b border-[#1f2430] z-50">
  <div>
    <h2 className="text-white text-lg font-bold flex items-center gap-2">
      لوحة التحكم
    </h2>
  </div>
</header>


      <main className="space-y-6 p-9">
        {/* 1. Stat Cards */}
                <p className="text-[#9da6b9] text-sm mt-1">أهلاً بك، إليك ملخص أداء النظام</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <StatCard title="إجمالي المبيعات" value={`${stats.totalSales.toLocaleString()} ر.س`} color="text-emerald-400" />
          <StatCard title="عدد الفواتير" value={stats.totalInvoices} />
          <StatCard title="المنتجات" value={stats.totalProducts} />
          <StatCard title="المستخدمين" value={stats.totalUsers} />
        </div>

        {/* 2. Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Sales (Area Chart) */}
          <div className="bg-[#181b21] p-6 rounded-xl border border-[#1f2430]">
            <h3 className="text-lg font-bold mb-6 text-white">تحليل المبيعات (آخر 7 أيام)</h3>
            <div className="h-[300px] w-full">
              {stats.chartData && stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chartData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2430" vertical={false} />
                    <XAxis dataKey="date" stroke="#5e6676" tick={{fill: '#9da6b9', fontSize: 12}} />
                    <YAxis stroke="#5e6676" tick={{fill: '#9da6b9', fontSize: 12}} />
                    <Tooltip contentStyle={{ backgroundColor: '#111318', borderColor: '#1f2430', color: '#fff' }} />
                    <Area type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">لا توجد بيانات مبيعات</div>
              )}
            </div>
          </div>

          {/* Chart 2: Low Stock (Bar Chart) - جديد 🔥 */}
          <div className="bg-[#181b21] p-6 rounded-xl border border-[#1f2430]">
            <h3 className="text-lg font-bold mb-6 text-red-400">تنبيهات المخزون (الأقل كمية)</h3>
            <div className="h-[300px] w-full">
               {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.lowStockProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2430" horizontal={false} />
                    <XAxis type="number" stroke="#5e6676" tick={{fill: '#9da6b9'}} />
                    <YAxis dataKey="name" type="category" width={100} stroke="#5e6676" tick={{fill: '#9da6b9', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#1f2430'}} contentStyle={{ backgroundColor: '#111318', borderColor: '#1f2430', color: '#fff' }} />
                    <Bar dataKey="stock" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
               ) : (
                <div className="flex items-center justify-center h-full text-green-500">المخزون تمام 👍</div>
               )}
            </div>
          </div>
        </div>

        {/* 3. Recent Invoices Table */}
        <div className="bg-[#181b21] rounded-xl border border-[#1f2430] overflow-hidden">
          <div className="p-6 border-b border-[#1f2430]">
            <h3 className="text-lg font-bold">أحدث الفواتير</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-[#111318] text-[#9da6b9] text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">رقم الفاتورة</th>
                  <th className="px-6 py-4">المورد</th>
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4">القيمة</th>
                  <th className="px-6 py-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f2430]">
                {stats.latestInvoices && stats.latestInvoices.map(inv => {
                  const statusInfo = getStatusBadge(inv.status);
                  return (
                    <tr key={inv.id} className="hover:bg-[#1f2430]/50 transition duration-150">
                      <td className="px-6 py-4 text-white font-medium">#{inv.invoiceNumber}</td>
                      <td className="px-6 py-4">{inv.merchantName || 'غير معروف'}</td>
                      <td className="px-6 py-4 text-[#9da6b9]">
                        {new Date(inv.date).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">{inv.amount} ر.س</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(!stats.latestInvoices || stats.latestInvoices.length === 0) && (
              <div className="text-center py-6 text-gray-500">لا توجد فواتير حديثة</div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}