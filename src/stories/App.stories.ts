import type { Meta, StoryObj } from '@storybook/react';
import { within,expect, userEvent, screen } from '@storybook/test';
import App from '../App';

const meta = {
  title: 'Meisterwerk/Pages',
  component: App,
  parameters: {
    layout: 'fullscreen',
  },
  args: {

  },
} satisfies Meta<typeof App>;

export default meta;
type Story = StoryObj<typeof meta>;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const Start: StoryObj<typeof App> = {

  play: async ({ canvasElement }) => {
    
    const canvas = within(canvasElement)
     
    expect(canvas.queryAllByTestId('create_quote_button') ).toHaveLength(1) // is there a create button
    
    const createButton = canvas.getByTestId('create_quote_button')
    await userEvent.click(createButton)  // click create button

    const canvasWithModal = within(screen.getByRole('dialog')) // is there a modal
    expect(canvasWithModal.getAllByText('city')).toHaveLength(1) // that contain the word city
  
    const cancelButton = canvasWithModal.getAllByText('Cancel') // press cancel
    await userEvent.click(cancelButton[0])

    await sleep(500);
    expect(canvasElement.querySelectorAll('div.ant-table-row')).toHaveLength(10) // check if table has 10 rows
  },
};