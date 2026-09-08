import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { apiClient, getBaseUrl } from "../../api/client";

interface StoredApplication {
  applicationId?: number;
  applicationNumber?: string;
  pdfUrl?: string;
  submittedAt?: string;
  flat?: any;
  applicant?: any;
}

const STATIC_DOCS = [
  {
    type: "application",
    name: "Booking Application",
    desc: "Application form and buyer declaration",
    statusBadge: "Available",
    icon: "📄",
  },
  {
    type: "receipt",
    name: "Payment Receipt",
    desc: "Token amount confirmation receipt",
    statusBadge: "Available",
    icon: "🧾",
  },
  {
    type: "allotment",
    name: "Allotment Letter",
    desc: "Official flat allotment from builder",
    statusBadge: "Pending Approval",
    icon: "📜",
  },
  {
    type: "agreement",
    name: "Apartment Buyers Agreement",
    desc: "Legal agreement and terms of sale",
    statusBadge: "After 10% Payment",
    icon: "📑",
  },
  {
    type: "statement",
    name: "Payment Statement",
    desc: "Complete ledger of paid & due installments",
    statusBadge: "On Demand",
    icon: "📊",
  },
  {
    type: "possession",
    name: "Possession Letter",
    desc: "Handover certificate upon completion",
    statusBadge: "At Handover",
    icon: "🔑",
  },
];

const DocumentsScreen = () => {
  const [bookingApp, setBookingApp] = useState<StoredApplication | null>(null);
  const [loading, setLoading] = useState(false);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      // Check local storage first
      let localApp: StoredApplication | null = null;
      const storedJson = await AsyncStorage.getItem("@latest_booking_application");
      if (storedJson) {
        try {
          localApp = JSON.parse(storedJson);
          setBookingApp(localApp);
        } catch (_) {}
      }

      // Check API for latest applications
      try {
        const res = await apiClient.get("/api/applications", { timeout: 8000 });
        const rawData = res.data?.data;
        const items = Array.isArray(rawData)
          ? rawData
          : (Array.isArray(rawData?.items) ? rawData.items : []);

        if (items.length > 0) {
          // Find matching application if locally saved, or pick latest
          let matched = null;
          if (localApp?.applicationId) {
            matched = items.find((it: any) => Number(it.id) === Number(localApp?.applicationId));
          }
          if (!matched && localApp?.applicationNumber) {
            matched = items.find((it: any) => it.application_number === localApp?.applicationNumber);
          }
          if (!matched) {
            const sorted = [...items].sort((a: any, b: any) => Number(b.id) - Number(a.id));
            matched = sorted[0];
          }

          if (matched) {
            setBookingApp((prev) => ({
              ...prev,
              applicationId: matched.id,
              applicationNumber: matched.application_number,
              pdfUrl: `${getBaseUrl()}/api/applications/${matched.id}/pdf`,
              flat: {
                ...(prev?.flat || {}),
                flatNumber: matched.flat_number || prev?.flat?.flatNumber,
                tower: matched.tower || prev?.flat?.tower,
                block: matched.block || prev?.flat?.block,
              },
            }));
          }
        }
      } catch (apiErr) {
        console.log("Documents API check error:", apiErr);
      }
    } catch (e) {
      console.log("Error reading documents:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDocuments();
    }, [])
  );

  const handleDocumentClick = async (docType: string, docName: string) => {
    if (docType === "application" || docType === "receipt") {
      if (!bookingApp?.applicationId && !bookingApp?.applicationNumber) {
        Alert.alert(
          docName,
          "No booking application found. Once you submit an application and complete payment, the official PDF will be available here for download."
        );
        return;
      }

      const pdfUrl =
        bookingApp?.pdfUrl ||
        `${getBaseUrl()}/api/applications/${bookingApp.applicationId || 1}/pdf`;

      Alert.alert(
        docName,
        `Application No: ${bookingApp.applicationNumber || "DRT-APP"}\n\nWould you like to open and download your application PDF?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Download / Open",
            onPress: async () => {
              try {
                console.log("Opening document URL:", pdfUrl);
                await Linking.openURL(pdfUrl);
              } catch (err) {
                Alert.alert(
                  docName,
                  `Direct PDF URL:\n${pdfUrl}\n\nApp No: ${bookingApp.applicationNumber || "DRT-APP"}`
                );
              }
            },
          },
        ]
      );
      return;
    }

    if (docType === "allotment") {
      Alert.alert(
        docName,
        "Allotment Letter is issued after the DION verification team approves your booking application."
      );
      return;
    }

    if (docType === "agreement") {
      Alert.alert(
        docName,
        "Apartment Buyers Agreement (BBA) will be executed and uploaded after payment of the first 10% installment."
      );
      return;
    }

    Alert.alert(
      docName,
      "This document will be available once the relevant project milestone is reached."
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>My Documents</Text>
      <Text style={styles.subtitle}>
        Access, view, and download all your flat booking documents
      </Text>

      {/* SAVED APPLICATION HIGHLIGHT (IF AVAILABLE) */}
      {bookingApp?.applicationNumber ? (
        <View style={styles.savedBanner}>
          <View style={styles.savedBannerIcon}>
            <Text style={styles.savedBannerIconText}>📁</Text>
          </View>
          <View style={styles.savedBannerContent}>
            <Text style={styles.savedBannerTitle}>
              Application: {bookingApp.applicationNumber}
            </Text>
            <Text style={styles.savedBannerSubtitle}>
              Unit: {bookingApp.flat?.flatNumber || "A-101"} •{" "}
              {bookingApp.flat?.tower || "Tower A"} (Ready to Download)
            </Text>
          </View>
        </View>
      ) : null}

      {/* DOCUMENTS LIST */}
      {STATIC_DOCS.map((doc) => {
        const isAppDoc = doc.type === "application" || doc.type === "receipt";
        const isReady = isAppDoc && Boolean(bookingApp?.applicationNumber);

        return (
          <TouchableOpacity
            key={doc.type}
            style={[styles.card, isReady && styles.cardActive]}
            activeOpacity={0.75}
            onPress={() => handleDocumentClick(doc.type, doc.name)}
          >
            <View style={styles.iconWrapper}>
              <Text style={styles.icon}>{doc.icon}</Text>
            </View>

            <View style={styles.info}>
              <View style={styles.titleRow}>
                <Text style={styles.name}>{doc.name}</Text>
                <View
                  style={[
                    styles.badge,
                    isReady ? styles.badgeSuccess : styles.badgeDefault,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      isReady && styles.badgeTextSuccess,
                    ]}
                  >
                    {isReady ? "Download PDF" : doc.statusBadge}
                  </Text>
                </View>
              </View>

              <Text style={styles.desc}>{doc.desc}</Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    marginBottom: 20,
  },
  savedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1.5,
    borderColor: "#BFDBFE",
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  savedBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  savedBannerIconText: {
    fontSize: 20,
  },
  savedBannerContent: {
    flex: 1,
  },
  savedBannerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E3A8A",
  },
  savedBannerSubtitle: {
    fontSize: 12,
    color: "#3B82F6",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardActive: {
    borderColor: "#93C5FD",
    backgroundColor: "#FFFFFF",
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 22,
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
  },
  desc: {
    fontSize: 12,
    color: "#64748B",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeDefault: {
    backgroundColor: "#F1F5F9",
  },
  badgeSuccess: {
    backgroundColor: "#DCFCE7",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
  },
  badgeTextSuccess: {
    color: "#15803D",
  },
  arrow: {
    fontSize: 22,
    color: "#94A3B8",
    marginLeft: 10,
  },
});

export default DocumentsScreen;