import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState, AppDispatch } from '../../store';
import { fetchMyProducts } from '../../store/slices/marketplaceSlice';
import { Product } from '../../lib/supabase';
import { MainStackParamList } from '../../navigation/MainNavigator';

type MyProductsScreenNavigationProp = StackNavigationProp<MainStackParamList>;

const MyProductsScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<MyProductsScreenNavigationProp>();
  const { myProducts, loading } = useSelector((state: RootState) => state.marketplace);
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchMyProducts(user.id));
    }
  }, [dispatch, user?.id]);

  const onRefresh = React.useCallback(async () => {
    if (!user?.id) return;
    setRefreshing(true);
    await dispatch(fetchMyProducts(user.id));
    setRefreshing(false);
  }, [dispatch, user?.id]);

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      'Ürünü Sil',
      'Bu ürünü silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement delete product functionality
            console.log('Delete product:', productId);
          }
        },
      ]
    );
  };

  const handleToggleActive = (productId: string, currentStatus: boolean) => {
    // TODO: Implement toggle active status
    console.log('Toggle active status:', productId, !currentStatus);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        {item.image_url ? (
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name="image" size={32} color="#E0E0E0" />
          </View>
        )}
        
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
        </View>

        <View style={styles.productActions}>
          <TouchableOpacity
            style={[styles.statusButton, item.is_active ? styles.activeButton : styles.inactiveButton]}
            onPress={() => handleToggleActive(item.id, item.is_active)}
          >
            <Text style={[styles.statusButtonText, item.is_active ? styles.activeButtonText : styles.inactiveButtonText]}>
              {item.is_active ? 'Aktif' : 'Pasif'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => console.log('Edit product:', item.id)}
          >
            <Icon name="edit" size={20} color="#757575" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteProduct(item.id)}
          >
            <Icon name="delete" size={20} color="#D32F2F" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading && myProducts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('marketplace.myProducts')}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('marketplace.myProducts')}</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Icon name="add" size={24} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={myProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2E7D32']}
            tintColor="#2E7D32"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="store" size={64} color="#E0E0E0" />
            <Text style={styles.emptyText}>Henüz ürününüz bulunmuyor</Text>
            <Text style={styles.emptySubtext}>
              İlk ürününüzü ekleyerek satışa başlayın
            </Text>
            <TouchableOpacity 
              style={styles.addFirstProductButton}
              onPress={() => navigation.navigate('AddProduct')}
            >
              <Icon name="add" size={20} color="#ffffff" style={styles.buttonIcon} />
              <Text style={styles.addFirstProductButtonText}>
                {t('marketplace.addFirstProduct')}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  productList: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#9E9E9E',
    textTransform: 'uppercase',
  },
  productActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  activeButton: {
    backgroundColor: '#E8F5E8',
  },
  inactiveButton: {
    backgroundColor: '#FFF3E0',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeButtonText: {
    color: '#2E7D32',
  },
  inactiveButtonText: {
    color: '#F57C00',
  },
  actionButton: {
    padding: 8,
    marginBottom: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#757575',
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  addFirstProductButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  addFirstProductButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyProductsScreen;