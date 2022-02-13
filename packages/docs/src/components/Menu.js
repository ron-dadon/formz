import logo from '../formz-logo.svg'
import { useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Avatar, Box, Button, IconButton } from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'

const Menu = () => {
  const navigate = useNavigate()

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box
          display="flex"
          alignItems="center"
          onClick={() => navigate('/')}
          sx={{ cursor: 'pointer' }}
        >
          <Avatar src={logo} />
          <Typography variant="h3" ml={2}>
            Formz
          </Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Button color="inherit" onClick={() => navigate('/getting-started')}>
            Getting Started
          </Button>
          <Button color="inherit" onClick={() => navigate('/api-docs')}>
            API Documentation
          </Button>
          <Button color="inherit" onClick={() => navigate('/examples')}>
            Examples
          </Button>
          <IconButton color="inherit" href="https://github.com/ron-dadon/formz">
            <GitHubIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Menu
