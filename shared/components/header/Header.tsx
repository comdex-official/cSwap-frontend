import styles from './Header.module.scss';
import { useAppDispatch } from '@/shared/hooks/useAppDispatch';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { toggleTheme } from '@/logic/redux/slices/themeSlice';
import { NextImage } from '@/shared/image/NextImage';
import { DotDropdownData, HeaderData, cSwapDropdownData } from './Data';
import { C_Logo, Faucet, Logo_Dark, Logo_Light } from '@/shared/image';
import { Icon } from '@/shared/image/Icon';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useRef, useState } from 'react';
import useOutsideClick from '@/shared/hooks/useOutsideClick';
import Sidebar from '../sidebar/Sidebar';

const Header = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const [isOpen, setIsOpen] = useState({
    cSwap: false,
    wallet: false,
    dot: false,
  });

  const [mobileHam, setMobileHam] = useState<boolean>(false);

  const router = useRouter();

  const isActive = (pathname: string) => {
    return router.pathname === pathname;
  };

  const cSwapRef = useRef<any>();
  const walletRef = useRef<any>();
  const dotRef = useRef<any>();

  useOutsideClick({
    isOpen: isOpen.cSwap,
    node: cSwapRef,
    ids: ['cSwap'],
    onOutsideClick: () => setIsOpen({ ...isOpen, cSwap: false }),
  });

  useOutsideClick({
    isOpen: isOpen.wallet,
    node: walletRef,
    ids: ['wallet'],
    onOutsideClick: () => setIsOpen({ ...isOpen, wallet: false }),
  });

  useOutsideClick({
    isOpen: isOpen.dot,
    node: dotRef,
    ids: ['dot'],
    onOutsideClick: () => setIsOpen({ ...isOpen, dot: false }),
  });

  return (
    <div className={styles.header__wrap}>
      <div className={styles.header__main}>
        <div
          className={styles.hamburger}
          onClick={() => setMobileHam(!mobileHam)}
        >
          <Icon
            className={`bi bi-list ${
              theme === 'dark' ? styles.icon_dark : styles.icon_light
            }`}
            size={'1.5rem'}
          />
        </div>

        <div className={styles.header__left}>
          <div className={styles.header__logo} onClick={() => router.push('/')}>
            {theme === 'dark' ? (
              <NextImage src={Logo_Dark} alt="Logo_Dark" />
            ) : (
              <NextImage src={Logo_Light} alt="Logo_Dark" />
            )}
          </div>
          {HeaderData.map((item) => (
            <div
              key={item.id}
              className={`${styles.header__left__element} ${
                theme === 'dark' ? styles.dark : styles.light
              } ${isActive(item.route) ? styles.active : ''}`}
            >
              <Link href={item.route}>{item.name}</Link>
            </div>
          ))}
        </div>

        <div className={styles.dropdown}>
          <div className={styles.header__right}>
            <div
              id="cSwap"
              className={styles.header__cSwap}
              onClick={() => setIsOpen({ ...isOpen, cSwap: !isOpen.cSwap })}
            >
              <div className={styles.header__cSwap__main}>
                {theme === 'dark' ? (
                  <NextImage src={C_Logo} alt="Logo_Dark" />
                ) : (
                  <NextImage src={C_Logo} alt="Logo_Dark" />
                )}

                <div
                  className={`${styles.header__cSwap__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'cSwap'}
                </div>
              </div>
              <Icon
                className={`bi bi-grid-fill ${
                  theme === 'dark' ? styles.icon_dark : styles.icon_light
                }`}
              />
            </div>

            <div className={styles.header__faucet}>
              <NextImage src={Faucet} alt="Logo_Dark" />
              <div
                className={`${styles.header__faucet__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'Faucet'}
              </div>
            </div>
            <div
              id="wallet"
              className={styles.header__wallet}
              onClick={() => setIsOpen({ ...isOpen, wallet: !isOpen.wallet })}
            >
              <div
                className={`${styles.header__wallet__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'Connect Wallet'}
              </div>
            </div>
            <Icon
              id="dot"
              className={`bi bi-three-dots-vertical ${
                theme === 'dark' ? styles.icon_dark : styles.icon_light
              }`}
              size={'2rem'}
              onClick={() => setIsOpen({ ...isOpen, dot: !isOpen.dot })}
            />

            {isOpen.cSwap && (
              <div className={styles.dropdown__cSwap__menu} ref={cSwapRef}>
                {cSwapDropdownData.map((item) => (
                  <button key={item.id}>{item.name}</button>
                ))}
              </div>
            )}

            {isOpen.wallet && (
              <div className={styles.dropdown__wallet__menu} ref={walletRef}>
                <div className={styles.dropdown__wallet__title}>
                  {' Connect Wallet'}
                </div>
                <button>{'Keplr Wallet'}</button>
              </div>
            )}

            {isOpen.dot && (
              <div className={styles.dropdown__dot__menu} ref={dotRef}>
                {DotDropdownData.map((item) => (
                  <div key={item.id} className={styles.dropdown__dot__item}>
                    <Link href="#">
                      <div>
                        <Icon
                          className={`${item.icon} ${
                            theme === 'dark'
                              ? styles.icon_dark
                              : styles.icon_light
                          }`}
                        />
                      </div>
                      <div>{item.name}</div>
                    </Link>
                  </div>
                ))}
              </div>
            )}

            <Sidebar isOpen={mobileHam} setIsOpen={setMobileHam} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
