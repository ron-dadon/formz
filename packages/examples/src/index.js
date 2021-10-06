import React from 'react'
import ReactDOM from 'react-dom'
import { BasicExample, BasicExampleWithAsyncValidation, FieldDependencyExample, BasicExampleWithValidation, ParseFormatExample } from "./examples";

const renderExample = (Example) => () => ReactDOM.render(
  <React.StrictMode>
    <Example />
  </React.StrictMode>,
  document.getElementById('live-example')
)

window.formzExamples = {
  basic: renderExample(BasicExample),
  basicWithAsyncValidation: renderExample(BasicExampleWithAsyncValidation),
  fieldDependency: renderExample(FieldDependencyExample),
  basicWithValidation: renderExample(BasicExampleWithValidation),
  parseFormat: renderExample(ParseFormatExample)
}
