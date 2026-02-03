import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { spacing, borderRadius } from '../theme';
import { ESMA_UL_HUSNA, EsmaItem } from '../data/esmaUlHusna';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EsmaUlHusnaModalProps {
  visible: boolean;
  onClose: () => void;
}

export function EsmaUlHusnaModal({ visible, onClose }: EsmaUlHusnaModalProps) {
  const renderEsmaCard = ({ item }: { item: EsmaItem }) => {
    const baseColor = item.color;

    return (
      <View style={[styles.esmaCard, { borderColor: `${baseColor}50` }]}>
        {/* Arka plan renk katmanı */}
        <View style={[styles.cardBackground, { backgroundColor: `${baseColor}12` }]} />

        {/* Numara Badge */}
        <View style={[styles.numberBadge, { backgroundColor: baseColor }]}>
          <Text style={styles.numberText}>{item.number}</Text>
        </View>

        {/* Dekoratif üst çizgi */}
        <View style={[styles.topAccent, { backgroundColor: baseColor }]} />

        {/* Arapça İsim */}
        <View style={styles.arabicContainer}>
          <Text style={[styles.esmaArabic, { color: baseColor }]}>
            {item.arabic}
          </Text>
        </View>

        {/* Türkçe Okunuş */}
        <Text style={styles.esmaTurkish}>{item.turkish}</Text>

        {/* Ayırıcı */}
        <View style={styles.dividerContainer}>
          <View style={[styles.dividerLine, { backgroundColor: `${baseColor}40` }]} />
          <Icon name="star-four-points" size={12} color={baseColor} style={styles.dividerIcon} />
          <View style={[styles.dividerLine, { backgroundColor: `${baseColor}40` }]} />
        </View>

        {/* Anlam */}
        <Text style={styles.esmaMeaning}>{item.meaning}</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Icon name="star-crescent" size={20} color="#FFD700" style={{ marginRight: 8 }} />
              <Text style={styles.headerTitle}>Esmaü'l Hüsna</Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.countText}>99</Text>
            </View>
          </View>

          {/* Subtitle */}
          <Text style={styles.subtitle}>Allah'ın 99 Güzel İsmi</Text>

          {/* Esma List */}
          <FlatList
            data={ESMA_UL_HUSNA}
            renderItem={renderEsmaCard}
            keyExtractor={(item) => item.number.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContainer: {
    flex: 1,
    marginTop: 50,
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,215,0,0.2)',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerRight: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 20,
  },
  countText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  esmaCard: {
    borderRadius: 20,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: '#111',
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  numberBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  numberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  topAccent: {
    position: 'absolute',
    top: 0,
    left: '25%',
    right: '25%',
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  arabicContainer: {
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
  },
  esmaArabic: {
    fontSize: 52,
    fontFamily: 'System',
    fontWeight: '300',
  },
  esmaTurkish: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: spacing.sm,
    letterSpacing: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
    width: '60%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerIcon: {
    marginHorizontal: spacing.sm,
  },
  esmaMeaning: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
});
