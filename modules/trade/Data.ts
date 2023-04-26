type FooterProps = {
  id: number;
  leftData: string;
  rightData: string;
};

type OrderDataProps = {
  id: number;
  name: string;
};

export const TradeFooterData: FooterProps[] = [
  {
    id: 0,
    leftData: 'Estimated Slippage',
    rightData: '0.0000000%',
  },
  {
    id: 1,
    leftData: 'Swap Fee',
    rightData: '0.3%',
  },
];

export const OrderData: OrderDataProps[] = [
  {
    id: 0,
    name: '1Block',
  },
  {
    id: 1,
    name: '6H',
  },
  {
    id: 2,
    name: '12H',
  },
  {
    id: 3,
    name: '24H',
  },
];
