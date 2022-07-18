import { comdex } from "../../../config/network";

const Snack = ({ message, explorerUrlToTx = comdex.explorerUrlToTx, hash }) => {
  return (
    <span>
      {message}
      <a
        href={`${explorerUrlToTx.replace("{txHash}", hash?.toUpperCase())}`}
        target="_blank"
        className="ml-3"
        rel="noreferrer"
        aria-label="explorer"
      >
        {" "}
        View Explorer
      </a>
    </span>
  );
};

export default Snack;
