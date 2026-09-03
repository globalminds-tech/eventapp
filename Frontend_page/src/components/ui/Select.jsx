import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback
} from "react";
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
            <SelectContent className={contentClassName}>
              {options
                ? options.map((opt, idx) => {
                    const optVal = typeof opt === "object" ? opt.value : opt;
                    const optLabel = typeof opt === "object" ? opt.label : opt;
                    const optDisabled = typeof opt === "object" ? opt.disabled : false;
                    return (
                      <SelectItem
                        key={idx}
                        value={optVal}
                        disabled={optDisabled}
                      >
                        {optLabel}
                      </SelectItem>
                    );
                  })
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
          "flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 font-semibold shadow-2xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:border-slate-300 cursor-pointer text-left",
          open && "ring-2 ring-sky-500 border-sky-500",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      >
        <span className="truncate flex-1 pointer-events-none">{children}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 pointer-events-none ml-2",
            open && "transform rotate-180 text-sky-600"
          )}
        />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = ({ placeholder = "Select an option", className = "" }) => {
  const { value, selectedLabel } = useSelect();
  const display = selectedLabel || value;

  return (
    <span
      className={cn(
        "truncate block",
        !display ? "text-slate-400 font-normal" : "text-slate-800",
        className
      )}
    >
      {display || placeholder}
    </span>
  );
};

export const SelectContent = ({
  className = "",
  position = "popper",
  children,
  ...props
}) => {
  const { open, contentRef } = useSelect();

  if (!open) return null;

  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 left-0 right-0 top-[calc(100%+4px)] min-w-[8rem] overflow-hidden rounded-xl border border-slate-200/90 bg-white p-1 text-slate-800 shadow-xl animate-in fade-in-80 zoom-in-95 duration-100 max-h-64 overflow-y-auto",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
};

export const SelectItem = ({
  value: itemValue,
  disabled = false,
  className = "",
  children,
  ...props
}) => {
  const { value, onValueChange, setSelectedLabel } = useSelect();
  const isSelected = String(value) === String(itemValue);

  // Sync label if this item is currently selected
  useEffect(() => {
    if (isSelected && typeof children === "string") {
      setSelectedLabel(children);
    }
  }, [isSelected, children, setSelectedLabel]);

  const handleSelect = (e) => {
    e.stopPropagation();
    if (!disabled) {
      const label = typeof children === "string" ? children : undefined;
      onValueChange(itemValue, label);
    }
  };

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={handleSelect}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg py-2 pl-3 pr-3 text-xs sm:text-sm font-semibold outline-none transition-colors hover:bg-slate-100 hover:text-slate-900 text-slate-700",
        isSelected && "bg-sky-50 text-sky-700 font-bold hover:bg-sky-100 hover:text-sky-800",
        disabled && "pointer-events-none opacity-40 cursor-not-allowed",
        className
      )}
      {...props}
    >
      <span className="truncate mr-2">{children}</span>
      {isSelected && (
        <Check className="h-4 w-4 shrink-0 text-sky-600" />
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
