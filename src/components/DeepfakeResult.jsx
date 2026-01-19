import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/utils/useTheme';
import { Shield, AlertTriangle, AlertCircle } from 'lucide-react-native';

export default function DeepfakeResult({ result }) {
  const theme = useTheme();

  if (!result) return null;

  const getResultColor = () => {
    if (result.verification_result.includes('🟢')) return theme.colors.safe;
    if (result.verification_result.includes('🔴')) return theme.colors.emergency;
    return theme.colors.warning;
  };

  const getResultIcon = () => {
    if (result.verification_result.includes('🟢')) return Shield;
    if (result.verification_result.includes('🔴')) return AlertCircle;
    return AlertTriangle;
  };

  const ResultIcon = getResultIcon();
  const resultColor = getResultColor();

  return (
    <View style={styles.container}>
      {/* Main Result */}
      <View style={[styles.resultCard, { backgroundColor: theme.colors.elevated }]}>
        <View style={[styles.iconContainer, { backgroundColor: resultColor }]}>
          <ResultIcon size={32} color="#FFFFFF" strokeWidth={2} />
        </View>
        <Text style={[styles.resultText, { color: theme.colors.text }]}>
          {result.verification_result}
        </Text>
        <Text style={[styles.confidenceText, { color: theme.colors.textSecondary }]}>
          Confidence: {result.confidence_score.toFixed(1)}%
        </Text>
      </View>

      {/* Explanation */}
      <View style={[styles.section, { backgroundColor: theme.colors.elevated }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Analysis
        </Text>
        <Text style={[styles.explanationText, { color: theme.colors.textSecondary }]}>
          {result.explanation}
        </Text>
      </View>

      {/* Detailed Findings */}
      {result.detailed_findings && result.detailed_findings.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.colors.elevated }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Detailed Findings
          </Text>
          {result.detailed_findings.map((finding, index) => (
            <View key={index} style={styles.findingItem}>
              <Text style={[styles.bullet, { color: theme.colors.textSecondary }]}>•</Text>
              <Text style={[styles.findingText, { color: theme.colors.textSecondary }]}>
                {finding}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <View style={[styles.section, { backgroundColor: theme.colors.elevated }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            What You Can Do
          </Text>
          {result.recommendations.map((rec, index) => (
            <View key={index} style={styles.findingItem}>
              <Text style={[styles.bullet, { color: theme.colors.textSecondary }]}>•</Text>
              <Text style={[styles.findingText, { color: theme.colors.textSecondary }]}>
                {rec}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  resultCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultText: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  section: {
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  findingItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 4,
  },
  bullet: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginRight: 8,
  },
  findingText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
});
