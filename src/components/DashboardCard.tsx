import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface DashboardCardProps {
  title: string;
  subtitle: string;
  description?: string;
  backgroundColor: string;
  accentColor: string;
}

const DashboardCard = ({ title, subtitle, description, backgroundColor, accentColor }: DashboardCardProps) => {
  return (
    <View style={[styles.card, { backgroundColor }]}>
      <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: accentColor }]}>{subtitle}</Text>
      {description && <Text style={[styles.description, { color: accentColor }]}>{description}</Text>}
    </View>
  );
};

export default DashboardCard;

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    opacity: 0.8,
  },
});
