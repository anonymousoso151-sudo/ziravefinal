import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState } from '../../store';

interface DiagnosisResult {
  diagnosis_id: string;
  plant_type: string;
  detected_issues: Array<{
    name: string;
    symptoms: string[];
    treatment: string;
    confidence: number;
  }>;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    priority: string;
  }>;
  confidence: number;
  timestamp: string;
}

const DiagnosticsScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleImageUpload = async () => {
    // TODO: Implement actual image picker
    Alert.alert(
      'Fotoğraf Seç',
      'Bitki fotoğrafı seçme özelliği yakında aktif olacak',
      [
        {
          text: 'Kameradan Çek',
          onPress: () => mockImageDiagnosis('camera')
        },
        {
          text: 'Galeriden Seç',
          onPress: () => mockImageDiagnosis('gallery')
        },
        {
          text: 'İptal',
          style: 'cancel'
        }
      ]
    );
  };

  const mockImageDiagnosis = async (source: 'camera' | 'gallery') => {
    setIsLoading(true);
    setSelectedImage('https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg'); // Mock image
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock diagnosis result
      const mockResult: DiagnosisResult = {
        diagnosis_id: `diag_${Date.now()}`,
        plant_type: 'Domates',
        detected_issues: [
          {
            name: 'Alternaria Yaprak Lekesi',
            symptoms: ['Kahverengi lekeler', 'Yaprak sararması', 'Yaprak dökülmesi'],
            treatment: 'Fungisit uygulaması ve sulama düzeni ayarlaması önerilir',
            confidence: 0.85
          }
        ],
        recommendations: [
          {
            type: 'treatment',
            title: 'Acil Müdahale',
            description: 'Etkilenen yaprakları temizleyin ve fungisit uygulayın',
            priority: 'high'
          },
          {
            type: 'prevention',
            title: 'Önleyici Tedbirler',
            description: 'Sulama sıklığını azaltın ve havalandırmayı artırın',
            priority: 'medium'
          },
          {
            type: 'monitoring',
            title: 'İzleme',
            description: 'Haftalık kontroller yapın ve gelişimi takip edin',
            priority: 'low'
          }
        ],
        confidence: 0.85,
        timestamp: new Date().toISOString()
      };
      
      setDiagnosisResult(mockResult);
    } catch (error) {
      Alert.alert('Hata', 'Teşhis işlemi başarısız oldu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSymptomDiagnosis = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResult: DiagnosisResult = {
        diagnosis_id: `symptom_diag_${Date.now()}`,
        plant_type: 'Genel Bitki',
        detected_issues: [
          {
            name: 'Beslenme Eksikliği',
            symptoms: ['Yaprak sararması', 'Büyüme geriliği'],
            treatment: 'Dengeli gübre uygulaması yapın',
            confidence: 0.78
          }
        ],
        recommendations: [
          {
            type: 'fertilizer',
            title: 'Gübre Önerisi',
            description: 'NPK gübresi ile beslenme desteği sağlayın',
            priority: 'high'
          }
        ],
        confidence: 0.78,
        timestamp: new Date().toISOString()
      };
      
      setDiagnosisResult(mockResult);
    } catch (error) {
      Alert.alert('Hata', 'Semptom analizi başarısız oldu');
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#D32F2F';
      case 'medium': return '#F57C00';
      case 'low': return '#388E3C';
      default: return '#757575';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Yüksek';
      case 'medium': return 'Orta';
      case 'low': return 'Düşük';
      default: return 'Normal';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('navigation.diagnostics')}</Text>
        <Text style={styles.subtitle}>AI Destekli Bitki Teşhis Sistemi</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleImageUpload}
          disabled={isLoading}
        >
          <Icon name="camera-alt" size={24} color="#ffffff" />
          <Text style={styles.actionButtonText}>Fotoğraf ile Teşhis</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleSymptomDiagnosis}
          disabled={isLoading}
        >
          <Icon name="assignment" size={24} color="#2E7D32" />
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            Semptom Analizi
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>AI analiz yapıyor...</Text>
        </View>
      )}

      {/* Selected Image */}
      {selectedImage && !isLoading && (
        <View style={styles.imageContainer}>
          <Text style={styles.sectionTitle}>Analiz Edilen Görsel</Text>
          <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
        </View>
      )}

      {/* Diagnosis Results */}
      {diagnosisResult && !isLoading && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultHeader}>
            <Text style={styles.sectionTitle}>Teşhis Sonuçları</Text>
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceText}>
                Güven: %{Math.round(diagnosisResult.confidence * 100)}
              </Text>
            </View>
          </View>

          <View style={styles.plantTypeContainer}>
            <Icon name="eco" size={20} color="#2E7D32" />
            <Text style={styles.plantType}>{diagnosisResult.plant_type}</Text>
          </View>

          {/* Detected Issues */}
          <View style={styles.section}>
            <Text style={styles.subsectionTitle}>Tespit Edilen Sorunlar</Text>
            {diagnosisResult.detected_issues.map((issue, index) => (
              <View key={index} style={styles.issueCard}>
                <Text style={styles.issueName}>{issue.name}</Text>
                <Text style={styles.issueConfidence}>
                  Güven: %{Math.round(issue.confidence * 100)}
                </Text>
                
                <View style={styles.symptomsContainer}>
                  <Text style={styles.symptomsTitle}>Semptomlar:</Text>
                  {issue.symptoms.map((symptom, idx) => (
                    <Text key={idx} style={styles.symptom}>• {symptom}</Text>
                  ))}
                </View>
                
                <View style={styles.treatmentContainer}>
                  <Text style={styles.treatmentTitle}>Önerilen Tedavi:</Text>
                  <Text style={styles.treatment}>{issue.treatment}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Recommendations */}
          <View style={styles.section}>
            <Text style={styles.subsectionTitle}>Öneriler</Text>
            {diagnosisResult.recommendations.map((rec, index) => (
              <View key={index} style={styles.recommendationCard}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationTitle}>{rec.title}</Text>
                  <View style={[
                    styles.priorityBadge, 
                    { backgroundColor: getPriorityColor(rec.priority) }
                  ]}>
                    <Text style={styles.priorityText}>
                      {getPriorityText(rec.priority)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.recommendationDescription}>
                  {rec.description}
                </Text>
              </View>
            ))}
          </View>

          {/* Diagnosis Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Teşhis ID: {diagnosisResult.diagnosis_id}
            </Text>
            <Text style={styles.infoText}>
              Tarih: {new Date(diagnosisResult.timestamp).toLocaleString('tr-TR')}
            </Text>
          </View>
        </View>
      )}

      {/* Empty State */}
      {!diagnosisResult && !isLoading && (
        <View style={styles.emptyContainer}>
          <Icon name="local-hospital" size={64} color="#E0E0E0" />
          <Text style={styles.emptyTitle}>AI Bitki Teşhis Sistemi</Text>
          <Text style={styles.emptyDescription}>
            Bitkilerinizin sağlık durumunu analiz etmek için fotoğraf yükleyin 
            veya semptomları belirtin. Yapay zeka destekli sistemimiz size 
            profesyonel öneriler sunacak.
          </Text>
        </View>
      )}
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
    paddingBottom: 24,
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
  actionSection: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2E7D32',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButtonText: {
    color: '#2E7D32',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#757575',
    marginTop: 12,
  },
  imageContainer: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  resultsContainer: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  confidenceContainer: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  plantTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  plantType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  section: {
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  issueCard: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    marginBottom: 12,
  },
  issueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 4,
  },
  issueConfidence: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 12,
  },
  symptomsContainer: {
    marginBottom: 12,
  },
  symptomsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  symptom: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  treatmentContainer: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 6,
  },
  treatmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  treatment: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  recommendationCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  infoContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
    marginTop: 16,
  },
  infoText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginTop: 16,
    marginBottom: 12,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default DiagnosticsScreen;