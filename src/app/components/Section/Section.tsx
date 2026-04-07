import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "main";
  id?: string;
}

export default function Section({
  children,
  className = "",
  as: Component = "section",
  id,
}: SectionProps) {
  return (
    <Component className={`py-section ${className}`} id={id}>
      <div className="max-w-6xl mx-auto px-4">{children}</div>
    </Component>
  );
}
