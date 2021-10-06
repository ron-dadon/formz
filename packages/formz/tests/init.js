import { configure } from 'enzyme'
import enzymeSerializer from 'enzyme-to-json/serializer'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
configure({ adapter: new Adapter() })
expect.addSnapshotSerializer(enzymeSerializer)
