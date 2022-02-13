import { createTheme, ThemeProvider } from '@mui/material/styles'
import { CssBaseline, Box, Container } from '@mui/material'
import './App.css'
import GettingStarted from './pages/GettingStarted'
import ApiDocs from './pages/ApiDocs'
import Home from './pages/Home'
import Examples from './pages/Examples'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Menu from './components/Menu'

function createTypography(size, css) {
  return {
    fontSize: `${size}px`,
    lineHeight: `${size * 1.5}px`,
    ...css,
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#00FFFA',
    },
    secondary: {
      main: '#E83E8C',
    },
    mode: 'dark',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        message: createTypography(16),
      },
    },
  },
  typography: {
    h1: createTypography(36, { fontWeight: 700, lineHeight: 2 }),
    h2: createTypography(28, { fontWeight: 700, lineHeight: 2 }),
    h3: createTypography(24, { fontWeight: 700, lineHeight: 2 }),
    h4: createTypography(22, { fontWeight: 700, lineHeight: 2 }),
    h5: createTypography(18, { fontWeight: 700, lineHeight: 2 }),
    h6: createTypography(16, { fontWeight: 700, lineHeight: 2 }),
    subtitle1: createTypography(14, { fontWeight: 500 }),
    subtitle2: createTypography(12, { fontWeight: 500 }),
    body1: createTypography(16),
    body2: createTypography(14),
    caption: createTypography(14),
    button: createTypography(14),
    overline: createTypography(12, { fontWeight: 500 }),
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Menu />
        <Container>
          <Box p={2}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/getting-started" element={<GettingStarted />} />
              <Route path="/api-docs" element={<ApiDocs />} />
              <Route path="/examples" element={<Examples />} />
            </Routes>
          </Box>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
