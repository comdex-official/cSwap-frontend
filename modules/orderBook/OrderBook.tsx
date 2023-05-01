import { useAppSelector } from '@/shared/hooks/useAppSelector';
import { Icon } from '@/shared/image/Icon';
import React, { useState } from 'react';
import styles from './OrderBook.module.scss';
import dynamic from 'next/dynamic';
import { NextImage } from '@/shared/image/NextImage';
import { Slider } from '@/shared/image';

const Tab = dynamic(() => import('@/shared/components/tab/Tab'));
const OrderbookTable = dynamic(
  () => import('@/modules/orderBook/OrderbookTable')
);

const OrderBook = () => {
  const theme = useAppSelector((state) => state.theme.theme);

  const TabData = ['Buy', 'Sell'];

  const [active, setActive] = useState<string>('Buy');

  const handleActive = (item: string) => {
    setActive(item);
  };

  return (
    <div
      className={`${styles.orderbook__wrap} ${
        theme === 'dark' ? styles.dark : styles.light
      }`}
    >
      <div
        className={`${styles.orderbook__main} ${
          theme === 'dark' ? styles.dark : styles.light
        }`}
      >
        <div
          className={`${styles.orderbook__element__left} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.orderbook__trading__view} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          ></div>
          <div
            className={`${styles.orderbook__table__view} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.orderbook__tab__wrap} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.orderbook__tab__element} ${
                  styles.active
                } ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                {'Open Order (2)'}
              </div>
              <div
                className={`${styles.orderbook__tab__element} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'Trade History'}
              </div>
            </div>
            <OrderbookTable />
          </div>
        </div>

        <div
          className={`${styles.orderbook__element__middle__upper} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.orderbook__element__middle__upper__head} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.orderbook__upper__head__main} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.orderbook__upper__head__left__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'Order Book'}
              </div>
              <div
                className={`${styles.orderbook__upper__head__right__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'0.001'} <Icon className={'bi bi-chevron-down'} />
              </div>
            </div>
            <div
              className={`${styles.orderbook__lower__head__main} ${
                styles.upper
              } ${theme === 'dark' ? styles.dark : styles.light}`}
            >
              <div
                className={`${styles.orderbook__lower__head}  ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.orderbook__lower__head__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'Price (CMST)'}
                </div>
                <div
                  className={`${styles.orderbook__lower__head__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'Amount (CMDX)'}
                </div>
              </div>

              {true && (
                <div
                  className={`${styles.orderbook__lower__head} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${
                      styles.orderbook__lower__table__head__title
                    } ${styles.loss} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    {'$100.00'}
                  </div>
                  <div
                    className={`${
                      styles.orderbook__lower__table__head__title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {'$855.00'}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className={`${styles.orderbook__middle__head__main} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.orderbook__middle__head__main__title} ${
                styles.active
              } ${theme === 'dark' ? styles.dark : styles.light}`}
            >
              {'1.1789'}
            </div>
            <div
              className={`${styles.orderbook__middle__head__main__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'$ 0.0993'}
            </div>
          </div>
          <div
            className={`${styles.orderbook__lower__head__main} ${
              styles.lower
            } ${theme === 'dark' ? styles.dark : styles.light}`}
          >
            {true && (
              <div
                className={`${styles.orderbook__lower__head} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.orderbook__lower__table__head__title}  ${
                    styles.profit
                  } ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  {'$25.00'}
                </div>
                <div
                  className={`${styles.orderbook__lower__table__head__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'$855.00'}
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={`${styles.orderbook__element__middle__lower} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.orderbook__upper__head__table} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.orderbook__upper__head__left__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'Recent Trades'}
            </div>
          </div>
          <div
            className={`${styles.orderbook__middle__lower__table} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.orderbook__middle__lower__table__head} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.orderbook__lower__head__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'Price (CMST)'}
              </div>
              <div
                className={`${styles.orderbook__lower__head__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'Amount (CMDX)'}
              </div>
              <div
                className={`${styles.orderbook__lower__head__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'Time'}
              </div>
            </div>

            {true && (
              <div
                className={`${styles.orderbook__lower__head} ${styles.lower}  ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.orderbook__lower__table__head__title} ${
                    styles.profit
                  }  ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  {'$100.00'}
                </div>
                <div
                  className={`${styles.orderbook__lower__table__head__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'$855.00'}
                </div>
                <div
                  className={`${styles.orderbook__lower__table__head__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'18:49:44'}
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className={`${styles.orderbook__element__right} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.orderbook__element__right__head} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.orderbook__element__right__head__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'Spot'}
            </div>
            <NextImage src={Slider} alt="Logo" />
          </div>
          <div
            className={`${styles.orderbook__element__right__body__wrap} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <Tab data={TabData} active={active} handleActive={handleActive} />

            <div
              className={`${styles.orderbook__element__right__body__main} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {true && (
                <div
                  className={`${styles.orderbook__element__right__body__tab} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div
                    className={`${styles.orderbook__body__tab__head} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    <div
                      className={`${
                        styles.orderbook__body__tab__head__element
                      } ${styles.active} ${
                        theme === 'dark' ? styles.dark : styles.light
                      }`}
                    >
                      {'Limit'}
                    </div>
                    <div
                      className={`${
                        styles.orderbook__body__tab__head__element
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      {'MARKET'}
                    </div>
                  </div>
                  <div
                    className={`${styles.orderbook__body__tab__body} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    <div
                      className={`${
                        styles.orderbook__body__tab__body__balance
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      {'Balance: 0.0000 CMST'}
                    </div>

                    <div
                      className={`${
                        styles.orderbook__body__tab__body__input__wrap
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      <div
                        className={`${
                          styles.orderbook__body__tab__body__input__title
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        {'Price'}
                      </div>
                      <div
                        className={`${
                          styles.orderbook__body__tab__body__input
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        <input type="text" />
                      </div>
                    </div>
                    <div
                      className={`${
                        styles.orderbook__body__tab__body__input__wrap
                      } ${theme === 'dark' ? styles.dark : styles.light}`}
                    >
                      <div
                        className={`${
                          styles.orderbook__body__tab__body__input__title
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        {'Quantity'}
                      </div>
                      <div
                        className={`${
                          styles.orderbook__body__tab__body__input
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        <input type="text" />
                      </div>
                    </div>
                    <div
                      className={`${styles.orderbook__body__tab__footer} ${
                        theme === 'dark' ? styles.dark : styles.light
                      }`}
                    >
                      <div
                        className={`${
                          styles.orderbook__body__tab__footer__element
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        {'10%'}
                      </div>
                      <div
                        className={`${
                          styles.orderbook__body__tab__footer__element
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        {'25%'}
                      </div>
                      <div
                        className={`${
                          styles.orderbook__body__tab__footer__element
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        {'50%'}
                      </div>
                      <div
                        className={`${
                          styles.orderbook__body__tab__footer__element
                        } ${theme === 'dark' ? styles.dark : styles.light}`}
                      >
                        {'100%'}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`${styles.orderbook__body__tab__button} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
                  >
                    <button>{'Place Order'}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
