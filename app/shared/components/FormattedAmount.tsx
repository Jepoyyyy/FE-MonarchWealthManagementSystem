import { fmt, fmtFull } from "~/utils";

interface FormattedAmountProps {
  value: number;
  full?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function FormattedAmount({ value, full = false, className = "", style }: FormattedAmountProps) {
  return (
    <span
      className={`${className}`}
      style={{ fontFamily: "var(--font-mono)", ...style }}
    >
      {full ? fmtFull(value) : fmt(value)}
    </span>
  );
}
