import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Text, IconButton, useTheme, SegmentedButtons } from 'react-native-paper';
import { useSettingsStore } from '../store/settingsStore';
import { BACKGROUND_IMAGES, SOLID_COLORS } from '../data/backgroundImages';
import { spacing, borderRadius } from '../theme';

const { width: screenWidth } = Dimensions.get('window');
const GRID_PADDING = spacing.md;
const GRID_GAP = spacing.sm;
const NUM_COLUMNS = 2;
const IMAGE_SIZE = (screenWidth - GRID_PADDING * 2 - GRID_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

interface BackgroundImagePickerProps {
  visible: boolean;
  onClose: () => void;
}

export function BackgroundImagePicker({ visible, onClose }: BackgroundImagePickerProps) {
  const theme = useTheme();
  const { background, setBackgroundImage, setBackgroundColor } = useSettingsStore();
  const [tab, setTab] = useState<'images' | 'colors'>('images');

  const handleSelectImage = (imageId: string) => {
    setBackgroundImage(imageId);
    onClose();
  };

  const handleSelectColor = (colorId: string) => {
    setBackgroundColor(colorId);
    onClose();
  };

  const renderImageGrid = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.gridContainer}
      showsVerticalScrollIndicator={false}
    >
      {BACKGROUND_IMAGES.map((image) => (
        <TouchableOpacity
          key={image.id}
          style={[
            styles.imageItem,
            background.imageId === image.id && background.type === 'image' && {
              borderColor: theme.colors.primary,
              borderWidth: 3,
            },
          ]}
          onPress={() => handleSelectImage(image.id)}
          activeOpacity={0.7}
        >
          <Image source={image.thumbnail} style={styles.thumbnail} resizeMode="cover" />
          <View style={[styles.imageLabelContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <Text style={styles.imageLabel} numberOfLines={1}>
              {image.name}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      {BACKGROUND_IMAGES.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={{ color: theme.colors.outline }}>
            Henüz arka plan resmi eklenmemiş
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderColorGrid = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.gridContainer}
      showsVerticalScrollIndicator={false}
    >
      {SOLID_COLORS.map((color) => (
        <TouchableOpacity
          key={color.id}
          style={[
            styles.colorItem,
            { backgroundColor: color.color },
            background.colorId === color.id && background.type === 'color' && {
              borderColor: theme.colors.primary,
              borderWidth: 3,
            },
            color.color === '#FFFFFF' && { borderWidth: 1, borderColor: theme.colors.outline },
          ]}
          onPress={() => handleSelectColor(color.id)}
          activeOpacity={0.7}
        >
          <View style={[styles.colorLabelContainer, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
            <Text style={styles.colorLabel} numberOfLines={1}>
              {color.name}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton icon="close" size={24} onPress={onClose} />
          <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onBackground }]}>
            Arka Plan Resmi
          </Text>
          <View style={{ width: 48 }} />
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <SegmentedButtons
            value={tab}
            onValueChange={(value) => setTab(value as 'images' | 'colors')}
            buttons={[
              { value: 'images', label: 'Varsayılan' },
              { value: 'colors', label: 'Düz Renk' },
            ]}
            style={styles.segmentedButtons}
          />
        </View>

        {/* Content */}
        {tab === 'images' ? renderImageGrid() : renderColorGrid()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontWeight: '600',
  },
  tabContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  segmentedButtons: {
    borderRadius: borderRadius.full,
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: GRID_PADDING,
    gap: GRID_GAP,
  },
  imageItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE * 1.4,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  imageLabelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
  },
  imageLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  colorItem: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  colorLabelContainer: {
    padding: spacing.sm,
  },
  colorLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
});
