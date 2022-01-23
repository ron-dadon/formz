export declare function useFormz(): FormzResult

export declare function useFormzContext(): FormzFullContextResult

export declare function useFormzField(field: FieldInput): FieldResult

type ValuesType = { [field: string]: any }
type FormPropsGenerator = (context: FormzContextResult) => object
type ValidationFunction = (validateInput: ValidateInput) => Promise<any>

interface OnSubmitArguments {
  values: object
}

interface FormProps {
  onSubmit: (args: OnSubmitArguments) => Promise<any>
  formProps?: object | FormPropsGenerator
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

interface FieldInput {
  name: string
}

interface MountFieldInput extends FieldInput {
  defaultValue?: any
  validate?: ValidationFunction
}

interface SetFieldErrorInput extends FieldInput {
  error: string | Error
}

interface SetFieldValueInput extends FieldInput {
  value: any
}

interface FormzFullContextResult extends FormzContextResult {
  mountField: (field: MountFieldInput) => void
  unmountField: (field: FieldInput) => void
  setFieldTouched: (field: FieldInput) => void
  setFieldError: (field: SetFieldErrorInput) => void
  setValidating: (field: FieldInput) => void
  clearFieldError: (field: FieldInput) => void
  setFieldValue: (field: SetFieldValueInput) => void
  resetField: (field: FieldInput) => void
  reset: (e?: Event) => void
  submit: (e?: Event) => void
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
  validate?: ValidationFunction
  parse?: (value: any) => any
  format?: (value: any) => any
  validateOnBlur?: boolean
  validateOnChange?: boolean
}

interface FieldInputProps {
  value: any
  onChange: (value: any) => void
  onBlur: (event?: object) => void
}

interface FieldResult extends FormzContextResult {
  field: FieldState
  rawValue: any
  value: any
  name: string
  defaultValue: any
  inputProps: FieldInputProps
}
