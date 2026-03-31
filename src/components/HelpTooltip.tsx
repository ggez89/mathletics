import React, { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HelpTooltipProps {
  content: string;
  align?: "left" | "center" | "right";
}

export default function HelpTooltip({ content, align = "center" }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const alignClasses = {
    left: "left-0 translate-x-0",
    center: "left-1/2 -translate-x-1/2",
    right: "right-0 translate-x-0",
  };

  const arrowClasses = {
    left: "left-2 translate-x-0",
    center: "left-1/2 -translate-x-1/2",
    right: "right-2 translate-x-0",
  };

  return (
    <div className="relative inline-flex items-center ml-1" ref={tooltipRef}>
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
        aria-label="Help information"
      >
        <Info size={12} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute z-[100] bottom-full mb-2 w-48 p-2 bg-gray-100 border border-gray-200 text-gray-700 text-[10px] leading-tight rounded shadow-xl pointer-events-none normal-case ${alignClasses[align]}`}
          >
            {content}
            <div className={`absolute top-full -mt-1 border-4 border-transparent border-t-gray-100 ${arrowClasses[align]}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
