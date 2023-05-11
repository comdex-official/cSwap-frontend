type FooterProps = {
  id: number;
  leftData: string;
  rightData: string;
};

type OrderDataProps = {
  id: number;
  name: string;
};

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
