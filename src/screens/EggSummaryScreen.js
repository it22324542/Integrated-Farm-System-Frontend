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
  Alert,
  Platform,
} from "react-native";
import {
  PieChart,
} from "react-native-chart-kit";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

const API_BASE = "http://localhost:5000/api";
const { width: screenWidth } = Dimensions.get("window");

const chartConfig = {
  backgroundGradientFrom: "#0cbe0f",
  backgroundGradientTo: "#28b310",
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: () => `#64748b`,
  style: {
    borderRadius: 16,
  },
};

export default function EggSummaryScreen() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [gradingSummary, setGradingSummary] = useState(null);
  const [qualitySummary, setQualitySummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const [gradingRes, qualityRes] = await Promise.all([
        fetch(`${API_BASE}/egg-grading/dailySummary?date=${date}`),
        fetch(`${API_BASE}/egg-quality/dailySummary?date=${date}`),
      ]);

      if (!gradingRes.ok || !qualityRes.ok) {
        throw new Error("One or both API calls failed");
      }

      const gradingData = await gradingRes.json();
      const qualityData = await qualityRes.json();

      setGradingSummary(gradingData.summary);
      setQualitySummary(qualityData.summary);
    } catch (err) {
      console.error(err);
      setError("Failed to load data. Please check connection or date format.");
    } finally {
      setLoading(false);
    }
  };

  const generateAndSaveReport = async () => {
    if (!gradingSummary && !qualitySummary) return;

    setPdfGenerating(true);

    try {
      const html = generateReportHTML();

      const { uri } = await Print.printToFileAsync({
        html,
      });

      // Try to save/show "Save to Files" option
      const canShare = await Sharing.isAvailableAsync();

      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: "Save Daily Egg Report",
          UTI: ".pdf",                // Helps iOS suggest "Save to Files"
          saveToFiles: true,           // Key for iOS → shows Save to Files
        });

        Alert.alert(
          "Success",
          "Report generated!\n\n" +
          (Platform.OS === "ios"
            ? "Use 'Save to Files' to store it in your Documents/Downloads."
            : "Choose 'Save to Files' or 'Downloads' from the share options.")
        );
      } else {
        Alert.alert(
          "Saved to cache",
          `PDF file created at:\n${uri}\n\n(Share not available on this device)`
        );
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
      Alert.alert("Error", "Failed to generate or save the report.");
    } finally {
      setPdfGenerating(false);
    }
  };

  const generateReportHTML = () => {
    const today = new Date().toLocaleDateString("en-GB");
    const reportDate = date;

    let gradingHTML = "";
    if (gradingSummary) {
      const total = gradingSummary.total || 0;
      const a = gradingSummary.A || 0;
      const b = gradingSummary.B || 0;
      const c = gradingSummary.C || 0;
      const aPct = (gradingSummary.A_percentage || 0).toFixed(1);
      const bPct = (gradingSummary.B_percentage || 0).toFixed(1);
      const cPct = (gradingSummary.C_percentage || 0).toFixed(1);

      gradingHTML = `
        <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Grading Breakdown</h2>
        <p><strong>Total Eggs:</strong> ${total}</p>
        <ul style="list-style: none; padding: 0;">
          <li style="margin: 12px 0; color: #22c55e;">Grade A: ${a} eggs (${aPct}%)</li>
          <li style="margin: 12px 0; color: #f59e0b;">Grade B: ${b} eggs (${bPct}%)</li>
          <li style="margin: 12px 0; color: #ef4444;">Grade C: ${c} eggs (${cPct}%)</li>
        </ul>
      `;
    }

    let qualityHTML = "";
    if (qualitySummary) {
      const total = qualitySummary.total || 0;
      const good = qualitySummary.good || 0;
      const bad = qualitySummary.bad || 0;
      const goodPct = (qualitySummary.good_percentage || 0).toFixed(1);
      const badPct = (((bad / (total || 1)) * 100) || 0).toFixed(1);

      qualityHTML = `
        <h2 style="color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Quality Summary</h2>
        <p><strong>Total Inspected:</strong> ${total}</p>
        <ul style="list-style: none; padding: 0;">
          <li style="margin: 12px 0; color: #22c55e;">Good Quality: ${good} eggs (${goodPct}%)</li>
          <li style="margin: 12px 0; color: #ef4444;">Defective: ${bad} eggs (${badPct}%)</li>
        </ul>
      `;
    }

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; color: #1e293b; line-height: 1.6; }
            h1 { color: #0f172a; text-align: center; }
            .meta { text-align: center; color: #64748b; margin-bottom: 32px; font-size: 15px; }
            .section { margin-bottom: 40px; }
          </style>
        </head>
        <body>
          <h1>Daily Egg Report</h1>
          <div class="meta">
            Report Date: ${reportDate} • Generated: ${today}
          </div>

          <div class="section">${gradingHTML}</div>
          <div class="section">${qualityHTML}</div>

          <p style="text-align: center; color: #94a3b8; margin-top: 60px; font-size: 13px;">
            Generated from Integrated Farm System • Colombo, Sri Lanka
          </p>
        </body>
      </html>
    `;
  };

  const ProgressBar = ({ percentage, color }) => (
    <View style={styles.progressBarContainer}>
      <View
        style={[
          styles.progressBarFill,
          { width: `${Math.min(percentage, 100)}%`, backgroundColor: color },
        ]}
      />
    </View>
  );

  const gradingChartData = gradingSummary
    ? [
        { name: "Grade A", population: gradingSummary.A || 0, color: "#22c55e", legendFontColor: "#475569", legendFontSize: 13 },
        { name: "Grade B", population: gradingSummary.B || 0, color: "#f59e0b", legendFontColor: "#475569", legendFontSize: 13 },
        { name: "Grade C", population: gradingSummary.C || 0, color: "#ef4444", legendFontColor: "#475569", legendFontSize: 13 },
      ].filter((item) => item.population > 0)
    : [];

  const qualityChartData = qualitySummary
    ? [
        { name: "Good Quality", population: qualitySummary.good || 0, color: "#22c55e", legendFontColor: "#475569", legendFontSize: 13 },
        { name: "Defective", population: qualitySummary.bad || 0, color: "#ef4444", legendFontColor: "#475569", legendFontSize: 13 },
      ].filter((item) => item.population > 0)
    : [];

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
        {(gradingSummary || qualitySummary) && (
          <TouchableOpacity
            style={[
              styles.reportButton,
              pdfGenerating && styles.reportButtonDisabled,
            ]}
            onPress={generateAndSaveReport}
            disabled={pdfGenerating || loading}
          >
            {pdfGenerating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.reportButtonText}>Generate & Save Report (PDF)</Text>
            )}
          </TouchableOpacity>
        )}

        {gradingSummary && (
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Grading Breakdown</Text>
            </View>

            {gradingChartData.length > 0 ? (
              <View style={{ alignItems: "center", marginVertical: 12 }}>
                <PieChart
                  data={gradingChartData}
                  width={screenWidth - 48}
                  height={220}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            ) : (
              <Text style={{ textAlign: "center", color: "#64748b", marginVertical: 20 }}>
                No grading distribution available
              </Text>
            )}

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Eggs</Text>
              <Text style={styles.totalValue}>{gradingSummary.total || 0}</Text>
            </View>

            {[
              { label: "Grade A", value: gradingSummary.A, pct: gradingSummary.A_percentage, color: "#22c55e" },
              { label: "Grade B", value: gradingSummary.B, pct: gradingSummary.B_percentage, color: "#f59e0b" },
              { label: "Grade C", value: gradingSummary.C, pct: gradingSummary.C_percentage, color: "#ef4444" },
            ].map((item, index) => (
              <View key={index} style={styles.statItem}>
                <View style={styles.labelRow}>
                  <Text style={[styles.statLabel, { color: item.color }]}>{item.label}</Text>
                  <Text style={styles.statPct}>{(item.pct || 0).toFixed(1)}%</Text>
                </View>
                <ProgressBar percentage={item.pct || 0} color={item.color} />
                <Text style={styles.statCount}>{item.value || 0} eggs</Text>
              </View>
            ))}
          </View>
        )}

        {qualitySummary && (
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Quality Summary</Text>
            </View>

            {qualityChartData.length > 0 ? (
              <View style={{ alignItems: "center", marginVertical: 12 }}>
                <PieChart
                  data={qualityChartData}
                  width={screenWidth - 48}
                  height={200}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            ) : (
              <Text style={{ textAlign: "center", color: "#64748b", marginVertical: 20 }}>
                No quality distribution available
              </Text>
            )}

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Inspected</Text>
              <Text style={styles.totalValue}>{qualitySummary.total || 0}</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.labelRow}>
                <Text style={[styles.statLabel, { color: "#22c55e" }]}>Good Quality</Text>
                <Text style={styles.statPct}>
                  {(qualitySummary.good_percentage || 0).toFixed(1)}%
                </Text>
              </View>
              <ProgressBar percentage={qualitySummary.good_percentage || 0} color="#22c55e" />
              <Text style={styles.statCount}>{qualitySummary.good || 0} eggs</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.labelRow}>
                <Text style={[styles.statLabel, { color: "#ef4444" }]}>Defective</Text>
                <Text style={styles.statPct}>
                  {(((qualitySummary.bad || 0) / (qualitySummary.total || 1)) * 100).toFixed(1)}%
                </Text>
              </View>
              <ProgressBar
                percentage={((qualitySummary.bad || 0) / (qualitySummary.total || 1)) * 100}
                color="#ef4444"
              />
              <Text style={styles.statCount}>{qualitySummary.bad || 0} eggs</Text>
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
  reportButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#8b5cf6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  reportButtonDisabled: {
    backgroundColor: "#c4b5fd",
  },
  reportButtonText: {
    color: "#ffffff",
    fontSize: 16,
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