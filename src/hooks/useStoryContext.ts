import { useContext } from 'react';
import { StoryContext } from '../context';

export function useStoryContext() {
  const context = useContext(StoryContext);

  if (!context) {
    throw new Error(
      '[react-native-story-ui] You must use useStoryContext inside a <Story>'
    );
  }

  return context;
}
