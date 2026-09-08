import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient, getBaseUrl, isAxiosError } from "../../api/client";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import {
  RootStackParamList,
  FlatData,
  ApplicantData,
} from "../../types/navigation";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "BookingSummary"
>;

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
  applicant1_dob: string | null;
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

  applicant2_name: string;
  applicant2_pan: string;
  applicant2_age: number;
  applicant2_dob: string | null;
  applicant2_guardian_name: string;
  applicant2_address: string;
  applicant2_city: string;
  applicant2_pin_code: string;
  applicant2_office_no: string;
  applicant2_res_no: string;
  applicant2_mobile_no: string;
  applicant2_email: string;
  applicant2_residential_status: string;
  applicant2_nationality: string;
  applicant2_ward: string;

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
  payment_date: string | null;

  mr_number: string;
  mr_date: string | null;

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
  } = route.params || {};

  const [application, setApplication] =
    useState<Application | null>(null);

  const [loading, setLoading] =
    useState(true);

  // ===================================================
  // FORMAT NUMBER
  // ===================================================

  const formatNumber = (
    value: string | number | null | undefined
  ): string => {
    if (
      value === null ||
      value === undefined ||
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

  // ===================================================
  // FORMAT DATE
  // ===================================================

  const formatDate = (
    value: string | null | undefined
  ): string => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  // ===================================================
  // GET LOGGED-IN USER
  // ===================================================

  const getLoggedInUserId = async (): Promise<number> => {
    try {
      const userData =
        await AsyncStorage.getItem(
          "userData"
        );

      if (!userData) {
        return 0;
      }

      const user = JSON.parse(userData);

      return Number(user?.id) || 0;
    } catch (error) {
      console.log(
        "USER DATA ERROR:",
        error
      );

      return 0;
    }
  };

  // ===================================================
  // FETCH APPLICATIONS
  // ===================================================

  const fetchApplication = async () => {
    try {
      setLoading(true);

      console.log(
        "================================="
      );

      console.log(
        "BOOKING SUMMARY API REQUEST"
      );

      console.log(
        "ENDPOINT:",
        "/api/applications"
      );

      console.log(
        "================================="
      );

      const response =
        await apiClient.get<ApplicationsResponse>(
          "/api/applications"
        );

      console.log(
        "================================="
      );

      console.log(
        "BOOKING SUMMARY API RESPONSE"
      );

      console.log(
        JSON.stringify(
          response.data,
          null,
          2
        )
      );

      console.log(
        "================================="
      );

      const routeAppId = (route.params as any)?.applicationId;
      const routeAppNumber = (route.params as any)?.applicationNumber;

      const rawData = response.data?.data;
      const items: Application[] = Array.isArray(rawData)
        ? (rawData as Application[])
        : (Array.isArray((rawData as any)?.items) ? (rawData as any).items : []);

      let currentApplication: Application | undefined;

      // 1. Check if route passed specific application ID
      if (routeAppId && items.length > 0) {
        currentApplication = items.find(
          (item) => Number(item.id) === Number(routeAppId)
        );
      }

      // 2. Check if route passed specific application number
      if (!currentApplication && routeAppNumber && items.length > 0) {
        currentApplication = items.find(
          (item) => item.application_number === routeAppNumber
        );
      }

      // 3. Check for logged in user's application
      if (!currentApplication && items.length > 0) {
        const loggedInUserId = await getLoggedInUserId();
        if (loggedInUserId) {
          const userItems = items.filter(
            (item) => Number(item.user_id) === loggedInUserId
          );
          if (userItems.length > 0) {
            currentApplication = [...userItems].sort(
              (a, b) => Number(b.id) - Number(a.id)
            )[0];
          }
        }
      }

      // 4. Fallback to latest item in API
      if (!currentApplication && items.length > 0) {
        currentApplication = [...items].sort(
          (a, b) => Number(b.id) - Number(a.id)
        )[0];
      }

      // 5. Fallback to local storage
      if (!currentApplication) {
        try {
          const cachedJson = await AsyncStorage.getItem("@latest_booking_application");
          if (cachedJson) {
            const cached = JSON.parse(cachedJson);
            currentApplication = {
              id: cached.applicationId || 1,
              application_number: cached.applicationNumber || "DRT-APP-001",
              user_id: 1,
              agent_id: 0,
              filled_by: 1,
              applicant1_name: [cached.applicant?.firstName, cached.applicant?.middleName, cached.applicant?.lastName].filter(Boolean).join(" ") || "Applicant",
              applicant1_pan: cached.applicant?.panNumber || "",
              applicant1_age: Number(cached.applicant?.age) || 30,
              applicant1_dob: cached.applicant?.dob || null,
              applicant1_guardian_name: cached.applicant?.fatherGuardianName || "",
              applicant1_address: cached.applicant?.address || "",
              applicant1_city: cached.applicant?.city || "Bhubaneswar",
              applicant1_pin_code: cached.applicant?.pincode || "751001",
              applicant1_office_no: "",
              applicant1_res_no: "",
              applicant1_mobile_no: cached.applicant?.mobile || "",
              applicant1_email: cached.applicant?.email || "",
              applicant1_residential_status: cached.applicant?.residentialStatus || "Resident",
              applicant1_nationality: cached.applicant?.nationality || "Indian",
              applicant1_ward: "",
              applicant2_name: "",
              applicant2_pan: "",
              applicant2_age: 0,
              applicant2_dob: null,
              applicant2_guardian_name: "",
              applicant2_address: "",
              applicant2_city: "",
              applicant2_pin_code: "",
              applicant2_office_no: "",
              applicant2_res_no: "",
              applicant2_mobile_no: "",
              applicant2_email: "",
              applicant2_residential_status: "Resident",
              applicant2_nationality: "Indian",
              applicant2_ward: "",
              block: (cached.flat as any)?.block || cached.flat?.tower || "Block 1",
              tower: cached.flat?.tower || "Tower A",
              flat_number: cached.flat?.flatNumber || "101",
              carpet_area: cached.flat?.carpetArea || 850,
              built_up_area: cached.flat?.builtUpArea || 1050,
              super_built_up_area: cached.flat?.superBuiltUpArea || 1250,
              rate_per_sqft: cached.flat?.ratePerSqft || 6500,
              payment_plan: cached.paymentPlan || "Down Payment Plan",
              total_cost: cached.flat?.totalCost || 8125000,
              payment_source: cached.applicant?.sourceOfPayment || "Own Contribution",
              booking_amount: cached.bookingAmount || 100000,
              payment_method: cached.paymentMethod || "Bank Transfer",
              instrument_number: `TXN-${Date.now().toString().slice(-8)}`,
              payment_date: new Date().toISOString().split("T")[0],
              mr_number: "",
              mr_date: null,
              bank_name: cached.applicant?.drawnOn || "State Bank of India",
              payable_at: "Bhubaneswar",
              is_submitted: 1,
              is_approved: 0,
              approved_by: 0,
              approved_at: null,
              rejection_reason: null,
              application_pdf: null,
              approved_pdf: null,
              rejected_pdf: null,
              created_at: cached.submittedAt || new Date().toISOString(),
              updated_at: cached.submittedAt || new Date().toISOString(),
              is_deleted: 0,
            };
          }
        } catch (_) {}
      }

      if (currentApplication) {
        setApplication(currentApplication);
      } else {
        setApplication(null);
      }
    } catch (error: any) {
      console.log(
        "================================="
      );

      console.log(
        "BOOKING SUMMARY API ERROR"
      );

      console.log(error);

      console.log(
        "================================="
      );

      if (isAxiosError(error)) {
        console.log(
          "STATUS:",
          error.response?.status
        );

        console.log(
          "RESPONSE:",
          JSON.stringify(
            error.response?.data,
            null,
            2
          )
        );

        Alert.alert(
          "Error",
          error.response?.data?.message ||
            "Unable to load application."
        );
      } else {
        Alert.alert(
          "Error",
          error?.message ||
            "Something went wrong."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // LOAD API
  // ===================================================

  useFocusEffect(
    useCallback(() => {
      fetchApplication();
    }, [])
  );

  // ===================================================
  // FLAT DATA
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
    flat?.block ||
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

  const primaryPan =
    application?.applicant1_pan ||
    applicant?.panNumber ||
    "-";

  // ===================================================
  // SECOND APPLICANT
  // ===================================================

  const secondName =
    application?.applicant2_name ||
    [
      secondApplicant?.firstName,
      secondApplicant?.middleName,
      secondApplicant?.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    "";

  const secondMobile =
    application?.applicant2_mobile_no ||
    secondApplicant?.mobile ||
    "-";

  const secondEmail =
    application?.applicant2_email ||
    secondApplicant?.email ||
    "-";

  const secondPan =
    application?.applicant2_pan ||
    secondApplicant?.panNumber ||
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

  const paymentDate =
    application?.payment_date
      ? formatDate(
          application.payment_date
        )
      : applicant?.paymentDate ??
        "-";

  const bankName =
    application?.bank_name ??
    applicant?.drawnOn ??
    "-";

  const payableAt =
    application?.payable_at ||
    "-";

  const effectiveFlat: FlatData | undefined =
    flat ||
    (application
      ? {
          id: String(application.id || "1"),
          flatNumber: application.flat_number || "A-101",
          tower: application.tower || "Tower A",
          block: application.block || "Block 1",
          floor: 1,
          type: "Apartment",
          carpetArea: Number(application.carpet_area) || 0,
          builtUpArea: Number(application.built_up_area) || 0,
          superBuiltUpArea: Number(application.super_built_up_area) || 0,
          ratePerSqft: Number(application.rate_per_sqft) || 0,
          totalCost: Number(application.total_cost) || 0,
          status: "AVAILABLE",
        }
      : undefined);

  const effectiveApplicant: ApplicantData | undefined =
    applicant ||
    (application
      ? {
          firstName: application.applicant1_name || "Applicant",
          lastName: "",
          fatherGuardianName: application.applicant1_guardian_name || "",
          dob: application.applicant1_dob || "",
          age: application.applicant1_age || 30,
          mobile: application.applicant1_mobile_no || "",
          officeNo: application.applicant1_office_no || "",
          resNo: application.applicant1_res_no || "",
          email: application.applicant1_email || "",
          address: application.applicant1_address || "",
          city: application.applicant1_city || "",
          state: "",
          pincode: application.applicant1_pin_code || "",
          nationality: application.applicant1_nationality || "Indian",
          residentialStatus:
            application.applicant1_residential_status || "Resident",
          panNumber: application.applicant1_pan || "",
          ward: application.applicant1_ward || "",
          paymentPlan: application.payment_plan || "",
          sourceOfPayment: application.payment_source || "",
          totalCost: application.total_cost || 0,
          remittanceSum: application.booking_amount || 0,
          paymentMode: application.payment_method || "",
          referenceNo: application.instrument_number || "",
          paymentDate: application.payment_date || "",
          drawnOn: application.bank_name || "",
        }
      : undefined);

  // ===================================================
  // LOADING SCREEN
  // ===================================================

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
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
      showsVerticalScrollIndicator={
        false
      }
      contentContainerStyle={
        styles.contentContainer
      }
    >
      {/* ==========================================
          HEADER
      ========================================== */}

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
              APPLICATION NUMBER
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

      {/* ==========================================
          FLAT DETAILS
      ========================================== */}

      <Section title="Flat Details">
        <Row
          label="Block"
          value={String(block)}
        />

        <Row
          label="Tower"
          value={String(tower)}
        />

        <Row
          label="Flat"
          value={String(flatNumber)}
        />

        <Row
          label="Type"
          value={String(
            flat?.type || "-"
          )}
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

      {/* ==========================================
          PRIMARY APPLICANT
      ========================================== */}

      <Section title="Primary Applicant">
        <Row
          label="Name"
          value={String(
            primaryName
          )}
        />

        <Row
          label="Mobile"
          value={String(
            primaryMobile
          )}
        />

        <Row
          label="Email"
          value={String(
            primaryEmail
          )}
        />

        <Row
          label="PAN"
          value={String(
            primaryPan
          )}
        />

        {application?.applicant1_age !==
          undefined && (
          <Row
            label="Age"
            value={String(
              application.applicant1_age
            )}
          />
        )}

        {application?.applicant1_city && (
          <Row
            label="City"
            value={
              application
                .applicant1_city
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

        {application?.applicant1_residential_status && (
          <Row
            label="Residential Status"
            value={
              application
                .applicant1_residential_status
            }
          />
        )}
      </Section>

      {/* ==========================================
          SECOND APPLICANT
      ========================================== */}

      {secondName ? (
        <Section title="Second Applicant">
          <Row
            label="Name"
            value={String(
              secondName
            )}
          />

          <Row
            label="Mobile"
            value={String(
              secondMobile
            )}
          />

          <Row
            label="Email"
            value={String(
              secondEmail
            )}
          />

          <Row
            label="PAN"
            value={String(
              secondPan
            )}
          />

          {application?.applicant2_age !==
            undefined && (
            <Row
              label="Age"
              value={String(
                application
                  .applicant2_age
              )}
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

          {application?.applicant2_pin_code && (
            <Row
              label="PIN Code"
              value={
                application
                  .applicant2_pin_code
              }
            />
          )}
        </Section>
      ) : null}

      {/* ==========================================
          PAYMENT
      ========================================== */}

      <Section title="Payment Plan">
        <Row
          label="Plan"
          value={String(
            finalPaymentPlan
          )}
        />

        <Row
          label="Payment Source"
          value={String(
            paymentSource
          )}
        />

        <Row
          label="Booking Amount"
          value={`₹${formatNumber(
            bookingAmount
          )}`}
        />

        <Row
          label="Payment Method"
          value={String(
            paymentMethod
          )}
        />

        <Row
          label="Reference Number"
          value={String(
            referenceNumber
          )}
        />

        <Row
          label="Payment Date"
          value={String(
            paymentDate
          )}
        />

        <Row
          label="Bank Name"
          value={String(
            bankName
          )}
        />

        <Row
          label="Payable At"
          value={String(
            payableAt
          )}
        />

        {application?.mr_number ? (
          <Row
            label="MR Number"
            value={
              application.mr_number
            }
          />
        ) : null}

        {application?.mr_date ? (
          <Row
            label="MR Date"
            value={formatDate(
              application.mr_date
            )}
          />
        ) : null}
      </Section>

      {/* ==========================================
          APPLICATION STATUS
      ========================================== */}

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
                application.rejection_reason
              }
            />
          )}
        </Section>
      )}

      {/* ==========================================
          CONTINUE
      ========================================== */}

      {effectiveFlat && effectiveApplicant && (
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate(
              "BookingAmount",
              {
                flat: effectiveFlat,
                applicant: effectiveApplicant,
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
      )}

      {/* ==========================================
          DOWNLOAD PDF
      ========================================== */}

      {application?.id ? (
        <TouchableOpacity
          style={styles.pdfDownloadButton}
          activeOpacity={0.8}
          onPress={() => {
            const pdfUrl = `${getBaseUrl()}/api/applications/${application.id}/pdf`;
            Linking.openURL(pdfUrl).catch(() => {
              Alert.alert("Application PDF", `PDF Link: ${pdfUrl}`);
            });
          }}
        >
          <Text style={styles.pdfDownloadButtonText}>
            📥 DOWNLOAD APPLICATION PDF
          </Text>
        </TouchableOpacity>
      ) : null}

      {/* ==========================================
          REFRESH
      ========================================== */}

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
// SECTION
// =====================================================

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <Text
      style={styles.sectionTitle}
    >
      {title}
    </Text>

    {children}
  </View>
);

// =====================================================
// ROW
// =====================================================

const Row = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
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

  // HEADER

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
    fontSize: 15,
    fontWeight: "800",
    color: "#1D4ED8",
    marginTop: 3,
  },

  // SECTION

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

  // ROW

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

  // BUTTON

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
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },

  // REFRESH

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

  pdfDownloadButton: {
    height: 52,
    backgroundColor: "#16A34A",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },

  pdfDownloadButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.3,
  },
});

export default BookingSummaryScreen;