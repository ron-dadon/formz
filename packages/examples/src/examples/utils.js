export const awaitTimeout = ms => new Promise(resolve => setTimeout(resolve, ms))

export const onSubmit = async (values) => {
  // Simulate server call with timeout
  console.log('Submitted form with values', values)
  await awaitTimeout(100)
  return true
}

export const onLoginSubmitSync = (values) => {
  console.log('Submitted form with values', values)
  return (values.email === 'test@test.com' && values.password === '12345')
}

export const onLoginSubmit = async (values) => {
  console.log('Submitted form with values', values)
  // Simulate server call with timeout
  await awaitTimeout(100)
  if (values.email === 'test@test.com' && values.password === '12345') return true
  throw new Error('Invalid credentials')
}
