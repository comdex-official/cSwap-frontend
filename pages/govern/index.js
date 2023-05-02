import dynamic from 'next/dynamic';

// const Govern = dynamic(() => import('@/modules/govern/index.js'));
import Govern from "../../modules/govern/index";

export default function GovernPage() {
  return (
    <>
      <Govern />
    </>
  );
}
