import Link from "next/link";
import { ReactNode } from "react";

export default function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  icon,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-black/[0.08] bg-white px-6 py-12 text-center shadow-sm">
      {icon ? (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF7F2] text-[#F26A21]">
          {icon}
        </div>
      ) : null}
      <h2 className="font-serif text-2xl font-bold text-[#171717]">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-black/55">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#F26A21] px-6 text-sm font-bold text-white transition hover:bg-[#D95512]"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
