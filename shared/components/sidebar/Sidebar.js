import styles from "./Sidebar.module.scss";
import { NextImage } from "../../../shared/image/NextImage";
import { Logo_Dark, Logo_Light } from "../../../shared/image";
import { HeaderData } from "../header/Data";
import { useRouter } from "next/router";
import Link from "next/link";
import { Icon } from "../../../shared/image/Icon";
import { useSelector } from "react-redux";
import MyDropdown from "../dropDown/Dropdown";
import { C_Logo, Comodo, Faucet, Harbor } from "../../../shared/image";
import { Modal } from "antd";
import { useState, useRef, useEffect } from "react";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const theme = "dark";

  const router = useRouter();

  const wrapperRef = useRef(null);

  const isActive = (pathname) => {
    return router.pathname === pathname;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const cswapItems = [
    {
      key: "item-2",
      label: (
        <div className={styles.dropdown__cSwap__menu}>
          <button>
            <NextImage src={Harbor} alt="Logo" />
          </button>
          <button>
            <NextImage src={Comodo} alt="Logo" />
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (isOpen) {
      function handleClickOutside(event) {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
          setIsOpen(!isOpen);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef, isOpen]);

  return (
    <div className={`${styles.sidebar__wrap} ${isOpen ? styles.active : ""}`}>
      <div className={styles.sidebar__main} ref={wrapperRef}>
        <div className={styles.sidebar__upper}>
          <div
            className={styles.sidebar__logo}
            onClick={() => {
              router.push("/");
              setIsOpen(!isOpen);
            }}
          >
            {theme === "dark" ? (
              <NextImage src={Logo_Dark} alt="Logo_Dark" />
            ) : (
              <NextImage src={Logo_Light} alt="Logo_Dark" />
            )}
          </div>

          <Icon
            className={`bi bi-x ${
              theme === "dark" ? styles.icon_dark : styles.icon_light
            }`}
            size={"1.5rem"}
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
        <div className={styles.sidebar__lower}>
          {HeaderData.map((item) => (
            <div
              key={item.id}
              className={`${styles.sidebar__element} ${
                theme === "dark" ? styles.dark : styles.light
              } ${isActive(item.route) ? styles.active : ""}`}
            >
              <div
                className={styles.header__name}
                onClick={() => {
                  item?.id === 5 ? showModal() : router.push(item.route);
                  setIsOpen(!isOpen);
                }}
              >
                {item.name}
              </div>
            </div>
          ))}
        </div>

        <MyDropdown
          items={cswapItems}
          placement={"topRight"}
          trigger={["click"]}
        >
          <div className={styles.header__cSwap}>
            <div className={styles.header__cSwap__main}>
              {theme === "dark" ? (
                <NextImage src={C_Logo} alt="Logo_Dark" />
              ) : (
                <NextImage src={C_Logo} alt="Logo_Dark" />
              )}

              <div
                className={`${styles.header__cSwap__title} ${
                  theme === "dark" ? styles.dark : styles.light
                }`}
              >
                {"cSwap"}
              </div>
            </div>
            <Icon
              className={`bi bi-grid-fill ${
                theme === "dark" ? styles.icon_dark : styles.icon_light
              }`}
              size={"0.8rem"}
            />
          </div>
        </MyDropdown>

        <div
          className={styles.header__faucet}
          onClick={() => window.open("https://faucet.comdex.one/", "_blank")}
        >
          <NextImage src={Faucet} alt="Logo_Dark" />
          <div
            className={`${styles.header__faucet__title} ${
              theme === "dark" ? styles.dark : styles.light
            }`}
          >
            {"Faucet"}
          </div>
        </div>

        <Modal
          className={"modal__wrap"}
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          centered={true}
          footer={null}
          header={null}
        >
          <iframe
            src="https://dev-transit.comdex.one/"
            frameBorder="0"
            width={"100%"}
            height={"700px"}
            style={{ borderRadius: "10px", background: "#030b1e" }}
          ></iframe>
        </Modal>
      </div>
    </div>
  );
};

export default Sidebar;
