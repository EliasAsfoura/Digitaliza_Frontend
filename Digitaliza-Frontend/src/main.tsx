import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@mui/material/styles'
import theme from './configs/theme.ts'

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <StrictMode>
      <App />
    </StrictMode>,
  </ThemeProvider>
)
