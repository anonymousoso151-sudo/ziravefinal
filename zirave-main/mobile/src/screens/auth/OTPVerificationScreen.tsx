import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootState, AppDispatch } from '../../store';
import { verifyOTP, sendOTP, clearError, resetOtpSent } from '../../store/slices/authSlice';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type OTPVerificationScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'OTPVerification'>;
type OTPVerificationScreenRouteProp = RouteProp<AuthStackParamList, 'OTPVerification'>;

interface Props {
  navigation: OTPVerificationScreenNavigationProp;
  route: OTPVerificationScreenRouteProp;
}

const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, profile } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();
  const { phone } = route.params;

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (profile === null && !loading) {
      // User exists but profile is not set up
      navigation.navigate('ProfileSetup');
    }
  }, [profile, loading, navigation]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert(t('common.error'), t('auth.invalidOTP'));
      return;
    }

    try {
      await dispatch(verifyOTP({ phone, token: otp })).unwrap();
      // Navigation will be handled by the auth state change
    } catch (error) {
      Alert.alert(t('common.error'), t('auth.verificationFailed'));
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    try {
      await dispatch(sendOTP(phone)).unwrap();
      setCountdown(60);
      setOtp('');
      dispatch(resetOtpSent());
    } catch (error) {
      Alert.alert(t('common.error'), t('auth.loginFailed'));
    }
  };

  React.useEffect(() => {
    if (error) {
      Alert.alert(t('common.error'), error);
      dispatch(clearError());
    }
  }, [error, dispatch, t]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.verificationCode')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.otpSent', { phone })}
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.otpInput}
            placeholder={t('auth.verificationCodePlaceholder')}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            textAlign="center"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? t('common.loading') : t('auth.verify')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resendButton, countdown > 0 && styles.resendButtonDisabled]}
            onPress={handleResendOTP}
            disabled={countdown > 0}
          >
            <Text style={[styles.resendButtonText, countdown > 0 && styles.resendButtonTextDisabled]}>
              {countdown > 0 
                ? `${t('auth.resendCode')} (${countdown}s)`
                : t('auth.resendCode')
              }
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
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
  otpInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    letterSpacing: 8,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: '#757575',
  },
});

export default OTPVerificationScreen;