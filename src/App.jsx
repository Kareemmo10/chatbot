import { BrowserRouter, Routes, Route } from "react-router-dom";
import InvoiceDetails from "../InvoiceDetails";
import Home from "../Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/> } />
        <Route path="/invoice/:id" element={ <InvoiceDetails/> } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
