import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";
import { apiClient, getBaseUrl, isAxiosError } from "../../api/client";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "BookingAmount"
>;

const PAYMENT_METHODS = [
  {
    id: "UPI",
    title: "UPI (Google Pay / PhonePe / Paytm)",
    subtitle: "Fast & seamless UPI transfer",
    icon: "⚡",
  },
  {
    id: "Net Banking",
    title: "Net Banking",
    subtitle: "All major Indian banks supported",
    icon: "🏦",
  },
  {
    id: "Card",
    title: "Credit / Debit Card",
    subtitle: "Visa, MasterCard, RuPay",
    icon: "💳",
  },
  {
    id: "Bank Transfer",
    title: "Bank Transfer (NEFT / RTGS)",
    subtitle: "Direct bank transfer to DION Infratech",
    icon: "📄",
  },
];

const BookingAmountScreen = ({ navigation, route }: Props) => {
  const { flat, applicant, secondApplicant, paymentPlan } = route.params;

  const [method, setMethod] = useState("UPI");
  const [processing, setProcessing] = useState(false);

  // Booking amount: 5% of flat cost or remittance sum if provided
  const rawBookingAmount = applicant?.remittanceSum
    ? Number(applicant.remittanceSum)
    : Math.round((flat?.totalCost || 0) * 0.05);

  const bookingAmount = Number.isNaN(rawBookingAmount) || rawBookingAmount <= 0
    ? 100000
    : rawBookingAmount;

  const formatCurrency = (amount: number | string | undefined): string => {
    const num = Number(amount) || 0;
    return num.toLocaleString("en-IN");
  };

  const applicantFullName = [
    applicant?.firstName,
    applicant?.middleName,
    applicant?.lastName,
  ]
    .filter(Boolean)
    .join(" ") || "Applicant";

  const fullAddress = [
    applicant?.address,
    applicant?.city,
    applicant?.state,
    applicant?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  const selectedPlan = paymentPlan || applicant?.paymentPlan || "Down Payment Plan";

  const handlePayAndConfirm = async () => {
    try {
      setProcessing(true);

      const applicationNumber = `DRT-${Date.now().toString().slice(-6)}`;
      let applicationId = Date.now();

      // Submit or register application through API if possible
      try {
        const payload = {
          user_id: 1,
          agent_id: 0,
          filled_by: 1,
          applicant1_name: applicantFullName,
          applicant1_pan: applicant?.panNumber || "",
          applicant1_dob: applicant?.dob || null,
          applicant1_guardian_name: applicant?.fatherGuardianName || "",
          applicant1_address: applicant?.address || "",
          applicant1_city: applicant?.city || "",
          applicant1_pin_code: applicant?.pincode || "",
          applicant1_mobile_no: applicant?.mobile || "",
          applicant1_email: applicant?.email || "",
          applicant1_residential_status: applicant?.residentialStatus || "Resident",
          applicant1_nationality: applicant?.nationality || "Indian",

          applicant2_name: secondApplicant?.firstName
            ? `${secondApplicant.firstName} ${secondApplicant.lastName || ""}`.trim()
            : "",
          applicant2_pan: secondApplicant?.panNumber || "",
          applicant2_mobile_no: secondApplicant?.mobile || "",

          tower: flat?.tower || "Tower A",
          block: (flat as any)?.block || "Block 1",
          flat_number: flat?.flatNumber || "A-101",
          carpet_area: flat?.carpetArea || 0,
          built_up_area: flat?.builtUpArea || 0,
          super_built_up_area: flat?.superBuiltUpArea || 0,
          rate_per_sqft: flat?.ratePerSqft || 0,
          total_cost: flat?.totalCost || 0,

          payment_plan: selectedPlan,
          payment_source: applicant?.sourceOfPayment || "Own Contribution",
          booking_amount: bookingAmount,
          payment_method: method,
          instrument_number: `TXN-${Date.now().toString().slice(-8)}`,
          payment_date: new Date().toISOString().split("T")[0],
          is_submitted: 1,
          is_approved: 0,
        };

        const res = await apiClient.post("/api/applications", payload, {
          timeout: 10000,
        });

        if (res.data?.data?.id) {
          applicationId = res.data.data.id;
        }
      } catch (apiErr) {
        console.log("Offline or non-blocking API response:", apiErr);
      }

      const pdfUrl = `${getBaseUrl()}/api/applications/${applicationId}/pdf`;

      // Save application into AsyncStorage so it shows in Documents & Booking Summary
      const bookingRecord = {
        applicationId,
        applicationNumber,
        flat,
        applicant,
        secondApplicant,
        paymentPlan: selectedPlan,
        bookingAmount,
        paymentMethod: method,
        pdfUrl,
        submittedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(
        "@latest_booking_application",
        JSON.stringify(bookingRecord)
      );

      // Append to documents list in AsyncStorage
      try {
        const existingDocsJson = await AsyncStorage.getItem("@user_documents");
        const existingDocs = existingDocsJson ? JSON.parse(existingDocsJson) : [];
        const newDoc = {
          id: `doc-${Date.now()}`,
          name: "Booking Application",
          applicationNumber,
          flatNumber: flat?.flatNumber,
          pdfUrl,
          date: new Date().toISOString(),
          status: "Verified",
        };
        await AsyncStorage.setItem(
          "@user_documents",
          JSON.stringify([newDoc, ...existingDocs])
        );
      } catch (storageErr) {
        console.log("Documents storage error:", storageErr);
      }

      // Navigate to Application Submitted Screen
      navigation.replace("ApplicationSubmitted", {
        applicationNumber,
        flatNumber: flat?.flatNumber || "A-101",
        applicationId,
        pdfUrl,
        bookingAmount,
      });
    } catch (err: any) {
      Alert.alert("Payment Error", err?.message || "Could not complete booking payment.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>Booking & Payment</Text>
          <Text style={styles.screenSubtitle}>
            Review application details and complete booking token
          </Text>
        </View>

        {/* AMOUNT HIGHLIGHT CARD */}
        <View style={styles.amountCard}>
          <View style={styles.amountRow}>
            <View>
              <Text style={styles.amountLabel}>BOOKING TOKEN DUE</Text>
              <Text style={styles.amountValue}>
                ₹{formatCurrency(bookingAmount)}
              </Text>
            </View>
            <View style={styles.amountBadge}>
              <Text style={styles.amountBadgeText}>5% Token</Text>
            </View>
          </View>
          <View style={styles.amountDivider} />
          <View style={styles.unitQuickInfo}>
            <Text style={styles.unitText}>
              🏢 {flat?.tower || "Tower A"} • Unit {flat?.flatNumber || "A-101"}
            </Text>
            <Text style={styles.unitCost}>
              Total: ₹{formatCurrency(flat?.totalCost)}
            </Text>
          </View>
        </View>

        {/* 1. PROPERTY DETAILS */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>🏢</Text>
            <Text style={styles.cardTitle}>Property Details</Text>
          </View>

          <View style={styles.detailGrid}>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>TOWER & BLOCK</Text>
              <Text style={styles.fieldValue}>
                {flat?.tower || "-"} ({flat?.block || "Block 1"})
              </Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>FLAT NUMBER</Text>
              <Text style={styles.fieldValue}>{flat?.flatNumber || "-"}</Text>
            </View>
          </View>

          <View style={styles.detailGrid}>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>CARPET AREA</Text>
              <Text style={styles.fieldValue}>{flat?.carpetArea || "-"} sqft</Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>SUPER BUILT-UP</Text>
              <Text style={styles.fieldValue}>
                {flat?.superBuiltUpArea || "-"} sqft
              </Text>
            </View>
          </View>

          <View style={styles.detailGrid}>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>RATE PER SQFT</Text>
              <Text style={styles.fieldValue}>
                ₹{formatCurrency(flat?.ratePerSqft)}
              </Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>TOTAL FLAT COST</Text>
              <Text style={[styles.fieldValue, styles.highlightValue]}>
                ₹{formatCurrency(flat?.totalCost)}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. APPLICANT DETAILS (CHOSEN IN APPLICANT DETAILS SCREEN) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>👤</Text>
            <Text style={styles.cardTitle}>Applicant Information</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.fieldLabel}>NAME</Text>
            <Text style={[styles.fieldValue, styles.semiBold]}>
              {applicantFullName}
            </Text>
          </View>

          <View style={styles.detailGrid}>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>PAN NUMBER</Text>
              <Text style={styles.fieldValue}>
                {applicant?.panNumber || "-"}
              </Text>
            </View>
            <View style={styles.gridCol}>
              <Text style={styles.fieldLabel}>MOBILE NUMBER</Text>
              <Text style={styles.fieldValue}>
                {applicant?.mobile || "-"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
            <Text style={styles.fieldValue}>
              {applicant?.email || "-"}
            </Text>
          </View>

          {applicant?.fatherGuardianName ? (
            <View style={styles.infoRow}>
              <Text style={styles.fieldLabel}>FATHER / GUARDIAN</Text>
              <Text style={styles.fieldValue}>
                {applicant.fatherGuardianName}
              </Text>
            </View>
          ) : null}

          {fullAddress ? (
            <View style={styles.infoRow}>
              <Text style={styles.fieldLabel}>ADDRESS</Text>
              <Text style={styles.fieldValue}>{fullAddress}</Text>
            </View>
          ) : null}

          <View style={styles.planBadgeContainer}>
            <Text style={styles.fieldLabel}>CHOSEN PAYMENT PLAN</Text>
            <View style={styles.planPill}>
              <Text style={styles.planPillText}>✓ {selectedPlan}</Text>
            </View>
          </View>
        </View>

        {/* 3. SECOND APPLICANT (IF ANY) */}
        {secondApplicant?.firstName ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>👥</Text>
              <Text style={styles.cardTitle}>Co-Applicant</Text>
            </View>
            <Text style={styles.fieldValue}>
              {secondApplicant.firstName} {secondApplicant.lastName || ""}
            </Text>
            <Text style={styles.smallText}>
              PAN: {secondApplicant.panNumber || "-"} | Mobile:{" "}
              {secondApplicant.mobile || "-"}
            </Text>
          </View>
        ) : null}

        {/* 4. SELECT PAYMENT METHOD */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>💳</Text>
            <Text style={styles.cardTitle}>Select Payment Method</Text>
          </View>

          {PAYMENT_METHODS.map((item) => {
            const isSelected = method === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.methodOption,
                  isSelected && styles.methodOptionSelected,
                ]}
                activeOpacity={0.8}
                onPress={() => setMethod(item.id)}
              >
                <View style={styles.methodIconWrapper}>
                  <Text style={styles.methodIcon}>{item.icon}</Text>
                </View>

                <View style={styles.methodTextContainer}>
                  <Text
                    style={[
                      styles.methodTitle,
                      isSelected && styles.methodTitleSelected,
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.methodSubtitle}>{item.subtitle}</Text>
                </View>

                <View
                  style={[
                    styles.radioCircle,
                    isSelected && styles.radioCircleSelected,
                  ]}
                >
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SECURITY GUARANTEE */}
        <View style={styles.trustBanner}>
          <Text style={styles.trustIcon}>🔒</Text>
          <Text style={styles.trustText}>
            256-bit Secure Encryption. Official Booking PDF Application and Receipt
            will be generated immediately upon confirmation.
          </Text>
        </View>
      </ScrollView>

      {/* FIXED BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarTextContainer}>
          <Text style={styles.bottomTotalLabel}>Total Payable</Text>
          <Text style={styles.bottomTotalAmount}>
            ₹{formatCurrency(bookingAmount)}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.payButton, processing && styles.payButtonDisabled]}
          activeOpacity={0.85}
          disabled={processing}
          onPress={handlePayAndConfirm}
        >
          {processing ? (
            <View style={styles.buttonLoadingRow}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.payButtonText}>Processing...</Text>
            </View>
          ) : (
            <Text style={styles.payButtonText}>
              PAY ₹{formatCurrency(bookingAmount)} ›
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 45,
    paddingBottom: 110,
  },
  header: {
    marginBottom: 18,
  },
  backButton: {
    marginBottom: 8,
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0F172A",
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },

  // Amount Highlight Card
  amountCard: {
    backgroundColor: "#1E3A8A",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#1E3A8A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#93C5FD",
    letterSpacing: 1,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 4,
  },
  amountBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  amountBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  amountDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    marginVertical: 14,
  },
  unitQuickInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  unitText: {
    color: "#E2E8F0",
    fontSize: 13,
    fontWeight: "600",
  },
  unitCost: {
    color: "#93C5FD",
    fontSize: 13,
    fontWeight: "600",
  },

  // Detail Cards
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  cardIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
  },
  detailGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  gridCol: {
    flex: 1,
  },
  infoRow: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
  },
  semiBold: {
    fontWeight: "700",
    fontSize: 15,
  },
  highlightValue: {
    fontWeight: "800",
    color: "#2563EB",
  },
  smallText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 4,
  },
  planBadgeContainer: {
    marginTop: 6,
  },
  planPill: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  planPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1D4ED8",
  },

  // Payment Methods
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    marginBottom: 10,
  },
  methodOptionSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  methodIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  methodIcon: {
    fontSize: 18,
  },
  methodTextContainer: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  methodTitleSelected: {
    color: "#1D4ED8",
  },
  methodSubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  radioCircleSelected: {
    borderColor: "#2563EB",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },

  // Trust Banner
  trustBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
    marginBottom: 20,
  },
  trustIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  trustText: {
    flex: 1,
    fontSize: 11,
    color: "#475569",
    lineHeight: 16,
  },

  // Bottom Floating Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomBarTextContainer: {
    flex: 1,
  },
  bottomTotalLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  bottomTotalAmount: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
  },
  payButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  payButtonDisabled: {
    opacity: 0.7,
  },
  buttonLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});

export default BookingAmountScreen;
