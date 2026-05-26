"use client";

import { ReactNode } from "react";

interface ProgressCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  progress?: number; // 0 to 100
  color?: string;
}

export function ProgressCard({ title, value, description, icon, progress, color = "bg-blue-600" }: ProgressCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        {icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            {icon}
          </div>
        )}
      </div>
      
      {(progress !== undefined || description) && (
        <div className="mt-4">
          {progress !== undefined && (
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full ${color}`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
          {description && (
            <p className="mt-2 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
    </div>
  );
}
