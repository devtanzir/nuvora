import { LucideIcon } from "lucide-react";

export interface BrandValue {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface BrandValuesSectionProps {
  eyebrow?: string;
  values?: BrandValue[];
}
