import { useState } from "react";
import { cn } from "@/lib/utils";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDown, Check } from "lucide-react";

interface FilterDropdownProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  maxWidth?: string;
}

export function FilterDropdown({
  value, onChange, placeholder, options, maxWidth = "120px",
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const active = value !== "all";
  const label = options.find(o => o.value === value)?.label ?? placeholder;

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 text-[12px] font-medium rounded-lg border h-8 px-3 transition-all",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
            active
              ? "border-primary text-primary font-semibold bg-primary/10"
              : "border-border bg-background text-foreground hover:border-foreground/30",
          )}
        >
          <span className="truncate" style={{ maxWidth }}>{label}</span>
          <ChevronDown className={cn("w-3 h-3 shrink-0 transition-transform", open && "rotate-180")} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 min-w-[160px] max-h-[280px] overflow-y-auto rounded-xl border border-border bg-background p-1 shadow-lg shadow-black/8 animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
        >
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12px] transition-colors text-left",
                opt.value === value
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-foreground hover:bg-muted",
              )}
            >
              <Check className={cn("w-3.5 h-3.5 shrink-0", opt.value === value ? "opacity-100" : "opacity-0")} />
              {opt.label}
            </button>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
