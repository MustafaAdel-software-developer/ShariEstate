interface PriceHistoryEntry {
  price: number;
  status: string;
  createdAt: string;
  note?: string | null;
}

interface Props {
  history: PriceHistoryEntry[];
  listingType?: string;
}

export function PriceHistory({ history, listingType }: Props) {
  if (!history.length) return null;

  const format = (price: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(price) +
    (listingType === "rent" ? "/mo" : "");

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold">Price history</h2>
      <ul className="mt-3 space-y-3">
        {history.map((entry, i) => (
          <li key={i} className="flex items-start gap-3 border-l-2 border-emerald-200 pl-4">
            <div>
              <p className="font-semibold text-slate-900">{format(Number(entry.price))}</p>
              <p className="text-sm text-slate-500">
                {new Date(entry.createdAt).toLocaleDateString()} · {entry.status.replace("_", " ")}
                {entry.note && ` · ${entry.note}`}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
