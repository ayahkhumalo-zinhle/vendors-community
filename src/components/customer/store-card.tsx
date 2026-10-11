import Link from "next/link";
import type { Seller } from "@/types";

export function StoreCard({ store }: { store: Seller }) {
  return (
    <Link href={`/customer/stores/${store.id}`}
      className="block bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
          {store.business_name.charAt(0).toUpperCase()}
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          Open
        </span>
      </div>
      <h3 className="font-semibold text-slate-900 mt-3">{store.business_name}</h3>
      <p className="text-slate-500 text-sm mt-0.5 capitalize">{store.business_type} · {store.city}</p>
      {store.address && <p className="text-slate-400 text-xs mt-1">{store.address}</p>}
    </Link>
  );
}
