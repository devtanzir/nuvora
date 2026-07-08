import Image from 'next/image';
import Link from 'next/link';
import NuvoraLogoDark from '../../../../public/images/nuvora-dark.png';
import NuvoraLogoLight from '../../../../public/images/nuvora-light.png';
import NuvoraTextLogo from '../icons/nuvora-text-logo';

const LogoComponent = ({
  scrolled,
  isTransparent,
  isDarkMode,
}: {
  scrolled: boolean;
  isTransparent: boolean;
  isDarkMode: boolean;
}) => {
  return (
    <>
      <Link href="/" className="shrink-0 z-10">
        <div
          className={`transition-all duration-300 ease-out flex items-center
      ${scrolled ? 'w-[120px] md:w-[180px]' : 'w-[140px] md:w-[180px]'}
    `}
        >
          <Image
            src={
              isTransparent
                ? NuvoraLogoLight
                : isDarkMode
                  ? NuvoraLogoLight
                  : NuvoraLogoDark
            }
            alt="Nuvora Logo"
            className="h-14 w-15 hidden md:inline-block"
            width={200}
            height={200}
          />
          <NuvoraTextLogo
            className="h-14 w-full -translate-x-5"
            isTransparent={isTransparent}
            isDarkMode={isDarkMode}
          />
        </div>
      </Link>
    </>
  );
};

export default LogoComponent;
