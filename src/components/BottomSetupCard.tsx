import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme/useTheme';

const BottomSetupCard = () => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <View style={[styles.container, isTablet && styles.tabletContainer]}>
      {/* Branding Text Container */}
      <View style={styles.brandingWrapper}>
        <View style={styles.brandingSection}>
          <Text style={[styles.easyText, { color: colors.text }]}>Easy-to-Use, End-to-End</Text>
          <Text style={[styles.aiText, { color: colors.textSecondary }]}>Smart AI SaaS for Your Institute</Text>
        </View>
      </View>

      {/* Setup Card */}
      <View style={[styles.setupCardWrapper, isTablet && styles.tabletCardWrapper]}>
        <TouchableOpacity style={[styles.setupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.setupLabel, { color: colors.textSecondary }]}>Don't have an institute yet?</Text>
          <View style={styles.setupLinkRow}>
            <Text style={[styles.setupLinkText, { color: colors.primary }]}>Setup Institute</Text>
            <Text style={[styles.secondaryBlueText, { color: colors.primary }]}> →</Text>
          </View>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            By continuing, you agree to our{' '}
            <Text style={[styles.linkText, { color: colors.primary }]}>Terms & Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default BottomSetupCard;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
  },
  tabletContainer: {
    alignSelf: 'center',
    maxWidth: 480,
  },
  brandingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  brandingSection: {
    alignItems: 'center',
  },
  easyText: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  aiText: {
    fontSize: 14,
  },
  setupCardWrapper: {
    paddingBottom: 20,
  },
  tabletCardWrapper: {
    width: '100%',
  },
  setupCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  setupLabel: {
    fontSize: 15,
    marginBottom: 6,
  },
  setupLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setupLinkText: {
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBlueText: {
    fontSize: 17,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
  linkText: {
    fontWeight: '600',
  },
});
