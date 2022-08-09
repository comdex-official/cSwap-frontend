import Assets from "./containers/Assets";
import Swap from "./containers/Swap";
import Farm from "./containers/Farm";
import Govern from "./containers/Govern";
import Balances from "./containers/MyHome";
import GovernDetails from "./containers/Govern/Details";
import FarmDetails from "./containers/Farm/Details";

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
    path: "/govern-details/:id",
    element: <GovernDetails />,
  },
  {
    path: "/portfolio",
    element: <Balances />,
  },
  {
    path: "/farm-details/:id",
    element: <FarmDetails />,
  },
];

export default routes;
