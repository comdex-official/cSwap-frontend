import Assets from "./containers/Assets";
import Farm from "./containers/Farm";
import FarmDetails from "./containers/Farm/Details";
import Govern from "./containers/Govern";
import GovernDetails from "./containers/Govern/Details";
import Balances from "./containers/MyHome";
import Swap from "./containers/Swap";
import OrderBook from "./containers/OrderBook";

const routes = [
  {
    path: "/trade",
    element: <Swap />,
  },
  {
    path: "/assets",
    element: <Assets />,
  },
  {
    path: "/farm",
    element: <Farm />,
  },
  {
    path: "/govern",
    element: <Govern />,
  },
  {
    path: "/govern/:id",
    element: <GovernDetails />,
  },
  {
    path: "/portfolio",
    element: <Balances />,
  },
  {
    path: "/farm/:id",
    element: <FarmDetails />,
  },
  {
    path: "/orderbook",
    element: <OrderBook />,
  },
];

export default routes;
