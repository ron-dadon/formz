import React from 'react'
import ReactDOM from 'react-dom'
import Typography from '@material-ui/core/Typography'
//

const loadCss = (href) => {
  const linkStyle = document.createElement('link')
  linkStyle.setAttribute('rel', 'stylesheet')
  linkStyle.setAttribute('href', href)
  document.getElementsByTagName('head')[0].appendChild(linkStyle)
}

const getMountPoint = () => {
  const mountDiv = document.createElement('div')
  document.body.appendChild(mountDiv)
  return mountDiv
}

const Home = () => <Typography>Home</Typography>

loadCss('https://fonts.googleapis.com/css?family=Roboto:300,400,500')

ReactDOM.render(<Home />, getMountPoint())
