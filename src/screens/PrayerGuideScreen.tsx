import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  abdestAdimlari,
  namazVakitleri,
  type NamazVakti,
  type NamazBolumu,
  type NamazAdim,
} from '../data/namazRehberi';
import { spacing, borderRadius } from '../theme';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
import { useSettingsStore } from '../store/settingsStore';

const { width } = Dimensions.get('window');

type ViewMode = 'main' | 'abdest' | 'detail';

export function PrayerGuideScreen() {
  const theme = useTheme();
  const cardOpacity = useSettingsStore((state) => state.cardOpacity);
  const cardBgColor = theme.dark ? `rgba(0,0,0,${cardOpacity})` : `rgba(255,255,255,${cardOpacity})`;
  const [expandedVakit, setExpandedVakit] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('main');
  const [selectedBolum, setSelectedBolum] = useState<NamazBolumu | null>(null);
  const [selectedVakitName, setSelectedVakitName] = useState<string>('');

  const toggleVakit = (vakitId: string) => {
    setExpandedVakit(expandedVakit === vakitId ? null : vakitId);
  };

  const openBolumDetail = (bolum: NamazBolumu, vakitName: string) => {
    setSelectedBolum(bolum);
    setSelectedVakitName(vakitName);
    setViewMode('detail');
  };

  const getTurColor = (tur: 'sunnet' | 'farz' | 'vitir') => {
    switch (tur) {
      case 'farz':
        return '#4CAF50';
      case 'sunnet':
        return '#2196F3';
      case 'vitir':
        return '#9C27B0';
    }
  };

  const getTurLabel = (tur: 'sunnet' | 'farz' | 'vitir') => {
    switch (tur) {
      case 'farz':
        return 'Farz';
      case 'sunnet':
        return 'Sünnet';
      case 'vitir':
        return 'Vacip';
    }
  };

  // Adım kartı render
  const renderAdim = (adim: NamazAdim, index: number) => (
    <View key={adim.id} style={[styles.stepCard, { backgroundColor: cardBgColor }]}>
      <View style={styles.stepHeader}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{index + 1}</Text>
        </View>
        <Text style={styles.stepTitle}>{adim.baslik}</Text>
      </View>

      <Text style={styles.stepDesc}>{adim.aciklama}</Text>

      {adim.arapca && (
        <View style={styles.arabicBox}>
          <Text style={styles.arabicText}>{adim.arapca}</Text>
          {adim.okunusu && (
            <Text style={styles.okunusText}>{adim.okunusu}</Text>
          )}
        </View>
      )}
    </View>
  );

  // Abdest görünümü
  const renderAbdestView = () => (
    <View style={styles.detailContainer}>
      <View style={styles.detailHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setViewMode('main')}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.detailTitleContainer}>
          <Icon name="hand-wash" size={28} color="#4FC3F7" />
          <Text style={styles.detailTitle}>Abdest Nasıl Alınır?</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.detailContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <Icon name="information-outline" size={20} color="#81D4FA" />
          <Text style={styles.infoText}>
            Abdest, namazın şartlarından biridir. Hadesten taharet (abdestsizlikten temizlenmek) için alınır.
          </Text>
        </View>

        {abdestAdimlari.map((adim, index) => renderAdim(adim, index))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );

  // Bölüm detay görünümü
  const renderDetailView = () => {
    if (!selectedBolum) return null;

    const turColor = getTurColor(selectedBolum.tur);

    return (
      <View style={styles.detailContainer}>
        <View style={styles.detailHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setViewMode('main')}
          >
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.detailTitleContainer}>
            <Text style={styles.detailSubtitle}>{selectedVakitName}</Text>
            <Text style={styles.detailTitle}>{selectedBolum.isim}</Text>
          </View>
          <View style={[styles.rekatBadgeLarge, { backgroundColor: turColor }]}>
            <Text style={styles.rekatBadgeLargeText}>{selectedBolum.rekat}</Text>
            <Text style={styles.rekatBadgeLargeLabel}>Rekat</Text>
          </View>
        </View>

        <ScrollView
          style={styles.detailContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.infoCard, { borderLeftColor: turColor }]}>
            <Icon name="information-outline" size={20} color={turColor} />
            <Text style={styles.infoText}>{selectedBolum.aciklama}</Text>
          </View>

          {selectedBolum.adimlar.map((adim, index) => renderAdim(adim, index))}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  };

  // Namaz vakti kartı
  const renderVakitCard = (vakit: NamazVakti) => {
    const isExpanded = expandedVakit === vakit.id;

    return (
      <View key={vakit.id} style={[styles.vakitCard, { backgroundColor: cardBgColor }]}>
        <TouchableOpacity
          style={[styles.vakitHeader, { borderLeftColor: vakit.renk }]}
          onPress={() => toggleVakit(vakit.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.vakitIconContainer, { backgroundColor: vakit.renk + '20' }]}>
            <Icon name={vakit.icon} size={28} color={vakit.renk} />
          </View>

          <View style={styles.vakitInfo}>
            <Text style={styles.vakitName}>{vakit.isim}</Text>
            <Text style={styles.vakitRekat}>
              Toplam {vakit.toplamRekat} Rekat
            </Text>
          </View>

          <View style={styles.vakitRight}>
            <View style={styles.bolumCount}>
              <Text style={styles.bolumCountText}>
                {vakit.bolumler.length} bölüm
              </Text>
            </View>
            <Icon
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="rgba(255,255,255,0.5)"
            />
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.bolumlerContainer}>
            {vakit.bolumler.map((bolum, index) => (
              <TouchableOpacity
                key={bolum.id}
                style={styles.bolumCard}
                onPress={() => openBolumDetail(bolum, vakit.isim)}
                activeOpacity={0.7}
              >
                <View style={styles.bolumLeft}>
                  <View style={styles.bolumOrder}>
                    <Text style={styles.bolumOrderText}>{index + 1}</Text>
                  </View>
                  <View style={styles.bolumInfo}>
                    <Text style={styles.bolumName}>{bolum.isim}</Text>
                    <View style={styles.bolumMeta}>
                      <View style={[styles.turBadge, { backgroundColor: getTurColor(bolum.tur) + '30' }]}>
                        <Text style={[styles.turBadgeText, { color: getTurColor(bolum.tur) }]}>
                          {getTurLabel(bolum.tur)}
                        </Text>
                      </View>
                      <Text style={styles.bolumRekat}>{bolum.rekat} rekat</Text>
                    </View>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Ana görünüm
  const renderMainView = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Namaz Rehberi</Text>

        {/* Abdest kartı */}
        <TouchableOpacity
          style={styles.abdestCard}
          onPress={() => setViewMode('abdest')}
          activeOpacity={0.8}
        >
          <View style={styles.abdestLeft}>
            <View style={styles.abdestIconContainer}>
              <Icon name="hand-wash" size={32} color="#4FC3F7" />
            </View>
            <View style={styles.abdestInfo}>
              <Text style={styles.abdestTitle}>Abdest Rehberi</Text>
              <Text style={styles.abdestDesc}>
                Abdest nasıl alınır, adım adım öğrenin
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>

        {/* Namaz vakitleri başlığı */}
        <View style={styles.sectionHeader}>
          <Icon name="mosque" size={20} color="rgba(255,255,255,0.7)" />
          <Text style={styles.sectionTitle}>Günlük Namazlar</Text>
        </View>
      </View>

      {/* Namaz vakitleri listesi */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {namazVakitleri.map(renderVakitCard)}

        {/* Bilgi kartı */}
        <View style={styles.tipCard}>
          <Icon name="lightbulb-outline" size={24} color="#FFD700" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Bilgi</Text>
            <Text style={styles.tipText}>
              Her namaz vaktine tıklayarak farz ve sünnet namazların kılınışını detaylı olarak öğrenebilirsiniz.
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </>
  );

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        {viewMode === 'main' && renderMainView()}
        {viewMode === 'abdest' && renderAbdestView()}
        {viewMode === 'detail' && renderDetailView()}
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },

  // Abdest kartı
  abdestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(79, 195, 247, 0.25)',
    padding: spacing.md,
    borderRadius: 16,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.4)',
  },
  abdestLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  abdestIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(79, 195, 247, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  abdestInfo: {
    flex: 1,
  },
  abdestTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  abdestDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  // Vakit kartı
  vakitCard: {
    borderRadius: 16,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  vakitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderLeftWidth: 4,
  },
  vakitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  vakitInfo: {
    flex: 1,
  },
  vakitName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  vakitRekat: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  vakitRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  bolumCount: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  bolumCountText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },

  // Bölümler
  bolumlerContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingVertical: spacing.sm,
  },
  bolumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  bolumLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bolumOrder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  bolumOrderText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  bolumInfo: {
    flex: 1,
  },
  bolumName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  bolumMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  turBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  turBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  bolumRekat: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },

  // Tip kartı
  tipCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },

  // Detail view
  detailContainer: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  detailSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  rekatBadgeLarge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rekatBadgeLargeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  rekatBadgeLargeLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
  },
  detailContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  // Info card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#81D4FA',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },

  // Step card
  stepCard: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  stepDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
  },
  arabicBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: spacing.md,
    borderRadius: 10,
    marginTop: spacing.sm,
  },
  arabicText: {
    fontSize: 20,
    color: '#81D4FA',
    textAlign: 'right',
    lineHeight: 32,
    fontFamily: 'System',
  },
  okunusText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});
