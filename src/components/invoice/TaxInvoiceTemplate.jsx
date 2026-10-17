import { forwardRef } from "react";
import logo from "@/assets/logo.png";
import signature from "@/assets/signature.png";
import { numberToWords } from "@/utils/numberUtils";
import { config } from "@/config";

const defaultCompanyInfo = {
  name: "Dreamonix Solution Pvt. Ltd.",
  address: "Plot No-222, District Center,\nBhubaneswar - 751001",
  gstin: "21AAMCB1486G1ZT",
  state: "Odisha",
  stateCode: "21",
  contact: "9348354248, 7978207390",
  email: config.companyEmail,
  bank: {
    holder: "Dreamonix Solution Pvt. Ltd.",
    bank: "HDFC Bank",
    account: "50200087663786",
    branch: "Infocity",
    ifsc: "HDFC0004013",
  },
};

const TaxInvoiceTemplate = forwardRef(({ invoice, companyInfo: propCompanyInfo }, ref) => {
  const companyInfo = propCompanyInfo || defaultCompanyInfo;
  const logoSrc = companyInfo.logo || logo;
  const signatureSrc = companyInfo.signature || signature;

  const client = invoice?.clientId || {};
  const items = invoice?.items || [];
  const subtotal = invoice?.subtotal || items.reduce((s, i) => s + (i.quantity || 0) * (i.price || 0), 0);
  const tax = invoice?.tax || Math.round(subtotal * 0.18);
  const discount = invoice?.discount || 0;
  const grandTotal = subtotal + tax - discount;

  const invoiceDate = invoice?.createdAt ? new Date(invoice.createdAt).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN");
  const dueDate = invoice?.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-IN") : "";

  return (
    <div ref={ref} className="tax-invoice-container w-full min-h-[297mm] mx-auto bg-white text-black text-xs leading-tight print:shadow-none" style={{ fontFamily: "'Inter', 'Helvetica', 'Arial', sans-serif" }}>
      <style>{`
        .tax-invoice-container {
          background-color: #ffffff !important;
          color: #000000 !important;
        }
        .tax-invoice-container * {
          border-color: #000000 !important;
        }
        .tax-invoice-container .bg-gray-100 {
          background-color: #f3f4f6 !important;
        }
        .tax-invoice-container .bg-gray-200 {
          background-color: #e5e7eb !important;
        }
        .tax-invoice-container .text-gray-400 {
          color: #9ca3af !important;
        }
        .tax-invoice-container .text-gray-500 {
          color: #6b7280 !important;
        }
        .tax-invoice-container .border-gray-300 {
          border-color: #d1d5db !important;
        }
      `}</style>
      <div className="border-2 border-black m-4">
        <div className="text-center border-b-2 border-black py-2">
          <h1 className="text-xl font-extrabold tracking-wider uppercase">Tax Invoice</h1>
        </div>

        <div className="flex border-b-2 border-black">
          <div className="w-1/2 p-3 border-r border-black flex gap-3 items-start">
            <img src={logoSrc} alt="Logo" className="w-28 h-auto object-contain mt-1" />
            <div className="space-y-0.5 text-[9px] leading-tight flex-1">
              <p className="font-bold text-[11px] uppercase">{companyInfo.name}</p>
              <p className="whitespace-pre-line">{companyInfo.address}</p>
              <p><span className="font-semibold">GSTIN/UIN:</span> {companyInfo.gstin}</p>
              <p><span className="font-semibold">State Name:</span> {companyInfo.state}, <span className="font-semibold">Contact:</span> {companyInfo.contact}</p>
            </div>
          </div>
          <div className="w-1/2 p-3">
            <table className="w-full text-[9px]">
              <tbody>
                {[
                  ["Invoice No.", invoice?.invoiceNumber || ""],
                  ["Invoice Date", invoiceDate],
                  ["Delivery Note", ""],
                  ["Mode/Terms of Payment", ""],
                  ["Reference No. & Date", ""],
                  ["Buyer's Order No.", ""],
                  ["Dispatch Doc No.", ""],
                  ["Destination", client.address || ""],
                  ["Terms of Delivery", ""],
                ].map(([label, value], i) => (
                  <tr key={i} className="border border-black">
                    <td className="font-semibold px-2.5 py-1.5 border-r border-black w-2/5">{label}</td>
                    <td className="px-2.5 py-1.5">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex border-b-2 border-black">
          <div className="w-1/2 p-3 border-r border-black">
            <p className="font-bold text-sm mb-1">Consignee (Ship To)</p>
            <p className="font-bold uppercase">{client.companyName || ""}</p>
            <p>GSTIN/UIN: {client.gstNumber || ""}</p>
          </div>
          <div className="w-1/2 p-3">
            <p className="font-bold text-sm mb-1">Buyer (Bill To)</p>
            <p className="font-bold uppercase">{client.companyName || ""}</p>
            <p>{client.address || ""}</p>
          </div>
        </div>

        <table className="w-full border-collapse text-[9px]">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-black">
              <th className="border-r border-black px-3 py-2.5 font-bold text-center w-[8%]">Sl No</th>
              <th className="border-r border-black px-3 py-2.5 font-bold text-left">Description of Item</th>
              <th className="border-r border-black px-3 py-2.5 font-bold text-center w-[10%]">HSN/SAC</th>
              <th className="border-r border-black px-3 py-2.5 font-bold text-center w-[8%]">Quantity</th>
              <th className="border-r border-black px-3 py-2.5 font-bold text-right w-[8%]">Rate</th>
              <th className="border-r border-black px-3 py-2.5 font-bold text-center w-[6%]">Per</th>
              <th className="px-3 py-2.5 font-bold text-right w-[14%]">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400 border-b border-black">No items</td>
              </tr>
            ) : (
              items.map((item, i) => (
                <tr key={i} className="border-b border-black">
                  <td className="border-r border-black px-3 py-2.5 text-center">{i + 1}</td>
                  <td className="border-r border-black px-3 py-2.5">{item.service}{item.description ? ` - ${item.description}` : ""}</td>
                  <td className="border-r border-black px-3 py-2.5 text-center">{item.hsnSac || "—"}</td>
                  <td className="border-r border-black px-3 py-2.5 text-center">{item.quantity}</td>
                  <td className="border-r border-black px-3 py-2.5 text-right">{item.price.toLocaleString("en-IN")}</td>
                  <td className="border-r border-black px-3 py-2.5 text-center">{item.per || "Nos"}</td>
                  <td className="px-3 py-2.5 text-right font-semibold">{(item.quantity * item.price).toLocaleString("en-IN")}</td>
                </tr>
              ))
            )}
            {items.length < 5 && Array.from({ length: Math.max(0, 4 - items.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="border-b border-black">
                <td colSpan={7} className="py-2.5">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex border-b-2 border-black">
          <div className="w-1/2 p-3 border-r border-black space-y-1">
            <div>
              <p className="font-bold text-[10px]">Amount in Words</p>
              <p className="text-[9px] uppercase font-semibold">INR {numberToWords(grandTotal)} Only</p>
            </div>
            <div className="pt-1">
              <p className="font-bold text-[10px]">Declaration</p>
              <p className="text-[8px]">We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.</p>
            </div>
          </div>
          <div className="w-1/2 p-3 space-y-0.5">
            <div className="flex justify-between text-[9px]">
              <span>Taxable Amount</span>
              <span className="font-semibold">₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-[9px]">
              <span>GST 18%</span>
              <span className="font-semibold">₹{tax.toLocaleString("en-IN")}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[9px]">
                <span>Discount</span>
                <span className="font-semibold">−₹{discount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between text-[11px] font-extrabold border-t border-black pt-1.5 mt-2">
              <span>Grand Total</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <div className="flex">
          <div className="w-1/2 p-3 border-r border-black">
            <p className="font-bold text-[10px] mb-0.5">Bank Details</p>
            <table className="text-[8px] w-full">
              <tbody>
                <tr><td className="font-semibold w-[40%]">Account Holder</td><td>: {companyInfo.bank.holder}</td></tr>
                <tr><td className="font-semibold">Bank Name</td><td>: {companyInfo.bank.bank}</td></tr>
                <tr><td className="font-semibold">Account No.</td><td>: {companyInfo.bank.account}</td></tr>
                <tr><td className="font-semibold">Branch & IFSC</td><td>: {companyInfo.bank.branch} | {companyInfo.bank.ifsc}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="w-1/2 p-3 text-right">
            <p className="font-bold text-[10px] mb-1">for {companyInfo.name}</p>
            <div className="h-12 flex items-center justify-end">
              <img src={signatureSrc} alt="Signature" className="h-12 w-auto object-contain" />
            </div>
            <p className="font-bold text-[10px] mt-1">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
});

TaxInvoiceTemplate.displayName = "TaxInvoiceTemplate";
export default TaxInvoiceTemplate;
