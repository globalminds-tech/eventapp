import React from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import Can from "@/components/Can";

/**
 * Reusable Create Event Button for Organizer side.
 * Adheres to the Design System Primary Accent standard:
 * Electric Cyan to Royal Blue gradient with cyan glow shadow.
 */
export default function CreateEventButton({
  onClick,
  label = "+ Create New Event",
  icon: Icon = PlusCircle,
  size = "md",
  className = "",
  bypassCan = false,
  children,
  ...props
}) {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      navigate("/OrganizerHome/CreateEvent");
    }
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-[11px] gap-1.5",
    md: "px-4 py-2 text-xs gap-2",
    lg: "px-5 py-2.5 text-sm gap-2.5",
  }[size] || "px-4 py-2 text-xs gap-2";

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  }[size] || 16;

  const buttonElement = (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center font-extrabold text-white rounded-xl border-none cursor-pointer bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 shadow-md shadow-cyan-500/25 hover:opacity-95 hover:shadow-lg hover:shadow-cyan-500/35 active:scale-95 transition-all shrink-0 select-none ${sizeClasses} ${className}`}
      {...props}
    >
      {children || (
        <>
          {Icon && <Icon size={iconSizes} className="shrink-0" />}
          <span>{label}</span>
        </>
      )}
    </button>
  );

  if (bypassCan) {
    return buttonElement;
  }

  return <Can I="events.create">{buttonElement}</Can>;
}
