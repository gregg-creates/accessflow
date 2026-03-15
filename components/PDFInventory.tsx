import type { PDFLink } from "@/types";

interface PDFInventoryProps {
  pdfs: PDFLink[];
}

export function PDFInventory({ pdfs }: PDFInventoryProps) {
  if (pdfs.length === 0) return null;

  return (
    <section aria-labelledby="pdf-inventory-heading" className="mt-8">
      <h2
        id="pdf-inventory-heading"
        className="text-xl font-bold text-navy"
      >
        PDF Documents Found ({pdfs.length})
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        PDFs are not automatically accessible. Each should be checked for
        proper tagging, reading order, and alt text.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th scope="col" className="pb-2 font-medium text-slate-600">
                Link Text
              </th>
              <th scope="col" className="pb-2 font-medium text-slate-600">
                URL
              </th>
              <th scope="col" className="pb-2 font-medium text-slate-600">
                Found On
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pdfs.map((pdf) => (
              <tr key={pdf.id}>
                <td className="py-2 text-navy">
                  {pdf.link_text || "(no link text)"}
                </td>
                <td className="py-2 font-mono text-xs text-slate-500">
                  {pdf.pdf_url}
                </td>
                <td className="py-2 font-mono text-xs text-slate-500">
                  {pdf.page_url}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
