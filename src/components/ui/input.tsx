import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ className, label, id, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-foreground">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm text-foreground placeholder:text-slate-400 transition-colors focus:border-trust-400",
          className,
        )}
        {...props}
      />
    </div>
  );
}
