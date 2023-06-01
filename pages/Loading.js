
import Lottie from "lottie-react";
import { PageLoader } from "../shared/image";

const Loading = () => {
  return (
    <>
      
        <Lottie
          animationData={PageLoader}
          loop={true}
          style={{ height: 130 }}
        />
      
    </>
  );
};

export default Loading;
