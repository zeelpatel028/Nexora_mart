/**
 * Patch React Native 0.75 index.js to export codegenNativeComponent.
 * react-native-svg and other modern libraries import codegenNativeComponent from 'react-native'.
 */
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'node_modules', 'react-native', 'index.js');
if (fs.existsSync(targetFile)) {
  let content = fs.readFileSync(targetFile, 'utf8');
  if (!content.includes('codegenNativeComponent():')) {
    const target = 'return require(\'./Libraries/ReactNative/requireNativeComponent\').default;\n  },';
    const replacement = 'return require(\'./Libraries/ReactNative/requireNativeComponent\').default;\n  },\n  get codegenNativeComponent(): any {\n    return require(\'./Libraries/Utilities/codegenNativeComponent\').default;\n  },';
    if (content.includes(target)) {
      content = content.replace(target, replacement);
      fs.writeFileSync(targetFile, content, 'utf8');
      console.log('Successfully patched react-native/index.js with codegenNativeComponent export');
    }
  }
}

