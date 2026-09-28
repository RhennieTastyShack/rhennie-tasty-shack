"use client";

import { useState, type InputHTMLAttributes } from "react";

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

export default function PasswordField({
  className = "",
  name = "password",
  autoComplete = "current-password",
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        name={name}
        autoComplete={autoComplete}
        type={visible ? "text" : "password"}
        className={`${className} pr-16`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#D4AF37]"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
