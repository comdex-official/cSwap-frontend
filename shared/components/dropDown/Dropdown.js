import { Dropdown } from "antd";

const MyDropdown = ({ children, items, placement, trigger, className }) => {
  return (
    <>
      <Dropdown
        menu={{ items }}
        placement={placement}
        trigger={trigger}
        overlayClassName={className}
      >
        {children}
      </Dropdown>
    </>
  );
};

export default MyDropdown;
