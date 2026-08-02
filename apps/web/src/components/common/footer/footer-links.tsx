import { FooterNavProps, NavColumnData } from './interface';
import FooterLinkItems from './footer-link-items';
import { NAV_COLUMNS } from './constants/footer-constants';

const FooterLinks = ({ navRef }: FooterNavProps) => {
  return (
    <>
      <nav
        aria-label="Footer"
        className="mx-auto max-w-[90rem] px-6 py-14 lg:py-16 md:px-10"
      >
        <div
          ref={navRef}
          className="grid grid-cols-2 gap-x-10 gap-y-12 md:grid-cols-4 md:gap-x-12"
        >
          {NAV_COLUMNS.map((column: NavColumnData) => (
            <div key={column.title}>
              <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-muted-foreground/40">
                {column.title}
              </span>
              <ul className="mt-7 flex flex-col gap-4">
                {column.links.map(
                  (link: {
                    href: string;
                    label: string;
                    external?: boolean;
                  }) => (
                    <li key={link.label}>
                      <FooterLinkItems
                        href={link.href}
                        label={link.label}
                        external={link.external}
                      />
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
};

export default FooterLinks;
