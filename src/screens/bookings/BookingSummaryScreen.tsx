import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import axios from "axios";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import { RootStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "BookingSummary"
>;

// =====================================================
// API CONFIG
// =====================================================

const BASE_URL = "http://192.168.1.99:5000";

// =====================================================
// APPLICATION TYPE
// =====================================================

interface Application {
  id: number;
  application_number: string;

  user_id: number;
  agent_id: number;
  filled_by: number;

  applicant1_name: string;
  applicant1_pan: string;
  applicant1_age: number;
  applicant1_dob: string;
  applicant1_guardian_name: string;
  applicant1_address: string;
  applicant1_city: string;
  applicant1_pin_code: string;
  applicant1_office_no: string;
  applicant1_res_no: string;
  applicant1_mobile_no: string;
  applicant1_email: string;
  applicant1_residential_status: string;
  applicant1_nationality: string;
  applicant1_ward: string;

  applicant2_name?: string;
  applicant2_pan?: string;
  applicant2_age?: number;
  applicant2_dob?: string;
  applicant2_guardian_name?: string;
  applicant2_address?: string;
  applicant2_city?: string;
  applicant2_pin_code?: string;
  applicant2_office_no?: string;
  applicant2_res_no?: string;
  applicant2_mobile_no?: string;
  applicant2_email?: string;
  applicant2_residential_status?: string;
  applicant2_nationality?: string;
  applicant2_ward?: string;

  block: string;
  tower: string;
  flat_number: string;

  carpet_area: string | number;
  built_up_area: string | number;
  super_built_up_area: string | number;
  rate_per_sqft: string | number;

  payment_plan: string;
  total_cost: string | number;
  payment_source: string;

  booking_amount: string | number;
  payment_method: string;
  instrument_number: string;
  payment_date: string;

  mr_number: string;
  mr_date: string;

  bank_name: string;
  payable_at: string;

  is_submitted: number;
  is_approved: number;

  approved_by: number;
  approved_at: string | null;

  rejection_reason: string | null;

  application_pdf: string | null;
  approved_pdf: string | null;
  rejected_pdf: string | null;

  created_at: string;
  updated_at: string;

  is_deleted: number;
}

// =====================================================
// API RESPONSE
// =====================================================

interface ApplicationsResponse {
  success: boolean;
  message: string;

  data: {
    count: number;
    items: Application[];
  };
}

// =====================================================
// SCREEN
// =====================================================

const BookingSummaryScreen = ({
  navigation,
  route,
}: Props) => {
  const {
    flat,
    applicant,
    secondApplicant,
    paymentPlan,
  } = route.params;

  // ===================================================
  // STATE
  // ===================================================

  const [application, setApplication] =
    useState<Application | null>(null);

  const [loading, setLoading] =
    useState(true);

  // ===================================================
  // FETCH APPLICATIONS
  // ===================================================

  const fetchApplication = async () => {
    try {
      setLoading(true);

      const url = `${BASE_URL}/api/applications`;

      console.log("=================================");
      console.log("BOOKING SUMMARY API REQUEST");
      console.log("URL:", url);
      console.log("=================================");

      const response =
        await axios.get<ApplicationsResponse>(
          url,
          {
            headers: {
              "Content-Type":
                "application/json",
            },
            timeout: 15000,
          }
        );

      console.log("=================================");
      console.log("BOOKING SUMMARY API RESPONSE");
      console.log(
        JSON.stringify(
          response.data,
          null,
          2
        )
      );
      console.log("=================================");

      if (
        response.data?.success &&
        response.data?.data?.items?.length > 0
      ) {
        // For now use the first application
        const apiApplication =
          response.data.data.items[0];

        setApplication(
          apiApplication
        );
      } else {
        setApplication(null);

        console.log(
          "No applications returned"
        );
      }
    } catch (error: any) {
      console.log("=================================");
      console.log("BOOKING SUMMARY API ERROR");
      console.log(error);
      console.log("=================================");

      if (axios.isAxiosError(error)) {
        console.log(
          "Status:",
          error.response?.status
        );

        console.log(
          "Response:",
          JSON.stringify(
            error.response?.data,
            null,
            2
          )
        );

        Alert.alert(
          "Error",
          error.response?.data?.message ||
            "Unable to load application"
        );
      } else {
        Alert.alert(
          "Error",
          error?.message ||
            "Something went wrong"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // LOAD API WHEN SCREEN OPENS
  // ===================================================

  useFocusEffect(
    useCallback(() => {
      fetchApplication();
    }, [])
  );

  // ===================================================
  // HELPERS
  // ===================================================

  const formatNumber = (
    value: string | number | undefined
  ) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return "0";
    }

    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      return String(value);
    }

    return numberValue.toLocaleString(
      "en-IN"
    );
  };

  const formatDate = (
    value: string | undefined
  ) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  // ===================================================
  // DATA TO DISPLAY
  //
  // API DATA FIRST
  // ROUTE DATA AS FALLBACK
  // ===================================================

  const flatNumber =
    application?.flat_number ||
    flat?.flatNumber ||
    "-";

  const tower =
    application?.tower ||
    flat?.tower ||
    "-";

  const block =
    application?.block ||
    (flat as any)?.block ||
    "-";

  const carpetArea =
    application?.carpet_area ??
    flat?.carpetArea ??
    0;

  const builtUpArea =
    application?.built_up_area ??
    flat?.builtUpArea ??
    0;

  const superBuiltUpArea =
    application?.super_built_up_area ??
    flat?.superBuiltUpArea ??
    0;

  const ratePerSqft =
    application?.rate_per_sqft ??
    flat?.ratePerSqft ??
    0;

  const totalCost =
    application?.total_cost ??
    flat?.totalCost ??
    0;

  // ===================================================
  // PRIMARY APPLICANT
  // ===================================================

  const primaryName =
    application?.applicant1_name ||
    [
      applicant?.firstName,
      applicant?.middleName,
      applicant?.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "-";

  const primaryMobile =
    application?.applicant1_mobile_no ||
    applicant?.mobile ||
    "-";

  const primaryEmail =
    application?.applicant1_email ||
    applicant?.email ||
    "-";

  // ===================================================
  // SECOND APPLICANT
  // ===================================================

  const apiSecondApplicantName =
    application?.applicant2_name;

  const routeSecondApplicantName =
    secondApplicant
      ? [
          secondApplicant.firstName,
          secondApplicant.middleName,
          secondApplicant.lastName,
        ]
          .filter(Boolean)
          .join(" ")
      : "";

  const secondName =
    apiSecondApplicantName ||
    routeSecondApplicantName ||
    "";

  const secondMobile =
    application?.applicant2_mobile_no ||
    secondApplicant?.mobile ||
    "-";

  const secondEmail =
    application?.applicant2_email ||
    secondApplicant?.email ||
    "-";

 // ===================================================
// PAYMENT
// ===================================================

const finalPaymentPlan =
  application?.payment_plan ??
  paymentPlan ??
  applicant?.paymentPlan ??
  "-";

const paymentSource =
  application?.payment_source ??
  applicant?.sourceOfPayment ??
  "-";

const bookingAmount =
  application?.booking_amount ??
  applicant?.remittanceSum ??
  0;

const paymentMethod =
  application?.payment_method ??
  applicant?.paymentMode ??
  "-";

const referenceNumber =
  application?.instrument_number ??
  applicant?.referenceNo ??
  "-";

const paymentDate = application?.payment_date
  ? formatDate(application.payment_date)
  : applicant?.paymentDate ?? "-";

const bankName =
  application?.bank_name ??
  applicant?.drawnOn ??
  "-";
  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <View
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text
          style={styles.loadingText}
        >
          Loading booking summary...
        </Text>
      </View>
    );
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={
        styles.contentContainer
      }
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <View style={styles.header}>
        <Text style={styles.title}>
          Booking Summary
        </Text>

        <Text style={styles.subtitle}>
          Review your application details
        </Text>

        {application?.application_number && (
          <View
            style={
              styles.applicationNumberContainer
            }
          >
            <Text
              style={
                styles.applicationNumberLabel
              }
            >
              APPLICATION
            </Text>

            <Text
              style={
                styles.applicationNumber
              }
            >
              {
                application.application_number
              }
            </Text>
          </View>
        )}
      </View>

      {/* =================================================
          FLAT DETAILS
      ================================================= */}

      <Section title="Flat Details">
        <Row
          label="Block"
          value={block}
        />

        <Row
          label="Tower"
          value={tower}
        />

        <Row
          label="Flat"
          value={flatNumber}
        />

        <Row
          label="Type"
          value={
            flat?.type || "-"
          }
        />

        <Row
          label="Carpet Area"
          value={`${carpetArea} sqft`}
        />

        <Row
          label="Built Up Area"
          value={`${builtUpArea} sqft`}
        />

        <Row
          label="Super Built-Up Area"
          value={`${superBuiltUpArea} sqft`}
        />

        <Row
          label="Rate / Sqft"
          value={`₹${formatNumber(
            ratePerSqft
          )}`}
        />

        <Row
          label="Total Cost"
          value={`₹${formatNumber(
            totalCost
          )}`}
          highlight
        />
      </Section>

      {/* =================================================
          PRIMARY APPLICANT
      ================================================= */}

      <Section title="Primary Applicant">
        <Row
          label="Name"
          value={primaryName}
        />

        <Row
          label="Mobile"
          value={primaryMobile}
        />

        <Row
          label="Email"
          value={primaryEmail}
        />

        {application?.applicant1_pan && (
          <Row
            label="PAN"
            value={
              application.applicant1_pan
            }
          />
        )}

        {application?.applicant1_city && (
          <Row
            label="City"
            value={
              application.applicant1_city
            }
          />
        )}

        {application?.applicant1_pin_code && (
          <Row
            label="PIN Code"
            value={
              application
                .applicant1_pin_code
            }
          />
        )}

        {application?.applicant1_nationality && (
          <Row
            label="Nationality"
            value={
              application
                .applicant1_nationality
            }
          />
        )}
      </Section>

      {/* =================================================
          SECOND APPLICANT
      ================================================= */}

      {secondName ? (
        <Section title="Second Applicant">
          <Row
            label="Name"
            value={secondName}
          />

          <Row
            label="Mobile"
            value={secondMobile}
          />

          <Row
            label="Email"
            value={secondEmail}
          />

          {application?.applicant2_pan && (
            <Row
              label="PAN"
              value={
                application
                  .applicant2_pan
              }
            />
          )}

          {application?.applicant2_city && (
            <Row
              label="City"
              value={
                application
                  .applicant2_city
              }
            />
          )}
        </Section>
      ) : null}

      {/* =================================================
          PAYMENT PLAN
      ================================================= */}
<Section title="Payment Plan">
  <Row
    label="Plan"
    value={String(finalPaymentPlan)}
  />

  <Row
    label="Payment Source"
    value={String(paymentSource)}
  />

  <Row
    label="Booking Amount"
    value={`₹${formatNumber(bookingAmount)}`}
  />

  <Row
    label="Payment Method"
    value={String(paymentMethod)}
  />

  <Row
    label="Reference Number"
    value={String(referenceNumber)}
  />

  <Row
    label="Payment Date"
    value={String(paymentDate)}
  />

  <Row
    label="Bank Name"
    value={String(bankName)}
  />
</Section>

      {/* =================================================
          APPLICATION STATUS
      ================================================= */}

      {application && (
        <Section title="Application Status">
          <Row
            label="Submitted"
            value={
              application.is_submitted ===
              1
                ? "Yes"
                : "No"
            }
          />

          <Row
            label="Approved"
            value={
              application.is_approved ===
              1
                ? "Yes"
                : "No"
            }
          />

          {application.rejection_reason && (
            <Row
              label="Rejection Reason"
              value={
                application
                  .rejection_reason
              }
            />
          )}
        </Section>
      )}

      {/* =================================================
          CONTINUE
      ================================================= */}

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate(
            "BookingAmount",
            {
              flat,
              applicant,
              secondApplicant,
              paymentPlan:
                finalPaymentPlan,
            }
          )
        }
      >
        <Text style={styles.buttonText}>
          CONTINUE TO BOOKING PAYMENT
        </Text>
      </TouchableOpacity>

      {/* =================================================
          REFRESH
      ================================================= */}

      <TouchableOpacity
        style={
          styles.refreshButton
        }
        activeOpacity={0.8}
        onPress={fetchApplication}
      >
        <Text
          style={
            styles.refreshButtonText
          }
        >
          Refresh Application
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// =====================================================
// SECTION COMPONENT
// =====================================================

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <View style={styles.section}>
      <Text
        style={styles.sectionTitle}
      >
        {title}
      </Text>

      <View>
        {children}
      </View>
    </View>
  );
};

// =====================================================
// ROW COMPONENT
// =====================================================

const Row = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>
        {label}
      </Text>

      <Text
        style={[
          styles.value,
          highlight &&
            styles.highlightValue,
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F6",
  },

  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F5F7F6",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },

  // =================================================
  // HEADER
  // =================================================

  header: {
    marginTop: 30,
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },

  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 5,
  },

  applicationNumberContainer: {
    backgroundColor: "#DBEAFE",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: "flex-start",
    marginTop: 15,
  },

  applicationNumberLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#1D4ED8",
    letterSpacing: 1,
  },

  applicationNumber: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1D4ED8",
    marginTop: 2,
  },

  // =================================================
  // SECTION
  // =================================================

  section: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 14,
    marginBottom: 15,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.04,
    shadowRadius: 5,

    elevation: 2,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  // =================================================
  // ROW
  // =================================================

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  label: {
    color: "#777",
    fontSize: 13,
    flex: 1,
  },

  value: {
    fontWeight: "600",
    color: "#111827",
    maxWidth: "60%",
    textAlign: "right",
    fontSize: 13,
  },

  highlightValue: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "800",
  },

  // =================================================
  // BUTTON
  // =================================================

  button: {
    height: 55,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    marginBottom: 12,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 13,
  },

  // =================================================
  // REFRESH
  // =================================================

  refreshButton: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  refreshButtonText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 13,
  },
});

export default BookingSummaryScreen;