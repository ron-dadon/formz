import * as React from 'react'
import { ValidateInput } from '@formz/core/src'

export declare function useFormzDebugger(options: FormzDebuggerOptions): void

export declare function FormzField(): React.FC<FormzFieldProps>

type ValidationFunction = (validateInput: ValidateInput) => Promise<any>

interface FormzDebuggerOptions {
  values?: boolean
  form?: boolean
  fields?: boolean
}

interface FormzFieldProps {
  name: string
  component: React.FC
  defaultValue?: any
  validate?: ValidationFunction
  parse?: (value: any) => any
  format?: (value: any) => any
  validateOnBlur?: boolean
  validateOnChange?: boolean
}
