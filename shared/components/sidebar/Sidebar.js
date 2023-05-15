import styles from "./Sidebar.module.scss";
import { NextImage } from "../../../shared/image/NextImage";
import { Logo_Dark, Logo_Light } from "../../../shared/image";
import { HeaderData } from "../header/Data";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "../../../shared/image/Icon";
import { useSelector } from "react-redux";
import MyDropdown from "../dropDown/Dropdown";
import { C_Logo, Comodo, Faucet, Harbor } from "../../../shared/image";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const theme = "dark";

  const router = useRouter();

  const isActive = (pathname) => {
    return router.pathname === pathname;
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

  return (
    <div className={`${styles.sidebar__wrap} ${isOpen ? styles.active : ""}`}>
      <div className={styles.sidebar__main}>
        <div className={styles.sidebar__upper}>
          <div className={styles.sidebar__logo}>
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
                onClick={() => (item?.id === 5 ? "" : router.push(item.route))}
              >
                {item.name}
              </div>
            </div>
          ))}
        </div>

        <MyDropdown
          items={cswapItems}
          placement={"bottomRight"}
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
      </div>
    </div>
  );
};

export default Sidebar;
