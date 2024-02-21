import { message } from 'antd';
import Lottie from 'lottie-react';
import { Done } from '../../image';

export const Toaster = (content) => {
  return message.open({
    type: 'success',
    content: content,
    icon: <Lottie animationData={Done} loop={true} style={{ height: 40 }} />,
  });
};
