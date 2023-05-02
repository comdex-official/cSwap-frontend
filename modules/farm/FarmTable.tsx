import React from 'react';
import styles from './Farm.module.scss';
import { NextImage } from '@/shared/image/NextImage';
import { ATOM, CMDS, Cup, Current, Pyramid, Ranged } from '@/shared/image';
import { Icon } from '@/shared/image/Icon';
import Table from '@/shared/components/table/Table';
interface FarmTableProps {
  theme: string;
}

type AssetsColumnProps = {
  Header: string;
  accessor: string;
  Cell: ({ row, value }: any) => void;
};

type AssetsDataProps = {
  PoolPair: string;
  Image1: string;
  Image2: string;
  APR: number;
  TotalLiquidity: string;
};

const FarmTable = ({ theme }: FarmTableProps) => {
  const COLUMNS: AssetsColumnProps[] = [
    {
      Header: 'Pool Pair',
      accessor: 'PoolPair',
      Cell: ({ row, value }: any) => (
        <div
          className={`${styles.farmCard__table__data__wrap} ${
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
                <NextImage src={row.original.Image1} alt="" />
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
                <NextImage src={row.original.Image2} alt="" />
              </div>
            </div>
          </div>

          <div
            className={`${styles.farmCard__element__left__title} ${
              styles.tableActive
            } ${theme === 'dark' ? styles.dark : styles.light}`}
          >
            {value}
          </div>

          <div
            className={`${styles.farmCard__element__right} ${
              styles.tableActive
            } ${theme === 'dark' ? styles.dark : styles.light}`}
          >
            <div
              className={`${styles.farmCard__element__right__main} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.farmCard__element__right__basic} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${
                    styles.farmCard__element__right__basic__title
                  } ${theme === 'dark' ? styles.dark : styles.light}`}
                >
                  {'Basic'}
                </div>
                {false && (
                  <div
                    className={`${
                      styles.farmCard__element__right__ranged__title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    <NextImage src={Ranged} alt="Pool" />
                    {'Ranged'}
                  </div>
                )}
              </div>
              <div
                className={`${styles.farmCard__element__right__pool} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <div
                  className={`${styles.farmCard__element__right__pool__title} ${
                    theme === 'dark' ? styles.dark : styles.light
                  }`}
                >
                  <NextImage src={Pyramid} alt="Logo" />
                  {'Master Pool'}
                </div>

                {false && (
                  <div
                    className={`${
                      styles.farmCard__element__right__pool__title
                    } ${theme === 'dark' ? styles.dark : styles.light}`}
                  >
                    <NextImage src={Current} alt="Logo" />
                    {'MP Boost'}
                  </div>
                )}
              </div>
            </div>
            <div
              className={`${styles.farmCard__element__right__incentive} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.farmCard__element__right__pool__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                <NextImage src={Cup} alt="Logo" />
                {'External Incentives'}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      Header: 'APR',
      accessor: 'APR',
      Cell: ({ value }: any) => (
        <div
          className={`${styles.farmCard__element__right__details} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.farmCard__element__right__details__title} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            {value}%
            <Icon className={'bi bi-arrow-right'} />
          </div>
          <div
            className={`${styles.farmCard__element__right__pool} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.farmCard__element__right__pool__title} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <NextImage src={Current} alt="Logo" />
              {'Upto 54.45%'}
            </div>
          </div>
        </div>
      ),
    },
    {
      Header: 'Total Liquidity',
      accessor: 'TotalLiquidity',
      Cell: ({ value }: any) => (
        <div
          className={`${styles.liquidity__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.farmCard__element__right__title} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            ${value}
          </div>

          <div
            className={`${styles.farmCard__buttonWrap} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <button>Add Liquidity</button>
          </div>
        </div>
      ),
    },
  ];

  const DATA: AssetsDataProps[] = [
    {
      PoolPair: 'CMDX-ATOM',
      Image1: CMDS,
      Image2: ATOM,
      APR: 14.45,
      TotalLiquidity: '117,402,993',
    },
    {
      PoolPair: 'CMDX-ATOM',
      Image1: CMDS,
      Image2: ATOM,
      APR: 14.45,
      TotalLiquidity: '117,402,993',
    },
    {
      PoolPair: 'CMDX-ATOM',
      Image1: CMDS,
      Image2: ATOM,
      APR: 14.45,
      TotalLiquidity: '117,402,993',
    },
    {
      PoolPair: 'CMDX-ATOM',
      Image1: CMDS,
      Image2: ATOM,
      APR: 14.45,
      TotalLiquidity: '117,402,993',
    },
    {
      PoolPair: 'CMDX-ATOM',
      Image1: CMDS,
      Image2: ATOM,
      APR: 14.45,
      TotalLiquidity: '117,402,993',
    },
    {
      PoolPair: 'CMDX-ATOM',
      Image1: CMDS,
      Image2: ATOM,
      APR: 14.45,
      TotalLiquidity: '117,402,993',
    },
    {
      PoolPair: 'CMDX-ATOM',
      Image1: CMDS,
      Image2: ATOM,
      APR: 14.45,
      TotalLiquidity: '117,402,993',
    },
    {
      PoolPair: 'CMDX-ATOM',
      Image1: CMDS,
      Image2: ATOM,
      APR: 14.45,
      TotalLiquidity: '117,402,993',
    },
    {
      PoolPair: 'CMDX-ATOM',
      Image1: CMDS,
      Image2: ATOM,
      APR: 14.45,
      TotalLiquidity: '117,402,993',
    },
    {
      PoolPair: 'CMDX-ATOM',
      Image1: CMDS,
      Image2: ATOM,
      APR: 14.45,
      TotalLiquidity: '117,402,993',
    },
    {
      PoolPair: 'CMDX-ATOM',
      Image1: CMDS,
      Image2: ATOM,
      APR: 14.45,
      TotalLiquidity: '117,402,993',
    },
    {
      PoolPair: 'CMDX-ATOM',
      Image1: CMDS,
      Image2: ATOM,
      APR: 14.45,
      TotalLiquidity: '117,402,993',
    },
    {
      PoolPair: 'CMDX-ATOM',
      Image1: CMDS,
      Image2: ATOM,
      APR: 14.45,
      TotalLiquidity: '117,402,993',
    },
  ];

  return <Table columns={COLUMNS} data={DATA} />;
};

export default FarmTable;
