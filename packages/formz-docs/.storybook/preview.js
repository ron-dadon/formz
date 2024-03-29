import { themes } from '@storybook/theming'
import { addParameters } from '@storybook/react'

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  options: {
    storySort: {
      order: ['Getting Started', 'API', 'Examples'],
    },
  },
  docs: {
    theme: themes.light,
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}

addParameters({
  previewTabs: {
    canvas: {
      title: 'Live Example',
      hidden: false,
    },
  },
})
