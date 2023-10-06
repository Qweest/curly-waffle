import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import {
  Box,
  Button,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

const App = () => {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      <Box height="100vh" display="flex" flexDirection="column">
        <Box display="flex" flexDirection="row" height="70%">
          <Box display="flex" flex={2} />
          <Box
            bgcolor="grey.800"
            display="flex"
            flex={1}
            flexDirection="column"
            justifyContent="flex-start"
            overflow="auto"
          >
            <Button>Text</Button>
          </Box>
        </Box>

        <Box width="100%" height="30%" bgcolor="grey.700" />
      </Box>
    </ThemeProvider>
  )
}

export default App
