
import Lottie from "lottie-react";
import { PageLoader } from "../shared/image";

const Loading = ({height}) => {
  return (
    <>
        <Lottie
          animationData={PageLoader}
          loop={true}
          style={{ height: height ? height : 130 }}
        />
    </>
  );
};

export default Loading;
