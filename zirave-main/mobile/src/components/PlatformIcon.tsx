import React from 'react';
import { Platform } from 'react-native';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

const PlatformIcon: React.FC<IconProps> = ({ name, size = 24, color = '#000', style }) => {
  if (Platform.OS === 'web') {
    // Web implementation - you can use any web icon library here
    return (
      <span
        style={{
          fontSize: size,
          color: color,
          ...style,
        }}
      >
        {name}
      </span>
    );
  }

  // Native implementation
  const Icon = require('react-native-vector-icons/MaterialIcons').default;
  return <Icon name={name} size={size} color={color} style={style} />;
};

export default PlatformIcon;
