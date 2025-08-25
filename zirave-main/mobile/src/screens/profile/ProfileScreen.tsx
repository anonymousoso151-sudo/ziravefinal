import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState, AppDispatch } from '../../store';
import { signOut } from '../../store/slices/authSlice';
import { MainStackParamList } from '../../navigation/MainNavigator';

type ProfileScreenNavigationProp = StackNavigationProp<MainStackParamList>;

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: () => dispatch(signOut())
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('profile.title')}</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Icon name="person" size={64} color="#2E7D32" />
        </View>
        
        <Text style={styles.userName}>
          {profile?.full_name || 'Kullanıcı'}
        </Text>
        
        <Text style={styles.userRole}>
          {profile?.role ? t(`profile.roles.${profile.role}`) : 'Rol belirtilmemiş'}
        </Text>
        
        <Text style={styles.userPhone}>
          {user?.phone || 'Telefon belirtilmemiş'}
        </Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="edit" size={24} color="#757575" />
          <Text style={styles.menuItemText}>{t('profile.editProfile')}</Text>
          <Icon name="chevron-right" size={24} color="#757575" />
        </TouchableOpacity>

        {profile?.role === 'SUPPLIER' && (
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('MyProducts')}
          >
            <Icon name="store" size={24} color="#757575" />
            <Text style={styles.menuItemText}>{t('marketplace.myProducts')}</Text>
            <Icon name="chevron-right" size={24} color="#757575" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="settings" size={24} color="#757575" />
          <Text style={styles.menuItemText}>Ayarlar</Text>
          <Icon name="chevron-right" size={24} color="#757575" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="help" size={24} color="#757575" />
          <Text style={styles.menuItemText}>Yardım</Text>
          <Icon name="chevron-right" size={24} color="#757575" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="logout" size={24} color="#ffffff" />
        <Text style={styles.logoutButtonText}>{t('profile.logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#2E7D32',
    marginBottom: 8,
  },
  userPhone: {
    fontSize: 14,
    color: '#757575',
  },
  menuSection: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    marginLeft: 16,
  },
  logoutButton: {
    backgroundColor: '#D32F2F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    paddingVertical: 16,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;