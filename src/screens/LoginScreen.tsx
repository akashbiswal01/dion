import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  Easing,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import Icon from "react-native-vector-icons/Ionicons";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient, getBaseUrl, isAxiosError } from "../api/client";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

// ======================================================
// LOGIN RESPONSE TYPE
// ======================================================

interface LoginResponse {
  success?: boolean;
  message?: string;

  token?: string;
  access_token?: string;

  data?: {
    token?: string;
    access_token?: string;
    user?: any;
    [key: string]: any;
  };

  [key: string]: any;
}

// ======================================================
// ANIMATED INPUT
// ======================================================

const AnimatedInput = ({
  label,
  icon,
  isPassword,
  ...props
}: {
  label: string;
  icon: string;
  isPassword?: boolean;
  [x: string]: any;
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(true);

  return (
    <View style={styles.inputContainer}>

      {/* LABEL */}
      <Text
        style={[
          styles.label,
          isFocused && styles.labelFocused,
        ]}
      >
        {label}
      </Text>

      {/* INPUT WRAPPER */}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
        ]}
      >

        {/* INPUT ICON */}
        <Text style={styles.inputIcon}>
          {icon}
        </Text>

        {/* INPUT */}
        <TextInput
          style={styles.input}
          placeholderTextColor="#9CA3AF"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={
            isPassword
              ? isSecure
              : props.secureTextEntry
          }
          {...props}
        />

        {/* PASSWORD EYE */}
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            activeOpacity={0.7}
            onPress={() => setIsSecure(!isSecure)}
          >
            <Image
              source={
                isSecure
                  ? require("../../src/assets/images/open_eye.png")
                  : require("../../src/assets/images/close-eye.png")
              }
              style={styles.eyeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}

      </View>
    </View>
  );
};

// ======================================================
// LOGIN SCREEN
// ======================================================

const LoginScreen = ({ navigation }: Props) => {

  // ====================================================
  // STATES
  // ====================================================

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // ====================================================
  // ANIMATION
  // ====================================================

  const fadeAnim = useRef(
    new Animated.Value(0)
  ).current;

  const slideAnim = useRef(
    new Animated.Value(50)
  ).current;

  // ====================================================
  // START ANIMATION
  // ====================================================

  useEffect(() => {
    // Load last used mobile number
    const loadSavedMobile = async () => {
      try {
        const saved = await AsyncStorage.getItem("loginMobile");
        if (saved) {
          setMobile(saved);
        }
      } catch (e) {
        // Ignore storage read error
      }
    };

    loadSavedMobile();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // ====================================================
  // LOGIN FUNCTION
  // ====================================================

  const handleLogin = async () => {

    // Remove spaces
    const identifier = mobile.trim();

    // ==================================================
    // MOBILE VALIDATION
    // ==================================================

    if (!identifier) {
      Alert.alert(
        "Login",
        "Please enter your mobile number."
      );

      return;
    }

    // Only numbers
    if (!/^[0-9]+$/.test(identifier)) {
      Alert.alert(
        "Invalid Mobile Number",
        "Mobile number can contain only numbers."
      );

      return;
    }

    // 10 digit validation
    if (identifier.length !== 10) {
      Alert.alert(
        "Invalid Mobile Number",
        "Please enter a valid 10-digit mobile number."
      );

      return;
    }

    // ==================================================
    // PASSWORD VALIDATION
    // ==================================================

    if (!password.trim()) {
      Alert.alert(
        "Login",
        "Please enter your password."
      );

      return;
    }

    try {

      setLoading(true);

      // =================================================
      // LOG REQUEST
      // =================================================

      console.log(
        "================================="
      );

      console.log("LOGIN REQUEST");

      console.log(
        "URL:",
        `${getBaseUrl()}/api/auth/login`
      );

      console.log(
        "Request:",
        JSON.stringify(
          {
            role: "user",
            identifier: identifier,
            password: password,
          },
          null,
          2
        )
      );

      console.log(
        "================================="
      );

      // =================================================
      // API CALL
      // =================================================

      const response =
        await apiClient.post<LoginResponse>(
          "/api/auth/login",
          {
            role: "user",
            identifier: identifier,
            password: password,
          },
          {
            timeout: 15000,
          }
        );

      // =================================================
      // RESPONSE
      // =================================================

      console.log(
        "================================="
      );

      console.log("LOGIN RESPONSE");

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

      const result = response.data;

      // =================================================
      // CHECK SUCCESS
      // =================================================

      if (result.success === false) {

        Alert.alert(
          "Login Failed",
          result.message ||
            "Invalid mobile number or password."
        );

        return;
      }

      // =================================================
      // GET TOKEN
      // =================================================

      const token =
        result.token ||
        result.access_token ||
        result.data?.token ||
        result.data?.access_token;

      // =================================================
      // SAVE TOKEN
      // =================================================

      if (token) {

        await AsyncStorage.setItem(
          "authToken",
          token
        );

        console.log(
          "Auth token saved successfully."
        );
      }

      // =================================================
      // SAVE USER DATA
      // =================================================

      if (result.data) {

        await AsyncStorage.setItem(
          "userData",
          JSON.stringify(result.data)
        );

        console.log(
          "User data saved successfully."
        );
      }

      // =================================================
      // SAVE MOBILE & LOGIN TIMESTAMP (FOR 1 MONTH REMEMBER ME)
      // =================================================

      await AsyncStorage.setItem(
        "loginMobile",
        identifier
      );

      await AsyncStorage.setItem(
        "loginTime",
        Date.now().toString()
      );

      console.log(
        "Login session saved. Navigating directly to Dashboard."
      );

      // =================================================
      // DIRECT NAVIGATE TO DASHBOARD
      // =================================================

      navigation.replace(
        "Dashboard" as any
      );

    } catch (error: any) {

      // =================================================
      // ERROR LOG
      // =================================================

      console.log(
        "================================="
      );

      console.log("LOGIN ERROR");

      console.log(error);

      console.log(
        "================================="
      );

      // =================================================
      // AXIOS ERROR
      // =================================================

      if (isAxiosError(error)) {

        // ===============================================
        // SERVER RESPONSE ERROR
        // ===============================================

        if (error.response) {

          console.log(
            "Status:",
            error.response.status
          );

          console.log(
            "Response:",
            JSON.stringify(
              error.response.data,
              null,
              2
            )
          );

          const serverMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            "Invalid mobile number or password.";

          Alert.alert(
            "Login Failed",
            serverMessage
          );
        }

        // ===============================================
        // NETWORK ERROR
        // ===============================================

        else if (error.request) {

          console.log(
            "No response received from server."
          );

          Alert.alert(
            "Server Error",
            "Unable to connect to the server. Please check your API URL and network connection."
          );
        }

        // ===============================================
        // OTHER AXIOS ERROR
        // ===============================================

        else {

          Alert.alert(
            "Login Error",
            error.message ||
              "Something went wrong."
          );
        }

      } else {

        // ===============================================
        // UNKNOWN ERROR
        // ===============================================

        Alert.alert(
          "Login Error",
          "Something went wrong. Please try again."
        );
      }

    } finally {

      setLoading(false);

    }
  };

  // ====================================================
  // UI
  // ====================================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >

      {/* STATUS BAR */}

      <StatusBar
        barStyle="light-content"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
      >

        {/* ==================================================
            DARK HEADER
        ================================================== */}

        <View style={styles.header}>

          {/* CIRCLE DECORATION */}

          <View
            style={styles.circleDecoration}
          />

          {/* SETTINGS BUTTON */}

          <TouchableOpacity
            style={styles.configButton}
            onPress={() =>
              navigation.navigate(
                "ApiConfig" as any
              )
            }
          >

            <Icon
              name="settings-outline"
              size={24}
              color="#FFFFFF"
            />

          </TouchableOpacity>

          {/* LOGO */}

          <View
            style={styles.logoWrapper}
          >

            <Image
              source={require("../../src/assets/images/dion image.jpg")}
              style={styles.logoImage}
              resizeMode="contain"
            />

          </View>

          {/* TITLE */}

          <Text style={styles.title}>
            Welcome
          </Text>

          {/* SUBTITLE */}

          <Text style={styles.subtitle}>
            Log in to continue your riverside
            journey.
          </Text>

        </View>

        {/* ==================================================
            FORM CARD
        ================================================== */}

        <Animated.View
          style={[
            styles.formCard,
            {
              opacity: fadeAnim,

              transform: [
                {
                  translateY: slideAnim,
                },
              ],
            },
          ]}
        >

          {/* ==================================================
              MOBILE NUMBER
          ================================================== */}

          <AnimatedInput
            label="Mobile Number"
            icon="📱"
            placeholder="Enter your mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            value={mobile}
            onChangeText={(text: string) => {

              // Only allow numbers

              const numericValue =
                text.replace(
                  /[^0-9]/g,
                  ""
                );

              setMobile(
                numericValue
              );
            }}
            editable={!loading}
          />

          {/* ==================================================
              PASSWORD
          ================================================== */}

          <View>

            <AnimatedInput
              label="Password"
              icon="🔒"
              placeholder="Enter your password"
              isPassword={true}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            {/* ==================================================
                FORGOT PASSWORD
            ================================================== */}

            <TouchableOpacity
              style={
                styles.forgotPasswordContainer
              }
              activeOpacity={0.7}
              disabled={loading}
              onPress={() => {
                Alert.alert(
                  "Forgot Password",
                  "Forgot password functionality will be added here."
                );
              }}
            >

              <Text
                style={
                  styles.forgotPasswordText
                }
              >
                Forgot Password?
              </Text>

            </TouchableOpacity>

          </View>

          {/* ==================================================
              LOGIN BUTTON
          ================================================== */}

          <TouchableOpacity
            style={[
              styles.button,
              loading &&
                styles.buttonDisabled,
            ]}
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={loading}
          >

            {loading ? (

              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text
                  style={[
                    styles.buttonText,
                    {
                      marginLeft: 10,
                    },
                  ]}
                >
                  LOGGING IN...
                </Text>
              </>

            ) : (

              <>
                <Text
                  style={
                    styles.buttonText
                  }
                >
                  LOG IN
                </Text>

                <Text
                  style={
                    styles.arrowIcon
                  }
                >
                  →
                </Text>
              </>

            )}

          </TouchableOpacity>

          {/* ==================================================
              SIGN UP
          ================================================== */}

          <View
            style={
              styles.signupFallback
            }
          >

            <Text
              style={
                styles.fallbackText
              }
            >
              Don't have an account?{" "}
            </Text>

            <TouchableOpacity
              disabled={loading}
              onPress={() =>
                navigation.navigate(
                  "Signup" as any
                )
              }
            >

              <Text
                style={
                  styles.signupText
                }
              >
                Sign Up
              </Text>

            </TouchableOpacity>

          </View>

        </Animated.View>

      </ScrollView>

    </KeyboardAvoidingView>
  );
};

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({

  // ====================================================
  // CONTAINER
  // ====================================================

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  // ====================================================
  // HEADER
  // ====================================================

  header: {
    backgroundColor: "#111827",

    paddingHorizontal: 30,

    paddingTop: 80,

    paddingBottom: 100,

    alignItems: "center",

    position: "relative",

    overflow: "hidden",
  },

  circleDecoration: {
    position: "absolute",

    top: -50,

    right: -50,

    width: 200,

    height: 200,

    borderRadius: 100,

    backgroundColor: "#2563EB",

    opacity: 0.15,
  },

  configButton: {
    position: "absolute",

    top: 50,

    right: 20,

    padding: 10,

    zIndex: 10,
  },

  // ====================================================
  // LOGO
  // ====================================================

  logoWrapper: {
    marginBottom: 24,

    alignItems: "center",

    justifyContent: "center",
  },

  logoImage: {
    width: 160,

    height: 60,
  },

  // ====================================================
  // TITLE
  // ====================================================

  title: {
    color: "#FFFFFF",

    fontSize: 28,

    fontWeight: "900",

    letterSpacing: 0.5,
  },

  subtitle: {
    color: "#9CA3AF",

    fontSize: 14,

    marginTop: 8,

    fontWeight: "500",

    textAlign: "center",
  },

  // ====================================================
  // FORM CARD
  // ====================================================

  formCard: {
    backgroundColor: "#FFFFFF",

    marginHorizontal: 20,

    marginTop: -60,

    borderRadius: 20,

    padding: 24,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.08,

    shadowRadius: 15,

    elevation: 10,
  },

  // ====================================================
  // INPUT
  // ====================================================

  inputContainer: {
    marginBottom: 20,
  },

  label: {
    fontSize: 13,

    fontWeight: "600",

    color: "#6B7280",

    marginBottom: 8,

    marginLeft: 4,
  },

  labelFocused: {
    color: "#2563EB",
  },

  inputWrapper: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#F9FAFB",

    borderWidth: 1,

    borderColor: "#E5E7EB",

    borderRadius: 12,

    height: 56,

    paddingHorizontal: 16,
  },

  inputWrapperFocused: {
    borderColor: "#2563EB",

    backgroundColor: "#EFF6FF",
  },

  inputIcon: {
    fontSize: 18,

    marginRight: 12,
  },

  input: {
    flex: 1,

    fontSize: 15,

    color: "#111827",

    height: "100%",
  },

  // ====================================================
  // PASSWORD EYE
  // ====================================================

  eyeButton: {
    padding: 8,
  },

  eyeIcon: {
    width: 22,

    height: 22,

    tintColor: "#9CA3AF",
  },

  // ====================================================
  // FORGOT PASSWORD
  // ====================================================

  forgotPasswordContainer: {
    alignSelf: "flex-end",

    marginTop: -10,

    marginBottom: 20,
  },

  forgotPasswordText: {
    color: "#2563EB",

    fontSize: 13,

    fontWeight: "600",
  },

  // ====================================================
  // LOGIN BUTTON
  // ====================================================

  button: {
    height: 56,

    borderRadius: 12,

    backgroundColor: "#2563EB",

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    marginTop: 4,

    shadowColor: "#2563EB",

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.3,

    shadowRadius: 8,

    elevation: 6,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  buttonText: {
    color: "#FFFFFF",

    fontWeight: "800",

    fontSize: 15,

    letterSpacing: 1,
  },

  arrowIcon: {
    color: "#FFFFFF",

    fontWeight: "800",

    fontSize: 18,

    marginLeft: 8,
  },

  // ====================================================
  // SIGNUP
  // ====================================================

  signupFallback: {
    flexDirection: "row",

    justifyContent: "center",

    marginTop: 24,
  },

  fallbackText: {
    color: "#6B7280",

    fontSize: 14,
  },

  signupText: {
    color: "#2563EB",

    fontSize: 14,

    fontWeight: "700",
  },

});

export default LoginScreen;