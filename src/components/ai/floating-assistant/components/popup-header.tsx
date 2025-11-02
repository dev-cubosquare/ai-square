import { X } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode, PointerEvent as ReactPointerEvent } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

interface PopupHeaderProps {
  onClose?: () => void;
  title: string;
  subtitle?: string;
  className?: string;
  onPointerDown?: (event: ReactPointerEvent<HTMLDivElement>) => void;
  actions?: ReactNode;
  icon?: ReactNode;
}

function PopupHeader({
  onClose,
  title,
  subtitle,
  className,
  onPointerDown,
  actions,
  icon,
}: PopupHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border-b border-border bg-linear-to-r from-primary/10 via-[#86c940]/10 to-[#9dd958]/10",
        className,
      )}
      onPointerDown={onPointerDown}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="flex items-center justify-center rounded-full bg-linear-to-tr from-primary/20 to-[#86c940]/20 p-1"
          >
            {icon}
          </motion.div>
        )}
        <div>
          <p className="font-semibold text-foreground leading-tight">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {actions}
        {onClose && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 p-0 cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>
    </div>
  );
}
export default PopupHeader;
