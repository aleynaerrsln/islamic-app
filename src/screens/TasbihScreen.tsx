import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Vibration,
  Pressable,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  Text,
  useTheme,
  IconButton,
  Switch,
} from 'react-native-paper';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';
import { spacing, borderRadius } from '../theme';
import { BackgroundWrapper } from '../components/BackgroundWrapper';
// import { useAnalytics, AnalyticsEvents } from '../hooks/useAnalytics';

const { width } = Dimensions.get('window');

// Zikir geçmişi için tip
interface DhikrHistoryEntry {
  dhikrId: string;
  dhikrName: string;
  timestamp: number; // Unix timestamp
}

// İstatistik tipi
interface DhikrStats {
  daily: number;
  monthly: number;
  yearly: number;
  totalAll: number;
  topDhikrs: { name: string; count: number }[];
}
const COUNTER_SIZE = width * 0.65;
const STROKE_WIDTH = 8;
const RADIUS = (COUNTER_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Varsayılan zikirler
const DEFAULT_DHIKRS = [
  {
    id: '1',
    name: 'Subhanallah',
    arabic: 'سُبْحَانَ اللّٰهِ',
    meaning: "Allah'ı tesbih ederim, Allah noksan sıfatlardan münezzehtir",
    target: 33,
    count: 0,
    isDefault: true,
  },
  {
    id: '2',
    name: 'Elhamdülillah',
    arabic: 'اَلْحَمْدُ لِلّٰهِ',
    meaning: "Hamd Allah'a mahsustur",
    target: 33,
    count: 0,
    isDefault: false,
  },
  {
    id: '3',
    name: 'Allahu Ekber',
    arabic: 'اَللّٰهُ اَكْبَرُ',
    meaning: 'Allah en büyüktür',
    target: 33,
    count: 0,
    isDefault: false,
  },
  {
    id: '4',
    name: 'La ilahe illallah',
    arabic: 'لَا اِلٰهَ اِلَّا اللّٰهُ',
    meaning: "Allah'tan başka ilah yoktur",
    target: 100,
    count: 0,
    isDefault: false,
  },
  {
    id: '5',
    name: 'Estağfirullah',
    arabic: 'اَسْتَغْفِرُ اللّٰهَ',
    meaning: "Allah'tan bağışlanma dilerim",
    target: 100,
    count: 0,
    isDefault: false,
  },
  {
    id: '6',
    name: 'Subhanallahi ve bihamdihi',
    arabic: 'سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ',
    meaning: "Allah'ı hamd ile tesbih ederim",
    target: 100,
    count: 0,
    isDefault: false,
  },
];

interface Dhikr {
  id: string;
  name: string;
  arabic: string;
  meaning: string;
  target: number;
  count: number;
  isDefault: boolean;
}

// Progress Ring Component
const ProgressRing = ({ progress }: { progress: number }) => {
  const strokeDashoffset = CIRCUMFERENCE * (1 - Math.min(progress, 1));

  return (
    <Svg width={COUNTER_SIZE} height={COUNTER_SIZE} style={styles.progressSvg}>
      {/* Arka plan çember */}
      <Circle
        cx={COUNTER_SIZE / 2}
        cy={COUNTER_SIZE / 2}
        r={RADIUS}
        stroke="rgba(76, 175, 80, 0.2)"
        strokeWidth={STROKE_WIDTH}
        fill="transparent"
      />
      {/* İlerleme çemberi */}
      <Circle
        cx={COUNTER_SIZE / 2}
        cy={COUNTER_SIZE / 2}
        r={RADIUS}
        stroke="#4CAF50"
        strokeWidth={STROKE_WIDTH}
        fill="transparent"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${COUNTER_SIZE / 2}, ${COUNTER_SIZE / 2}`}
      />
    </Svg>
  );
};

export function TasbihScreen() {
  const theme = useTheme();
  const [dhikrs, setDhikrs] = useState<Dhikr[]>(DEFAULT_DHIKRS);
  const [selectedDhikr, setSelectedDhikr] = useState<Dhikr>(DEFAULT_DHIKRS[0]);
  const [showModal, setShowModal] = useState(false);
  const [modalView, setModalView] = useState<'list' | 'add' | 'edit' | 'setCount'>('list');
  const [editingDhikr, setEditingDhikr] = useState<Dhikr | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [countInputValue, setCountInputValue] = useState('');

  // Yeni zikir formu
  const [newDhikrName, setNewDhikrName] = useState('');
  const [newDhikrArabic, setNewDhikrArabic] = useState('');
  const [newDhikrMeaning, setNewDhikrMeaning] = useState('');
  const [newDhikrTarget, setNewDhikrTarget] = useState(33);
  const [newDhikrIsDefault, setNewDhikrIsDefault] = useState(false);

  // İstatistikler için
  const [dhikrHistory, setDhikrHistory] = useState<DhikrHistoryEntry[]>([]);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [stats, setStats] = useState<DhikrStats>({
    daily: 0,
    monthly: 0,
    yearly: 0,
    totalAll: 0,
    topDhikrs: [],
  });

  // Verileri yükle
  useEffect(() => {
    loadDhikrs();
    loadHistory();
  }, []);

  // Verileri kaydet
  useEffect(() => {
    saveDhikrs();
  }, [dhikrs]);

  // Geçmişi kaydet
  useEffect(() => {
    if (dhikrHistory.length > 0) {
      saveHistory();
    }
  }, [dhikrHistory]);

  const loadDhikrs = async () => {
    try {
      const stored = await AsyncStorage.getItem('dhikrs');
      if (stored) {
        const parsed = JSON.parse(stored);
        setDhikrs(parsed);
        const defaultDhikr = parsed.find((d: Dhikr) => d.isDefault) || parsed[0];
        setSelectedDhikr(defaultDhikr);
      }
    } catch (error) {
      console.log('Zikirler yüklenemedi');
    }
  };

  const saveDhikrs = async () => {
    try {
      await AsyncStorage.setItem('dhikrs', JSON.stringify(dhikrs));
    } catch (error) {
      console.log('Zikirler kaydedilemedi');
    }
  };

  const loadHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem('dhikrHistory');
      if (stored) {
        const parsed = JSON.parse(stored);
        setDhikrHistory(parsed);
      }
    } catch (error) {
      console.log('Zikir geçmişi yüklenemedi');
    }
  };

  const saveHistory = async () => {
    try {
      // Son 1 yıllık veriyi sakla (performans için)
      const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
      const recentHistory = dhikrHistory.filter((h) => h.timestamp > oneYearAgo);
      await AsyncStorage.setItem('dhikrHistory', JSON.stringify(recentHistory));
    } catch (error) {
      console.log('Zikir geçmişi kaydedilemedi');
    }
  };

  // İstatistikleri hesapla
  const calculateStats = () => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;
    const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;

    // Günlük, aylık, yıllık sayılar
    const daily = dhikrHistory.filter((h) => h.timestamp > oneDayAgo).length;
    const monthly = dhikrHistory.filter((h) => h.timestamp > oneMonthAgo).length;
    const yearly = dhikrHistory.filter((h) => h.timestamp > oneYearAgo).length;
    const totalAll = dhikrHistory.length;

    // En çok çekilen zikirler
    const dhikrCounts: { [key: string]: { name: string; count: number } } = {};
    dhikrHistory.forEach((h) => {
      if (dhikrCounts[h.dhikrId]) {
        dhikrCounts[h.dhikrId].count += 1;
      } else {
        dhikrCounts[h.dhikrId] = { name: h.dhikrName, count: 1 };
      }
    });

    const topDhikrs = Object.values(dhikrCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({ daily, monthly, yearly, totalAll, topDhikrs });
  };

  // İstatistik modalını aç
  const openStats = () => {
    calculateStats();
    setShowStatsModal(true);
  };

  // Ana buton - sayacı artır
  const handlePress = () => {
    // Quick menu açıksa kapat
    if (showQuickMenu) {
      setShowQuickMenu(false);
      return;
    }

    const newCount = selectedDhikr.count + 1;
    Vibration.vibrate(10);

    if (newCount === selectedDhikr.target) {
      Vibration.vibrate([0, 100, 50, 100]);
    }

    const updatedDhikrs = dhikrs.map((d) =>
      d.id === selectedDhikr.id ? { ...d, count: newCount } : d
    );
    setDhikrs(updatedDhikrs);
    setSelectedDhikr({ ...selectedDhikr, count: newCount });

    // Geçmişe kaydet
    const historyEntry: DhikrHistoryEntry = {
      dhikrId: selectedDhikr.id,
      dhikrName: selectedDhikr.name,
      timestamp: Date.now(),
    };
    setDhikrHistory((prev) => [...prev, historyEntry]);
  };

  // Azalt
  const handleDecrease = () => {
    if (selectedDhikr.count > 0) {
      const newCount = selectedDhikr.count - 1;
      const updatedDhikrs = dhikrs.map((d) =>
        d.id === selectedDhikr.id ? { ...d, count: newCount } : d
      );
      setDhikrs(updatedDhikrs);
      setSelectedDhikr({ ...selectedDhikr, count: newCount });
      Vibration.vibrate(5);
    }
  };

  // Sıfırla
  const handleReset = () => {
    const updatedDhikrs = dhikrs.map((d) =>
      d.id === selectedDhikr.id ? { ...d, count: 0 } : d
    );
    setDhikrs(updatedDhikrs);
    setSelectedDhikr({ ...selectedDhikr, count: 0 });
    Vibration.vibrate([0, 50, 30, 50]);
  };

  // Sayacı belirli bir değere ayarla
  const handleSetCount = () => {
    const newCount = parseInt(countInputValue, 10);
    if (isNaN(newCount) || newCount < 0) return;

    const updatedDhikrs = dhikrs.map((d) =>
      d.id === selectedDhikr.id ? { ...d, count: newCount } : d
    );
    setDhikrs(updatedDhikrs);
    setSelectedDhikr({ ...selectedDhikr, count: newCount });
    setCountInputValue('');
    setShowModal(false);
    setModalView('list');
    Vibration.vibrate(10);
  };

  // Quick menu'den düzenleme aç
  const openCountEditor = () => {
    setShowQuickMenu(false);
    setCountInputValue(selectedDhikr.count.toString());
    setModalView('setCount');
    setShowModal(true);
  };

  const selectDhikr = (dhikr: Dhikr) => {
    setSelectedDhikr(dhikr);
    setShowModal(false);
  };

  const addNewDhikr = () => {
    if (!newDhikrName.trim()) return;

    const newDhikr: Dhikr = {
      id: Date.now().toString(),
      name: newDhikrName.trim(),
      arabic: newDhikrArabic.trim(),
      meaning: newDhikrMeaning.trim(),
      target: newDhikrTarget,
      count: 0,
      isDefault: newDhikrIsDefault,
    };

    let updatedDhikrs = dhikrs;
    if (newDhikrIsDefault) {
      updatedDhikrs = dhikrs.map((d) => ({ ...d, isDefault: false }));
    }

    setDhikrs([...updatedDhikrs, newDhikr]);

    // Varsayılan olarak işaretlendiyse seçili zikir olarak ayarla
    if (newDhikrIsDefault) {
      setSelectedDhikr(newDhikr);
    }

    resetAddForm();
    setModalView('list');
  };

  const updateDhikrTarget = (newTarget: number) => {
    if (!editingDhikr) return;

    const updatedDhikrs = dhikrs.map((d) =>
      d.id === editingDhikr.id ? { ...d, target: newTarget } : d
    );
    setDhikrs(updatedDhikrs);

    if (selectedDhikr.id === editingDhikr.id) {
      setSelectedDhikr({ ...selectedDhikr, target: newTarget });
    }

    setEditingDhikr({ ...editingDhikr, target: newTarget });
  };

  // Zikiri varsayılan yap
  const setAsDefault = (dhikrId: string) => {
    const updatedDhikrs = dhikrs.map((d) => ({
      ...d,
      isDefault: d.id === dhikrId,
    }));
    setDhikrs(updatedDhikrs);

    // editingDhikr'ı güncelle
    if (editingDhikr && editingDhikr.id === dhikrId) {
      setEditingDhikr({ ...editingDhikr, isDefault: true });
    }

    // Varsayılan yapılan zikri seçili zikir olarak ayarla
    const defaultDhikr = updatedDhikrs.find((d) => d.id === dhikrId);
    if (defaultDhikr) {
      setSelectedDhikr(defaultDhikr);
    }
  };

  const deleteDhikr = (dhikrId: string) => {
    const updatedDhikrs = dhikrs.filter((d) => d.id !== dhikrId);
    setDhikrs(updatedDhikrs);

    if (selectedDhikr.id === dhikrId && updatedDhikrs.length > 0) {
      setSelectedDhikr(updatedDhikrs[0]);
    }

    setModalView('list');
    setEditingDhikr(null);
  };

  const resetAddForm = () => {
    setNewDhikrName('');
    setNewDhikrArabic('');
    setNewDhikrMeaning('');
    setNewDhikrTarget(33);
    setNewDhikrIsDefault(false);
  };

  const filteredDhikrs = dhikrs.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.arabic.includes(searchQuery)
  );

  const progress = selectedDhikr.count / selectedDhikr.target;
  const isCompleted = selectedDhikr.count >= selectedDhikr.target;

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        {/* Üst bar */}
        <View style={styles.topBar}>
          <IconButton
            icon="menu"
            iconColor="#fff"
            size={24}
            onPress={() => { setModalView('list'); setShowModal(true); }}
          />
          <Text style={styles.topBarTitle}>Dijital Tesbih</Text>
          <IconButton
            icon="chart-bar"
            iconColor="#fff"
            size={24}
            onPress={openStats}
          />
        </View>

        {/* Zikir bilgisi */}
        <View style={styles.dhikrInfo}>
          <TouchableOpacity onPress={() => { setModalView('list'); setShowModal(true); }}>
            <Text style={styles.arabicText}>{selectedDhikr.arabic}</Text>
          </TouchableOpacity>

          {/* Zikir adı ve dropdown */}
          <TouchableOpacity
            style={styles.dhikrNameRow}
            onPress={() => setShowQuickMenu(!showQuickMenu)}
          >
            <Text style={styles.dhikrName}>{selectedDhikr.name}</Text>
            <Icon name="chevron-down" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>

          {/* Quick Menu */}
          {showQuickMenu && (
            <TouchableOpacity
              style={styles.quickMenuButton}
              onPress={openCountEditor}
              activeOpacity={0.8}
            >
              <Icon name="pencil" size={14} color="#4CAF50" />
              <Text style={styles.quickMenuButtonText}>Düzenle</Text>
            </TouchableOpacity>
          )}

          {selectedDhikr.meaning && (
            <Text style={styles.dhikrMeaning}>{selectedDhikr.meaning}</Text>
          )}
        </View>

        {/* Sayaç */}
        <Pressable onPress={handlePress} style={styles.counterWrapper}>
          {/* Progress Ring */}
          <ProgressRing progress={progress} />

          {/* İç daire - sayı göstergesi */}
          <View style={styles.counterInner}>
            <Text style={styles.countText}>{selectedDhikr.count}</Text>
            <Text style={styles.targetText}>/ {selectedDhikr.target}</Text>
          </View>
        </Pressable>

        {/* Tamamlandı mesajı */}
        {isCompleted && (
          <Text style={styles.completedText}>Hedefe ulaşıldı! 🎉</Text>
        )}

        {/* Kontrol butonları */}
        <View style={styles.controlButtons}>
          <TouchableOpacity
            style={[styles.controlButton, styles.decreaseButton]}
            onPress={handleDecrease}
          >
            <Icon name="minus" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.resetButton]}
            onPress={handleReset}
          >
            <Icon name="refresh" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Tek Modal - Liste, Ekle, Düzenle görünümleri */}
        <Modal
          visible={showModal && modalView !== 'setCount'}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            if (modalView === 'list') {
              setShowModal(false);
            } else {
              setModalView('list');
            }
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.dhikrListModal, { backgroundColor: '#121212' }]}>
              {/* Liste Görünümü */}
              {modalView === 'list' && (
                <>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowModal(false)}>
                      <Icon name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Zikirlerim</Text>
                    <TouchableOpacity onPress={() => setModalView('add')}>
                      <Icon name="plus" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.searchContainer}>
                    <Icon name="magnify" size={20} color="rgba(255,255,255,0.5)" />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Zikir ara"
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                  </View>

                  <FlatList
                    data={filteredDhikrs}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.dhikrListItem,
                          item.id === selectedDhikr.id && styles.dhikrListItemActive,
                        ]}
                        onPress={() => selectDhikr(item)}
                      >
                        <View style={styles.dhikrListItemContent}>
                          <Text style={styles.dhikrListArabic}>{item.arabic}</Text>
                          <View style={styles.dhikrListInfo}>
                            <Text style={styles.dhikrListName}>{item.name}</Text>
                            {item.isDefault && (
                              <Icon
                                name="check-circle"
                                size={16}
                                color="#4CAF50"
                                style={{ marginLeft: 8 }}
                              />
                            )}
                          </View>
                          <Text style={styles.dhikrListStats}>
                            Hedef: {item.target} • Sayaç: {item.count}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.dhikrMenuButton}
                          onPress={() => {
                            setEditingDhikr(item);
                            setModalView('edit');
                          }}
                        >
                          <Icon name="dots-vertical" size={24} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.dhikrListContent}
                  />
                </>
              )}

              {/* Yeni Zikir Ekle Görünümü */}
              {modalView === 'add' && (
                <>
                  <View style={styles.addModalHeader}>
                    <TouchableOpacity onPress={() => { resetAddForm(); setModalView('list'); }}>
                      <Text style={styles.cancelText}>İptal</Text>
                    </TouchableOpacity>
                    <Text style={styles.addModalTitle}>Yeni Zikir Ekle</Text>
                    <TouchableOpacity onPress={addNewDhikr}>
                      <Text style={[styles.saveText, { opacity: newDhikrName.trim() ? 1 : 0.5 }]}>
                        Kaydet
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.addModalContent}>
                    <Text style={styles.sectionLabel}>ZİKİR BİLGİLERİ</Text>
                    <View style={styles.inputGroup}>
                      <TextInput
                        style={styles.textInput}
                        placeholder="Zikir adı"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={newDhikrName}
                        onChangeText={setNewDhikrName}
                      />
                      <View style={styles.inputDivider} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Arapça (opsiyonel)"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={newDhikrArabic}
                        onChangeText={setNewDhikrArabic}
                      />
                      <View style={styles.inputDivider} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Anlam (opsiyonel)"
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={newDhikrMeaning}
                        onChangeText={setNewDhikrMeaning}
                      />
                      <View style={styles.inputDivider} />
                      <View style={styles.targetInputRow}>
                        <Text style={styles.targetLabel}>Hedef sayısı</Text>
                        <View style={styles.targetControls}>
                          <Text style={styles.targetValue}>{newDhikrTarget}</Text>
                          <TouchableOpacity
                            style={styles.targetButton}
                            onPress={() => setNewDhikrTarget(Math.max(1, newDhikrTarget - 1))}
                          >
                            <Text style={styles.targetButtonText}>−</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.targetButton}
                            onPress={() => setNewDhikrTarget(newDhikrTarget + 1)}
                          >
                            <Text style={styles.targetButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.inputDivider} />
                      <View style={styles.switchRow}>
                        <Text style={styles.switchLabel}>Varsayılan zikir yap</Text>
                        <Switch
                          value={newDhikrIsDefault}
                          onValueChange={setNewDhikrIsDefault}
                        />
                      </View>
                    </View>
                  </ScrollView>
                </>
              )}

              {/* Zikir Düzenle Görünümü */}
              {modalView === 'edit' && editingDhikr && (
                <View style={styles.editContainer}>
                  <View style={styles.addModalHeader}>
                    <TouchableOpacity onPress={() => { setEditingDhikr(null); setModalView('list'); }}>
                      <Text style={styles.cancelText}>Geri</Text>
                    </TouchableOpacity>
                    <Text style={styles.addModalTitle}>Zikir Düzenle</Text>
                    <TouchableOpacity onPress={() => { setEditingDhikr(null); setModalView('list'); }}>
                      <Text style={styles.saveText}>Tamam</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.editContent}>
                    <Text style={styles.editModalTitle}>{editingDhikr.name}</Text>
                    <Text style={styles.editArabicText}>{editingDhikr.arabic}</Text>

                    {/* Ayarlar */}
                    <View style={styles.editOptionsContainer}>
                      {/* Hedef Sayısı */}
                      <View style={styles.editOptionRow}>
                        <View style={styles.editOptionLeft}>
                          <Icon name="target" size={20} color="#4CAF50" />
                          <Text style={styles.editOptionLabel}>Hedef Sayısı</Text>
                        </View>
                        <View style={styles.editTargetControls}>
                          <TouchableOpacity
                            style={styles.editTargetButton}
                            onPress={() => updateDhikrTarget(Math.max(1, editingDhikr.target - 1))}
                          >
                            <Text style={styles.editTargetButtonText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.editTargetValue}>{editingDhikr.target}</Text>
                          <TouchableOpacity
                            style={styles.editTargetButton}
                            onPress={() => updateDhikrTarget(editingDhikr.target + 1)}
                          >
                            <Text style={styles.editTargetButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Varsayılan Yap */}
                      <View style={styles.editOptionRow}>
                        <View style={styles.editOptionLeft}>
                          <Icon name="star" size={20} color="#FF9800" />
                          <Text style={styles.editOptionLabel}>Varsayılan Zikir</Text>
                        </View>
                        <Switch
                          value={editingDhikr.isDefault}
                          onValueChange={(value) => {
                            if (value) {
                              setAsDefault(editingDhikr.id);
                            }
                          }}
                          disabled={editingDhikr.isDefault}
                        />
                      </View>
                    </View>

                    {/* Sil Butonu */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteDhikr(editingDhikr.id)}
                    >
                      <Icon name="delete" size={20} color="#E53935" />
                      <Text style={styles.deleteButtonText}>Zikiri Sil</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

            </View>
          </View>
        </Modal>

        {/* Sayaç Düzenleme Popup Modal */}
        <Modal
          visible={modalView === 'setCount' && showModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => { setCountInputValue(''); setShowModal(false); setModalView('list'); }}
        >
          <View style={styles.popupOverlay}>
            <View style={styles.popupContainer}>
              <View style={styles.popupHeader}>
                <Icon name="counter" size={18} color="#4CAF50" />
                <Text style={styles.popupTitle}>Sayacı Düzenle</Text>
              </View>

              <Text style={styles.popupSubtitle}>
                Sayaç değerini girin
              </Text>

              <View style={styles.popupInputContainer}>
                <TouchableOpacity
                  style={styles.popupInputButton}
                  onPress={() => {
                    const current = parseInt(countInputValue, 10) || 0;
                    if (current > 0) setCountInputValue((current - 1).toString());
                  }}
                >
                  <Icon name="minus" size={16} color="#fff" />
                </TouchableOpacity>

                <TextInput
                  style={styles.popupInput}
                  value={countInputValue}
                  onChangeText={setCountInputValue}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  autoFocus
                  selectTextOnFocus
                />

                <TouchableOpacity
                  style={styles.popupInputButton}
                  onPress={() => {
                    const current = parseInt(countInputValue, 10) || 0;
                    setCountInputValue((current + 1).toString());
                  }}
                >
                  <Icon name="plus" size={16} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.popupActions}>
                <TouchableOpacity
                  style={styles.popupCancelButton}
                  onPress={() => { setCountInputValue(''); setShowModal(false); setModalView('list'); }}
                >
                  <Text style={styles.popupCancelText}>İptal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.popupSaveButton, { opacity: countInputValue.trim() ? 1 : 0.5 }]}
                  onPress={handleSetCount}
                  disabled={!countInputValue.trim()}
                >
                  <Text style={styles.popupSaveText}>Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* İstatistikler Modal */}
        <Modal
          visible={showStatsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowStatsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.statsModal, { backgroundColor: '#121212' }]}>
              {/* Header */}
              <View style={styles.statsHeader}>
                <TouchableOpacity onPress={() => setShowStatsModal(false)}>
                  <Icon name="close" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.statsTitle}>Zikir İstatistiklerim</Text>
                <View style={{ width: 24 }} />
              </View>

              <ScrollView style={styles.statsContent} showsVerticalScrollIndicator={false}>
                {/* Özet Kartları */}
                <View style={styles.statsGrid}>
                  {/* Günlük */}
                  <View style={[styles.statCard, { backgroundColor: '#1e3a2f' }]}>
                    <Icon name="calendar-today" size={24} color="#4CAF50" />
                    <Text style={styles.statValue}>{stats.daily.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>Son 24 Saat</Text>
                  </View>

                  {/* Aylık */}
                  <View style={[styles.statCard, { backgroundColor: '#2a3a4a' }]}>
                    <Icon name="calendar-month" size={24} color="#2196F3" />
                    <Text style={styles.statValue}>{stats.monthly.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>Bu Ay</Text>
                  </View>

                  {/* Yıllık */}
                  <View style={[styles.statCard, { backgroundColor: '#3a2a3a' }]}>
                    <Icon name="calendar" size={24} color="#9C27B0" />
                    <Text style={styles.statValue}>{stats.yearly.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>Bu Yıl</Text>
                  </View>

                  {/* Toplam */}
                  <View style={[styles.statCard, { backgroundColor: '#3a3a2a' }]}>
                    <Icon name="sigma" size={24} color="#FF9800" />
                    <Text style={styles.statValue}>{stats.totalAll.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>Toplam</Text>
                  </View>
                </View>

                {/* En Çok Çekilen Zikirler */}
                <View style={styles.topDhikrsSection}>
                  <View style={styles.topDhikrsHeader}>
                    <Icon name="trophy" size={20} color="#FFD700" />
                    <Text style={styles.topDhikrsTitle}>En Çok Çekilen Zikirler</Text>
                  </View>

                  {stats.topDhikrs.length === 0 ? (
                    <View style={styles.emptyStats}>
                      <Icon name="history" size={40} color="rgba(255,255,255,0.3)" />
                      <Text style={styles.emptyStatsText}>
                        Henüz zikir çekmediniz.{'\n'}Zikir çekmeye başladığınızda istatistikleriniz burada görünecek.
                      </Text>
                    </View>
                  ) : (
                    stats.topDhikrs.map((item, index) => (
                      <View key={index} style={styles.topDhikrItem}>
                        <View style={styles.topDhikrRank}>
                          <Text style={[
                            styles.rankText,
                            index === 0 && { color: '#FFD700' },
                            index === 1 && { color: '#C0C0C0' },
                            index === 2 && { color: '#CD7F32' },
                          ]}>
                            {index + 1}
                          </Text>
                        </View>
                        <Text style={styles.topDhikrName}>{item.name}</Text>
                        <View style={styles.topDhikrCount}>
                          <Text style={styles.topDhikrCountText}>{item.count.toLocaleString()}</Text>
                          <Text style={styles.topDhikrCountLabel}>kez</Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>

                {/* Motivasyon Mesajı */}
                {stats.totalAll > 0 && (
                  <View style={styles.motivationCard}>
                    <Icon name="heart" size={20} color="#E91E63" />
                    <Text style={styles.motivationText}>
                      {stats.totalAll >= 10000 ? 'Masallah! Harika bir azim gösteriyorsunuz!' :
                       stats.totalAll >= 1000 ? 'Çok iyi gidiyorsunuz! Devam edin!' :
                       stats.totalAll >= 100 ? 'Güzel bir başlangıç! Her zikir değerlidir.' :
                       'Her adım önemlidir. Devam edin!'}
                    </Text>
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 50,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.sm,
  },
  topBarTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  dhikrInfo: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  arabicText: {
    fontSize: 32,
    color: '#fff',
    marginBottom: spacing.sm,
  },
  dhikrName: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  dhikrMeaning: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    lineHeight: 20,
  },
  dhikrNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  quickMenuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: spacing.xs,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  quickMenuButtonText: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: '500',
  },

  // Sayaç stilleri
  counterWrapper: {
    width: COUNTER_SIZE,
    height: COUNTER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  progressSvg: {
    position: 'absolute',
  },
  counterInner: {
    width: COUNTER_SIZE - 30,
    height: COUNTER_SIZE - 30,
    borderRadius: (COUNTER_SIZE - 30) / 2,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 72,
    fontWeight: '300',
    color: '#fff',
  },
  targetText: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.5)',
    marginTop: -5,
  },

  completedText: {
    color: '#4CAF50',
    fontSize: 18,
    marginTop: spacing.xl,
    fontWeight: '500',
  },

  // Kontrol butonları
  controlButtons: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decreaseButton: {
    backgroundColor: '#E53935',
  },
  resetButton: {
    backgroundColor: '#FF9800',
  },

  // Modal stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  dhikrListModal: {
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    marginLeft: spacing.sm,
    fontSize: 16,
  },
  dhikrListContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  dhikrListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  dhikrListItemActive: {
    backgroundColor: '#2a3a2a',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  dhikrListItemContent: {
    flex: 1,
  },
  dhikrListArabic: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 4,
  },
  dhikrListInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dhikrListName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  dhikrListStats: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  dhikrMenuButton: {
    padding: spacing.sm,
  },
  // Yeni zikir ekle modal
  addModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'flex-end',
  },
  addModal: {
    height: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  addModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  addModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cancelText: {
    fontSize: 16,
    color: '#2196F3',
  },
  saveText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  addModalContent: {
    flex: 1,
    padding: spacing.md,
  },
  sectionLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  inputGroup: {
    backgroundColor: '#2a2a2a',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  textInput: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: '#fff',
    fontSize: 16,
  },
  inputDivider: {
    height: 1,
    backgroundColor: '#444',
    marginLeft: spacing.md,
  },
  targetInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  targetLabel: {
    fontSize: 16,
    color: '#fff',
  },
  targetControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  targetValue: {
    fontSize: 16,
    color: '#fff',
    minWidth: 40,
    textAlign: 'center',
  },
  targetButton: {
    width: 32,
    height: 32,
    backgroundColor: '#444',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  switchLabel: {
    fontSize: 16,
    color: '#fff',
  },
  // Düzenle modal
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editModal: {
    width: '85%',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  editModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  editTargetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  editTargetLabel: {
    fontSize: 16,
    color: '#fff',
  },
  editTargetControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  editTargetButton: {
    width: 36,
    height: 36,
    backgroundColor: '#444',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editTargetButtonText: {
    fontSize: 22,
    color: '#fff',
  },
  editTargetValue: {
    fontSize: 20,
    color: '#fff',
    minWidth: 50,
    textAlign: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#444',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#E53935',
  },
  editContainer: {
    flex: 1,
  },
  editContent: {
    flex: 1,
    padding: spacing.lg,
  },
  editArabicText: {
    fontSize: 24,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  editOptionsContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  editOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  editOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  editOptionLabel: {
    fontSize: 15,
    color: '#fff',
  },
  // Popup Modal stilleri
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  popupContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: spacing.md,
    width: '85%',
    maxWidth: 280,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  popupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  popupSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  popupInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  popupInputButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupInput: {
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  popupActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  popupCancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#333',
    alignItems: 'center',
  },
  popupCancelText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  popupSaveButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  popupSaveText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  // İstatistik Modal stilleri
  statsModal: {
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.md,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  statsContent: {
    flex: 1,
    padding: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  topDhikrsSection: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  topDhikrsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  topDhikrsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  topDhikrItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  topDhikrRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
  },
  topDhikrName: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  topDhikrCount: {
    alignItems: 'flex-end',
  },
  topDhikrCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  topDhikrCountLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  emptyStats: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyStatsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 20,
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(233, 30, 99, 0.15)',
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  motivationText: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
});
