import dynamic from 'next/dynamic';
import styles from './Assets.module.scss';
import { NextImage } from '@/shared/image/NextImage';
import { ArrowRight, CMDS } from '@/shared/image';

const Table = dynamic(() => import('@/shared/components/table/Table'));

interface AssetTableProps {
  theme: string;
}

type AssetsColumnProps = {
  Header: string;
  accessor: string;
  Cell: ({ row, value }: any) => void;
};

type AssetsDataProps = {
  Asset: string;
  Image: string;
  Tokens: number | string;
  Price: number | string;
  Amount: number | string;
  IBCDeposit: boolean;
  IBCWithdraw: boolean;
};

const AssetTable = ({ theme }: AssetTableProps) => {
  const COLUMNS: AssetsColumnProps[] = [
    {
      Header: 'Asset',
      accessor: 'Asset',
      Cell: ({ row, value }: any) => (
        <div
          className={`${styles.assets__table__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          <div
            className={`${styles.assets__logo__wrap} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            <div
              className={`${styles.assets__logo} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <NextImage src={row?.original?.Image} alt="Image" />
            </div>
          </div>
          <div
            className={`${styles.assets__title} ${
              theme === 'dark' ? styles.dark : styles.light
            }`}
          >
            {value}
          </div>
        </div>
      ),
    },
    {
      Header: 'No. of Tokens',
      accessor: 'Tokens',
      Cell: ({ value }: any) => (
        <div
          className={`${styles.all__title__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          {value}
        </div>
      ),
    },
    {
      Header: 'Price',
      accessor: 'Price',
      Cell: ({ value }: any) => (
        <div
          className={`${styles.all__title__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          ${value}
        </div>
      ),
    },
    {
      Header: 'Amount',
      accessor: 'Amount',
      Cell: ({ value }: any) => (
        <div
          className={`${styles.all__title__wrap} ${
            theme === 'dark' ? styles.dark : styles.light
          }`}
        >
          ${value}
        </div>
      ),
    },
    {
      Header: 'IBC Deposit',
      accessor: 'IBCDeposit',
      Cell: ({ value }: any) => (
        <>
          {value ? (
            <div
              className={`${styles.ibc__wrap} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.ibc__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'Deposit'}
              </div>
              <NextImage src={ArrowRight} alt="Arrow" />
            </div>
          ) : null}
        </>
      ),
    },
    {
      Header: 'IBC Withdraw',
      accessor: 'IBCWithdraw',
      Cell: ({ value }: any) => (
        <>
          {value ? (
            <div
              className={`${styles.ibc__wrap} ${
                theme === 'dark' ? styles.dark : styles.light
              }`}
            >
              <div
                className={`${styles.ibc__title} ${
                  theme === 'dark' ? styles.dark : styles.light
                }`}
              >
                {'Withdraw'}
              </div>
              <NextImage src={ArrowRight} alt="Arrow" />
            </div>
          ) : null}
        </>
      ),
    },
  ];

  const DATA: AssetsDataProps[] = [
    {
      Asset: 'CMDX',
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: false,
      IBCWithdraw: false,
    },
    {
      Asset: 'CMDX',
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: false,
      IBCWithdraw: false,
    },
    {
      Asset: 'CMDX',
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: false,
      IBCWithdraw: false,
    },
    {
      Asset: 'CMDX',
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: true,
      IBCWithdraw: true,
    },
    {
      Asset: 'CMDX',
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: true,
      IBCWithdraw: true,
    },
    {
      Asset: 'CMDX',
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: true,
      IBCWithdraw: true,
    },
    {
      Asset: 'CMDX',
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: true,
      IBCWithdraw: true,
    },
    {
      Asset: 'CMDX',
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: true,
      IBCWithdraw: true,
    },
    {
      Asset: 'CMDX',
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: false,
      IBCWithdraw: false,
    },
    {
      Asset: 'CMDX',
      Image: CMDS,
      Tokens: 0,
      Price: 0.0547,
      Amount: 0.0,
      IBCDeposit: false,
      IBCWithdraw: false,
    },
  ];

  return <Table columns={COLUMNS} data={DATA} />;
};

export default AssetTable;
