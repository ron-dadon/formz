import { Typography, Link, Alert, Divider, Box } from '@mui/material'
import Code, { InlineCode } from '../components/Code'

const GettingStarted = () => (
  <>
    <Typography variant="h1">Getting Started</Typography>
    <Divider />
    <Typography variant="h2">Overview</Typography>
    <p>
      Formz was created in 2018 by <Link href="https://github.com/ron-dadon">Ron Dadon</Link> while
      working at <Link href="https://www.linkedin.com/company/samanage">Samanage</Link> (acquired by{' '}
      <Link href="https://www.solarwinds.com/">SolarWinds</Link> in 2019) in order to solve the
      problem of form state handling in React. Until that point, redux-form was the de-facto form
      library, especially when redux was already in use by the application.
    </p>
    <p>
      Coming over to React from AngularJS (R.I.P), I felt a bit overwhalmed by the amount of code
      required to make forms work, and later as I got to know and understand redux better, I've
      found myself wondering why should I update a global state store everytime a temporary internal
      form state is updated.
    </p>
    <p>
      Searching the web at that time, did not lead me to any library I really liked, so Formz was
      born.
    </p>
    <p>
      It is in use by the <Link href="https://www.solarwinds.com/service-desk">Service Desk</Link>{' '}
      application since than, in production, with 1000's of active users using forms it handles on a
      daily basis.
    </p>
    <p>
      React has changed a lot since 2018, and the library was completely written in the beginning of
      2022 to be a pure hooks based library, and moving state to context instead of internal class
      state. At that time, the library was also split, with formz containing all the core
      functionality, and other utilities / framework integrations will be released as{' '}
      <InlineCode>formz-*</InlineCode> separate libraries.
    </p>
    <Alert variant="filled" severity="success">
      Formz has a tiny foot print, with <strong>no external dependencies at all</strong>, resulting
      in a <strong>4KB</strong> only when gzipped!
    </Alert>
    <Box mb={1} />
    <Divider />
    <Typography variant="h2">Installation</Typography>
    <p>
      As simple as all JS modules, just install via <InlineCode>yarn</InlineCode> or{' '}
      <InlineCode>npm</InlineCode>
    </p>
    <Code language="bash">yarn add formz</Code>
    <Code language="bash">npm install formz</Code>
    <Divider />
    <Typography variant="h2">License</Typography>
    <p>
      The library is released under the{' '}
      <Link href="https://github.com/ron-dadon/formz/blob/master/LICENSE.md">MIT license</Link>.
    </p>
    <Divider />
    <Typography variant="h2">What about formz@1.x?</Typography>
    <p>
      Version 2 is a complete re-write and it is not backward compatible at all. Some features were
      dropped during the rewrite after learning that they are rarely to never used.
    </p>
    <Alert variant="filled" severity="warning">
      The first version of the library is considered deprecated at this point. Only critical bug
      fixes will be applied to it if needed.
    </Alert>
  </>
)

export default GettingStarted
