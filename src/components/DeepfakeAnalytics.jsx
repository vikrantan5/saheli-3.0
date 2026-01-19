import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '@/utils/useTheme';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');
const chartWidth = width - 48;
const chartHeight = 200;

export default function DeepfakeAnalytics({ result }) {
  const theme = useTheme();

  if (!result) return null;

  const metrics = [
    {
      label: 'Deepfake Probability',
      value: result.deepfake_probability,
      color: result.deepfake_probability > 70 ? theme.colors.emergency : theme.colors.warning,
    },
    {
      label: 'Face Consistency',
      value: result.face_consistency_score,
      color: theme.colors.safe,
    },
    {
      label: 'Texture Anomaly',
      value: result.texture_anomaly_score,
      color: theme.colors.warning,
    },
    {
      label: 'Metadata Integrity',
      value: result.metadata_integrity,
      color: theme.colors.info,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.elevated }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Image Analytics
      </Text>

      <View style={styles.metricsContainer}>
        {metrics.map((metric, index) => (
          <View key={index} style={styles.metricItem}>
            <View style={styles.metricHeader}>
              <Text style={[styles.metricLabel, { color: theme.colors.text }]}>
                {metric.label}
              </Text>
              <Text style={[styles.metricValue, { color: theme.colors.text }]}>
                {metric.value.toFixed(0)}%
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.divider }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${metric.value}%`,
                    backgroundColor: metric.color,
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {/* Overall Score */}
      <View style={styles.overallScore}>
        <Text style={[styles.overallLabel, { color: theme.colors.textSecondary }]}>
          Overall Authenticity Score
        </Text>
        <Text style={[styles.overallValue, { color: theme.colors.text }]}>
          {(100 - result.deepfake_probability).toFixed(0)}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 16,
  },
  metricsContainer: {
    gap: 16,
  },
  metricItem: {
    gap: 8,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  metricValue: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  overallScore: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    alignItems: 'center',
  },
  overallLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
  },
  overallValue: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
  },
});
