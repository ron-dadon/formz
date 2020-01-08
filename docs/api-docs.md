# API Documentation

## Components

### Formz component

The main form component. This component is responsible for managing the form state, and hook up your event handlers into the form.

#### Props

| Name | Type | Required | Default | Description|
|------|:----:|:--------:|:-------:|------------|
|render|`React element` / `functional component`|Yes| |Formz utilizes the render prop pattern to inject all form related props and methods into your form component.Pass in a class component or functional component.
|onSubmit|`(formValues: {}) => Promise / Boolean`|Yes| |Form submission handler. The handler is called only if the form is valid, and will receive a single argument, that is a map object of `<field name, field value>`. If the handler does async work to process the form, it should return a `Promise` that is resolved if the process was successful, or rejected with the error if the processing failed. If the handler does sync work, it should return `true` if successful, or `false` if failed.
|onSubmitSuccess|`(result: any) => void`|No| |A callback to be called when the submission of the form is successful. If your `onSubmit` returned a `Promise`, it will be called with the resolved value. If your `onSubmit` returned `true`, it will be called with the submitted form values.
|onSubmitError|`(error: any) => void`|No| |A callback to be called when the submission of the form failed. If the form is invalid, it will be called when attempting to submit the form, and will get the form errors object as parameter. If your `onSubmit` returned a `Promise`, it will be called with the rejected value. If your `onSubmit` returned `false`, it will be called with `false`.
|onValidation|`({ errors: {}, valid: boolean }) => void`|No| |A callback to be called when the form has finished a validation phase. The callback will get a single object as a parameter, with `errors`, which is the form errors object, and `valid` that states if the form is valid or not.
|onValuesChange|`({ values: {}, field: string, updateFieldValue: ({ name: string, value:any }) => void }) => void`|No| |A callback to be called when a field value was changed. This allows you to update other fields based on the change using the `updateFieldValue` function that is provided to the callback.
|onReset|`() => void`|No| |A callback to be called when the form has been reset.
|autoReset|`boolean`|No|`false`|If set to `true`, the form would automatically reset upon a successful submit.
|validateOnInit|`boolean`|No|`false`|If set to `true`, the form would validate after each field initialization. Please note that this may cause an additional renders as it runs for every field that is registered in the form (for example, form with 7 fields will execute validation 7 times on initialization).
|validateOnChange|`boolean`|No|`true`|If set to `true`, the form would validate upon every change in a field. Please note that this may cause an additional render.
|validateOnBlur|`boolean`|No|`true`|If set to `true`, the form would validate upon every blur of a field. Please note that this may cause an additional render.
|validateOnSubmit|`boolean`|No|`true`|If set to `true`, the form would validate before submitting. Please note that this may cause an additional render. It is a good practice to leave this option set to `true`, as it should prevent unneeded API requests to your form endpoint if client side validation fails.
|formNative|`boolean`|No|`true`|Set to `false` to disable native form element generation. By default, Formz wraps the rendered form component with `form` HTML element to enable native HTML form features.
|formNoValidate|`boolean`|No|`true`|Set to `false` to enable browser built-in HTML5 validations for the form. This may cause UX problems if you implement your own validations.
|formAction|`string`|No| |Set the action of the native form element.
|formMethod|`'get' / 'post' / 'GET' / 'POST'`|No| |Set the method of the native form element.
|formEnctype|`'application/x-www-form-urlencoded' / 'multipart/form-data' / 'text/plain'`|No| |Set the enctype of the native form element.
|formTarget|`'_self' / '_blank' / '_parent' / '_top' / string`|No| |Set the target of the native form element.
|formProps|`object`|No| |Spread all properties of this object onto the `form` element.

<div class="alert alert-info mt-3">
    <i class="fas fa-info-circle"></i> Any other props that are passed to the Formz component will be passed to the render props.
</div>

<div class="alert alert-info mt-3">
    <i class="fas fa-info-circle"></i> Setting <code>formAction</code> and <code>formNative</code> will force the form to use the native submission. The side effects of the native submit are that <code>onSubmit</code> function will not be executed and fields will NOT be validated on submission. 
</div>

### Field component

The `Field` component is injected as a prop into your form component via the render prop of the `Form` component. Each form gets a `Field` component that is bounded to that form.

<div class="alert alert-warning">
<i class="fas fa-exclamation-circle"></i> <strong>Important Note:</strong> The <code>Field</code> component is very sensitive to props changes. Because validators gets the form props, every change to the props will trigger the validators, and if props always change that may cause infinite loop.
For example, the following is a <strong>BIG NO NO</strong>!
</div>

{% raw %}
```jsx
<Field name="fieldName" validators={{ isOK: ({ value }) => !!value }} />
```
{% endraw %}

Regardless of the fact that this is a bad practice in React in general, that means that for every render, the `validators` prop is injected with a new object, that will trigger `componentDidUpdate` and will push a notification that props was changed for that field to the `Formz` instance, causing it to execute the validators and re-render the fields, and there for, that will cause an infinite loop.

#### Props

| Name | Type | Required | Default | Description|
|------|:----:|:--------:|:-------:|------------|
|render|`React element` / `functional component`|Yes| |The `Field` component utilizes the render prop pattern to inject all field / form related props and methods into your field component. Pass in a class component or functional component.
|name|`string`|Yes| |The name of the field. It will be used as the key for the field in the form values map object.
|defaultValue|`object`/`array`/`string`/`number`/`boolean`|No| |The initial value for the field. Can be an object, array, string, number or boolean.
|validators|`object<string, ({ value, allValues, props }) => boolean / Promise>`|No| |A map of validation functions. Each key of the object will be used as the error key on the `errors` object of the field. A sync validation function should return `true` if the validation passed, `false` otherwise. An async validation function should return a `Promise` that will resolve with `true` if validation passed or `false` if validation failed.
|parsers|`array<({ value, allValues, props }) => any>`|No| |Parse function is used to convert the "view" (formatted) value into a value that should be stored in the form. This is useful for example for converting `DD/MM/YYYY` formatted dates to unix timestamps. Each function will get an object of `{ value, allValues, props }`, and should return the parsed value. If an array of parsing functions is provided, each function will be executed in order, and passed the returned value from the previous function.
|formatters|`array<({ value, allValues, props }) => any>`|No| |The opposite of `parsers`. Formatter function is used to convert the actual stored value in the form into a value should be displayed for the user. This is useful for example for converting unix timestamps to `DD/MM/YYYY` formatted date. Each function will get an object of `{ value, allValues, props }`, and should return the formatted value. If an array of formatting functions is provided, each function will be executed in order, and passed the returned value from the previous function.
|validateOnChange|`boolean`|No|`true`|If set to `true`, the form would validate upon every change in that field. Please note that this may cause an additional render, and validation runs on all fields. This can be used to force validation / prevent validation if the form prop `validateOnChange` is the opposite. For example, if the form prop `validateOnChange` is `false`, only a field with the prop `validateOnChange` sets to `true` will trigger the validation.
|validateOnBlur|`boolean`|No|`true`|If set to `true`, the form would validate upon every blur of that field. Please note that this may cause an additional render, and validation runs on all fields. This can be used to force validation / prevent validation if the form prop `validateOnBlur` is the opposite. For example, if the form prop `validateOnBlur` is `false`, only a field with the prop `validateOnBlur` sets to `true` will trigger the validation.
|validateOnInit|`boolean`|No|`true`|If set to `true`, the form would validate after field initialization. Please note that this may cause an additional render, runs for every field that is registered in the form (for example, form with 7 fields will execute validation 7 times on initialization), and validation runs on all fields. This can be used to force validation / prevent validation if the form prop `validateOnInit` is the opposite. For example, if the form prop `validateOnInit` is `false`, only a field with the prop `validateOnInit` sets to `true` will trigger the validation.
|reValidateOnFormChanges|`boolean`/`string`/`array<string>`|No|`false`|If set to `true`, this field validation will be executed for every change in any field. If set to a `string`, this field validation will be executed only if a field with the name of this prop is changed. If set to `array<string>`, you can set more than 1 field that will trigger the validation.
|reInitialize|`boolean`|No|`false`|If set to `true`, a change in the `defaultValue` prop will change the `value` of the field to the new default value.
|keepDirty|`boolean`|No|`false`|If set to `true`, a change in the `defaultValue` prop will change the `value` of the field to the new default value, **ONLY IF** the field is not `dirty`.
|synthetic|`boolean / string`|No| |Set to `true` to handle synthetic events `value` field automatically in `onChange`, or set to custom string value to extract that field from the synthetic event `target` object.
|onValueChange|`({ value: any, allValues: {}, submit: () => void, reset: () => void, updateFieldValue: ({ name: string, value:any }) => void }) => void`|No| |A callback to be called when a the field value was changed. This allows you to update other fields based on the change using the `updateFieldValue` function that is provided to the callback, submit the form using `submit` or reset it using `reset`.

<div class="alert alert-info mt-3">
    <i class="fas fa-info-circle"></i> Any other props that are passed to the Field component will be passed to the render props.
</div>

## Render props

Formz uses the **render prop** pattern of React to pass down relevant props into the rendered components.

### Formz render props

The `Formz` component `render` prop will render the entire form. It will inject the following props into the rendered component:

| Name | Type | Description|
|------|:----:|------------|
|Field|`React element`|A React component `Field` that is used to define fields for the form and is tightly coupled to the providing `Formz` instance.
|reset|`function`|A function that will reset the form when called.
|submit|`function`|A function that will trigger the form submission when called.
|errors|`object<string, object<string, boolean>>`|A map object of the current form field errors. Each object key is a name of a field, and each value is a map from the error name to `true` if the error is relevant to the field.
|valid|`boolean`|Is the form valid (no errors are present for all fields).
|invalid|`boolean`|The opposite of `valid`. Is `true` if there is at least one field with one error.
|pristine|`boolean`|Is the form pristine (no values were changed). Is `true` if all fields in the form are in `pristine` state.
|dirty|`boolean`|The opposite of `pristine`. Is `true` if there is at least one field that is in `dirty` state.
|touched|`boolean`|Was the form touched by the user. Is `true` if at least one field was touched by the user.
|untouched|`boolean`|The opposite of `touched`. Is `true` if none of the fields were touched by the user.
|pending|`boolean`|Does the form has pending validation (async). Is `true` if at least one of the fields has an async validation that is still processing.
|submitting|`boolean`|Is `true` when the form is submitting.
|submitted|`boolean`|Is `true` when the form was already submitted, and the submission completed (successfully or not).
|submitSuccess|`boolean`|If `true` when the form was successfully submitted.
|values|`object<string, any>`|A map of the form values|

<div class="alert alert-info mt-3">
    <i class="fas fa-info-circle"></i> Props passed to the Formz component that are not a part of the Formz component props will be passed as well, as long as they don't conflict with the names of the render props.
</div>

### Field render props

The `Field` component `render` prop will render a single field. It will inject the following props into the rendered component:

| Name | Type | Description|
|------|:----:|------------|
|value|`any`|The formatted value of the field for display to the user.
|rawValue|`any`|The actual value of the field.
|errors|`object<string, boolean>`|A map object with all the active errors of the field.
|valid|`boolean`|Is `true` if the field is valid (no errors).
|invalid|`boolean`|The opposite of `valid`. Is `true` if the field has at least one active error.
|touched|`boolean`|Is `true` if the field was touched by the user.
|untouched|`boolean`|The opposite of `touched`. Is `true` if the field was never touched by the user.
|pristine|`boolean`|Is `true` if the field was never changed.
|dirty|`boolean`|The opposite of `pristine`. Is `true` if the field was changed.
|active|`boolean`|Is `true` if the field is the currently active field in the form (in focused).
|pending|`boolean`|Is `true` if the field has at least one async validation pending.
|submitting|`boolean`|Is `true` when the form is submitting.
|submitted|`boolean`|Is `true` when the form was already submitted, and the submission completed (successfully or not).
|submitSuccess|`boolean`|If `true` when the form was successfully submitted.
|formValues|`object<string, any>`|A map object from field names to raw values.
|onChange|`(newValue) => void`|Call this function to change the value of the field. The function should be called with a single argument - the new field raw value.
|onBlur|`() => void`|Call this function when the field is blurred. 
|onFocus|`() => void`|Call this function when the field is focused. 
|reset|`() => void`|Call this function the reset the field. 
|updateFieldValue|`({ name, value }) => void`|Call this function to update a field value. The function argument is an object of `{ name, value }` where `name` is the name of the field to update, and `value` is the new value. Calling `onChange` actually calls this function with the current field `name`.
|resetForm|`function`|A function that will reset the form when called.
|submit|`function`|A function that will trigger the form submission when called.

<div class="alert alert-info mt-3">
    <i class="fas fa-info-circle"></i> Props passed to the Field component that are not a part of the Field component props will be passed as well, as long as they don't conflict with the names of the render props.
</div>
