import Card from '@/shared/components/card/Card';
import Header from '@/shared/components/header/Header';
import Search from '@/shared/components/search/Search';
import Tab from '@/shared/components/tab/Tab';
import React, { useState } from 'react';
import styles from './Trade.module.scss';
import TradeCard from './TradeCard';
import BridgeCard from '../bridge/BridgeCard';

interface Props {}

const Trade = (props: Props) => {
  // const [active, setActive] = useState('All');

  // const handleActive = (item: string) => {
  //   setActive(item);
  // };

  return (
    <>
      <Header />
      {/* <Search /> */}
      {/* <Tab
        data={['All', 'Basic', 'Ranged', 'MyPools']}
        active={active}
        handleActive={handleActive}
      /> */}

      {/* <TradeCard /> */}
      {/* <BridgeCard /> */}
    </>
  );
};

export default Trade;
