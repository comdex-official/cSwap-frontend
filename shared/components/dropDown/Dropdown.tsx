import React, { ReactNode } from 'react';
import { Dropdown } from 'antd';

interface Props {
  children: ReactNode;
  items: any;
  placement: any;
}

const MyDropdown = ({ children, items, placement }: Props) => {
  return (
    <>
      <Dropdown menu={{ items }} placement={placement}>
        {children}
      </Dropdown>
    </>
  );
};

export default MyDropdown;
