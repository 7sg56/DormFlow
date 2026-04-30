import * as React from "react"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    hint?: string;
    error?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', type, label, hint, error, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
        const inputElement = (
            <input
                id={inputId}
                type={type}
                className={`flex h-10 w-full rounded-[var(--radius)] border bg-background px-3 py-2 font-ui text-sm text-on-surface ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-outline transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 ${error ? 'border-error focus-visible:ring-error' : 'border-outline-variant focus-visible:border-primary'} ${className}`}
                ref={ref}
                {...props}
            />
        );

        if (!label && !hint && !error) return inputElement;

        return (
            <div className="space-y-1.5">
                {label && (
                    <label htmlFor={inputId} className="label-md text-on-surface-variant">
                        {label}
                    </label>
                )}
                {inputElement}
                {hint && !error && (
                    <p className="text-xs text-outline">{hint}</p>
                )}
                {error && (
                    <p className="text-xs text-error">{error}</p>
                )}
            </div>
        );
    }
)
Input.displayName = "Input"

export { Input }
