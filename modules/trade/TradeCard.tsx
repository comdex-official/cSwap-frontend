import Card from '@/shared/components/card/Card';
import styles from './Trade.module.scss';
import { Icon } from '@/shared/image/Icon';
import { NextImage } from '@/shared/image/NextImage';
import { ATOM, Arrow, CMDS } from '@/shared/image';
import Toggle from '@/shared/components/toggle/Toggle';
import { useRef, useState } from 'react';
import { OrderData, TradeFooterData } from './Data';
import useOutsideClick from '@/shared/hooks/useOutsideClick';

interface TradeCardProps {
  theme?: string;
}

const TradeCard = ({ theme }: TradeCardProps) => {
  const [toggleValue, setToggleValue] = useState<boolean>(false);

  const handleToggleValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToggleValue(e.target.checked);
  };

  const [isOpen, setIsOpen] = useState({
    setting: false,
    tokenFrom: false,
    tokenTo: false,
    tokenGet: false,
  });

  const settingRef = useRef<any>();
  const tokenFromRef = useRef<any>();
  const tokenToRef = useRef<any>();
  const tokenGetRef = useRef<any>();

  useOutsideClick({
    isOpen: isOpen.setting,
    node: settingRef,
    onOutsideClick: () => setIsOpen({ ...isOpen, setting: false }),
  });

  useOutsideClick({
    isOpen: isOpen?.tokenFrom,
    node: tokenFromRef,
    onOutsideClick: () => setIsOpen({ ...isOpen, tokenFrom: false }),
  });

  useOutsideClick({
    isOpen: isOpen?.tokenTo,
    node: tokenToRef,
    onOutsideClick: () => setIsOpen({ ...isOpen, tokenTo: false }),
  });

  useOutsideClick({
    isOpen: isOpen?.tokenGet,
    node: tokenGetRef,
    onOutsideClick: () => setIsOpen({ ...isOpen, tokenGet: false }),
  });

  return (
    <div className={styles.tradeCard__wrap}>
      <Card>
        <div className={styles.tradeCard__main}>
          <div
            className={`${styles.tradeCard__head} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.tradeCard__head__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <Toggle handleToggleValue={handleToggleValue} />
              <span>{'Limit Order'}</span>
            </div>

            <div className={styles.settings__dropdown} ref={settingRef}>
              {toggleValue && (
                <Icon
                  className={`bi bi-gear-fill`}
                  onClick={() =>
                    setIsOpen({ ...isOpen, setting: !isOpen.setting })
                  }
                />
              )}

              {isOpen.setting && (
                <div
                  className={`${styles.settings__dropdown__child} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${styles.settings__dropdown__title} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {'Limit Order Lifespan'}
                  </div>
                  <div
                    className={`${styles.settings__dropdown__footer} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {OrderData.map((item) => (
                      <div
                        key={item.id}
                        className={`${
                          styles.settings__dropdown__footer__title
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        {item.name}
                      </div>
                    ))}
                    <div
                      className={`${styles.settings__dropdown__input} ${
                        theme === 'dark' ? styles.dark : styles.light
                      }`}
                    >
                      <input type="text" /> {'s'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.tradeCard__body__item}>
            <div className={styles.tradeCard__body__left}>
              <div className={styles.tradeCard__body__main}>
                <div
                  className={`${styles.tradeCard__body__left__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {toggleValue ? 'Sell' : 'From'}
                </div>

                <div className={styles.tradeCard__body__right__el1}>
                  <div
                    className={`${styles.tradeCard__body__right__el1__title} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {'Available'} <span>{'1.99 ATOM'}</span>
                  </div>
                  <div
                    className={`${
                      styles.tradeCard__body__right__el1__description
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {'MAX'}
                  </div>
                  <div
                    className={`${styles.tradeCard__body__right__el1__footer} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {'HALF'}
                  </div>
                </div>
              </div>

              <div className={styles.tradeCard__body__right}>
                <div className={styles.settings__dropdown} ref={tokenFromRef}>
                  <div
                    className={`${
                      styles.tradeCard__body__left__item__details
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                    onClick={() =>
                      setIsOpen({ ...isOpen, tokenFrom: !isOpen?.tokenFrom })
                    }
                  >
                    <NextImage src={ATOM} alt="Logo_Dark" />
                    <div
                      className={`${
                        styles.tradeCard__body__left__item__details__title
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      {'ATOM'}
                    </div>
                    <Icon className={`bi bi-chevron-down`} />
                  </div>

                  {isOpen.tokenFrom && (
                    <div className={styles.token__dropdown__child}>
                      <h4>Loading...</h4>
                    </div>
                  )}
                </div>

                <div>
                  <div
                    className={`${styles.tradeCard__body__right__el2} ${
                      toggleValue ? styles.limit__order : ''
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {'0.00000'}
                  </div>
                  <div
                    className={`${styles.tradeCard__body__right__el3} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {'~ $0.00'}
                  </div>
                  <div
                    className={`${styles.tradeCard__body__right__el4} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {'1 ATOM = 207.727462 CMDX'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.tradeCard__swap}>
            <NextImage src={Arrow} alt="Logo_Dark" />
          </div>

          <div className={styles.tradeCard__body__item}>
            <div className={styles.tradeCard__body__left}>
              <div className={styles.tradeCard__body__main}>
                <div
                  className={`${styles.tradeCard__body__left__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {toggleValue ? 'At' : 'To'}
                </div>

                {toggleValue && (
                  <div
                    className={`${styles.tradeCard__body__limit__body} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {'Base Price: '} <span>{'0.004814'}</span>
                  </div>
                )}
              </div>

              <div className={styles.tradeCard__body__right}>
                {toggleValue ? (
                  <div
                    className={`${
                      styles.tradeCard__body__left__item__toggle_title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {'ATOM/CMDX'}
                  </div>
                ) : (
                  <div className={styles.settings__dropdown} ref={tokenToRef}>
                    <div
                      className={`${
                        styles.tradeCard__body__left__item__details
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                      onClick={() =>
                        setIsOpen({ ...isOpen, tokenTo: !isOpen?.tokenTo })
                      }
                    >
                      <NextImage src={CMDS} alt="Logo_Dark" />
                      <div
                        className={`${
                          styles.tradeCard__body__left__item__details__title
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        {'CMDX'}
                      </div>
                      <Icon className={`bi bi-chevron-down`} />
                    </div>

                    {isOpen.tokenTo && (
                      <div className={styles.token__dropdown__child}>
                        <h4>Loading...</h4>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  {toggleValue ? (
                    <>
                      <div
                        className={`${styles.tradeCard__body__right__el2} ${
                          toggleValue ? styles.limit__order : ''
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        {'0.00000'}
                      </div>
                      <div
                        className={`${styles.tradeCard__body__limit__body} ${
                          theme === 'dark' ? styles.dark : styles.light
                        }`}
                      >
                        {'Tolerance Range: '}{' '}
                        <span>{'0.004310 - 0.005268'}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className={`${styles.tradeCard__body__right__el2} ${
                          toggleValue ? styles.limit__order : ''
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        {'0.00000'}
                      </div>
                      <div
                        className={`${styles.tradeCard__body__right__el3} ${
                          theme === 'dark' ? styles.dark : styles.light
                        }`}
                      >
                        {'~ $0.00'}
                      </div>
                      <div
                        className={`${styles.tradeCard__body__right__el4} ${
                          theme === 'dark' ? styles.dark : styles.light
                        }`}
                      >
                        {'1 ATOM = 207.727462 CMDX'}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {toggleValue && (
            <div className={styles.tradeCard__body__item}>
              <div className={styles.tradeCard__body__left}>
                <div
                  className={`${styles.tradeCard__body__left__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'And Get'}
                </div>
                <div className={styles.tradeCard__body__right}>
                  <div className={styles.settings__dropdown} ref={tokenGetRef}>
                    <div
                      className={`${
                        styles.tradeCard__body__left__item__details
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                      onClick={() =>
                        setIsOpen({ ...isOpen, tokenGet: !isOpen?.tokenGet })
                      }
                    >
                      <NextImage src={CMDS} alt="Logo_Dark" />
                      <div
                        className={`${
                          styles.tradeCard__body__left__item__details__title
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        {'CMDX'}
                      </div>
                      <Icon className={`bi bi-chevron-down`} />
                    </div>

                    {isOpen.tokenGet && (
                      <div className={styles.token__dropdown__child}>
                        <h4>Loading...</h4>
                      </div>
                    )}
                  </div>
                  <div
                    className={`${styles.tradeCard__body__right__el2} ${
                      toggleValue ? styles.limit__order : ''
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {'0.00000'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.tradeCard__description}>
            {TradeFooterData.map((item, i) => {
              return toggleValue && i === 0 ? null : (
                <div
                  className={styles.tradeCard__description__el}
                  key={item.id}
                >
                  <div
                    className={`${styles.tradeCard__description__left_title} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {item.leftData}
                  </div>
                  <div
                    className={`${styles.tradeCard__description__right_title} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {item.rightData}
                  </div>
                </div>
              );
            })}

            {!toggleValue && (
              <div
                className={`${styles.tradeCard__description__el2} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {
                  'Note: The requested swap could be completed fully, partially, or cancelled due to price limiting and to maintain pool stability.'
                }
              </div>
            )}
          </div>

          <div
            className={`${styles.tradeCard__button__wrap} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <button>{'Swap'}</button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TradeCard;
