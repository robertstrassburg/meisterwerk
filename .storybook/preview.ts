import type { Preview } from "@storybook/react";

//import 'antd/dist/antd.min.css';
import '../dist/output.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
