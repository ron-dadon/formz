# Formatting and parsing

Many times the displayed value and actual form value are not identical in their format, the common examples are select components where the displayed label and selected value can be different and date fields, where many times the form value is a unix timestamp / ISO string but the displayed value is a human readable format of the data.

For that purpose, each field has two props, `parses` and `formatters`. Those props can receive a function or array of functions that will convert your form value to the displayed value (formatting) and vice versa (parsing). See `parsers` and `formatters` props on `Field` component.

Formatting and parsing arrays of function as executed sequentially, where the result of the currently running function is passed to the next function as the input value (that is basically function composition).

So, if for example your formatting function array is `[a, b]` where `a` and `b` are functions, Formz will pass your form value to `a` and will use the result as the value for `b`, so the final result is `newValue = b(a(value))`.
 
Just like validators, formatters and parsers are called with an object in the form of `{ value: any, allValues: object<string, any>, props: object<string, any> }`.

## Formatting

Formatting is the process of taking the raw value of the field and change it to the format of the UI component.

A simple example is converting UNIX timestamp to a human readable local date-time format.

```jsx
const formatToLocalDateTime = ({ value }) => (new Date(value)).toLocaleString() 
const formatters = [formatToLocalDateTime]

<Field formatters={formatters} ... />
```

So when the field value changes, and sets the value to `1535019565628`, the formatters will be executed and will return a modified value of `8/23/2018, 1:19:25 PM`.
The modified value will be injected to the rendered field component as `value`.

## Parsing

Formatting is the opposite process of formatting. In many UI elements, the value that will be send to the form field on change is the formatted value, where in that case, we want to parse it and keep the parse value as the form value.

A simple example is a select component that sends the entire object of `{ id, title }` as the value, but we only need to send the `id` when submitting the form.

```jsx
const getId = ({ value }) => (value && value.id) || null
const parsers = [getId]

<Field parsers={parsers} ... />
```

So when the field value changes, and sets the value to `{ id: 1, title: 'Title' }`, the parsers will be executed and will set the value of `id` which is `1` as the field value.
The value will be injected to the rendered field component as `rawValue`.

<div class="alert alert-info">
  <i class="fas fa-info-circle"></i> In most cases when you need to use <code>formatters</code> or <code>parsers</code>, you will need to implement both, so that Fromz can supply the currect value for your input and store the currect value for submission. 
</div>
