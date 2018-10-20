import { configure } from 'enzyme'
import enzymeSerializer from 'enzyme-to-json/serializer'
import Adapter from 'enzyme-adapter-react-16'
configure({ adapter: new Adapter() })
expect.addSnapshotSerializer(enzymeSerializer)
