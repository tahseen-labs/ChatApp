import React from 'react';
import ImageView from 'react-native-image-viewing';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ChatStackParamList } from '../../types/index';

type Props = NativeStackScreenProps<ChatStackParamList, 'ImageViewer'>;

export const ImageViewerScreen: React.FC<Props> = ({ route, navigation }) => {
  const { imageUrl } = route.params;

  return (
    <ImageView
      images={[{ uri: imageUrl }]}
      imageIndex={0}
      visible
      onRequestClose={() => navigation.goBack()}
      swipeToCloseEnabled
      doubleTapToZoomEnabled
    />
  );
};
