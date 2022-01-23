export declare function useFormz(): FormzResult

export declare function useFormzContext(): FormzContextResult

export declare function useFormzField(field: FieldInput): FieldResult

type ValuesType = { [field: string]: any }

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
  values: ValuesType
}

interface MetaState {
  valid: boolean
  invalid: boolean
  touched: boolean
  untouched: boolean
  pristine: boolean
}

interface FormState extends MetaState {
  errors: { [fieldName: string]: string }
  submitCount: number
  submitting: boolean
  submitted: boolean
  submitSuccess: boolean
  submitError: boolean | Error
}

interface FieldState extends MetaState {
  error?: boolean | string
}

interface ValidateInput {
  name: string
  value: any
  values: ValuesType
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
