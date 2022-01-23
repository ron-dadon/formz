export declare function useFormz(): FormzResult

export declare function useFormzContext(): FormzContextResult

export declare function useFormzField(field: FieldInput): FieldResult

interface OnSubmitArguments {
  values: object
}

interface FormProps {
  onSubmit: (args: OnSubmitArguments) => Promise<any>
  formProps?: object
  onSubmitSuccess?: (any) => void
  onSubmitError?: (Error) => void
}

interface FormzResult {
  Form: React.FC<FormProps>
}

interface FormzContextResult {
  form: FormState
  fields: { [fieldName: string]: FieldState }
  values: object
}

interface FormState {
  valid: boolean
  invalid: boolean
  touched: boolean
  untouched: boolean
  pristine: boolean
  errors: { [fieldName: string]: string }
}

interface FieldState {
  valid: boolean
  invalid: boolean
  touched: boolean
  untouched: boolean
  pristine: boolean
  error: string
}

interface ValidateInput {
  name: string
  value: any
  values: { [key: string]: any }
}

interface FieldInput {
  name: string
  defaultValue?: any
  validate?: (validateInput: ValidateInput) => Promise<any>
  parse?: (value: any) => any
  format?: (value: any) => any
  validateOnInit?: boolean
  validateOnBlur?: boolean
  validateOnChange?: boolean
}

interface FieldInputProps {
  value: any
  onChange: (value: any) => void
  onBlur: (event: object) => void
}

interface FieldResult extends FormzContextResult {
  field: FieldState
  rawValue: any
  value: any
  name: string
  defaultValue: any
  inputProps: FieldInputProps
}
