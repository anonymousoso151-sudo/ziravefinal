import React from 'react';
import { Platform } from 'react-native';

interface PickerProps {
  selectedValue?: string | number;
  onValueChange?: (value: string | number) => void;
  children: React.ReactNode;
  style?: any;
  enabled?: boolean;
}

const PlatformPicker: React.FC<PickerProps> = ({ 
  selectedValue, 
  onValueChange, 
  children, 
  style, 
  enabled = true 
}) => {
  if (Platform.OS === 'web') {
    // Web implementation using HTML select
    return (
      <select
        value={selectedValue}
        onChange={(e) => onValueChange?.(e.target.value)}
        style={{
          padding: 8,
          border: '1px solid #ccc',
          borderRadius: 4,
          fontSize: 16,
          ...style,
        }}
        disabled={!enabled}
      >
        {children}
      </select>
    );
  }

  // Native implementation
  const { Picker } = require('@react-native-picker/picker');
  return (
    <Picker
      selectedValue={selectedValue}
      onValueChange={onValueChange}
      style={style}
      enabled={enabled}
    >
      {children}
    </Picker>
  );
};

export default PlatformPicker;
