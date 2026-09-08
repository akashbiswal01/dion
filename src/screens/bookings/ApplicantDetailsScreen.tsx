import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  apiClient,
  getBaseUrl,
  isAxiosError,
} from "../../api/client";

import { NativeStackScreenProps } from "@react-navigation/native-stack";

import {
  RootStackParamList,
  ApplicantData,
} from "../../types/navigation";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "ApplicantDetails"
>;

// =====================================================
// INPUT PROPS
// =====================================================

type InputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;

  keyboardType?:
    | "default"
    | "phone-pad"
    | "email-address"
    | "number-pad"
    | "decimal-pad";

  multiline?: boolean;
  maxLength?: number;

  autoCapitalize?:
    | "none"
    | "sentences"
    | "words"
    | "characters";

  required?: boolean;
  editable?: boolean;
  prefix?: string;
  suffix?: string;
};

// =====================================================
// EXTENDED APPLICANT DATA
// =====================================================

type ExtendedApplicantData = ApplicantData & {
  paymentPlan: string;
  sourceOfPayment: string;
  totalCost: string;

  remittanceSum: string;
  paymentMode: string;
  referenceNo: string;
  paymentDate: string;
  drawnOn: string;
};

// =====================================================
// APPLICATION PAYLOAD
// =====================================================

interface ApplicationPayload {
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

  applicant2_name: string;
  applicant2_pan: string;
  applicant2_age: number;
  applicant2_dob: string;
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

  carpet_area: number;
  built_up_area: number;
  super_built_up_area: number;
  rate_per_sqft: number;

  payment_plan: string;
  total_cost: number;
  payment_source: string;

  booking_amount: number;
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

  rejection_reason: string | null;

  application_pdf: string | null;
  approved_pdf: string | null;
  rejected_pdf: string | null;
}

// =====================================================
// API RESPONSE
// =====================================================

interface ApplicationResponse {
  success: boolean;
  message: string;
  data?: any;
}

// =====================================================
// SECTION HEADER
// =====================================================

const SectionHeader = ({
  number,
  title,
}: {
  number: string;
  title: string;
}) => (
  <View style={styles.sectionHeaderContainer}>
    <View style={styles.sectionBadge}>
      <Text style={styles.sectionBadgeText}>
        {number}
      </Text>
    </View>

    <Text style={styles.sectionTitle}>
      {title}
    </Text>
  </View>
);

// =====================================================
// MAIN SCREEN
// =====================================================

const ApplicantDetailsScreen = ({
  navigation,
  route,
}: Props) => {
  const { flat } = route.params;

  // ===================================================
  // FORM STATE
  // ===================================================

  const [applicant, setApplicant] =
    useState<ExtendedApplicantData>({
      firstName: "",
      middleName: "",
      lastName: "",
      fatherGuardianName: "",
      dob: "",
      mobile: "",
      email: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      nationality: "",
      residentialStatus: "Resident",
      panNumber: "",

      paymentPlan: "",
      sourceOfPayment: "",

      totalCost:
        flat?.totalCost?.toString() || "",

      remittanceSum: "",
      paymentMode: "Select mode...",
      referenceNo: "",
      paymentDate: "",
      drawnOn: "",
    });

  const [acceptedTerms, setAcceptedTerms] =
    useState(false);

  const [showPaymentModal, setShowPaymentModal] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  // ===================================================
  // PAYMENT OPTIONS
  // ===================================================

  const paymentOptions = [
    "Cash",
    "Bank Draft",
    "Cheque",
    "RTGS",
    "NEFT",
  ];

  // ===================================================
  // UPDATE FORM
  // ===================================================

  const update = (
    key: keyof ExtendedApplicantData,
    value: string
  ) => {
    setApplicant((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  // ===================================================
  // DATE FORMAT
  // DD-MM-YYYY -> YYYY-MM-DD
  // ===================================================

  const convertDateForApi = (
    date: string
  ): string => {
    if (!date) {
      return "";
    }

    const parts = date.split("-");

    if (parts.length !== 3) {
      return date;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  // ===================================================
  // CALCULATE AGE
  // ===================================================

  const calculateAge = (
    dob: string
  ): number => {
    if (!dob) {
      return 0;
    }

    const parts = dob.split("-");

    if (parts.length !== 3) {
      return 0;
    }

    const day = Number(parts[0]);
    const month = Number(parts[1]) - 1;
    const year = Number(parts[2]);

    const birthDate = new Date(
      year,
      month,
      day
    );

    const today = new Date();

    let age =
      today.getFullYear() -
      birthDate.getFullYear();

    const monthDifference =
      today.getMonth() -
      birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() <
          birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  // ===================================================
  // VALIDATE FORM
  // ===================================================

  const validateForm = () => {
    if (!applicant.firstName.trim()) {
      Alert.alert(
        "Validation",
        "Please enter applicant name."
      );
      return false;
    }

    if (!applicant.fatherGuardianName.trim()) {
      Alert.alert(
        "Validation",
        "Please enter father's / husband's / guardian's name."
      );
      return false;
    }

    if (!applicant.dob.trim()) {
      Alert.alert(
        "Validation",
        "Please select date of birth."
      );
      return false;
    }

    if (!applicant.address.trim()) {
      Alert.alert(
        "Validation",
        "Please enter address."
      );
      return false;
    }

    if (
      applicant.mobile.length !== 10
    ) {
      Alert.alert(
        "Validation",
        "Please enter a valid 10-digit mobile number."
      );
      return false;
    }

    if (!applicant.nationality.trim()) {
      Alert.alert(
        "Validation",
        "Please enter nationality."
      );
      return false;
    }

    if (
      applicant.panNumber.length !== 10
    ) {
      Alert.alert(
        "Validation",
        "Please enter a valid PAN number."
      );
      return false;
    }

    if (!applicant.paymentPlan) {
      Alert.alert(
        "Validation",
        "Please select payment plan."
      );
      return false;
    }

    if (!applicant.sourceOfPayment) {
      Alert.alert(
        "Validation",
        "Please select source of payment."
      );
      return false;
    }

    if (!applicant.totalCost) {
      Alert.alert(
        "Validation",
        "Please enter total cost."
      );
      return false;
    }

    if (!applicant.remittanceSum) {
      Alert.alert(
        "Validation",
        "Please enter booking amount."
      );
      return false;
    }

    if (
      applicant.paymentMode ===
      "Select mode..."
    ) {
      Alert.alert(
        "Validation",
        "Please select payment mode."
      );
      return false;
    }

    if (!applicant.paymentDate) {
      Alert.alert(
        "Validation",
        "Please select payment date."
      );
      return false;
    }

    if (
      isReferenceRequired &&
      !applicant.referenceNo.trim()
    ) {
      Alert.alert(
        "Validation",
        "Please enter reference number."
      );
      return false;
    }

    if (
      isReferenceRequired &&
      !applicant.drawnOn.trim()
    ) {
      Alert.alert(
        "Validation",
        "Please enter bank name."
      );
      return false;
    }

    return true;
  };

  // ===================================================
  // SUBMIT APPLICATION API
  // ===================================================

  const submitApplication = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setSubmitting(true);

      // ===============================================
      // GET USER DATA SAVED DURING LOGIN
      // ===============================================

      const userDataString =
        await AsyncStorage.getItem(
          "userData"
        );

      let loggedInUser: any = null;

      if (userDataString) {
        try {
          loggedInUser =
            JSON.parse(userDataString);
        } catch (parseError) {
          console.log(
            "USER DATA PARSE ERROR:",
            parseError
          );
        }
      }

      const token =
        await AsyncStorage.getItem(
          "authToken"
        );

      // ===============================================
      // USER ID
      // ===============================================

      const actualUser =
        loggedInUser?.user || loggedInUser;

      const userId =
        Number(actualUser?.id) || 0;

      const agentId =
        Number(actualUser?.agent_id) || 0;

      console.log(
        "LOGGED USER:",
        loggedInUser
      );

      console.log(
        "USER ID:",
        userId
      );

      console.log(
        "AGENT ID:",
        agentId
      );

      if (!userId) {
        Alert.alert(
          "Login Required",
          "Logged-in user information was not found. Please login again."
        );

        return;
      }

      // ===============================================
      // BUILD API PAYLOAD
      // ===============================================

      const payload: ApplicationPayload = {
        // =============================================
        // USER
        // =============================================

        user_id: userId,

        agent_id: agentId,

        filled_by: userId,

        // =============================================
        // APPLICANT 1
        // =============================================

        applicant1_name: [
          applicant.firstName?.trim(),
          applicant.middleName?.trim(),
          applicant.lastName?.trim(),
        ]
          .filter(Boolean)
          .join(" "),

        applicant1_pan:
          applicant.panNumber.trim(),

        applicant1_age:
          calculateAge(
            applicant.dob
          ),

        applicant1_dob:
          convertDateForApi(
            applicant.dob
          ),

        applicant1_guardian_name:
          applicant.fatherGuardianName.trim(),

        applicant1_address:
          applicant.address.trim(),

        applicant1_city:
          applicant.city?.trim() || "",

        applicant1_pin_code:
          applicant.pincode?.trim() || "",

        applicant1_office_no: "",

        applicant1_res_no: "",

        applicant1_mobile_no:
          applicant.mobile.trim(),

        applicant1_email:
          applicant.email?.trim() || "",

        applicant1_residential_status:
          applicant.residentialStatus ||
          "Resident",

        applicant1_nationality:
          applicant.nationality.trim(),

        applicant1_ward: "",

        // =============================================
        // APPLICANT 2
        //
        // Applicant 2 is not available on this screen.
        // These will be filled later in SecondApplicant.
        // =============================================

        applicant2_name: "",

        applicant2_pan: "",

        applicant2_age: 0,

        applicant2_dob: "",

        applicant2_guardian_name: "",

        applicant2_address: "",

        applicant2_city: "",

        applicant2_pin_code: "",

        applicant2_office_no: "",

        applicant2_res_no: "",

        applicant2_mobile_no: "",

        applicant2_email: "",

        applicant2_residential_status:
          "Resident",

        applicant2_nationality: "",

        applicant2_ward: "",

        // =============================================
        // FLAT
        // =============================================

        block:
          String(
            (flat as any)?.block || flat?.tower || "Block 1"
          ),

        tower:
          String(
            flat?.tower || "Tower A"
          ),

        flat_number:
          String(
            flat?.flatNumber || "101"
          ),

        carpet_area:
          Number(
            flat?.carpetArea
          ) || 850,

        built_up_area:
          Number(
            flat?.builtUpArea
          ) || 1050,

        super_built_up_area:
          Number(
            flat?.superBuiltUpArea
          ) || 1250,

        rate_per_sqft:
          Number(
            flat?.ratePerSqft
          ) || 6500,

        // =============================================
        // FINANCIAL
        // =============================================

        payment_plan:
          applicant.paymentPlan || "Down Payment Plan",

        total_cost:
          Number(
            applicant.totalCost
          ) || Number(flat?.totalCost) || 8125000,

        payment_source:
          applicant.sourceOfPayment || "Own Contribution",

        // =============================================
        // BOOKING AMOUNT
        // =============================================

        booking_amount:
          Number(
            applicant.remittanceSum
          ) || 100000,

        payment_method:
          applicant.paymentMode ===
            "Select mode..."
            ? "Bank Transfer"
            : (applicant.paymentMode || "Bank Transfer"),

        instrument_number:
          applicant.referenceNo?.trim() ||
          `REF-${Date.now().toString().slice(-6)}`,

        payment_date:
          convertDateForApi(
            applicant.paymentDate
          ) || new Date().toISOString().split("T")[0],

        mr_number: "",

        mr_date: "",

        bank_name:
          applicant.drawnOn?.trim() ||
          "State Bank of India",

        payable_at:
          "Bhubaneswar",

        // =============================================
        // STATUS
        // =============================================

        is_submitted: 1,

        is_approved: 0,

        approved_by: 0,

        rejection_reason: null,

        // =============================================
        // PDF
        // =============================================

        application_pdf: null,

        approved_pdf: null,

        rejected_pdf: null,
      };

      // ===============================================
      // LOG REQUEST
      // ===============================================

      console.log(
        "================================="
      );

      console.log(
        "POST APPLICATION"
      );

      console.log(
        "BASE URL:",
        getBaseUrl()
      );

      console.log(
        "ENDPOINT:",
        "/api/applications"
      );

      console.log(
        "FULL URL:",
        `${getBaseUrl()}/api/applications`
      );

      console.log(
        "PAYLOAD:",
        JSON.stringify(
          payload,
          null,
          2
        )
      );

      console.log(
        "================================="
      );

      // ===============================================
      // POST API
      // ===============================================

      const response =
        await apiClient.post<ApplicationResponse>(
          "/api/applications",
          payload,
          {
            headers: {
              "Content-Type":
                "application/json",

              ...(token
                ? {
                    Authorization:
                      `Bearer ${token}`,
                  }
                : {}),
            },

            timeout: 20000,
          }
        );

      // ===============================================
      // RESPONSE
      // ===============================================

      console.log(
        "================================="
      );

      console.log(
        "POST APPLICATION RESPONSE"
      );

      console.log(
        "STATUS:",
        response.status
      );

      console.log(
        "DATA:",
        JSON.stringify(
          response.data,
          null,
          2
        )
      );

      console.log(
        "================================="
      );

      // ===============================================
      // SUCCESS
      // ===============================================

      if (response.data?.success) {
        const createdAppId = response.data?.data?.id;
        const createdAppNumber =
          response.data?.data?.application_number ||
          `DRT-APP-${Date.now().toString().slice(-6)}`;
        const pdfUrl = `${getBaseUrl()}/api/applications/${createdAppId}/pdf`;

        // Save into AsyncStorage so DocumentsScreen, BookingSummary, and MyBooking pick it up
        try {
          const bookingRecord = {
            applicationId: createdAppId,
            applicationNumber: createdAppNumber,
            flat,
            applicant,
            secondApplicant: undefined,
            paymentPlan: applicant.paymentPlan,
            bookingAmount: Number(applicant.remittanceSum) || 100000,
            paymentMethod: applicant.paymentMode,
            pdfUrl,
            submittedAt: new Date().toISOString(),
          };

          await AsyncStorage.setItem(
            "@latest_booking_application",
            JSON.stringify(bookingRecord)
          );

          const existingDocsJson = await AsyncStorage.getItem("@user_documents");
          const existingDocs = existingDocsJson ? JSON.parse(existingDocsJson) : [];
          const newDoc = {
            id: `doc-${Date.now()}`,
            name: "Booking Application",
            applicationNumber: createdAppNumber,
            applicationId: createdAppId,
            flatNumber: flat?.flatNumber,
            tower: flat?.tower,
            date: new Date().toLocaleDateString("en-IN"),
            pdfUrl,
          };
          await AsyncStorage.setItem(
            "@user_documents",
            JSON.stringify([newDoc, ...existingDocs.filter((d: any) => d.applicationNumber !== createdAppNumber)])
          );
        } catch (storageErr) {
          console.log("Error caching booking record:", storageErr);
        }

        Alert.alert(
          "Application Submitted",
          response.data.message ||
            "Application submitted successfully. Please proceed to payment to confirm your booking.",
          [
            {
              text: "View Summary",
              onPress: () => {
                navigation.navigate(
                  "BookingSummary",
                  {
                    flat,
                    applicant,
                    secondApplicant: undefined,
                    paymentPlan: applicant.paymentPlan,
                    applicationId: createdAppId,
                    applicationNumber: createdAppNumber,
                  }
                );
              },
            },
            {
              text: "Proceed to Payment",
              onPress: () => {
                navigation.navigate(
                  "BookingAmount",
                  {
                    flat,
                    applicant,
                    secondApplicant: undefined,
                    paymentPlan: applicant.paymentPlan,
                    applicationId: createdAppId,
                    applicationNumber: createdAppNumber,
                  }
                );
              },
            },
          ]
        );
      } else {
        Alert.alert(
          "Failed",
          response.data?.message ||
            "Application was not submitted."
        );
      }
    } catch (error: any) {
      console.log(
        "================================="
      );

      console.log(
        "POST APPLICATION ERROR"
      );

      console.log(error);

      console.log(
        "================================="
      );

      if (isAxiosError(error)) {
        console.log(
          "ERROR STATUS:",
          error.response?.status
        );

        console.log(
          "ERROR RESPONSE:",
          JSON.stringify(
            error.response?.data,
            null,
            2
          )
        );

        Alert.alert(
          "Submission Failed",
          error.response?.data?.message ||
            "Unable to submit application."
        );
      } else {
        Alert.alert(
          "Error",
          error?.message ||
            "Something went wrong while submitting application."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ===================================================
  // CONTINUE / SUBMIT
  // ===================================================

  const handleContinue = async () => {
    if (!acceptedTerms) {
      Alert.alert(
        "Terms Required",
        "Please accept the terms and conditions before submitting."
      );

      return;
    }

    await submitApplication();
  };

  // ===================================================
  // RESET
  // ===================================================

  const handleReset = () => {
    setAcceptedTerms(false);

    setApplicant({
      firstName: "",
      middleName: "",
      lastName: "",
      fatherGuardianName: "",
      dob: "",
      mobile: "",
      email: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      nationality: "",
      residentialStatus: "Resident",
      panNumber: "",

      paymentPlan: "",
      sourceOfPayment: "",

      totalCost:
        flat?.totalCost?.toString() || "",

      remittanceSum: "",
      paymentMode:
        "Select mode...",
      referenceNo: "",
      paymentDate: "",
      drawnOn: "",
    });
  };

  // ===================================================
  // REFERENCE REQUIRED
  // ===================================================

  const isReferenceRequired =
    applicant.paymentMode !==
      "Cash" &&
    applicant.paymentMode !==
      "Select mode...";

  // ===================================================
  // UI
  // ===================================================

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        style={styles.mainBackground}
        contentContainerStyle={
          styles.scrollPadding
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        <View
          style={
            styles.formContainer
          }
        >
          {/* HEADER */}

          <View
            style={styles.pageHeader}
          >
            <View
              style={styles.headerLeft}
            >
              <Text
                style={
                  styles.pageTitleMain
                }
              >
                RIVERSIDE{" "}
                <Text
                  style={
                    styles.textBlue
                  }
                >
                  TOWNSHIP
                </Text>
              </Text>

              <Text
                style={
                  styles.pageTitleSub
                }
              >
                APPLICATION FORM
              </Text>
            </View>
          </View>

          <View
            style={styles.divider}
          />

          {/* 01 GENERAL */}

          <SectionHeader
            number="01"
            title="General Information"
          />

          <View style={styles.card}>
            <View style={styles.row}>
              <View
                style={styles.flex}
              >
                <Input
                  label="Application Number"
                  value="Auto Generate"
                  onChangeText={() => {}}
                  editable={false}
                />
              </View>

              <View
                style={[
                  styles.flex,
                  {
                    marginLeft: 16,
                  },
                ]}
              >
                <Input
                  label="Flat Number"
                  value={
                    flat?.flatNumber ||
                    "-"
                  }
                  onChangeText={() => {}}
                  editable={false}
                />
              </View>
            </View>
          </View>

          {/* 02 APPLICANT */}

          <SectionHeader
            number="02"
            title="Applicant Details (Sole / First)"
          />

          <View style={styles.card}>
            <Input
              label="Name of the applicant"
              required
              value={
                applicant.firstName
              }
              placeholder="Enter full name"
              autoCapitalize="words"
              onChangeText={(
                value
              ) =>
                update(
                  "firstName",
                  value
                )
              }
            />

            <Input
              label="Father's / Husband's / Guardian's Name"
              required
              value={
                applicant.fatherGuardianName
              }
              placeholder="Enter name"
              autoCapitalize="words"
              onChangeText={(
                value
              ) =>
                update(
                  "fatherGuardianName",
                  value
                )
              }
            />

            <DateInput
              label="Date of Birth"
              required
              value={
                applicant.dob
              }
              onDateChange={(
                value
              ) =>
                update(
                  "dob",
                  value
                )
              }
            />
          </View>

          {/* 03 CONTACT */}

          <SectionHeader
            number="03"
            title="Contact & Identification"
          />

          <View style={styles.card}>
            <Input
              label="Address for Correspondence"
              required
              value={
                applicant.address
              }
              placeholder="Enter full address"
              multiline
              onChangeText={(
                value
              ) =>
                update(
                  "address",
                  value
                )
              }
            />

            <View style={styles.row}>
              <View
                style={styles.flex}
              >
                <Input
                  label="Mob. No."
                  required
                  value={
                    applicant.mobile
                  }
                  placeholder="Mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  onChangeText={(
                    value
                  ) =>
                    update(
                      "mobile",
                      value.replace(
                        /[^0-9]/g,
                        ""
                      )
                    )
                  }
                />
              </View>

              <View
                style={[
                  styles.flex,
                  {
                    marginLeft: 16,
                  },
                ]}
              >
                <Input
                  label="E-Mail ID"
                  value={
                    applicant.email
                  }
                  placeholder="Enter email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={(
                    value
                  ) =>
                    update(
                      "email",
                      value
                    )
                  }
                />
              </View>
            </View>

            <Text
              style={styles.label}
            >
              Residential Status{" "}
              <Text
                style={
                  styles.requiredStar
                }
              >
                *
              </Text>
            </Text>

            <View
              style={
                styles.radioContainer
              }
            >
              <TouchableOpacity
                style={
                  styles.radioOption
                }
                onPress={() =>
                  update(
                    "residentialStatus",
                    "Resident"
                  )
                }
              >
                <View
                  style={[
                    styles.radioCircle,
                    applicant.residentialStatus ===
                      "Resident" &&
                      styles.radioCircleSelected,
                  ]}
                >
                  {applicant.residentialStatus ===
                    "Resident" && (
                    <View
                      style={
                        styles.radioDot
                      }
                    />
                  )}
                </View>

                <Text
                  style={
                    styles.radioText
                  }
                >
                  Resident
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.radioOption
                }
                onPress={() =>
                  update(
                    "residentialStatus",
                    "Non-Resident"
                  )
                }
              >
                <View
                  style={[
                    styles.radioCircle,
                    applicant.residentialStatus ===
                      "Non-Resident" &&
                      styles.radioCircleSelected,
                  ]}
                >
                  {applicant.residentialStatus ===
                    "Non-Resident" && (
                    <View
                      style={
                        styles.radioDot
                      }
                    />
                  )}
                </View>

                <Text
                  style={
                    styles.radioText
                  }
                >
                  Non-Resident
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View
                style={styles.flex}
              >
                <Input
                  label="Nationality"
                  required
                  value={
                    applicant.nationality
                  }
                  placeholder="Select nationality"
                  autoCapitalize="words"
                  onChangeText={(
                    value
                  ) =>
                    update(
                      "nationality",
                      value
                    )
                  }
                />
              </View>

              <View
                style={[
                  styles.flex,
                  {
                    marginLeft: 16,
                  },
                ]}
              >
                <Input
                  label="PAN No."
                  required
                  value={
                    applicant.panNumber
                  }
                  placeholder="ENTER PAN NUMBER"
                  autoCapitalize="characters"
                  maxLength={10}
                  onChangeText={(
                    value
                  ) =>
                    update(
                      "panNumber",
                      value.toUpperCase()
                    )
                  }
                />
              </View>
            </View>
          </View>

          {/* 04 FLAT */}

          <SectionHeader
            number="04"
            title="Details of Flat to be Purchased"
          />

          <View
            style={[
              styles.card,
              styles.cardBlue,
            ]}
          >
            <View style={styles.row}>
              <View
                style={styles.flex}
              >
                <Input
                  label="Flat No."
                  required
                  value={
                    flat?.flatNumber ||
                    ""
                  }
                  editable={false}
                  onChangeText={() => {}}
                />
              </View>

              <View
                style={[
                  styles.flex,
                  {
                    marginLeft: 12,
                  },
                ]}
              >
                <Input
                  label="Carpet Area"
                  required
                  value={
                    flat?.carpetArea?.toString() ||
                    ""
                  }
                  suffix="sq.ft."
                  editable={false}
                  onChangeText={() => {}}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View
                style={styles.flex}
              >
                <Input
                  label="Built Up Area"
                  required
                  value={
                    flat?.builtUpArea?.toString() ||
                    ""
                  }
                  suffix="sq.ft."
                  editable={false}
                  onChangeText={() => {}}
                />
              </View>

              <View
                style={[
                  styles.flex,
                  {
                    marginLeft: 12,
                  },
                ]}
              >
                <Input
                  label="Super Built-Up Area"
                  required
                  value={
                    flat?.superBuiltUpArea?.toString() ||
                    ""
                  }
                  suffix="sq.ft."
                  editable={false}
                  onChangeText={() => {}}
                />
              </View>
            </View>

            <Input
              label="Rate per Sqft."
              required
              value={
                flat?.ratePerSqft?.toString() ||
                ""
              }
              prefix="₹"
              editable={false}
              onChangeText={() => {}}
            />
          </View>

          {/* 05 FINANCIAL */}

          <SectionHeader
            number="05"
            title="Financial Details"
          />

          <View style={styles.card}>
            <Text
              style={styles.label}
            >
              Payment Plan Opted For
            </Text>

            <View style={styles.row}>
              <BoxRadio
                label="Down Payment"
                selected={
                  applicant.paymentPlan ===
                  "Down Payment"
                }
                onPress={() =>
                  update(
                    "paymentPlan",
                    "Down Payment"
                  )
                }
              />

              <View
                style={{
                  width: 12,
                }}
              />

              <BoxRadio
                label="Installment Plan"
                selected={
                  applicant.paymentPlan ===
                  "Installment"
                }
                onPress={() =>
                  update(
                    "paymentPlan",
                    "Installment"
                  )
                }
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text
              style={styles.label}
            >
              Source of Payment
            </Text>

            <View style={styles.row}>
              <BoxRadio
                label="Self"
                selected={
                  applicant.sourceOfPayment ===
                  "Self"
                }
                onPress={() =>
                  update(
                    "sourceOfPayment",
                    "Self"
                  )
                }
              />

              <View
                style={{
                  width: 12,
                }}
              />

              <BoxRadio
                label="Finance"
                selected={
                  applicant.sourceOfPayment ===
                  "Finance"
                }
                onPress={() =>
                  update(
                    "sourceOfPayment",
                    "Finance"
                  )
                }
              />
            </View>
          </View>

          <View style={styles.card}>
            <Input
              label="Total Cost: Rupees"
              required
              value={
                applicant.totalCost
              }
              placeholder="Enter total cost in rupees"
              prefix="₹"
              keyboardType="number-pad"
              onChangeText={(
                value
              ) =>
                update(
                  "totalCost",
                  value.replace(
                    /[^0-9]/g,
                    ""
                  )
                )
              }
            />
          </View>

          {/* 06 BOOKING */}

          <SectionHeader
            number="06"
            title="Booking Amount Details"
          />

          <View style={styles.card}>
            <View style={styles.row}>
              <View
                style={styles.flex}
              >
                <Input
                  label="REMITTANCE SUM (RS.)"
                  required
                  value={
                    applicant.remittanceSum
                  }
                  placeholder="0.00"
                  prefix="₹"
                  keyboardType="decimal-pad"
                  onChangeText={(
                    value
                  ) =>
                    update(
                      "remittanceSum",
                      value.replace(
                        /[^0-9.]/g,
                        ""
                      )
                    )
                  }
                />
              </View>

              <View
                style={[
                  styles.flex,
                  {
                    marginLeft: 16,
                  },
                ]}
              >
                <View
                  style={
                    styles.inputOuterContainer
                  }
                >
                  <Text
                    style={styles.label}
                  >
                    PAYMENT MODE{" "}
                    <Text
                      style={
                        styles.requiredStar
                      }
                    >
                      *
                    </Text>
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.dropdownTrigger
                    }
                    activeOpacity={0.7}
                    onPress={() =>
                      setShowPaymentModal(
                        true
                      )
                    }
                  >
                    <Text
                      style={[
                        styles.input,
                        applicant.paymentMode ===
                          "Select mode..." && {
                          color:
                            "#9CA3AF",
                        },
                      ]}
                    >
                      {
                        applicant.paymentMode
                      }
                    </Text>

                    <Text
                      style={
                        styles.dropdownIcon
                      }
                    >
                      ▼
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View
                style={styles.flex}
              >
                <Input
                  label="REFERENCE NO."
                  required={
                    isReferenceRequired
                  }
                  value={
                    applicant.referenceNo
                  }
                  placeholder="Transaction / Cheque No."
                  onChangeText={(
                    value
                  ) =>
                    update(
                      "referenceNo",
                      value
                    )
                  }
                />
              </View>

              <View
                style={[
                  styles.flex,
                  {
                    marginLeft: 16,
                  },
                ]}
              >
                <DateInput
                  label="DATE"
                  required
                  value={
                    applicant.paymentDate
                  }
                  onDateChange={(
                    value
                  ) =>
                    update(
                      "paymentDate",
                      value
                    )
                  }
                />
              </View>
            </View>

            <Input
              label="DRAWN ON (BANK NAME)"
              required={
                isReferenceRequired
              }
              value={
                applicant.drawnOn
              }
              placeholder="e.g. State Bank of India"
              onChangeText={(
                value
              ) =>
                update(
                  "drawnOn",
                  value
                )
              }
            />

            <View
              style={styles.infoBanner}
            >
              <View
                style={
                  styles.infoIconWrapper
                }
              >
                <Text
                  style={styles.infoIcon}
                >
                  i
                </Text>
              </View>

              <Text
                style={styles.infoText}
              >
                All drafts or Cheques to be
                made in favor of{" "}
                <Text
                  style={{
                    fontWeight: "700",
                  }}
                >
                  "Dion Riverside Township"
                </Text>{" "}
                payable at Bhubaneswar.
                However, cheque shall be
                subject to realization.
              </Text>
            </View>
          </View>

          <View
            style={styles.divider}
          />

          {/* TERMS */}

          <TouchableOpacity
            style={
              styles.termsContainer
            }
            activeOpacity={0.8}
            onPress={() =>
              setAcceptedTerms(
                !acceptedTerms
              )
            }
          >
            <View
              style={[
                styles.checkbox,
                acceptedTerms &&
                  styles.checkboxSelected,
              ]}
            >
              {acceptedTerms && (
                <Text
                  style={
                    styles.checkmark
                  }
                >
                  ✓
                </Text>
              )}
            </View>

            <Text
              style={styles.termsText}
            >
              I/We have read and understood
              the terms and conditions and
              agree to abide by the same. I/We
              do hereby declare that the above
              particulars/information given by
              me/us are true and correct to the
              best of my/our knowledge and no
              material fact has been concealed
              there from.
            </Text>
          </TouchableOpacity>

          {/* ACTION BUTTONS */}

          <View
            style={
              styles.actionContainer
            }
          >
            <TouchableOpacity
              style={
                styles.resetButton
              }
              activeOpacity={0.7}
              onPress={handleReset}
              disabled={submitting}
            >
              <Text
                style={
                  styles.resetButtonText
                }
              >
                Reset
              </Text>
            </TouchableOpacity>

            {acceptedTerms && (
              <TouchableOpacity
                style={
                  styles.primaryButton
                }
                activeOpacity={0.8}
                onPress={
                  handleContinue
                }
                disabled={submitting}
              >
                {submitting ? (
                  <View
                    style={
                      styles.buttonLoading
                    }
                  >
                    <ActivityIndicator
                      color="#FFFFFF"
                      size="small"
                    />

                    <Text
                      style={
                        styles.primaryButtonText
                      }
                    >
                      Submitting...
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={
                      styles.primaryButtonText
                    }
                  >
                    Submit Application
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>

      {/* PAYMENT MODE MODAL */}

      <Modal
        visible={
          showPaymentModal
        }
        transparent
        animationType="fade"
      >
        <TouchableOpacity
          style={
            styles.modalOverlay
          }
          activeOpacity={1}
          onPress={() =>
            setShowPaymentModal(
              false
            )
          }
        >
          <View
            style={
              styles.modalContent
            }
          >
            <Text
              style={
                styles.modalHeader
              }
            >
              Select Payment Mode
            </Text>

            {paymentOptions.map(
              (mode, index) => (
                <TouchableOpacity
                  key={index}
                  style={
                    styles.modalOption
                  }
                  onPress={() => {
                    update(
                      "paymentMode",
                      mode
                    );

                    if (
                      mode ===
                      "Cash"
                    ) {
                      update(
                        "referenceNo",
                        ""
                      );

                      update(
                        "drawnOn",
                        ""
                      );
                    }

                    setShowPaymentModal(
                      false
                    );
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      applicant.paymentMode ===
                        mode &&
                        styles.modalOptionTextSelected,
                    ]}
                  >
                    {mode}
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

// =====================================================
// INPUT COMPONENT
// =====================================================

const Input = ({
  label,
  required,
  editable = true,
  prefix,
  suffix,
  ...props
}: InputProps) => {
  return (
    <View
      style={
        styles.inputOuterContainer
      }
    >
      <Text style={styles.label}>
        {label}{" "}
        {required && (
          <Text
            style={
              styles.requiredStar
            }
          >
            *
          </Text>
        )}
      </Text>

      <View
        style={[
          styles.inputWrapper,
          props.multiline &&
            styles.multilineInputWrapper,
          !editable &&
            styles.disabledInputWrapper,
        ]}
      >
        {prefix && (
          <Text
            style={
              styles.prefixSuffixText
            }
          >
            {prefix}
          </Text>
        )}

        <TextInput
          style={[
            styles.input,
            props.multiline &&
              styles.multilineInput,
          ]}
          placeholderTextColor="#9CA3AF"
          editable={editable}
          {...props}
        />

        {suffix && (
          <Text
            style={
              styles.prefixSuffixText
            }
          >
            {suffix}
          </Text>
        )}
      </View>
    </View>
  );
};

// =====================================================
// DATE INPUT
// =====================================================

const DateInput = ({
  label,
  required,
  value,
  onDateChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  onDateChange: (
    val: string
  ) => void;
}) => {
  const [show, setShow] =
    useState(false);

  let initialDate = new Date();

  if (value) {
    const parts =
      value.split("-");

    if (parts.length === 3) {
      initialDate = new Date(
        parseInt(parts[2]),
        parseInt(parts[1]) - 1,
        parseInt(parts[0])
      );
    }
  }

  const onChange = (
    event: any,
    selectedDate?: Date
  ) => {
    if (
      Platform.OS ===
      "android"
    ) {
      setShow(false);
    }

    if (
      event.type === "set" &&
      selectedDate
    ) {
      const day =
        selectedDate
          .getDate()
          .toString()
          .padStart(2, "0");

      const month =
        (
          selectedDate.getMonth() +
          1
        )
          .toString()
          .padStart(2, "0");

      const year =
        selectedDate.getFullYear();

      onDateChange(
        `${day}-${month}-${year}`
      );

      if (
        Platform.OS === "ios"
      ) {
        setShow(false);
      }
    } else if (
      event.type ===
      "dismissed"
    ) {
      setShow(false);
    }
  };

  return (
    <View
      style={
        styles.inputOuterContainer
      }
    >
      <Text style={styles.label}>
        {label}{" "}
        {required && (
          <Text
            style={
              styles.requiredStar
            }
          >
            *
          </Text>
        )}
      </Text>

      <TouchableOpacity
        style={
          styles.dropdownTrigger
        }
        activeOpacity={0.7}
        onPress={() =>
          setShow(true)
        }
      >
        <Text
          style={[
            styles.input,
            !value && {
              color:
                "#9CA3AF",
            },
          ]}
        >
          {value ||
            "DD-MM-YYYY"}
        </Text>

        <Text
          style={
            styles.dropdownIcon
          }
        >
          📅
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={initialDate}
          mode="date"
          display={
            Platform.OS ===
            "ios"
              ? "spinner"
              : "default"
          }
          onChange={onChange}
        />
      )}
    </View>
  );
};

// =====================================================
// BOX RADIO
// =====================================================

const BoxRadio = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.boxRadioContainer,
        selected &&
          styles.boxRadioContainerSelected,
      ]}
    >
      <View
        style={[
          styles.radioCircle,
          selected &&
            styles.radioCircleSelected,
        ]}
      >
        {selected && (
          <View
            style={
              styles.radioDot
            }
          />
        )}
      </View>

      <Text
        style={
          styles.boxRadioText
        }
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  row: {
    flexDirection: "row",
  },

  mainBackground: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  scrollPadding: {
    padding: 16,
    paddingTop: 40,
    paddingBottom: 60,
  },

  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.05,
    shadowRadius: 10,

    elevation: 2,
  },

  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  headerLeft: {
    flex: 1,
  },

  pageTitleMain: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  textBlue: {
    color: "#2563EB",
  },

  pageTitleSub: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 4,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 20,
  },

  sectionHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 10,
  },

  sectionBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },

  sectionBadgeText: {
    color: "#1D4ED8",
    fontSize: 13,
    fontWeight: "bold",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },

  cardBlue: {
    backgroundColor: "#F4F9FF",
    borderColor: "#E1EFFF",
  },

  inputOuterContainer: {
    marginBottom: 20,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
  },

  requiredStar: {
    color: "#EF4444",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    minHeight: 48,
    paddingHorizontal: 16,
  },

  disabledInputWrapper: {
    backgroundColor: "#F3F4F6",
  },

  multilineInputWrapper: {
    alignItems: "flex-start",
  },

  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
  },

  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },

  prefixSuffixText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginRight: 8,
    marginLeft: 8,
  },

  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 8,
    minHeight: 48,
    paddingHorizontal: 16,
  },

  dropdownIcon: {
    fontSize: 12,
    color: "#4B5563",
    marginLeft: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    elevation: 5,
  },

  modalHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  modalOptionText: {
    fontSize: 15,
    color: "#4B5563",
  },

  modalOptionTextSelected: {
    color: "#2563EB",
    fontWeight: "bold",
  },

  infoBanner: {
    flexDirection: "row",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
    alignItems: "center",
  },

  infoIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoIcon: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "bold",
    fontStyle: "italic",
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1E3A8A",
    lineHeight: 20,
  },

  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 4,
  },

  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },

  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#FFFFFF",
  },

  radioCircleSelected: {
    borderColor: "#2563EB",
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },

  radioText: {
    color: "#4B5563",
    fontSize: 14,
    fontWeight: "500",
  },

  boxRadioContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
  },

  boxRadioContainerSelected: {
    borderColor: "#2563EB",
    backgroundColor: "#F0F9FF",
  },

  boxRadioText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },

  termsContainer: {
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
  },

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    backgroundColor: "#FFFFFF",
    marginRight: 12,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  termsText: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    lineHeight: 20,
  },

  actionContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 12,
  },

  resetButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  resetButtonText: {
    color: "#374151",
    fontSize: 15,
    fontWeight: "600",
  },

  primaryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 170,
    minHeight: 46,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  buttonLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});

export default ApplicantDetailsScreen;