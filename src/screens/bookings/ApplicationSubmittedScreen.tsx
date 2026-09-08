import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { getBaseUrl } from "../../api/client";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "ApplicationSubmitted"
>;

const ApplicationSubmittedScreen = ({ navigation, route }: Props) => {
  const {
    applicationNumber,
    flatNumber,
    applicationId,
    pdfUrl,
    bookingAmount,
  } = route.params;

  const [downloading, setDownloading] = useState(false);

  const finalPdfUrl =
    pdfUrl ||
    (applicationId
      ? `${getBaseUrl()}/api/applications/${applicationId}/pdf`
      : `${getBaseUrl()}/api/applications/1/pdf`);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      console.log("Opening Application PDF:", finalPdfUrl);

      const supported = await Linking.canOpenURL(finalPdfUrl);
      if (supported) {
        await Linking.openURL(finalPdfUrl);
      } else {
        await Linking.openURL(finalPdfUrl);
      }
    } catch (error: any) {
      console.log("Error downloading PDF:", error);
      Alert.alert(
        "PDF Document",
        `Your application (${applicationNumber}) PDF is generated. It can also be accessed anytime under Profile > Documents.\n\nLink: ${finalPdfUrl}`
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* SUCCESS BADGE */}
      <View style={styles.circle}>
        <Text style={styles.check}>✓</Text>
      </View>

      <Text style={styles.title}>Booking Confirmed!</Text>

      <Text style={styles.subtitle}>
        Your flat booking application and payment token have been submitted
        successfully.
      </Text>

      {/* APPLICATION & PAYMENT DETAILS CARD */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardTitle}>Application Details</Text>
          <View style={styles.verifiedPill}>
            <Text style={styles.verifiedText}>● Verified</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Application Number</Text>
          <Text style={styles.application}>{applicationNumber}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Flat / Unit</Text>
          <Text style={styles.flat}>{flatNumber}</Text>
        </View>

        {bookingAmount ? (
          <View style={styles.row}>
            <Text style={styles.label}>Token Amount Paid</Text>
            <Text style={styles.amount}>
              ₹{Number(bookingAmount).toLocaleString("en-IN")}
            </Text>
          </View>
        ) : null}

        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.status}>Payment Received & Submitted</Text>
        </View>
      </View>

      {/* 📥 DOWNLOAD PDF BUTTON */}
      <TouchableOpacity
        style={[styles.downloadButton, downloading && styles.buttonDisabled]}
        activeOpacity={0.85}
        disabled={downloading}
        onPress={handleDownloadPdf}
      >
        {downloading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <View style={styles.downloadRow}>
            <Text style={styles.downloadIcon}>📥</Text>
            <Text style={styles.downloadButtonText}>
              DOWNLOAD APPLICATION PDF
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* VIEW DOCUMENTS BUTTON */}
      <TouchableOpacity
        style={styles.documentsButton}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("Documents")}
      >
        <Text style={styles.documentsButtonText}>
          📁 VIEW IN MY DOCUMENTS
        </Text>
      </TouchableOpacity>

      {/* VIEW MY BOOKING BUTTON */}
      <TouchableOpacity
        style={styles.summaryButton}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("BookingSummary")}
      >
        <Text style={styles.summaryButtonText}>
          VIEW BOOKING SUMMARY
        </Text>
      </TouchableOpacity>

      {/* BACK TO DASHBOARD */}
      <TouchableOpacity
        style={styles.homeContainer}
        onPress={() => navigation.replace("Dashboard")}
      >
        <Text style={styles.home}>Back to Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  circle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#86EFAC",
  },
  check: {
    fontSize: 48,
    color: "#16A34A",
    fontWeight: "900",
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 20,
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: "center",
    color: "#64748B",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B",
  },
  verifiedPill: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  verifiedText: {
    color: "#15803D",
    fontSize: 11,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 14,
  },
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  application: {
    fontSize: 19,
    fontWeight: "800",
    color: "#2563EB",
    marginTop: 2,
  },
  flat: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 2,
  },
  amount: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
  },
  status: {
    marginTop: 2,
    color: "#16A34A",
    fontWeight: "700",
    fontSize: 14,
  },

  // Buttons
  downloadButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#16A34A",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  downloadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  downloadIcon: {
    fontSize: 20,
  },
  downloadButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  documentsButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#EFF6FF",
    borderWidth: 1.5,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  documentsButtonText: {
    color: "#1D4ED8",
    fontWeight: "800",
    fontSize: 14,
  },
  summaryButton: {
    width: "100%",
    height: 52,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  summaryButtonText: {
    color: "#334155",
    fontWeight: "800",
    fontSize: 14,
  },
  homeContainer: {
    marginTop: 20,
    padding: 8,
  },
  home: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default ApplicationSubmittedScreen;