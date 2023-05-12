import { Dropdown } from "antd";

const MyDropdown = ({ children, items, placement, trigger }) => {
  return (
    <>
      <Dropdown menu={{ items }} placement={placement} trigger={trigger}>
        {children}
      </Dropdown>
    </>
  );
};

export default MyDropdown;
