import React, { useState } from 'react';
import styles from './Farm.module.scss';
import { NextImage } from '@/shared/image/NextImage';
import { ATOM, CMDS } from '@/shared/image';
import { Icon } from '@/shared/image/Icon';
import dynamic from 'next/dynamic';
import RangeTooltipContent from '@/shared/components/range/RangedToolTip';

const Tab = dynamic(() => import('@/shared/components/tab/Tab'));

const Liquidity = ({ theme }: any) => {
  const TabData = ['DEPOSIT', 'WITHDRAW'];

  const [active, setActive] = useState<string>('DEPOSIT');

  const handleActive = (item: string) => {
    setActive(item);
  };

  return (
    <div
      className={`${styles.liquidityCard__wrap} ${
        theme === 'dark' ? styles.dark : styles.light
      }`}
    >
      <div
        className={`${styles.liquidityCard__tab} ${
          theme === 'dark' ? styles.dark : styles.light
        }`}
      >
        <div
          className={`${styles.liquidityCard__tab__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <Tab data={TabData} active={active} handleActive={handleActive} />
        </div>
        <div
          className={`${styles.liquidityCard__trade__pair} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          {'Trade Pair'}
        </div>
      </div>

      {active === 'DEPOSIT' ? (
        <>
          <div className={styles.tradeCard__body__item}>
            <div className={styles.tradeCard__body__left}>
              <div className={styles.tradeCard__body__main}>
                <div
                  className={`${styles.tradeCard__body__left__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'Provide CMDX'}
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
                <div
                  className={`${styles.tradeCard__body__left__item__details} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div className={`${styles.tradeCard__logo__wrap}`}>
                    <div className={`${styles.tradeCard__logo}`}>
                      <NextImage src={ATOM} alt="Logo_Dark" />
                    </div>
                  </div>

                  <div
                    className={`${
                      styles.tradeCard__body__left__item__details__title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {'ATOM'}
                  </div>
                  <Icon className={`bi bi-chevron-down`} />
                </div>

                <div>
                  <div
                    className={`${styles.tradeCard__body__right__el2} ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
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

          <div className={styles.tradeCard__body__item}>
            <div className={styles.tradeCard__body__left}>
              <div className={styles.tradeCard__body__main}>
                <div
                  className={`${styles.tradeCard__body__left__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  {'Provide ATOM'}
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
                <div
                  className={`${styles.tradeCard__body__left__item__details} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <div className={`${styles.tradeCard__logo__wrap}`}>
                    <div className={`${styles.tradeCard__logo}`}>
                      <NextImage src={ATOM} alt="Logo_Dark" />
                    </div>
                  </div>

                  <div
                    className={`${
                      styles.tradeCard__body__left__item__details__title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    {'ATOM'}
                  </div>
                  <Icon className={`bi bi-chevron-down`} />
                </div>

                <div>
                  <div
                    className={`${styles.tradeCard__body__right__el2}  ${
                      theme === 'dark' ? styles.dark : styles.light
                    }`}
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
        </>
      ) : (
        <div
          className={`${styles.liquidityCard__pool__withdraw__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.liquidityCard__pool__withdraw__title} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            {'Amount to Withdraw'}
          </div>
          <div
            className={`${styles.liquidityCard__pool__input} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <RangeTooltipContent />
          </div>
          <div
            className={`${styles.liquidityCard__pool__withdraw__footer} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.liquidityCard__pool__withdraw__element} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${
                  styles.liquidityCard__pool__withdraw__element__title
                } ${styles.title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'Tokens to be Withdrawn'}
              </div>
              <div
                className={`${
                  styles.liquidityCard__pool__withdraw__element__title
                } ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                {'$0.00 ≈ 0 PoolToken'}
              </div>
            </div>
            <div
              className={`${styles.liquidityCard__pool__withdraw__element} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${
                  styles.liquidityCard__pool__withdraw__element__title
                } ${styles.title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'You have'}
              </div>
              <div
                className={`${
                  styles.liquidityCard__pool__withdraw__element__title
                } ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                {'$0.00 ≈ 0 PoolToken'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`${styles.liquidityCard__pool__details} ${
          theme === 'dark' ? styles.dark : styles.light
        }`}
      >
        <div
          className={`${styles.liquidityCard__pool__title} ${styles.title} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          {'Pool Details'}
        </div>
        <div
          className={`${styles.liquidityCard__pool__details__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.farmCard__element__left__logo__wrap} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.farmCard__element__left__logo} ${
                styles.first
              } ${theme === 'dark' ? styles.dark : styles.light}`}
            >
              <div
                className={`${styles.farmCard__element__left__logo__main} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <NextImage src={CMDS} alt="" />
              </div>
            </div>
            <div
              className={`${styles.farmCard__element__left__logo} ${
                styles.last
              } ${theme === 'dark' ? styles.dark : styles.light}`}
            >
              <div
                className={`${styles.farmCard__element__left__logo__main} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <NextImage src={ATOM} alt="" />
              </div>
            </div>
          </div>
          <div
            className={`${styles.liquidityCard__pool__title} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            {'CMDX/ATOM'}
          </div>
        </div>

        <div
          className={`${styles.liquidityCard__pool__footer__details} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.liquidityCard__pool__element} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.liquidityCard__pool__title} ${
                styles.semiTitle
              } ${theme === 'dark' ? styles.dark : styles.light}`}
            >
              {'CMDX-50%'}
            </div>
            <div
              className={`${styles.liquidityCard__pool__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'2,446,148.9 CMDX'}
            </div>
          </div>
          <div
            className={`${styles.liquidityCard__pool__element} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.liquidityCard__pool__title} ${
                styles.semiTitle
              } ${theme === 'dark' ? styles.dark : styles.light}`}
            >
              {'ATOM-50%'}
            </div>
            <div
              className={`${styles.liquidityCard__pool__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              {'16,259,599.7 ATOM'}
            </div>
          </div>
        </div>
        <div
          className={`${styles.liquidityCard__pool__footer__details__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.liquidityCard__pool__title} ${styles.title} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            {'Your Details'}
          </div>
          <div
            className={`${styles.liquidityCard__pool__footer__details} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.liquidityCard__pool__element} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.liquidityCard__pool__title} ${
                  styles.semiTitle
                } ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                {'My Amount'}
              </div>
              <div
                className={`${styles.liquidityCard__pool__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'22.385608 CMDX'}
              </div>
            </div>
            <div
              className={`${styles.liquidityCard__pool__element} ${
                styles.semiTitle
              } ${theme === 'dark' ? styles.dark : styles.light}`}
            >
              <div
                className={`${styles.liquidityCard__pool__title} ${
                  styles.semiTitle
                } ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                {'My Amount'}
              </div>
              <div
                className={`${styles.liquidityCard__pool__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'0.148797 ATOM'}
              </div>
            </div>
            <div
              className={`${styles.liquidityCard__pool__element} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.liquidityCard__pool__title} ${
                  styles.semiTitle
                } ${theme === 'dark' ? styles.dark : styles.light}`}
              >
                {'LP Amount'}
              </div>
              <div
                className={`${styles.liquidityCard__pool__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'$ 342.242'}
              </div>
            </div>
          </div>
        </div>

        <div
          className={`${styles.tradeCard__button__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <button>
            {active === 'DEPOSIT' ? 'Deposit & Farm' : 'Withdraw & Unfarm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Liquidity;
