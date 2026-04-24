import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/useTheme';

const BrandingHeader = () => {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View style={styles.topSection}>
      {/* Header Buttons */}
      <View style={styles.headerButtons}>
        <TouchableOpacity 
          style={[styles.headerIconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            console.log('[BrandingHeader] Theme button pressed');
            toggleTheme();
          }}
        >
          <Image
            source={require('../assets/logos/dark-mode.png')}
            style={[styles.headerIcon, { tintColor: colors.text }]}
          />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.headerIconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Image
            source={require('../assets/icons/report-icon.png')}
            style={[styles.headerIcon, { tintColor: colors.text }]}
          />
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <Image
        source={isDark ? require('../assets/logos/logo-white.png') : require('../assets/logos/logo-black.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]}>
        Mentrix<Text style={{ color: '#2563eb' }}>OS</Text>
      </Text>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          MentrixOS = <Text style={styles.orange}>Mentor</Text> + Matrix +{' '}
          <Text style={styles.purple}>Metrics</Text>
        </Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          combined into one <Text style={[styles.boldBlack, { color: colors.text }]}>Operating System</Text>{' '}
          for your institute
        </Text>
      </View>
    </View>
  );
};

export default BrandingHeader;

const styles = StyleSheet.create({
  headerButtons: {
    flexDirection: 'row-reverse',
    paddingTop: 10,
    gap: 12,
    width: '100%',
    zIndex: 10,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
  },
  headerIcon: {
    width: 24,
    height: 24,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    width: '100%',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
    marginTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitleContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  orange: {
    color: '#F97316',
    fontWeight: '700',
  },
  purple: {
    color: '#8B5CF6',
    fontWeight: '700',
  },
  desc: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
    opacity: 0.8,
  },
  boldBlack: {
    fontWeight: '700',
  },
});
