import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { spacing, borderRadius } from '../theme';

const { width } = Dimensions.get('window');

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  description: string;
  onPress: () => void;
}

interface MoreMenuModalProps {
  visible: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}

export function MoreMenuModal({ visible, onClose, menuItems }: MoreMenuModalProps) {
  const theme = useTheme();
  // Tema bazlı renkler
  const menuItemBgColor = theme.colors.surfaceVariant;
  const buttonTextColor = theme.colors.onSurface;
  const buttonDescColor = theme.colors.onSurfaceVariant;
  const menuIconColor = theme.colors.primary;
  const menuIconBgColor = theme.colors.primary + '20';
  const chevronColor = theme.colors.outline;
  // Kapatma butonu için özel renkler
  const closeButtonBgColor = theme.dark ? '#E5E5E5' : theme.colors.surfaceVariant;
  const closeButtonTextColor = theme.dark ? '#1a1a1a' : theme.colors.onSurface;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
              {/* Handle bar */}
              <View style={styles.handleBar} />

              {/* Title */}
              <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                Daha Fazla
              </Text>

              {/* Menu Items */}
              <View style={styles.menuList}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.menuItem,
                      { backgroundColor: menuItemBgColor },
                      index === menuItems.length - 1 && styles.lastMenuItem,
                    ]}
                    onPress={() => {
                      onClose();
                      item.onPress();
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconContainer, { backgroundColor: menuIconBgColor }]}>
                      <Icon name={item.icon} size={28} color={menuIconColor} />
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={[styles.menuTitle, { color: buttonTextColor }]}>
                        {item.title}
                      </Text>
                      <Text style={[styles.menuDescription, { color: buttonDescColor }]}>
                        {item.description}
                      </Text>
                    </View>
                    <Icon name="chevron-right" size={24} color={chevronColor} />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Close Button */}
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: closeButtonBgColor }]}
                onPress={onClose}
              >
                <Text style={[styles.closeButtonText, { color: closeButtonTextColor }]}>
                  Kapat
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + 20,
    paddingTop: spacing.sm,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(128,128,128,0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  menuList: {
    gap: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  lastMenuItem: {
    marginBottom: 0,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 13,
  },
  closeButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
