import { Discord, Git, Info, Medium, Telegram, Twitter } from "@/shared/image";


type HeaderDataProps = {
  id: number;
  name: string;
  route: string;
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

export const DotDropdownData: DotDropdownDataProps[] = [
  {
    id: 0,
    name: 'Discord',
    icon: Discord,
  },
  {
    id: 1,
    name: 'Github',
    icon: Git,
  },
  {
    id: 1,
    name: 'Telegram',
    icon: Telegram,
  },
  {
    id: 1,
    name: 'Twitter',
    icon: Twitter,
  },
  {
    id: 1,
    name: 'Medium',
    icon: Medium,
  },
  {
    id: 1,
    name: 'Info',
    icon: Info,
  },
];
