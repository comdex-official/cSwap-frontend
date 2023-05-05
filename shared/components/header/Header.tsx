import styles from './Header.module.scss';
import { useAppDispatch } from '@/shared/hooks/useAppDispatch';
import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { toggleTheme } from '@/logic/redux/slices/themeSlice';
import { NextImage } from '@/shared/image/NextImage';
import { DotDropdownData, HeaderData } from './Data';
import {
  C_Logo,
  Comodo,
  Faucet,
  Harbor,
  Logo_Dark,
  Logo_Light,
} from '@/shared/image';
import { Icon } from '@/shared/image/Icon';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import { Modal } from 'antd';
import MyDropdown from '../dropDown/Dropdown';

const Header = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.theme);

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const [mobileHam, setMobileHam] = useState<boolean>(false);

  const router = useRouter();

  const isActive = (pathname: string) => {
    return router.pathname === pathname;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const cswapItems = [
    {
      key: '1',
      label: (
        <div className={styles.dropdown__cSwap__menu}>
          <button>
            <NextImage src={Harbor} alt="Logo" />
          </button>
          <button>
            <NextImage src={Comodo} alt="Logo" />
          </button>
        </div>
      ),
    },
  ];

  const walletItems = [
    {
      key: '1',
      label: (
        <div className={styles.dropdown__wallet__menu}>
          <div className={styles.dropdown__wallet__title}>
            {' Connect Wallet'}
          </div>
          <button>{'Keplr Wallet'}</button>
        </div>
      ),
    },
  ];

  const threeDotItems = [
    {
      key: '1',
      label: (
        <div className={styles.dropdown__dot__menu}>
          {DotDropdownData.map((item) => (
            <div key={item.id} className={styles.dropdown__dot__item}>
              <Link href="#">
                <div>
                  <NextImage src={item.icon} alt="Icon" />
                </div>
                <div>{item.name}</div>
              </Link>
            </div>
          ))}
        </div>
      ),
    },
  ];

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
          {HeaderData.map((item, i) => (
            <div
              key={item.id}
              className={`${styles.header__left__element} ${
                theme === 'dark' ? styles.dark : styles.light
              } ${isActive(item.route) ? styles.active : ''}`}
            >
              <Link
                href={i === 6 ? '' : item.route}
                onClick={() => i === 6 && showModal()}
              >
                {item.name}
              </Link>
            </div>
          ))}
        </div>

        <Modal
          className={'modal__wrap'}
          title="Bridge"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <iframe
            src="https://dev-transit.comdex.one/"
            frameBorder="0"
            width={'100%'}
            height={'580px'}
            style={{ borderRadius: '10px', background: '#030b1e' }}
          ></iframe>
        </Modal>

        <div className={styles.dropdown}>
          <div className={styles.header__right}>
            <MyDropdown items={cswapItems} placement={'bottomLeft'}>
              <div className={styles.header__cSwap}>
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
            </MyDropdown>

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

            <MyDropdown items={walletItems} placement={'bottomLeft'}>
              <div className={styles.header__wallet}>
                <div
                  className={`${styles.header__wallet__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'Connect Wallet'}
                </div>
              </div>
            </MyDropdown>

            <MyDropdown items={threeDotItems} placement={'bottomLeft'}>
              <div>
                <Icon
                  className={`bi bi-three-dots-vertical ${
                    theme === 'dark' ? styles.icon_dark : styles.icon_light
                  }`}
                  size={'2rem'}
                />
              </div>
            </MyDropdown>

            <Sidebar isOpen={mobileHam} setIsOpen={setMobileHam} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
