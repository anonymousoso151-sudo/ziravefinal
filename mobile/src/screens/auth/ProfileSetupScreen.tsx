import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../../store';
import { updateProfile } from '../../store/slices/authSlice';

const ProfileSetupScreen: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'FARMER' | 'SUPPLIER' | 'WORKER' | 'ENGINEER'>('FARMER');
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert(t('common.error'), 'Lütfen adınızı ve soyadınızı giriniz');
      return;
    }

    if (!user) return;

    try {
      await dispatch(updateProfile({
        id: user.id,
        full_name: fullName.trim(),
        role: role,
        phone: user.phone || '',
      })).unwrap();
    } catch (error) {
      Alert.alert(t('common.error'), 'Profil kaydedilemedi');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('profile.editProfile')}</Text>
          <Text style={styles.subtitle}>Profilinizi tamamlayın</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('profile.fullName')}</Text>
            <TextInput
              style={styles.input}
              placeholder="Adınız ve soyadınız"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('profile.role')}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={role}
                onValueChange={(itemValue) => setRole(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label={t('profile.roles.FARMER')} value="FARMER" />
                <Picker.Item label={t('profile.roles.SUPPLIER')} value="SUPPLIER" />
                <Picker.Item label={t('profile.roles.WORKER')} value="WORKER" />
                <Picker.Item label={t('profile.roles.ENGINEER')} value="ENGINEER" />
              </Picker>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSaveProfile}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? t('common.loading') : t('common.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileSetupScreen;