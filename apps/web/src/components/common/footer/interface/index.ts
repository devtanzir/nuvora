import { RefObject } from "react";

export interface FooterTopProps {
  headlineRef: RefObject<HTMLHeadingElement | null>;
  paragraphRef: RefObject<HTMLParagraphElement | null>;
  ctaRef: RefObject<HTMLDivElement | null>;
}

export interface FooterNavProps {
  navRef: RefObject<HTMLDivElement | null>;
}

export interface NavColumnData {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}
