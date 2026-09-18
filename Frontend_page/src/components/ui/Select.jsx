import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const SelectContext = createContext(null);

export const useSelect = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within a <Select>");
  }
  return context;
};

export const Select = ({
  value,
  defaultValue = "",
  onValueChange,
  onChange,
  name,
  disabled = false,
  placeholder = "Select an option",
  options,
  label,
  helperText,
  error = false,
  className = "",
  triggerClassName = "",
  contentClassName = "",
  itemClassName = "",
  position = "popper",
  children,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const triggerRef = useRef(null);
  const contentRef = useRef(null);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const handleValueChange = useCallback(
    (newValue, newLabel) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      if (newLabel !== undefined) {
        setSelectedLabel(newLabel);
      }
      if (onValueChange) {
        onValueChange(newValue);
      }
      if (onChange) {
        onChange({
          target: {
            name: name || "",
            value: newValue
          }
        });
      }
      setOpen(false);
    },
    [isControlled, onValueChange, onChange, name]
  );

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        contentRef.current &&
        !contentRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Context value for compound components
  // Sync selectedLabel when options or value changes
  useEffect(() => {
    if (options && currentValue !== undefined && currentValue !== null) {
      const matched = options.find((opt) => {
        const optVal = typeof opt === "object" ? opt.value : opt;
        return String(optVal) === String(currentValue);
      });
      if (matched) {
        setSelectedLabel(typeof matched === "object" ? matched.label : matched);
      }
    }
  }, [options, currentValue]);

  // Sync selectedLabel when children change
  useEffect(() => {
    if (children && currentValue !== undefined && currentValue !== null) {
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && String(child.props?.value) === String(currentValue)) {
          const label = extractTextFromChildren(child.props.children);
          if (label) setSelectedLabel(label);
        }
      });
    }
  }, [children, currentValue]);

  const contextValue = {
    value: currentValue,
    onValueChange: handleValueChange,
    open,
    setOpen,
    disabled,
    triggerRef,
    contentRef,
    placeholder,
    selectedLabel,
    setSelectedLabel
  };


  // Determine if this is drop-in shortcut mode (options prop or direct SelectItem/option children)
  const isDirectChildren = React.Children.toArray(children).some(
    (child) =>
      React.isValidElement(child) &&
      (child.type === SelectItem || child.type === "option")
  );

  const hasShortcutMode = Boolean(options) || isDirectChildren;

  return (
    <SelectContext.Provider value={contextValue}>
      <div className={cn("relative w-full flex flex-col gap-1.5", className)} {...props}>
        {label && (
          <label className="text-xs font-bold text-slate-700 tracking-tight flex items-center justify-between">
            {label}
          </label>
        )}

        {hasShortcutMode ? (
          <>
            <SelectTrigger
              className={triggerClassName}
              error={error}
              disabled={disabled}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className={contentClassName} position={position}>
              {options
                ? options.length > 0 ? (
                    options.map((opt, idx) => {
                      const optVal = typeof opt === "object" ? opt.value : opt;
                      const optLabel = typeof opt === "object" ? opt.label : opt;
                      const optDisabled = typeof opt === "object" ? opt.disabled : false;
                      const isDarkTheme = contentClassName?.includes("bg-slate-9") || contentClassName?.includes("bg-slate-8") || contentClassName?.includes("bg-black");
                      return (
                        <SelectItem
                          key={idx}
                          value={optVal}
                          disabled={optDisabled}
                          className={cn(
                            isDarkTheme && "text-slate-200 hover:bg-slate-800 hover:text-white",
                            itemClassName
                          )}
                        >
                          {optLabel}
                        </SelectItem>
                      );
                    })
                  ) : (
                    <div className="py-2.5 px-3 text-xs text-slate-400 font-medium text-center">
                      {placeholder || "No options available"}
                    </div>
                  )
                : React.Children.map(children, (child) => {
                    if (!React.isValidElement(child)) return child;
                    if (child.type === "option") {
                      return (
                        <SelectItem
                          value={child.props.value}
                          disabled={child.props.disabled}
                        >
                          {child.props.children}
                        </SelectItem>
                      );
                    }
                    return child;
                  })}
            </SelectContent>
          </>
        ) : (
          children
        )}

        {helperText && (
          <span
            className={cn(
              "text-[11px]",
              error ? "text-red-500 font-medium" : "text-slate-500"
            )}
          >
            {helperText}
          </span>
        )}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = React.forwardRef(
  ({ className = "", children, error = false, disabled: propDisabled, ...props }, ref) => {
    const { open, setOpen, disabled: contextDisabled, triggerRef } = useSelect();
    const disabled = propDisabled !== undefined ? propDisabled : contextDisabled;

    return (
      <button
        ref={(node) => {
          triggerRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        type="button"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-semibold shadow-2xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-slate-300 cursor-pointer text-left",
          open && "ring-2 ring-emerald-500 border-emerald-500",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      >
        <span className="truncate flex-1 pointer-events-none">{children}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 pointer-events-none ml-2",
            open && "transform rotate-180 text-emerald-600"
          )}
        />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = ({ placeholder = "Select an option", className = "" }) => {
  const { value, selectedLabel } = useSelect();
  
  // Prevent displaying raw UUID strings
  const isUuid = typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.trim());
  const display = selectedLabel || (isUuid ? "" : value);

  return (
    <span
      className={cn(
        "truncate block",
        !display ? "text-slate-400 font-normal" : "text-inherit font-medium",
        className
      )}
    >
      {display || placeholder}
    </span>
  );
};


function extractTextFromChildren(children) {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("");
  }
  if (React.isValidElement(children) && children.props?.children) {
    return extractTextFromChildren(children.props.children);
  }
  return "";
}

export const SelectContent = ({
  className = "",
  position = "popper",
  children,
  style = {},
  ...props
}) => {
  const { open, contentRef, triggerRef } = useSelect();

  const getPositionCoords = useCallback(() => {
    if (!triggerRef?.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropdownHeight = 220;
    const isTop =
      position === "top" ||
      position === "above" ||
      (position !== "bottom" && spaceBelow < dropdownHeight && rect.top > spaceBelow);

    const minW = Math.max(rect.width, 160);
    const maxAllowedLeft = Math.max(8, window.innerWidth - minW - 12);
    const left = Math.max(8, Math.min(rect.left, maxAllowedLeft));

    return {
      top: isTop ? undefined : rect.bottom + 4,
      bottom: isTop ? window.innerHeight - rect.top + 4 : undefined,
      left: left,
      minWidth: Math.max(rect.width, 160),
      isTop
    };
  }, [triggerRef, position]);

  const [coords, setCoords] = useState(getPositionCoords);

  useEffect(() => {
    if (!open) return;
    setCoords(getPositionCoords());

    const handleUpdate = () => {
      setCoords(getPositionCoords());
    };

    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);
    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [open, getPositionCoords]);

  if (!open) return null;

  const contentElement = (
    <div
      ref={contentRef}
      className={cn(
        "fixed z-[99999] min-w-[8rem] max-w-[min(90vw,420px)] rounded-xl border border-slate-200/90 bg-white p-1 text-slate-800 shadow-2xl animate-in fade-in-80 zoom-in-95 duration-100 max-h-56 overflow-y-auto overscroll-contain",
        className
      )}
      style={{
        ...(coords
          ? {
              top: coords.top !== undefined ? `${coords.top}px` : undefined,
              bottom: coords.bottom !== undefined ? `${coords.bottom}px` : undefined,
              left: `${coords.left}px`,
              minWidth: `${coords.minWidth}px`,
            }
          : {}),
        scrollbarWidth: "thin",
        ...style
      }}
      {...props}
    >
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(contentElement, document.body) : contentElement;
};

export const SelectItem = ({
  value: itemValue,
  label: propLabel,
  textValue,
  disabled = false,
  className = "",
  children,
  ...props
}) => {
  const { value, onValueChange, setSelectedLabel } = useSelect();
  const isSelected = String(value) === String(itemValue);
  const itemText = React.useMemo(() => {
    if (propLabel) return propLabel;
    if (textValue) return textValue;
    return extractTextFromChildren(children);
  }, [propLabel, textValue, children]);

  // Sync label if this item is currently selected
  useEffect(() => {
    if (isSelected && itemText) {
      setSelectedLabel(itemText);
    }
  }, [isSelected, itemText, setSelectedLabel]);

  const handleSelect = (e) => {
    e.stopPropagation();
    if (!disabled) {
      onValueChange(itemValue, itemText || undefined);
    }
  };

  const isDark = className?.includes("text-slate-200") || className?.includes("text-white") || className?.includes("hover:bg-slate-800");

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={handleSelect}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg py-2 pl-3 pr-3 text-xs sm:text-sm font-semibold outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 text-slate-700",
        isSelected && (isDark ? "bg-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500/30" : "bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100 hover:text-emerald-900"),
        disabled && "pointer-events-none opacity-40 cursor-not-allowed",
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0 mr-2">{children}</div>
      {isSelected && (
        <Check className={cn("h-4 w-4 shrink-0", isDark ? "text-emerald-400" : "text-emerald-600")} />
      )}
    </div>
  );
};

export const SelectGroup = ({ className = "", children, ...props }) => (
  <div className={cn("p-1", className)} {...props}>
    {children}
  </div>
);

export const SelectLabel = ({ className = "", children, ...props }) => (
  <div
    className={cn(
      "py-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const SelectSeparator = ({ className = "", ...props }) => (
  <div className={cn("-mx-1 my-1 h-px bg-slate-100", className)} {...props} />
);

export default Select;
