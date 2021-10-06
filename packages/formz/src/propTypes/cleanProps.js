import fieldRenderPropTypes from './fieldRenderPropTypes'
import formzRenderPropTypes from './formzRenderPropTypes'

const cleanProps = (...args) => {
  const props = args.shift()
  const propTypes = args.reduce((finalPropTypes, propType) => ({ ...finalPropTypes, ...propType }), {})
  const propTypesKeys = Object.keys(propTypes)
  return Object.keys(props).reduce((finalProps, prop) => {
    if (propTypesKeys.includes(prop)) return finalProps
    return { ...finalProps, [prop]: props[prop] }
  }, {})
}

export const cleanFieldRenderPropTypes = (props) => cleanProps(props, fieldRenderPropTypes)

export const cleanFormzRenderPropTypes = (props) => cleanProps(props, formzRenderPropTypes)

export default cleanProps
