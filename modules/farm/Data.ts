export type RightDataProps = {
  image: string;
  value: string;
};

export type OrderDataProps = {
  id: number;
  leftData: string;
  rightData: RightDataProps[] | string;
};

export const FarmFooterData: OrderDataProps[] = [
  {
    id: 0,
    leftData: 'Estimated rewards earned per day',
    rightData: [
      {
        image: '',
        value: '0.000000',
      },
      {
        image: '',
        value: '0.000000',
      },
    ],
  },
  {
    id: 1,
    leftData: 'CMDX/CMST LP Farmed',
    rightData: '$50.000',
  },
  {
    id: 2,
    leftData: 'CMDX/ATOM LP Farmed (Master Pool)',
    rightData: '$150.000',
  },
];
