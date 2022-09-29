export declare function useFormz(): FormzResult

export declare function useFormzContext(): FormzFullContextResult

export declare function useFormzField(field: FieldInput): FieldResult

type ValuesType = { [field: string]: any }
type FormPropsGenerator = (context: FormzContextResult) => object
type ValidationFunction = (validateInput: ValidateInput) => Promise<any>
type ValidateAllFunction = (name: string, field: FieldState) => boolean

interface SubmitOptions {
  ignoreErrors?: boolean
}

interface OnSubmitArguments {
  values: ValuesType
  event?: Event | null
  validationErrors?: ValuesType | null
  options: SubmitOptions
}

interface FormProps {
  onSubmit: (args: OnSubmitArguments) => Promise<any>
  formProps?: object | FormPropsGenerator
  onSubmitSuccess?: (any) => void
  onSubmitError?: (Error) => void
  focusFirstErrorField?: boolean
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
  validateOnBlur?: boolean
  validateOnChange?: boolean
  validateAll?: ValidateAllFunction | boolean
  fieldRef: React.RefObject<HTMLElement | null>,
}

interface SetFieldErrorInput extends FieldInput {
  error: string | Error
}

interface SetFieldValueInput extends FieldInput {
  value: any
}

interface FieldValidationInput extends FieldInput {
  validate?: ValidationFunction
  validateOnBlur?: boolean
  validateOnChange?: boolean
  validateAll?: ValidateAllFunction | boolean
}

interface FormzFullContextResult extends FormzContextResult {
  mountField: (field: MountFieldInput) => void
  unmountField: (field: FieldInput) => void
  setFieldValidation: (field: FieldValidationInput) => void
  setFieldTouched: (field: FieldInput) => void
  setFieldError: (field: SetFieldErrorInput) => void
  setValidating: (field: FieldInput) => void
  clearFieldError: (field: FieldInput) => void
  setFieldValue: (field: SetFieldValueInput) => void
  resetField: (field: FieldInput) => void
  reset: (e?: Event) => void
  submit: (e?: Event, options?: SubmitOptions) => void
  validate: () => Promise<void>
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
  submitEvent: null | SubmitEvent
}

interface FieldState extends MetaState {
  error?: boolean | string
  validate?: ValidationFunction
  validateOnBlur?: boolean
  validateOnChange?: boolean
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
  validateAll?: ValidateAllFunction | boolean
}

interface FieldInputProps {
  value: any
  onChange: (value: any) => void
  onBlur: (event?: object) => void
  ref: React.RefObject<HTMLElement | null>
}

interface FieldResult extends FormzContextResult {
  ready: boolean
  field: FieldState
  rawValue: any
  value: any
  name: string
  defaultValue: any
  inputProps: FieldInputProps
}
