import React, { useState } from "react";

export default function InvoiceImage({ imagePath }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* الصورة المصغرة */}
      <div
        className="w-full gap-1 overflow-hidden aspect-[4/5] rounded-lg flex cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div
          className="w-full bg-center bg-no-repeat bg-cover aspect-auto rounded-lg flex-1 border border-gray-200"
          style={{ backgroundImage: `url(${imagePath})` }}
        />
      </div>

      {/* المودال */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* الخلفية مع بلور */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* الصورة الكبيرة */}
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <img
              src={imagePath}
              alt="Invoice"
              className="h-[90vh] w-auto object-contain rounded-lg shadow-lg"
            />
            {/* زرار الإغلاق */}
            <button
  onClick={() => setIsOpen(false)}
  className="absolute top-2 left-2 text-white bg-black/50 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70"
>
  ✕
</button>

          </div>
        </div>
      )}
    </>
  );
}
