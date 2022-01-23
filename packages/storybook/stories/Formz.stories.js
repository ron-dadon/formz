import React from 'react'
import { useFormz } from '@formz/core'
import { Input, Select } from './components/Input'
import { FormButtons } from './components/Buttons'
import { sleep } from './utils'
import FormzDocs from './Formz.mdx'

const NameField = () => {
  return <Input name="firstName" placeholder="First name" defaultValue="" />
}

const DateField = () => {
  const defaultValue = new Date().toISOString().substr(0, 16)

  return (
    <Input
      name="birthday"
      placeholder="Birthday"
      type="datetime-local"
      defaultValue={defaultValue}
    />
  )
}

const AgeField = () => {
  return <Input name="age" placeholder="Age" type="number" defaultValue={18} />
}

const Gender = () => {
  return (
    <Select
      name="gender"
      placeholder="Gender"
      defaultValue="-"
      options={{
        '-': 'Not specified',
        male: 'Male',
        female: 'Female',
      }}
    />
  )
}

const FormzTemplate = ({ children }) => {
  const { Form } = useFormz()

  const onSubmit = async ({ values }) => {
    console.log('VALUES', values)
    await sleep(1000)
  }

  return <Form onSubmit={onSubmit}>{children}</Form>
}

const story = {
  title: 'Examples',
  argTypes: {},
  parameters: {
    docs: {
      page: FormzDocs,
    },
  },
}

export default story

export const Simple = () => (
  <FormzTemplate>
    <NameField />
    <DateField />
    <AgeField />
    <Gender />
    <FormButtons />
  </FormzTemplate>
)
