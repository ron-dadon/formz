import React from 'react'
import './init'
import { shallow } from 'enzyme'
import fieldComponentFactory from '../src/components/Field'

const FieldRenderComponent = () => <div />

const formzFunctions = {
  registerField: jest.fn(),
  unregisterField: jest.fn(),
  isRegistered: jest.fn(() => true),
  resetField: jest.fn(),
  updateField: jest.fn(),
  updateFieldValue: jest.fn(),
  setFieldTouched: jest.fn(),
  setFieldActive: jest.fn(),
  getField: jest.fn(() => ({})),
  formValues: jest.fn(() => ({ a: 1 })),
  getFormState: jest.fn(() => ({})),
  submit: jest.fn(),
  reset: jest.fn()
}

const Field = fieldComponentFactory(formzFunctions)

describe('Field component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderField = (props) => shallow(<Field name='test' render={FieldRenderComponent} {...props} />)

  it('should call registerField on componentDidMount', () => {
    renderField()
    expect(formzFunctions.registerField).toHaveBeenCalled()
  })

  it('should call updateField on componentDidUpdate', () => {
    const comp = renderField()
    comp.setProps({ newProp: true })
    expect(formzFunctions.updateField).toHaveBeenCalled()
  })

  it('should call unregisterField on componentWillUnmount', () => {
    const comp = renderField()
    comp.unmount()
    expect(formzFunctions.unregisterField).toHaveBeenCalled()
  })

  it('should check if registered when rendering', () => {
    renderField()
    expect(formzFunctions.isRegistered).toHaveBeenCalledWith('test')
  })

  it('should call getField when rendering', () => {
    renderField()
    expect(formzFunctions.getField).toHaveBeenCalledWith('test')
  })

  it('should render FieldRenderComponent', () => {
    const comp = renderField()
    expect(comp.find('FieldRenderComponent').length).toEqual(1)
  })

  describe('Field injected props', () => {
    const comp = renderField()
    const compInstance = comp.instance()
    const renderedComponent = comp.find('FieldRenderComponent').get(0)

    it('should pass field properties', () => {
      expect(renderedComponent.props.onChange).toBe(compInstance.onChange)
      expect(renderedComponent.props.onFocus).toBe(compInstance.onFocus)
      expect(renderedComponent.props.onBlur).toBe(compInstance.onBlur)
      expect(renderedComponent.props.reset).toBe(compInstance.reset)
    })
  })

  describe('Field update value', () => {
    const comp = renderField({ synthetic: true })
    const compInstance = comp.instance()

    it('should call updateFieldValue with synthetic event', () => {
      compInstance.onChange({ target: { value: 'test' } })
      expect(formzFunctions.updateFieldValue).toHaveBeenCalledWith({ name: 'test', value: 'test' })
    })

    it('should call updateFieldValue with synthetic event custom key', () => {
      comp.setProps({ synthetic: 'checked' })
      compInstance.onChange({ target: { checked: true } })
      expect(formzFunctions.updateFieldValue).toHaveBeenCalledWith({ name: 'test', value: true })
    })

    it('should call updateFieldValue without synthetic event', () => {
      comp.setProps({ synthetic: false })
      compInstance.onChange('test')
      expect(formzFunctions.updateFieldValue).toHaveBeenCalledWith({ name: 'test', value: 'test' })
    })
  })
})
