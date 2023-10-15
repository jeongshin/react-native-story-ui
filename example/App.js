import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import App from './src/App';

export default () => {
  return (
    <SafeAreaProvider>
      <App />
    </SafeAreaProvider>
  );
};
