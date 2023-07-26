import styles from './Sidebar.module.scss';
import { NextImage } from '../../../shared/image/NextImage';
import { Logo_Dark, Logo_Light } from '../../../shared/image';
import { HeaderData } from '../header/Data';
import { useRouter } from 'next/router';
import { Icon } from '../../../shared/image/Icon';
import MyDropdown from '../dropDown/Dropdown';
import {
  C_Logo,
  Comodo,
  Faucet,
  Harbor,
  Hyperlink,
  Shop,
} from '../../../shared/image';
import { Modal } from 'antd';
import { useState, useRef, useEffect } from 'react';
import { FIAT_URL } from '../../../constants/common';
import { connect } from 'react-redux';

const Sidebar = ({ isOpen, setIsOpen, address }) => {
  const theme = 'dark';

  const router = useRouter();

  const wrapperRef = useRef(null);

  const isActive = (pathname) => {
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

  const [isFiatOpen, setIsFiatOpen] = useState(false);

  const modalShow = () => {
    setIsFiatOpen(true);
  };
  const okModal = () => {
    setIsFiatOpen(false);
  };
  const cancellModal = () => {
    setIsFiatOpen(false);
  };

  const cswapItems = [
    {
      key: 'item-2',
      label: (
        <div className={styles.dropdown__cSwap__menu}>
          <button
            onClick={() =>
              window.open('https://app.harborprotocol.one/', '_blank')
            }
          >
            <NextImage src={Harbor} alt="Logo" />
          </button>
          <button
            onClick={() => window.open('https://app.commodo.one/', '_blank')}
          >
            <NextImage src={Comodo} alt="Logo" />
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (isOpen) {
      function handleClickOutside(event) {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
          setIsOpen(!isOpen);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef, isOpen]);

  return (
    <div className={`${styles.sidebar__wrap} ${isOpen ? styles.active : ''}`}>
      <div className={styles.sidebar__main} ref={wrapperRef}>
        <div className={styles.sidebar__upper}>
          <div
            className={styles.sidebar__logo}
            onClick={() => {
              router.push('/');
              setIsOpen(!isOpen);
            }}
          >
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
              <div
                className={styles.header__name}
                onClick={() => {
                  item?.id === 5 ? showModal() : router.push(item.route);
                  setIsOpen(!isOpen);
                }}
              >
                {item.name}
              </div>
            </div>
          ))}
        </div>

        <div id="topRightToogle">
          <MyDropdown
            items={cswapItems}
            placement={'topRight'}
            trigger={['click']}
            className={'header_cswap'}
            getPopupContainer={() => document.getElementById('topRightToogle')}
          >
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
                size={'0.8rem'}
              />
            </div>
          </MyDropdown>
        </div>

        <div
          className={styles.header__faucet}
          onClick={() => window.open('https://faucet.comdex.one/', '_blank')}
        >
          <div>
            <NextImage src={Faucet} alt="Logo_Dark" />
            <div
              className={`${styles.header__faucet__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'Faucet'}
            </div>
          </div>
          <NextImage src={Hyperlink} alt={'Logo'} height={15} width={15} />
        </div>

        <div className={styles.header__buy} onClick={modalShow}>
          <div>
            <NextImage src={Shop} alt={'Logo'} />
            <div
              className={`${styles.header__buy__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'Buy'}
            </div>
          </div>
          <NextImage src={Hyperlink} alt={'Logo'} height={15} width={15} />
        </div>

        <Modal
          className={'modal__wrap'}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          centered={true}
          footer={null}
          header={null}
        >
          <iframe
            src="https://dev-transit.comdex.one/"
            frameBorder="0"
            width={'100%'}
            height={'700px'}
            style={{ borderRadius: '10px', background: '#030b1e' }}
          ></iframe>
        </Modal>

        <Modal
          className={'fiat__modal'}
          open={isFiatOpen}
          onOk={okModal}
          onCancel={cancellModal}
          centered={true}
          footer={null}
          header={null}
        >
          <iframe
            src={`${FIAT_URL}&onToAddress=${address}`}
            width="465"
            height="700"
            frameBorder={0}
            style={{ border: '0px', borderRadius: '12px' }}
          />
        </Modal>
      </div>
    </div>
  );
};

const stateToProps = (state) => {
  return {
    lang: state.language,
    address: state.account.address,
  };
};

const actionsToProps = {};

export default connect(stateToProps, actionsToProps)(Sidebar);
