import { Box } from '@mui/material'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark as dark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const Code = (props) => {
  return <SyntaxHighlighter {...props} style={dark} />
}

export const InlineCode = ({ children }) => (
  <Box
    as="span"
    sx={(theme) => ({
      color: theme.palette.secondary.main,
      fontFamily: `source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace`,
    })}
  >
    {children}
  </Box>
)
export default Code
