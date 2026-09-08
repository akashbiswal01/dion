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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient, getBaseUrl, isAxiosError } from "../api/client";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Signup">;

// Reusable animated input component for smart focus states & password toggle
const AnimatedInput = ({
  label,
  icon,
  isPassword,
  ...props
}: {
  label: string;
  icon: string;
  isPassword?: boolean;
  [x: string]: any
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(true);

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, isFocused && styles.labelFocused]}>{label}</Text>
      <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
        <Text style={styles.inputIcon}>{icon}</Text>
        <TextInput
          style={styles.input}
          placeholderTextColor="#9CA3AF"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword ? isSecure : props.secureTextEntry}
          {...props}
        />

        {/* Render the eye icon only if this is a password field */}
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            activeOpacity={0.7}
            onPress={() => setIsSecure(!isSecure)}
          >
            <Image
              // REPLACE THESE PATHS WITH YOUR ACTUAL IMAGE PATHS
              source={
                isSecure
                  ? require('../../src/assets/images/open_eye.png')
                  : require('../../src/assets/images/close-eye.png')
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

const SignupScreen = ({ navigation }: Props) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    const identifier = mobile.trim();

    if (!firstName.trim()) {
      Alert.alert("Sign Up", "Please enter your first name.");
      return;
    }

    if (!identifier) {
      Alert.alert("Sign Up", "Please enter your mobile number.");
      return;
    }

    if (!/^[0-9]+$/.test(identifier) || identifier.length !== 10) {
      Alert.alert(
        "Invalid Mobile Number",
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (!password.trim()) {
      Alert.alert("Sign Up", "Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");

      const payload = {
        name: fullName,
        email: email.trim(),
        mobile: identifier,
        username: identifier,
        password: password,
        role: "user",
        is_active: 1,
      };

      console.log("=================================");
      console.log("CREATE USER REQUEST");
      console.log("URL:", `${getBaseUrl()}/api/users`);
      console.log("Payload:", JSON.stringify(payload, null, 2));
      console.log("=================================");

      const response = await apiClient.post("/api/users", payload, {
        timeout: 15000,
      });

      console.log("CREATE USER RESPONSE:", response.data);

      const result = response.data;

      if (result.success === false) {
        Alert.alert(
          "Registration Failed",
          result.message || "Failed to create user account."
        );
        return;
      }

      const createdUserId = result.data?.id || Date.now();

      // Auto-login to obtain JWT token
      let token = `auth_${createdUserId}_${Date.now()}`;
      try {
        const loginRes = await apiClient.post(
          "/api/auth/login",
          {
            role: "user",
            identifier,
            password,
          },
          { timeout: 8000 }
        );
        const fetchedToken =
          loginRes.data?.token ||
          loginRes.data?.access_token ||
          loginRes.data?.data?.token;
        if (fetchedToken) {
          token = fetchedToken;
        }
      } catch (loginErr) {
        console.log("Auto-login note:", loginErr);
      }

      const userData = {
        id: createdUserId,
        name: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: identifier,
        mobile: identifier,
        email: email.trim() || `${identifier}@dion.com`,
        role: "user",
      };

      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      await AsyncStorage.setItem("loginMobile", identifier);
      await AsyncStorage.setItem("loginTime", Date.now().toString());

      Alert.alert(
        "Success",
        "Account created successfully!",
        [
          {
            text: "Get Started",
            onPress: () => navigation.replace("Dashboard"),
          },
        ]
      );
    } catch (error: any) {
      console.log("CREATE USER ERROR:", error);

      if (isAxiosError(error)) {
        const errorMsg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          (error.response?.status === 400
            ? "Mobile number or username already exists."
            : "Network error. Please check backend connection.");

        Alert.alert("Registration Failed", errorMsg);
      } else {
        Alert.alert(
          "Error",
          error?.message || "An unexpected error occurred. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >

        {/* --- DARK HEADER SECTION --- */}
        <View style={styles.header}>
          <View style={styles.circleDecoration} />

          <View style={styles.logoWrapper}>
            <Image
              source={require('../../src/assets/images/dion image.jpg')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Start your riverside living journey today.
          </Text>
        </View>

        {/* --- ANIMATED FORM CARD --- */}
        <Animated.View
          style={[
            styles.formCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.row}>
            <View style={styles.flex}>
              <AnimatedInput
                label="First Name"
                icon="👤"
                placeholder="John"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>
            <View style={{ width: 16 }} />
            <View style={styles.flex}>
              <AnimatedInput
                label="Last Name"
                icon="👥"
                placeholder="Doe"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <AnimatedInput
            label="Mobile Number"
            icon="📱"
            placeholder="Enter mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            value={mobile}
            onChangeText={(val: string) => setMobile(val.replace(/[^0-9]/g, ""))}
          />

          <AnimatedInput
            label="Email Address"
            icon="✉️"
            placeholder="john.doe@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <AnimatedInput
            label="Password"
            icon="🔒"
            placeholder="Create a strong password"
            isPassword={true} // Turns on the view/hide toggle functionality
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            activeOpacity={0.8}
            disabled={loading}
            onPress={handleSignup}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
                <Text style={styles.arrowIcon}>→</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.loginFallback}>
            <Text style={styles.fallbackText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login" as any)}>
              <Text style={styles.loginText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  flex: { flex: 1 },
  row: { flexDirection: "row" },

  // --- HEADER STYLES ---
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
  logoWrapper: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoImage: { width: 140, height: 50 },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  subtitle: { color: "#9CA3AF", fontSize: 14, marginTop: 8, fontWeight: "500" },

  // --- FORM CARD STYLES ---
  formCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: -60,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 10,
  },

  // --- INPUT STYLES ---
  inputContainer: { marginBottom: 20 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
    marginLeft: 4,
  },
  labelFocused: { color: "#2563EB" },
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
  inputIcon: { fontSize: 18, marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    height: "100%",
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    width: 22,
    height: 22,
    tintColor: "#9CA3AF", // Tints the image gray to match the placeholder styling
  },

  // --- BUTTON STYLES ---
  button: {
    height: 56,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "800", fontSize: 15, letterSpacing: 1 },
  arrowIcon: { color: "#FFFFFF", fontWeight: "800", fontSize: 18, marginLeft: 8 },

  // --- FALLBACK STYLES ---
  loginFallback: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  fallbackText: { color: "#6B7280", fontSize: 14 },
  loginText: { color: "#2563EB", fontSize: 14, fontWeight: "700" },
});

export default SignupScreen;