import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProductDetailScreen: React.FC = () => {
  const { t } = useTranslation();

  // This is a placeholder - in real implementation, you'd fetch product details
  const product = {
    id: '1',
    name: 'Organik Domates',
    description: 'Taze, organik domates. Pestisit kullanılmadan yetiştirilmiştir.',
    price: 15,
    category: 'Sebze',
    image_url: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg',
    supplier_name: 'Ahmet Çiftçi',
  };

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: product.image_url }} style={styles.productImage} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>₺{product.price.toLocaleString()}</Text>
        </View>

        <Text style={styles.productCategory}>{product.category}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Açıklama</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Satıcı</Text>
          <Text style={styles.supplierName}>{product.supplier_name}</Text>
        </View>

        <TouchableOpacity style={styles.contactButton}>
          <Icon name="chat" size={20} color="#ffffff" style={styles.buttonIcon} />
          <Text style={styles.contactButtonText}>{t('marketplace.contactSeller')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  productImage: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productName: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 16,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  productCategory: {
    fontSize: 14,
    color: '#9E9E9E',
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 16,
    color: '#757575',
    lineHeight: 24,
  },
  supplierName: {
    fontSize: 16,
    color: '#333333',
  },
  contactButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonIcon: {
    marginRight: 8,
  },
  contactButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductDetailScreen;