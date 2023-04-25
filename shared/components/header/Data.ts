type HeaderDataProps = {
  id: number;
  name: string;
  route: string;
};

type cSwapDropdownDataProps = {
  id: number;
  name: string;
  icon: string;
};

type DotDropdownDataProps = {
  id: number;
  name: string;
  icon: string;
};

export const HeaderData: HeaderDataProps[] = [
  {
    id: 0,
    name: 'TRADE',
    route: '/',
  },
  {
    id: 1,
    name: 'ASSETS',
    route: '/assets',
  },
  {
    id: 2,
    name: 'FARM',
    route: '/farm',
  },
  {
    id: 3,
    name: 'PORTFOLIO',
    route: '/portfolio',
  },
  {
    id: 4,
    name: 'GOVERN',
    route: '/govern',
  },
  {
    id: 5,
    name: 'ORDERBOOK',
    route: '/orderbook',
  },
  {
    id: 6,
    name: 'BRIDGE',
    route: '/bridge',
  },
];

export const cSwapDropdownData: cSwapDropdownDataProps[] = [
  {
    id: 0,
    name: 'HARBOR',
    icon: '',
  },
  {
    id: 1,
    name: 'COMMODO',
    icon: '',
  },
];

export const DotDropdownData: DotDropdownDataProps[] = [
  {
    id: 0,
    name: 'Discord',
    icon: 'bi bi-discord',
  },
  {
    id: 1,
    name: 'Github',
    icon: 'bi bi-github',
  },
  {
    id: 1,
    name: 'Telegram',
    icon: 'bi bi-telegram',
  },
  {
    id: 1,
    name: 'Twitter',
    icon: 'bi bi-twitter',
  },
  {
    id: 1,
    name: 'Medium',
    icon: '',
  },
  {
    id: 1,
    name: 'Info',
    icon: 'bi bi-info-circle-fill',
  },
];
