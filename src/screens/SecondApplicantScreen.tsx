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
  Alert,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  RootStackParamList,
  ApplicantData,
} from "../types/navigation";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "SecondApplicant"
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
      <Text style={styles.sectionBadgeText}>{number}</Text>
    </View>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// =====================================================
// MAIN SCREEN
// =====================================================

const SecondApplicantScreen = ({
  navigation,
  route,
}: Props) => {
  const { flat, applicant } = route.params;

  // ===================================================
  // STATE
  // ===================================================

  const [addSecond, setAddSecond] = useState(true);

  const [second, setSecond] = useState<ApplicantData>({
    firstName: "",
    middleName: "",
    lastName: "",
    fatherGuardianName: "",
    dob: "",
    mobile: "",
    email: "",
    address: "",
    city: applicant?.city || "",
    state: applicant?.state || "",
    pincode: applicant?.pincode || "",
    nationality: "Indian",
    residentialStatus: "Resident",
    panNumber: "",
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // ===================================================
  // UPDATE FORM
  // ===================================================

  const update = (
    key: keyof ApplicantData,
    value: string
  ) => {
    setSecond((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // ===================================================
  // RESET
  // ===================================================

  const handleReset = () => {
    setSecond({
      firstName: "",
      middleName: "",
      lastName: "",
      fatherGuardianName: "",
      dob: "",
      mobile: "",
      email: "",
      address: "",
      city: applicant?.city || "",
      state: applicant?.state || "",
      pincode: applicant?.pincode || "",
      nationality: "Indian",
      residentialStatus: "Resident",
      panNumber: "",
    });
    setAcceptedTerms(false);
  };

  // ===================================================
  // CONTINUE / SUBMIT
  // ===================================================

  const handleContinue = () => {
    if (!addSecond) {
      navigation.navigate("PaymentPlan", {
        flat,
        applicant,
        secondApplicant: undefined,
      });
      return;
    }

    // Validation for Second Applicant
    if (!second.firstName.trim()) {
      Alert.alert("Required Field", "Please enter the second applicant's name.");
      return;
    }

    if (!second.fatherGuardianName.trim()) {
      Alert.alert(
        "Required Field",
        "Please enter Father's / Husband's / Guardian's name."
      );
      return;
    }

    if (!second.dob.trim()) {
      Alert.alert("Required Field", "Please select Date of Birth.");
      return;
    }

    if (!second.mobile.trim() || second.mobile.length < 10) {
      Alert.alert(
        "Invalid Mobile",
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (!second.panNumber.trim() || second.panNumber.length !== 10) {
      Alert.alert(
        "Invalid PAN",
        "Please enter a valid 10-digit PAN number."
      );
      return;
    }

    if (!acceptedTerms) {
      Alert.alert(
        "Terms Required",
        "Please accept the declaration terms and conditions."
      );
      return;
    }

    navigation.navigate("PaymentPlan", {
      flat,
      applicant,
      secondApplicant: second,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.mainBackground}
        contentContainerStyle={styles.scrollPadding}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* ========================================
              HEADER
          ======================================== */}
          <View style={styles.pageHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.pageTitleMain}>
                RIVERSIDE <Text style={styles.textBlue}>TOWNSHIP</Text>
              </Text>
              <Text style={styles.pageTitleSub}>
                APPLICATION FORM — SECOND APPLICANT
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* ========================================
              01 CO-APPLICANT OPTION
          ======================================== */}
          <SectionHeader
            number="01"
            title="Second / Co-Applicant Option"
          />

          <View style={styles.card}>
            <Text style={styles.label}>
              Do you want to add a Second / Co-Applicant?{" "}
              <Text style={styles.requiredStar}>*</Text>
            </Text>

            <View style={styles.row}>
              <BoxRadio
                label="Yes, Add Co-Applicant"
                selected={addSecond}
                onPress={() => setAddSecond(true)}
              />

              <View style={{ width: 12 }} />

              <BoxRadio
                label="No, Sole Applicant Only"
                selected={!addSecond}
                onPress={() => setAddSecond(false)}
              />
            </View>
          </View>

          {addSecond ? (
            <>
              {/* ========================================
                  02 GENERAL INFORMATION
              ======================================== */}
              <SectionHeader
                number="02"
                title="General Information"
              />

              <View style={styles.card}>
                <View style={styles.row}>
                  <View style={styles.flex}>
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
                      { marginLeft: 16 },
                    ]}
                  >
                    <Input
                      label="Flat Number"
                      value={flat?.flatNumber || "-"}
                      onChangeText={() => {}}
                      editable={false}
                    />
                  </View>
                </View>

                <View style={{ marginTop: 12 }}>
                  <Input
                    label="Primary Applicant Name"
                    value={applicant?.firstName || "-"}
                    onChangeText={() => {}}
                    editable={false}
                  />
                </View>
              </View>

              {/* ========================================
                  03 SECOND APPLICANT DETAILS
              ======================================== */}
              <SectionHeader
                number="03"
                title="Second Applicant Details (Joint / Co-Applicant)"
              />

              <View style={styles.card}>
                <Input
                  label="Name of the Second Applicant"
                  required
                  value={second.firstName}
                  placeholder="Enter full name"
                  autoCapitalize="words"
                  onChangeText={(value) => update("firstName", value)}
                />

                <Input
                  label="Father's / Husband's / Guardian's Name"
                  required
                  value={second.fatherGuardianName}
                  placeholder="Enter name"
                  autoCapitalize="words"
                  onChangeText={(value) =>
                    update("fatherGuardianName", value)
                  }
                />

                <DateInput
                  label="Date of Birth"
                  required
                  value={second.dob}
                  onDateChange={(value) => update("dob", value)}
                />
              </View>

              {/* ========================================
                  04 CONTACT & IDENTIFICATION
              ======================================== */}
              <SectionHeader
                number="04"
                title="Contact & Identification"
              />

              <View style={styles.card}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Text style={styles.label}>
                    Address for Correspondence{" "}
                    <Text style={styles.requiredStar}>*</Text>
                  </Text>

                  {applicant?.address ? (
                    <TouchableOpacity
                      onPress={() =>
                        update("address", applicant.address)
                      }
                      style={styles.copyBadge}
                    >
                      <Text style={styles.copyBadgeText}>
                        📋 Same as Primary
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                <View
                  style={[
                    styles.inputWrapper,
                    styles.multilineInputWrapper,
                    { marginBottom: 20 },
                  ]}
                >
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Enter full address"
                    placeholderTextColor="#9CA3AF"
                    value={second.address}
                    multiline
                    onChangeText={(value) => update("address", value)}
                  />
                </View>

                <View style={styles.row}>
                  <View style={styles.flex}>
                    <Input
                      label="Mob. No."
                      required
                      value={second.mobile}
                      placeholder="Mobile number"
                      keyboardType="phone-pad"
                      maxLength={10}
                      onChangeText={(value) =>
                        update("mobile", value.replace(/[^0-9]/g, ""))
                      }
                    />
                  </View>

                  <View
                    style={[
                      styles.flex,
                      { marginLeft: 16 },
                    ]}
                  >
                    <Input
                      label="E-Mail ID"
                      value={second.email}
                      placeholder="Enter email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onChangeText={(value) => update("email", value)}
                    />
                  </View>
                </View>

                {/* RESIDENTIAL STATUS */}
                <Text style={styles.label}>
                  Residential Status{" "}
                  <Text style={styles.requiredStar}>*</Text>
                </Text>

                <View style={styles.radioContainer}>
                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() =>
                      update("residentialStatus", "Resident")
                    }
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        second.residentialStatus === "Resident" &&
                          styles.radioCircleSelected,
                      ]}
                    >
                      {second.residentialStatus === "Resident" && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text style={styles.radioText}>Resident</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.radioOption}
                    onPress={() =>
                      update("residentialStatus", "Non-Resident")
                    }
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        second.residentialStatus === "Non-Resident" &&
                          styles.radioCircleSelected,
                      ]}
                    >
                      {second.residentialStatus === "Non-Resident" && (
                        <View style={styles.radioDot} />
                      )}
                    </View>
                    <Text style={styles.radioText}>Non-Resident</Text>
                  </TouchableOpacity>
                </View>

                {/* NATIONALITY + PAN */}
                <View style={styles.row}>
                  <View style={styles.flex}>
                    <Input
                      label="Nationality"
                      required
                      value={second.nationality}
                      placeholder="e.g. Indian"
                      autoCapitalize="words"
                      onChangeText={(value) =>
                        update("nationality", value)
                      }
                    />
                  </View>

                  <View
                    style={[
                      styles.flex,
                      { marginLeft: 16 },
                    ]}
                  >
                    <Input
                      label="PAN No."
                      required
                      value={second.panNumber}
                      placeholder="ENTER PAN NUMBER"
                      autoCapitalize="characters"
                      maxLength={10}
                      onChangeText={(value) =>
                        update("panNumber", value.toUpperCase())
                      }
                    />
                  </View>
                </View>
              </View>

              {/* ========================================
                  05 FLAT DETAILS
              ======================================== */}
              <SectionHeader
                number="05"
                title="Details of Flat to be Purchased"
              />

              <View style={[styles.card, styles.cardBlue]}>
                <View style={styles.row}>
                  <View style={styles.flex}>
                    <Input
                      label="Flat No."
                      required
                      value={flat?.flatNumber || ""}
                      editable={false}
                      onChangeText={() => {}}
                    />
                  </View>

                  <View
                    style={[
                      styles.flex,
                      { marginLeft: 12 },
                    ]}
                  >
                    <Input
                      label="Carpet Area"
                      required
                      value={flat?.carpetArea?.toString() || ""}
                      suffix="sq.ft."
                      editable={false}
                      onChangeText={() => {}}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.flex}>
                    <Input
                      label="Built Up Area"
                      required
                      value={flat?.builtUpArea?.toString() || ""}
                      suffix="sq.ft."
                      editable={false}
                      onChangeText={() => {}}
                    />
                  </View>

                  <View
                    style={[
                      styles.flex,
                      { marginLeft: 12 },
                    ]}
                  >
                    <Input
                      label="Super Built-Up Area"
                      required
                      value={
                        flat?.superBuiltUpArea?.toString() || ""
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
                  value={flat?.ratePerSqft?.toString() || ""}
                  prefix="₹"
                  editable={false}
                  onChangeText={() => {}}
                />
              </View>

              <View style={styles.divider} />

              {/* ========================================
                  TERMS & DECLARATION
              ======================================== */}
              <TouchableOpacity
                style={styles.termsContainer}
                activeOpacity={0.8}
                onPress={() => setAcceptedTerms(!acceptedTerms)}
              >
                <View
                  style={[
                    styles.checkbox,
                    acceptedTerms && styles.checkboxSelected,
                  ]}
                >
                  {acceptedTerms && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>

                <Text style={styles.termsText}>
                  I/We have read and understood the terms and
                  conditions and agree to abide by the same. I/We do
                  hereby declare that the above particulars/information
                  given by me/us are true and correct to the best of
                  my/our knowledge and no material fact has been
                  concealed there from.
                </Text>
              </TouchableOpacity>

              {/* ========================================
                  ACTION BUTTONS
              ======================================== */}
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={styles.resetButton}
                  activeOpacity={0.7}
                  onPress={handleReset}
                >
                  <Text style={styles.resetButtonText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    !acceptedTerms && styles.disabledButton,
                  ]}
                  activeOpacity={0.8}
                  onPress={handleContinue}
                >
                  <Text style={styles.primaryButtonText}>
                    CONTINUE TO PAYMENT PLAN
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            /* If user selects NO, show clean skip panel */
            <View style={styles.skipContainer}>
              <View style={styles.infoBanner}>
                <View style={styles.infoIconWrapper}>
                  <Text style={styles.infoIcon}>i</Text>
                </View>
                <Text style={styles.infoText}>
                  You have selected to proceed with a{" "}
                  <Text style={{ fontWeight: "700" }}>Sole Applicant</Text>{" "}
                  ({applicant?.firstName || "Primary Applicant"}). No second
                  applicant details will be registered for this booking.
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, { marginTop: 24 }]}
                activeOpacity={0.8}
                onPress={handleContinue}
              >
                <Text style={styles.primaryButtonText}>
                  PROCEED TO PAYMENT PLAN →
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
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
    <View style={styles.inputOuterContainer}>
      <Text style={styles.label}>
        {label}{" "}
        {required && <Text style={styles.requiredStar}>*</Text>}
      </Text>

      <View
        style={[
          styles.inputWrapper,
          props.multiline && styles.multilineInputWrapper,
          !editable && styles.disabledInputWrapper,
        ]}
      >
        {prefix && (
          <Text style={styles.prefixSuffixText}>{prefix}</Text>
        )}

        <TextInput
          style={[
            styles.input,
            props.multiline && styles.multilineInput,
          ]}
          placeholderTextColor="#9CA3AF"
          editable={editable}
          {...props}
        />

        {suffix && (
          <Text style={styles.prefixSuffixText}>{suffix}</Text>
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
  onDateChange: (val: string) => void;
}) => {
  const [show, setShow] = useState(false);

  let initialDate = new Date();

  if (value) {
    const parts = value.split("-");
    if (parts.length === 3) {
      initialDate = new Date(
        parseInt(parts[2]),
        parseInt(parts[1]) - 1,
        parseInt(parts[0])
      );
    }
  }

  const onChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShow(false);
    }

    if (event.type === "set" && selectedDate) {
      const day = selectedDate
        .getDate()
        .toString()
        .padStart(2, "0");

      const month = (selectedDate.getMonth() + 1)
        .toString()
        .padStart(2, "0");

      const year = selectedDate.getFullYear();

      onDateChange(`${day}-${month}-${year}`);

      if (Platform.OS === "ios") {
        setShow(false);
      }
    } else if (event.type === "dismissed") {
      setShow(false);
    }
  };

  return (
    <View style={styles.inputOuterContainer}>
      <Text style={styles.label}>
        {label}{" "}
        {required && <Text style={styles.requiredStar}>*</Text>}
      </Text>

      <TouchableOpacity
        style={styles.dropdownTrigger}
        activeOpacity={0.7}
        onPress={() => setShow(true)}
      >
        <Text
          style={[
            styles.input,
            !value && { color: "#9CA3AF" },
          ]}
        >
          {value || "DD-MM-YYYY"}
        </Text>

        <Text style={styles.dropdownIcon}>📅</Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={initialDate}
          mode="date"
          maximumDate={new Date()}
          display={Platform.OS === "ios" ? "spinner" : "default"}
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
        selected && styles.boxRadioContainerSelected,
      ]}
    >
      <View
        style={[
          styles.radioCircle,
          selected && styles.radioCircleSelected,
        ]}
      >
        {selected && <View style={styles.radioDot} />}
      </View>

      <Text style={styles.boxRadioText}>{label}</Text>
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

  copyBadge: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#93C5FD",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  copyBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1D4ED8",
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
    minWidth: 100,
    minHeight: 46,
  },

  disabledButton: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  skipContainer: {
    paddingVertical: 12,
  },
});

export default SecondApplicantScreen;