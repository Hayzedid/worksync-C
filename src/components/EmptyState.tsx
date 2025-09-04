import { ReactNode } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  children
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-[#0FC2C0] to-[#0CABA8] rounded-full flex items-center justify-center mb-6 text-white">
        {icon}
      </div>
      
      <h3 className="text-xl font-semibold text-[#015958] mb-3">{title}</h3>
      <p className="text-[#0CABA8] max-w-sm mb-8 leading-relaxed">{description}</p>
      
      {children}
      
      {(actionText && (actionHref || onAction)) && (
        <div className="space-y-3">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#008F8C] to-[#0FC2C0] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              <Plus size={20} />
              {actionText}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#008F8C] to-[#0FC2C0] text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              <Plus size={20} />
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
