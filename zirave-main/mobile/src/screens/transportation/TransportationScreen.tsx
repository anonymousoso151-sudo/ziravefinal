import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState } from '../../store';
import { supabase } from '../../lib/supabase';

interface ShipmentRequest {
  id: string;
  title: string;
  description: string;
  pickup_location: string;
  dropoff_location: string;
  cargo_weight_kg: number;
  cargo_volume_m3: number;
  preferred_pickup_date: string;
  max_budget: number;
  status: 'OPEN' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  created_at: string;
}

interface ShipmentBid {
  id: string;
  shipment_request_id: string;
  driver_id: string;
  bid_amount: number;
  estimated_pickup_date: string;
  estimated_delivery_date: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  driver_profile: {
    full_name: string;
    phone: string;
  };
}

const TransportationScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'requests' | 'create'>('requests');
  const [shipmentRequests, setShipmentRequests] = useState<ShipmentRequest[]>([]);
  const [shipmentBids, setShipmentBids] = useState<{ [key: string]: ShipmentBid[] }>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user, profile } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();

  useEffect(() => {
    if (user?.id) {
      fetchShipmentRequests();
    }
  }, [user?.id]);

  const fetchShipmentRequests = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Fetch user's shipment requests
      const { data: requests, error: requestsError } = await supabase
        .from('shipment_requests')
        .select('*')
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;
      setShipmentRequests(requests || []);

      // Fetch bids for each request
      if (requests && requests.length > 0) {
        const requestIds = requests.map(r => r.id);
        const { data: bids, error: bidsError } = await supabase
          .from('shipment_bids')
          .select(`
            *,
            driver_profile:profiles!shipment_bids_driver_id_fkey(full_name, phone)
          `)
          .in('shipment_request_id', requestIds)
          .order('created_at', { ascending: false });

        if (bidsError) throw bidsError;

        // Group bids by shipment request ID
        const groupedBids: { [key: string]: ShipmentBid[] } = {};
        bids?.forEach(bid => {
          if (!groupedBids[bid.shipment_request_id]) {
            groupedBids[bid.shipment_request_id] = [];
          }
          groupedBids[bid.shipment_request_id].push(bid);
        });
        setShipmentBids(groupedBids);
      }
    } catch (error) {
      console.error('Error fetching shipment data:', error);
      Alert.alert('Hata', 'Nakliye verileri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchShipmentRequests();
    setRefreshing(false);
  };

  const handleAcceptBid = async (bidId: string, shipmentRequestId: string) => {
    try {
      const { error } = await supabase
        .from('shipment_bids')
        .update({ status: 'ACCEPTED' })
        .eq('id', bidId);

      if (error) throw error;

      Alert.alert('Başarılı', 'Teklif kabul edildi');
      fetchShipmentRequests();
    } catch (error) {
      console.error('Error accepting bid:', error);
      Alert.alert('Hata', 'Teklif kabul edilirken hata oluştu');
    }
  };

  const handleRejectBid = async (bidId: string) => {
    try {
      const { error } = await supabase
        .from('shipment_bids')
        .update({ status: 'REJECTED' })
        .eq('id', bidId);

      if (error) throw error;

      Alert.alert('Başarılı', 'Teklif reddedildi');
      fetchShipmentRequests();
    } catch (error) {
      console.error('Error rejecting bid:', error);
      Alert.alert('Hata', 'Teklif reddedilirken hata oluştu');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return '#2196F3';
      case 'ASSIGNED': return '#FF9800';
      case 'IN_TRANSIT': return '#9C27B0';
      case 'DELIVERED': return '#4CAF50';
      case 'CANCELLED': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Açık';
      case 'ASSIGNED': return 'Atandı';
      case 'IN_TRANSIT': return 'Yolda';
      case 'DELIVERED': return 'Teslim Edildi';
      case 'CANCELLED': return 'İptal Edildi';
      default: return status;
    }
  };

  const getBidStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#FF9800';
      case 'ACCEPTED': return '#4CAF50';
      case 'REJECTED': return '#F44336';
      case 'WITHDRAWN': return '#757575';
      default: return '#757575';
    }
  };

  const getBidStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Bekliyor';
      case 'ACCEPTED': return 'Kabul Edildi';
      case 'REJECTED': return 'Reddedildi';
      case 'WITHDRAWN': return 'Geri Çekildi';
      default: return status;
    }
  };

  const renderShipmentRequest = (request: ShipmentRequest) => {
    const bids = shipmentBids[request.id] || [];
    const pendingBids = bids.filter(bid => bid.status === 'PENDING');
    const acceptedBid = bids.find(bid => bid.status === 'ACCEPTED');

    return (
      <View key={request.id} style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <Text style={styles.requestTitle}>{request.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
            <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
          </View>
        </View>

        <Text style={styles.requestDescription}>{request.description}</Text>
        
        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <Icon name="my-location" size={16} color="#4CAF50" />
            <Text style={styles.locationText}>Alış: {request.pickup_location}</Text>
          </View>
          <View style={styles.locationRow}>
            <Icon name="location-on" size={16} color="#F44336" />
            <Text style={styles.locationText}>Varış: {request.dropoff_location}</Text>
          </View>
        </View>

        <View style={styles.requestDetails}>
          <Text style={styles.detailText}>Ağırlık: {request.cargo_weight_kg} kg</Text>
          <Text style={styles.detailText}>Hacim: {request.cargo_volume_m3} m³</Text>
          <Text style={styles.detailText}>Bütçe: ₺{request.max_budget?.toLocaleString()}</Text>
        </View>

        {/* Bids Section */}
        {bids.length > 0 && (
          <View style={styles.bidsSection}>
            <Text style={styles.bidsTitle}>
              Teklifler ({bids.length}) {pendingBids.length > 0 && `• ${pendingBids.length} bekliyor`}
            </Text>
            
            {acceptedBid && (
              <View style={[styles.bidCard, styles.acceptedBidCard]}>
                <View style={styles.bidHeader}>
                  <Text style={styles.bidDriverName}>{acceptedBid.driver_profile.full_name}</Text>
                  <View style={[styles.bidStatusBadge, { backgroundColor: getBidStatusColor(acceptedBid.status) }]}>
                    <Text style={styles.bidStatusText}>{getBidStatusText(acceptedBid.status)}</Text>
                  </View>
                </View>
                <Text style={styles.bidAmount}>₺{acceptedBid.bid_amount.toLocaleString()}</Text>
                <Text style={styles.bidMessage}>{acceptedBid.message}</Text>
              </View>
            )}

            {pendingBids.slice(0, 3).map(bid => (
              <View key={bid.id} style={styles.bidCard}>
                <View style={styles.bidHeader}>
                  <Text style={styles.bidDriverName}>{bid.driver_profile.full_name}</Text>
                  <View style={[styles.bidStatusBadge, { backgroundColor: getBidStatusColor(bid.status) }]}>
                    <Text style={styles.bidStatusText}>{getBidStatusText(bid.status)}</Text>
                  </View>
                </View>
                <Text style={styles.bidAmount}>₺{bid.bid_amount.toLocaleString()}</Text>
                {bid.message && <Text style={styles.bidMessage}>{bid.message}</Text>}
                
                {bid.status === 'PENDING' && request.status === 'OPEN' && (
                  <View style={styles.bidActions}>
                    <TouchableOpacity
                      style={[styles.bidActionButton, styles.acceptButton]}
                      onPress={() => handleAcceptBid(bid.id, request.id)}
                    >
                      <Text style={styles.bidActionText}>Kabul Et</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.bidActionButton, styles.rejectButton]}
                      onPress={() => handleRejectBid(bid.id)}
                    >
                      <Text style={styles.bidActionText}>Reddet</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {bids.length === 0 && request.status === 'OPEN' && (
          <View style={styles.noBidsContainer}>
            <Text style={styles.noBidsText}>Henüz teklif alınmadı</Text>
          </View>
        )}
      </View>
    );
  };

  const renderCreateForm = () => (
    <View style={styles.createFormContainer}>
      <View style={styles.comingSoonContainer}>
        <Icon name="build" size={64} color="#E0E0E0" />
        <Text style={styles.comingSoonTitle}>Nakliye Talebi Oluştur</Text>
        <Text style={styles.comingSoonDescription}>
          Bu özellik yakında aktif olacak. Nakliye taleplerini oluşturmak ve 
          sürücülerden teklif almak için form arayüzü geliştirilmektedir.
        </Text>
        <View style={styles.featureList}>
          <Text style={styles.featureItem}>• Alış ve varış noktası seçimi</Text>
          <Text style={styles.featureItem}>• Kargo detayları (ağırlık, hacim)</Text>
          <Text style={styles.featureItem}>• Tercih edilen tarih seçimi</Text>
          <Text style={styles.featureItem}>• Maksimum bütçe belirleme</Text>
          <Text style={styles.featureItem}>• Otomatik sürücü eşleştirme</Text>
        </View>
      </View>
    </View>
  );

  if (loading && shipmentRequests.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Nakliye</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Nakliye verileri yükleniyor...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nakliye</Text>
        <Text style={styles.subtitle}>Kargo ve nakliye yönetimi</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Icon 
            name="list" 
            size={20} 
            color={activeTab === 'requests' ? '#2E7D32' : '#757575'} 
          />
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Taleplerim ({shipmentRequests.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'create' && styles.activeTab]}
          onPress={() => setActiveTab('create')}
        >
          <Icon 
            name="add" 
            size={20} 
            color={activeTab === 'create' ? '#2E7D32' : '#757575'} 
          />
          <Text style={[styles.tabText, activeTab === 'create' && styles.activeTabText]}>
            Yeni Talep
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2E7D32']}
            tintColor="#2E7D32"
          />
        }
      >
        {activeTab === 'requests' ? (
          shipmentRequests.length > 0 ? (
            shipmentRequests.map(renderShipmentRequest)
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="local-shipping" size={64} color="#E0E0E0" />
              <Text style={styles.emptyTitle}>Henüz nakliye talebiniz yok</Text>
              <Text style={styles.emptyDescription}>
                İlk nakliye talebinizi oluşturmak için "Yeni Talep" sekmesini kullanın
              </Text>
            </View>
          )
        ) : (
          renderCreateForm()
        )}
      </ScrollView>
    </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2E7D32',
  },
  tabText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 16,
  },
  requestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  requestDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 20,
  },
  locationContainer: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  requestDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailText: {
    fontSize: 12,
    color: '#757575',
  },
  bidsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
  },
  bidsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  bidCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  acceptedBidCard: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  bidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bidDriverName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  bidStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  bidStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  bidAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  bidMessage: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  bidActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bidActionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  bidActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  noBidsContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  noBidsText: {
    fontSize: 14,
    color: '#9E9E9E',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
  },
  createFormContainer: {
    flex: 1,
  },
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 12,
  },
  comingSoonDescription: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  featureList: {
    alignSelf: 'stretch',
  },
  featureItem: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default TransportationScreen;