export interface NavItem {
  label: string;
  href: string;
  Icon: React.ElementType;
  count?: number;
  onClick?: () => void;
  matchPaths?: string[];
}
