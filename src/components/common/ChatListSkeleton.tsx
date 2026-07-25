import React from 'react';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useTheme } from '../../theme/index';

export const ChatListSkeleton: React.FC = () => {
  const { isDark } = useTheme();
  return (
    <SkeletonPlaceholder
      backgroundColor={isDark ? '#2A3942' : '#E1E4E8'}
      highlightColor={isDark ? '#3A4A54' : '#F2F4F5'}
    >
      <SkeletonPlaceholder.Item>
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonPlaceholder.Item
            key={i}
            flexDirection="row"
            alignItems="center"
            paddingHorizontal={16}
            paddingVertical={10}
          >
            <SkeletonPlaceholder.Item
              width={54}
              height={54}
              borderRadius={27}
            />
            <SkeletonPlaceholder.Item marginLeft={12}>
              <SkeletonPlaceholder.Item
                width={160}
                height={16}
                borderRadius={4}
              />
              <SkeletonPlaceholder.Item
                marginTop={8}
                width={220}
                height={12}
                borderRadius={4}
              />
            </SkeletonPlaceholder.Item>
          </SkeletonPlaceholder.Item>
        ))}
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};
