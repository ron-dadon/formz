import { Typography, Box, Button } from '@mui/material'
import logo from '../formz-logo.svg'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()
  return (
    <>
      <Box display="flex" backgroundColor="#00ccc9" m={-2}>
        <Box>
          <svg viewBox="0 0 485 400" width="485.085" height="537.047">
            <g transform="matrix(1.060683, -0.074171, 0.074171, 1.060683, 3.846423, 27.002825)">
              <path
                fill="#ffffff"
                d="M 16 56 H 408 A 16 16 0 0 1 424 72 V 532.673 H 0 V 72 A 16 16 0 0 1 16 56 Z"
              />
              <rect fill="#c6c6c6" x="16" y="72" width="184" height="32" rx="8" ry="8" />
              <rect fill="#c6c6c6" x="216" y="72" width="192" height="32" rx="8" ry="8" />
              <rect fill="#c6c6c6" x="16" y="120" width="392" height="32" rx="8" ry="8" />
              <rect fill="#c6c6c6" x="16" y="168" width="280" height="32" rx="8" ry="8" />
              <rect fill="#c6c6c6" x="312" y="168" width="96" height="32" rx="8" ry="8" />
              <rect fill="#c6c6c6" x="16" y="216" width="32" height="32" rx="8" ry="8" />
              <rect fill="#c6c6c6" x="56" y="224" width="184" height="16" rx="8" ry="8" />
              <rect fill="#c6c6c6" x="16" y="264" width="32" height="32" rx="8" ry="8" />
              <rect fill="#c6c6c6" x="56" y="272" width="120" height="16" rx="8" ry="8" />
              <rect fill="#c6c6c6" x="16" y="312" width="32" height="32" rx="8" ry="8" />
              <rect fill="#c6c6c6" x="56" y="320" width="152" height="16" rx="8" ry="8" />
              <ellipse fill="#c6c6c6" cx="344" cy="280" rx="64" ry="64" />
              <rect fill="#c6c6c6" x="16" y="360" width="248" height="32" rx="8" ry="8" />
              <rect fill="#c6c6c6" x="280" y="360" width="128" height="32" rx="8" ry="8" />
            </g>
          </svg>
        </Box>
        <Box
          flex={1}
          p={10}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <img src={logo} width={300} alt="logo" />
          <Typography variant="h1">Painless React Forms</Typography>
          <Box display="flex" columnGap={2}>
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={() => navigate('/getting-started')}
            >
              Getting Started
            </Button>
            <Button variant="text" size="large" onClick={() => navigate('/api-docs')}>
              API Documentation
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default Home
