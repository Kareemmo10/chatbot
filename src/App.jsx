import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthContext";
import PrivateRoute from "./components/auth/PrivateRoute";
import Auth from "./components/auth/Auth";
import Sidebar from "./components/sidebar/Sidebar";
import ChatInterface from "./components/chat/ChatInterface";
import InvoicesDashboard from "./components/dashboard/InvoicesDashboard";
import InvoiceReviewPage from "./components/invoice/InvoiceReviewPage"; // الصفحة الجديدة
import InvoiceDetails from "./components/dashboard/InvoiceDetails";
import { useState } from "react";

function App() {
  const [messages, setMessages] = useState([]);
  const [invoices, setInvoices] = useState([]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <div
                  dir="rtl"
                  className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-auto"
                >
                  <Sidebar />

                  <main className="flex-1 flex flex-col h-full">
                    <Routes>
                      <Route
                        path="/"
                        element={<Navigate to="/chat" replace />}
                      />
                      <Route
                        path="/chat"
                        element={
                          <ChatInterface
                            messages={messages}
                            setMessages={setMessages}
                            addInvoice={(inv) => setInvoices([inv, ...invoices])}
                          />
                        }
                      />
                      <Route
                        path="/invoices"
                        element={<InvoicesDashboard invoices={invoices} />}
                      />
                      <Route
                        path="/review"
                        element={
                          <InvoiceReviewPage
                            invoices={invoices}
                            setInvoices={setInvoices}
                          />
                        }
                      />
                      <Route path="/invoice/:id" element={<InvoiceDetails />} />
                    </Routes>
                  </main>
                </div>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
