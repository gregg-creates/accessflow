import type { ThirdPartyWidget } from "@/types";

const actionLabels: Record<string, { text: string; className: string }> = {
  contact_vendor: {
    text: "Contact Vendor",
    className: "bg-amber-100 text-amber-800",
  },
  replace: { text: "Replace Widget", className: "bg-red-100 text-red-800" },
  low_risk: { text: "Low Risk", className: "bg-green-100 text-green-800" },
};

interface WidgetInventoryProps {
  widgets: ThirdPartyWidget[];
}

export function WidgetInventory({ widgets }: WidgetInventoryProps) {
  if (widgets.length === 0) return null;

  return (
    <section aria-labelledby="widget-inventory-heading" className="mt-8">
      <h2
        id="widget-inventory-heading"
        className="text-xl font-bold text-navy"
      >
        Third-Party Widgets Found ({widgets.length})
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Third-party widgets can introduce accessibility barriers that you
        cannot directly fix. Contact the vendor or find an accessible
        alternative.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th scope="col" className="pb-2 font-medium text-slate-600">
                Type
              </th>
              <th scope="col" className="pb-2 font-medium text-slate-600">
                Domain
              </th>
              <th scope="col" className="pb-2 font-medium text-slate-600">
                Note
              </th>
              <th scope="col" className="pb-2 font-medium text-slate-600">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {widgets.map((widget) => {
              const action = actionLabels[widget.action] || actionLabels.low_risk;
              return (
                <tr key={widget.id}>
                  <td className="py-2 text-navy">{widget.widget_type}</td>
                  <td className="py-2 font-mono text-xs text-slate-500">
                    {widget.src_domain}
                  </td>
                  <td className="py-2 text-slate-600">{widget.note}</td>
                  <td className="py-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${action.className}`}
                    >
                      {action.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
