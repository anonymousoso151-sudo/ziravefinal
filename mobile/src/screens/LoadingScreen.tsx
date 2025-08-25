import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const LoadingScreen: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2E7D32" />
      <Text style={styles.text}>{t('common.loading')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
  },
});

export default LoadingScreen;