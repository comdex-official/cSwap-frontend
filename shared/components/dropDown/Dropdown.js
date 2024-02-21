import { Dropdown } from "antd";

const MyDropdown = ({
  children,
  items,
  placement,
  trigger,
  className,
  getPopupContainer,
}) => {
  return (
    <>
      <Dropdown
        menu={{ items }}
        placement={placement}
        trigger={trigger}
        overlayClassName={className}
        getPopupContainer={getPopupContainer}
        autoAdjustOverflow={false}
      >
        {children}
      </Dropdown>
    </>
  );
};

export default MyDropdown;
