import { comdex } from "../../../config/network";
import { Hyperlink } from "../../image";
import { NextImage } from "../../image/NextImage";

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
        View Explorer{" "}
        <NextImage src={Hyperlink} alt={"Logo"} height={15} width={15} />
      </a>
    </span>
  );
};

export default Snack;
