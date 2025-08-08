import React from "react";
import { cn } from "../lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={
        cn(
          "inline-flex items-center justify-center rounded-md bg-ws-primary px-6 py-3 text-base font-semibold text-ws-light shadow transition hover:bg-ws-secondary focus:outline-none focus:ring-2 focus:ring-ws-primary focus:ring-offset-2",
          className
        )
      }
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button"; 