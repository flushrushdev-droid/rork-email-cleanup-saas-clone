// Storybook configuration for React Native (native platforms only)
// This file is only loaded on iOS/Android, not on web

import { getStorybookUI, configure } from '@storybook/react-native';

// Addons are currently disabled due to compatibility issues with manager-api
// Storybook will work fine without them - you can still view and interact with stories
// import './rn-addons';

// Import stories
configure(() => {
  require('../components/common/AppText.stories');
  require('../components/common/StatCard.stories');
  require('../components/common/EmptyState.stories');
  require('../components/common/Avatar.stories');
}, module);

const StorybookUIRoot = getStorybookUI({
  asyncStorage: require('@react-native-async-storage/async-storage').default,
});

export default StorybookUIRoot;

