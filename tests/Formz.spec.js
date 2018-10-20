import React from 'react'
import './init'
import { shallow, mount } from 'enzyme'
import Formz from '../src/lib/components/Formz'
import Field from '../src/lib/components/Field'
import formzRenderPropTypes from '../src/lib/propTypes/formzRenderPropTypes'
import fieldRenderPropTypes from '../src/lib/propTypes/fieldRenderPropTypes'

const FormRenderComponent = () => <div />

const initialState = {
  fields: {},
  errors: {},
  valid: true,
  pristine: true,
  touched: false,
  pending: false,
  submitting: false,
  submitted: false,
  submitSuccess: false
}

const initialFieldState = {
  errors: {},
  valid: true,
  pending: false,
  active: false,
  pristine: true,
  touched: false,
  defaultValue: '',
  value: '',
  formattedValue: '',
  validators: {},
  parsers: [],
  formatters: [],
  props: {},
  validateOnChange: undefined,
  validateOnBlur: undefined,
  validateOnInit: undefined,
  reValidateOnFormChanges: undefined
}

describe('Formz constructor', () => {
  const comp = shallow(<Formz render={FormRenderComponent} onSubmit={jest.fn()} />)
  it('should build Field component', () => {
    expect(comp.instance().Field.name).toBe('Field')
  })
  it('should have initial state', () => {
    expect(comp.state()).toMatchObject(initialState)
  })
})

describe('Formz render', () => {
  const comp = shallow(<Formz render={FormRenderComponent} onSubmit={jest.fn()} />)
  it('should render form tag', () => {
    expect(comp.find('form').length).toEqual(1)
  })
  it('should render the render prop', () => {
    expect(comp.find('FormRenderComponent').length).toEqual(1)
  })
})

describe('Formz pass props', () => {
  describe('to form tag', () => {
    it('should pass onSubmit, reset and validation props to form tag', () => {
      const comp = shallow(<Formz render={FormRenderComponent} onSubmit={jest.fn()} />)
      const formTag = comp.find('form')
      expect(formTag.props().onSubmit).toEqual(comp.instance().startSubmit)
      expect(formTag.props().onReset).toEqual(comp.instance().resetForm)
      expect(formTag.props().noValidate).toEqual(!comp.instance().html5Validation)
    })
  })
  describe('to render prop component', () => {
    it('should pass Field', () => {
      const comp = shallow(<Formz render={FormRenderComponent} onSubmit={jest.fn()} />)
      const renderPropComponent = comp.find('FormRenderComponent')
      expect(renderPropComponent.props().Field).toEqual(comp.instance().Field)
    })
    it('should pass extra props', () => {
      const extraProps = { extraBoolean: true, extraString: 'abc', extraNumber: 123 }
      const comp = shallow(<Formz render={FormRenderComponent} onSubmit={jest.fn()} {...extraProps} />)
      const renderPropComponent = comp.find('FormRenderComponent')
      Object.keys(extraProps).forEach(
        propKey => expect(renderPropComponent.props()[propKey]).toEqual(extraProps[propKey])
      )
    })
    it('should pass all Formz props', () => {
      const comp = shallow(<Formz render={FormRenderComponent} onSubmit={jest.fn()} />)
      const renderPropComponent = comp.find('FormRenderComponent')
      Object.keys(formzRenderPropTypes).forEach(
        propKey => expect(renderPropComponent.props()[propKey]).toBeDefined()
      )
    })
  })
})

describe('Formz field', () => {
  const FieldRender = () => <div />
  const FormRenderComponentWithField = ({ Field, withFields }) => (
    <div>
      {withFields && <Field name="test" render={FieldRender} />}
    </div>
  )
  const comp = mount(<Formz render={FormRenderComponentWithField} onSubmit={jest.fn()} withFields={true} />)

  const fieldComponent = comp
    .find('FormRenderComponentWithField')
    .find('Field')
  const fieldRenderComponent = fieldComponent.find('FieldRender')

  describe('registration', () => {
    it('should have field registered', () => {
      expect(Object.keys(comp.state().fields).length).toEqual(1)
      expect(Object.keys(comp.state().fields)[0]).toEqual('test')
      expect(comp.state().fields.test).toMatchObject(initialFieldState)
    })
  })

  describe('props', () => {
    it('should pass field render props to field render prop component', () => {
      Object.keys(fieldRenderPropTypes).forEach(
        propKey => expect(fieldRenderComponent.props()[propKey]).toBeDefined()
      )
    })

    it('should have event handler props from Field component', () => {
      const propsList = ['onChange', 'onFocus', 'onBlur', 'reset']
      propsList.forEach(
        k => expect(fieldRenderComponent.props()[k]).toEqual(fieldComponent.instance()[k])
      )
    })
  })

  describe('manipulate field', () => {
    it('should update field value in Formz', () => {
      fieldRenderComponent.props().onChange('testValue')
      expect(comp.state().fields.test.value).toEqual('testValue')
      expect(comp.state().fields.test.pristine).toBeFalsy()
    })
    it('should set field touched in Formz', () => {
      fieldRenderComponent.props().onBlur()
      expect(comp.state().fields.test.touched).toBeTruthy()
    })
    it('should set field active in Formz', () => {
      fieldRenderComponent.props().onFocus()
      expect(comp.state().fields.test.active).toBeTruthy()
    })
    it('should reset field in Formz', () => {
      fieldRenderComponent.props().reset()
      expect(comp.state().fields.test.value).toEqual('')
      expect(comp.state().fields.test.active).toBeFalsy()
      expect(comp.state().fields.test.touched).toBeFalsy()
      expect(comp.state().fields.test.pristine).toBeTruthy()
    })
  })

  describe('un-register', () => {
    it('should unregister field when Field is unmounted', () => {
      comp.setProps({ withFields: false })
      expect(Object.keys(comp.state().fields).length).toEqual(0)
    })
  })
})

describe('Formz validation', () => {
  describe('custom validatiors', () => {
    const testValidators = {
      startWithA: ({ value }) => value.startsWith('A') || 'Must start with A',
      endWithB: ({ value }) => new Promise((resolve) => {
        setTimeout(() => resolve(value.endsWith('B') || 'Must end with B'), 0)
      })
    }
    const FieldRender = () => <div />
    const FormRenderComponentWithField = ({ Field }) => (
      <div><Field name="test" render={FieldRender} validators={testValidators} /></div>
    )
    const comp = mount(<Formz render={FormRenderComponentWithField} onSubmit={jest.fn()} />)

    const fieldComponent = comp
      .find('FormRenderComponentWithField')
      .find('Field')
    const fieldRenderComponent = fieldComponent.find('FieldRender')

    describe('sync validation', () => {
      it('should run validation on change of field value and fail validation', () => {
        fieldRenderComponent.props().onChange('testValue')
        const testFieldState = comp.state().fields.test
        expect(testFieldState.value).toEqual('testValue')
        expect(testFieldState.valid).toBeFalsy()
        expect(testFieldState.errors.startWithA).toEqual('Must start with A')
      })
      it('should run validation on change of field value and pass validation', () => {
        fieldRenderComponent.props().onChange('A test')
        const testFieldState = comp.state().fields.test
        expect(testFieldState.value).toEqual('A test')
        expect(testFieldState.valid).toBeTruthy()
        expect(Object.keys(testFieldState.errors).length).toEqual(0)
      })
    })

    describe('async validation', () => {
      it('should run validation on change of field value and fail both sync and async validation', () => {
        fieldRenderComponent.props().onChange('testValue')
        const testFieldState = comp.state().fields.test
        expect(testFieldState.value).toEqual('testValue')
        expect(testFieldState.valid).toBeFalsy()
        expect(testFieldState.errors.startWithA).toEqual('Must start with A')
        expect(testFieldState.errors.endWithB).not.toBeDefined()
        setTimeout(() => {
          expect(testFieldState.errors.endWithB).toEqual('Must start with B')
        }, 0)
      })
      it('should run validation on change of field value and pass sync validation and fail async validation', () => {
        fieldRenderComponent.props().onChange('A test')
        const testFieldState = comp.state().fields.test
        expect(testFieldState.value).toEqual('A test')
        expect(testFieldState.valid).toBeTruthy()
        expect(testFieldState.errors.startWithA).not.toBeDefined()
        setTimeout(() => {
          expect(testFieldState.valid).toBeFalsy()
          expect(testFieldState.errors.startWithA).not.toBeDefined()
          expect(testFieldState.errors.endWithB).toEqual('Must start with B')
        }, 0)
      })
      it('should run validation on change of field value and pass both sync and async validation', () => {
        fieldRenderComponent.props().onChange('A test B')
        const testFieldState = comp.state().fields.test
        expect(testFieldState.value).toEqual('A test B')
        expect(testFieldState.valid).toBeTruthy()
        expect(Object.keys(testFieldState.errors).length).toEqual(0)
        setTimeout(() => {
          expect(testFieldState.valid).toBeTruthy()
          expect(Object.keys(testFieldState.errors).length).toEqual(0)
        }, 0)
      })
    })
  })

  describe('onValidation hook', () => {
    const FieldRender = () => <div />
    const FormRenderComponentWithField = ({ Field }) => (
      <div><Field name="test" render={FieldRender} required /></div>
    )
    const comp = mount(<Formz render={FormRenderComponentWithField} onSubmit={jest.fn()} />)

    const fieldComponent = comp
      .find('FormRenderComponentWithField')
      .find('Field')
    const fieldRenderComponent = fieldComponent.find('FieldRender')

    const onValidation = jest.fn()
    comp.setProps({ onValidation })
    fieldRenderComponent.props().onChange('test')
    expect(onValidation).toBeCalledTimes(1)
  })

  describe('built in required validator', () => {
    const FieldRender = () => <div />
    const FormRenderComponentWithField = ({ Field }) => (
      <div><Field name="test" render={FieldRender} required /></div>
    )
    const comp = mount(<Formz render={FormRenderComponentWithField} onSubmit={jest.fn()} />)

    const fieldComponent = comp
      .find('FormRenderComponentWithField')
      .find('Field')
    const fieldRenderComponent = fieldComponent.find('FieldRender')

    const tests = {
      string: { fail: '', pass: 'test' },
      array: { fail: [], pass: ['test'] },
      object: { fail: {}, pass: { test: 'test' } }
    }

    Object.keys(tests).forEach((testKey) => {
      const { fail, pass } = tests[testKey]
      it(`should fail required validation when value is an empty ${testKey}`, () => {
        fieldRenderComponent.props().onChange(fail)
        const testFieldState = comp.state().fields.test
        expect(testFieldState.value).toEqual(fail)
        expect(testFieldState.valid).toBeFalsy()
        expect(testFieldState.errors.required).toBeTruthy()
      })
      it(`should pass required validation when value is a non empty ${testKey}`, () => {
        fieldRenderComponent.props().onChange(pass)
        const testFieldState = comp.state().fields.test
        expect(testFieldState.value).toEqual(pass)
        expect(testFieldState.valid).toBeTruthy()
        expect(testFieldState.errors.required).not.toBeDefined()
      })
    })

    it('should fail required validation when value is null', () => {
      fieldRenderComponent.props().onChange(null)
      const testFieldState = comp.state().fields.test
      expect(testFieldState.value).toEqual(null)
      expect(testFieldState.valid).toBeFalsy()
      expect(testFieldState.errors.required).toBeTruthy()
    })
  })

  describe('validate on init', () => {
    const FieldRender = () => <div />
    const FormRenderComponentWithField = ({ Field }) => (
      <div><Field name="test" render={FieldRender} validateOnInit required /></div>
    )
    const comp = mount(<Formz render={FormRenderComponentWithField} onSubmit={jest.fn()} />)

    const fieldComponent = comp
      .find('FormRenderComponentWithField')
      .find('Field')
    const fieldRenderComponent = fieldComponent.find('FieldRender')

    it('should fail required validation after it is registered', () => {
      const testFieldState = comp.state().fields.test
      expect(testFieldState.value).toEqual('')
      expect(testFieldState.valid).toBeFalsy()
      expect(testFieldState.errors.required).toBeTruthy()
    })
  })
})

describe('Formz parsing and formatting', () => {
  const formatters = [
    jest.fn(({ value }) => (value && (new Date(value)).toISOString()) || value)
  ]
  const parsers = [
    jest.fn(({ value }) => (value && (new Date(value)).getTime()) || value)
  ]
  const FieldRender = () => <div />
  const FormRenderComponentWithField = ({ Field }) => (
    <div><Field name="test" render={FieldRender} formatters={formatters} parsers={parsers} /></div>
  )
  const comp = mount(<Formz render={FormRenderComponentWithField} onSubmit={jest.fn()} />)

  const fieldComponent = comp
    .find('FormRenderComponentWithField')
    .find('Field')
  const fieldRenderComponent = fieldComponent.find('FieldRender')

  fieldRenderComponent.props().onChange(1535019565628)
  const testFieldState = comp.state().fields.test

  it('should have formatted ISO string value and raw unix timestamp value', () => {
    expect(testFieldState.formattedValue).toEqual('2018-08-23T10:19:25.628Z')
    expect(testFieldState.value).toEqual(1535019565628)
  })
  // Calls should be 2 times because it runs once on registration and again on value change
  it('should run formatters', () => {
    expect(testFieldState.formatters[0]).toBeCalled()
    expect(testFieldState.formatters[0]).toBeCalledTimes(2)
  })
  it('should run parsers', () => {
    expect(testFieldState.parsers[0]).toBeCalled()
    expect(testFieldState.parsers[0]).toBeCalledTimes(2)
  })
})

describe('Formz change field value', () => {
  const onValuesChange = jest.fn()
  const FieldRender = () => <div />
  const FormRenderComponentWithField = ({ Field }) => (
    <div><Field name="test" render={FieldRender} /></div>
  )
  const comp = mount(<Formz render={FormRenderComponentWithField} onSubmit={jest.fn()} onValuesChange={onValuesChange} />)

  const fieldComponent = comp
    .find('FormRenderComponentWithField')
    .find('Field')
  const fieldRenderComponent = fieldComponent.find('FieldRender')

  it('should set the field value and call onValuesChanged hook', () => {
    let testFieldState = comp.state().fields.test
    expect(testFieldState.value).toEqual('')
    fieldRenderComponent.props().onChange('testValue')
    testFieldState = comp.state().fields.test // Must get again from .state() to get fresh value
    expect(testFieldState.value).toEqual('testValue')
    expect(onValuesChange).toBeCalledTimes(1)
  })
})

describe('Formz reset form', () => {
  const onReset = jest.fn()
  const FieldRender = () => <div />
  const FormRenderComponentWithField = ({ Field }) => (
    <div><Field name="test" render={FieldRender} /></div>
  )
  const comp = mount(<Formz render={FormRenderComponentWithField} onSubmit={jest.fn()} onReset={onReset} />)

  const formComponentWithField = comp
    .find('FormRenderComponentWithField')
  const fieldComponent = formComponentWithField.find('Field')
  const fieldRenderComponent = fieldComponent.find('FieldRender')

  it('should set the field value and call onValuesChanged hook', () => {
    let testFieldState = comp.state().fields.test
    expect(testFieldState.value).toEqual('')
    expect(comp.state().pristine).toBeTruthy()
    fieldRenderComponent.props().onChange('testValue')
    testFieldState = comp.state().fields.test // Must get again from .state() to get fresh value
    expect(testFieldState.value).toEqual('testValue')
    expect(comp.state().pristine).toBeFalsy()
    formComponentWithField.props().reset()
    testFieldState = comp.state().fields.test // Must get again from .state() to get fresh value
    expect(testFieldState.value).toEqual('')
    expect(comp.state().pristine).toBeTruthy()
    expect(onReset).toBeCalledTimes(1)
  })
})

describe('Formz submit form', () => {
  const onSubmitSync = jest.fn(values => values.test === true)
  const onSubmitSuccess = jest.fn()
  const onSubmitError = jest.fn()
  const onSubmitAsync = jest.fn(values => values.test === true ? Promise.resolve() : Promise.reject(false))
  const FieldRender = () => <div />
  const FormRenderComponentWithField = ({ Field }) => (
    <div><Field name="test" render={FieldRender} /></div>
  )
  const comp = mount(<Formz
    render={FormRenderComponentWithField}
    onSubmit={onSubmitSync}
    onSubmitSuccess={onSubmitSuccess}
    onSubmitError={onSubmitError}
  />)

  const formComponentWithField = comp
    .find('FormRenderComponentWithField')
  const fieldComponent = formComponentWithField.find('Field')
  const fieldRenderComponent = fieldComponent.find('FieldRender')

  describe('sync', () => {
    it('should submit form with values and success', () => {
      fieldRenderComponent.props().onChange(true)
      expect(comp.state().fields.test.value).toBeTruthy()
      formComponentWithField.props().submit()
      expect(comp.state().submitting).toBeTruthy()
      setTimeout(() => {
        expect(comp.state().submitting).toBeFalsy()
        expect(comp.state().submitted).toBeTruthy()
        expect(comp.state().submitSuccess).toBeTruthy()
        expect(onSubmitSync).toBeCalledTimes(1)
        expect(onSubmitSync).toBeCalledWith({ test: true })
        expect(onSubmitSuccess).toBeCalledTimes(1)
        expect(onSubmitSuccess).toBeCalledWith({ test: true })
        expect(onSubmitError).not.toBeCalled()
      }, 0)
    })

    it('should submit form with values and fail', () => {
      fieldRenderComponent.props().onChange(false)
      expect(comp.state().fields.test.value).toBeFalsy()
      formComponentWithField.props().submit()
      expect(comp.state().submitting).toBeTruthy()
      setTimeout(() => {
        expect(comp.state().submitting).toBeFalsy()
        expect(comp.state().submitted).toBeTruthy()
        expect(comp.state().submitSuccess).toBeFalsy()
        expect(onSubmitSync).toBeCalledTimes(1)
        expect(onSubmitSync).toBeCalledWith({ test: true })
        expect(onSubmitError).toBeCalledTimes(1)
        expect(onSubmitError).toBeCalledWith(false)
        expect(onSubmitSuccess).not.toBeCalled()
      }, 0)
    })
  })

  describe('async', () => {
    onSubmitSuccess.mockClear()
    onSubmitError.mockClear()
    comp.setProps({ onSubmit: onSubmitAsync })
    it('should submit form with values and success', () => {
      fieldRenderComponent.props().onChange(true)
      expect(comp.state().fields.test.value).toBeTruthy()
      formComponentWithField.props().submit()
      expect(comp.state().submitting).toBeTruthy()
      setTimeout(() => {
        expect(comp.state().submitting).toBeFalsy()
        expect(comp.state().submitted).toBeTruthy()
        expect(comp.state().submitSuccess).toBeTruthy()
        expect(onSubmitAsync).toBeCalledTimes(1)
        expect(onSubmitAsync).toBeCalledWith({ test: true })
        expect(onSubmitSuccess).toBeCalledTimes(1)
        expect(onSubmitSuccess).toBeCalledWith({ test: true })
        expect(onSubmitError).not.toBeCalled()
      }, 0)
    })

    it('should submit form with values and fail', () => {
      fieldRenderComponent.props().onChange(false)
      expect(comp.state().fields.test.value).toBeFalsy()
      formComponentWithField.props().submit()
      expect(comp.state().submitting).toBeTruthy()
      setTimeout(() => {
        expect(comp.state().submitting).toBeFalsy()
        expect(comp.state().submitted).toBeTruthy()
        expect(comp.state().submitSuccess).toBeFalsy()
        expect(onSubmitAsync).toBeCalledTimes(1)
        expect(onSubmitAsync).toBeCalledWith({ test: true })
        expect(onSubmitError).toBeCalledTimes(1)
        expect(onSubmitError).toBeCalledWith(false)
        expect(onSubmitSuccess).not.toBeCalled()
      }, 0)
    })
  })
})
