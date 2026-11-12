import { MEMORY_TEXT } from "@/data/dialogues";
import { cx } from "@/lib/utils";

interface ProgressIndicatorProps {
  found: number;
  total: number;
  className?: string;
}

/** Quantas estrelas ja foram descobertas. */
export function ProgressIndicator({ found, total, className }: ProgressIndicatorProps) {
  return (
    <div
      role="status"
      aria-label={MEMORY_TEXT.progress(found, total)}
      className={cx("flex items-center gap-2 font-pixel text-xs text-paper", className)}
    >
      <span aria-hidden="true" className="flex gap-1">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cx("pixel-star h-4 w-4", i < found ? "bg-gold" : "bg-night-700")}
          />
        ))}
      </span>
      <span aria-hidden="true">{found}/{total}</span>
    </div>
  );
}
