import React from 'react'
import ReactDOM from 'react-dom'
import { ThemeProvider } from 'styled-components'
import { theme } from '@gnosis.pm/safe-react-components'
import SafeProvider from '@safe-global/safe-apps-react-sdk'
import GlobalStyle from './GlobalStyle'
import App from './App'
import SafeLoader from './components/SafeLoader'

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <SafeProvider loader={<SafeLoader />}>
      <App />
    </SafeProvider>
  </ThemeProvider>,
  document.getElementById('root'),
)
