/**
 * @format
 */
import * as ReactNative from 'react-native';
if (!ReactNative.codegenNativeComponent) {
  try {
    ReactNative.codegenNativeComponent = require('react-native/Libraries/Utilities/codegenNativeComponent').default;
  } catch (e) {}
}
import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('NexoraMart', () => App);

