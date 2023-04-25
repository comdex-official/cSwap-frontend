import { useAppSelector } from '@/shared/hooks/useAppSelector';
import styles from './Sidebar.module.scss';
import { NextImage } from '@/shared/image/NextImage';
import { Logo_Dark, Logo_Light } from '@/shared/image';
import { HeaderData } from '../header/Data';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Icon } from '@/shared/image/Icon';

interface SideBarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar = ({ isOpen, setIsOpen }: SideBarProps) => {
  const theme = useAppSelector((state) => state.theme.theme);

  const router = useRouter();

  const isActive = (pathname: string) => {
    return router.pathname === pathname;
  };

  return (
    <div className={`${styles.sidebar__wrap} ${isOpen ? styles.active : ''}`}>
      <div className={styles.sidebar__main}>
        <div className={styles.sidebar__upper}>
          <div className={styles.sidebar__logo}>
            {theme === 'dark' ? (
              <NextImage src={Logo_Dark} alt="Logo_Dark" />
            ) : (
              <NextImage src={Logo_Light} alt="Logo_Dark" />
            )}
          </div>

          <Icon
            className={`bi bi-x ${
              theme === 'dark' ? styles.icon_dark : styles.icon_light
            }`}
            size={'1.5rem'}
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
        <div className={styles.sidebar__lower}>
          {HeaderData.map((item) => (
            <div
              key={item.id}
              className={`${styles.sidebar__element} ${
                theme === 'dark' ? styles.dark : styles.light
              } ${isActive(item.route) ? styles.active : ''}`}
            >
              <Link href={item.route}>{item.name}</Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
