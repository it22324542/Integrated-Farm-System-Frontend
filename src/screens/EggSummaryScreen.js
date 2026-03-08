import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from "react-native";

const API_BASE = "http://localhost:5000/api";
const { width } = Dimensions.get("window");

export default function EggSummaryScreen() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [gradingSummary, setGradingSummary] = useState(null);
  const [qualitySummary, setQualitySummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const [gradingRes, qualityRes] = await Promise.all([
        fetch(`${API_BASE}/egg-grading/dailySummary?date=${date}`),
        fetch(`${API_BASE}/egg-quality/dailySummary?date=${date}`),
      ]);

      const gradingData = await gradingRes.json();
      const qualityData = await qualityRes.json();

      setGradingSummary(gradingData.summary);
      setQualitySummary(qualityData.summary);
    } catch (err) {
      console.error(err);
      setError("Failed to load data. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const ProgressBar = ({ percentage, color }) => (
    <View style={styles.progressBarContainer}>
      <View
        style={[
          styles.progressBarFill,
          { width: `${percentage}%`, backgroundColor: color },
        ]}
      />
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Egg Report</Text>
        <Text style={styles.subtitle}>Grading & Quality Overview</Text>
      </View>

      <View style={styles.controlCard}>
        <Text style={styles.label}>Select Date</Text>
        <View style={styles.dateRow}>
          <TextInput
            style={styles.dateInput}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity
            style={[styles.loadButton, loading && styles.loadButtonDisabled]}
            onPress={fetchSummary}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loadButtonText}>Load</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.content}>
        {gradingSummary && (
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Grading Breakdown</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Eggs</Text>
              <Text style={styles.totalValue}>{gradingSummary.total}</Text>
            </View>

            {[
              { label: "Grade A", value: gradingSummary.A, pct: gradingSummary.A_percentage, color: "#22c55e" },
              { label: "Grade B", value: gradingSummary.B, pct: gradingSummary.B_percentage, color: "#f59e0b" },
              { label: "Grade C", value: gradingSummary.C, pct: gradingSummary.C_percentage, color: "#ef4444" },
            ].map((item, index) => (
              <View key={index} style={styles.statItem}>
                <View style={styles.labelRow}>
                  <Text style={[styles.statLabel, { color: item.color }]}>{item.label}</Text>
                  <Text style={styles.statPct}>{item.pct.toFixed(1)}%</Text>
                </View>
                <ProgressBar percentage={item.pct} color={item.color} />
                <Text style={styles.statCount}>{item.value} eggs</Text>
              </View>
            ))}
          </View>
        )}

        {qualitySummary && (
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Quality Summary</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Inspected</Text>
              <Text style={styles.totalValue}>{qualitySummary.total}</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.labelRow}>
                <Text style={[styles.statLabel, { color: "#22c55e" }]}>Good Quality</Text>
                <Text style={styles.statPct}>{qualitySummary.good_percentage?.toFixed(1) || 0}%</Text>
              </View>
              <ProgressBar percentage={qualitySummary.good_percentage || 0} color="#22c55e" />
              <Text style={styles.statCount}>{qualitySummary.good} eggs</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.labelRow}>
                <Text style={[styles.statLabel, { color: "#ef4444" }]}>Defective</Text>
                <Text style={styles.statPct}>
                  {((qualitySummary.bad / qualitySummary.total) * 100 || 0).toFixed(1)}%
                </Text>
              </View>
              <ProgressBar percentage={(qualitySummary.bad / qualitySummary.total) * 100 || 0} color="#ef4444" />
              <Text style={styles.statCount}>{qualitySummary.bad} eggs</Text>
            </View>
          </View>
        )}

        {!gradingSummary && !qualitySummary && !loading && !error && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>No data loaded yet</Text>
            <Text style={styles.emptyHint}>Choose a date and tap Load</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 24,
    paddingTop: 40,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748b",
  },

  controlCard: {
    margin: 16,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateInput: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  loadButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 100,
  },
  loadButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  loadButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  errorBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: "#ef4444",
  },
  errorText: {
    color: "#991b1b",
    fontSize: 14,
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0f172a",
  },

  statItem: {
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 15,
    color: "#475569",
    fontWeight: "500",
  },
  totalValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1e293b",
    marginTop: 4,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  statPct: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
  },
  statCount: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    textAlign: "right",
  },

  progressBarContainer: {
    height: 10,
    backgroundColor: "#e2e8f0",
    borderRadius: 5,
    overflow: "hidden",
    marginVertical: 6,
  },
  progressBarFill: {
    height: "100%",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: "#94a3b8",
  },
});