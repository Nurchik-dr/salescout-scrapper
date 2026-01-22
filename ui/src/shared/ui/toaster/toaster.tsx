import { message } from 'antd';

export const toaster = {
  success: (content: string, duration: number = 3) => {
    message.success(content, duration);
  },

  error: (content: string, duration: number = 4) => {
    message.error(content, duration);
  },

  info: (content: string, duration: number = 3) => {
    message.info(content, duration);
  },

  warning: (content: string, duration: number = 3) => {
    message.warning(content, duration);
  },
};
