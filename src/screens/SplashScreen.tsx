import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
  Image,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { initApiClient } from "../api/client";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

const { width } = Dimensions.get("window");

const SplashScreen = ({ navigation }: Props) => {
  // Foreground Animation Values
  const logoTranslateY = useRef(new Animated.Value(-500)).current; // Drops from sky
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  // Background Diorama Animation Values
  const truckTranslateX = useRef(new Animated.Value(-150)).current;
  const pillar1Y = useRef(new Animated.Value(200)).current;
  const pillar2Y = useRef(new Animated.Value(200)).current;
  const pillar3Y = useRef(new Animated.Value(200)).current;

  useEffect(() => {
    let isMounted = true;

    // Initialize API client on app startup
    initApiClient();

    // Check whether user has an active session (< 30 days / 1 month old)
    const determineDestination = async (): Promise<"Dashboard" | "Login"> => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        const loginTimeString = await AsyncStorage.getItem("loginTime");
        const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

        if (token) {
          if (loginTimeString) {
            const loginTime = parseInt(loginTimeString, 10);
            const isExpired = Date.now() - loginTime > ONE_MONTH_MS;
            if (isExpired) {
              console.log("Login session expired after 1 month. Redirecting to Login.");
              await AsyncStorage.removeMany(["authToken", "userData", "loginTime"]);
              return "Login";
            }
          } else {
            // Existing token without timestamp; stamp now to remember for 1 month
            await AsyncStorage.setItem("loginTime", Date.now().toString());
          }
          console.log("Valid login session found. Redirecting directly to Dashboard.");
          return "Dashboard";
        }
      } catch (error) {
        console.error("Error verifying login session:", error);
      }
      return "Login";
    };

    // Master Animation Sequence
    Animated.parallel([
      // 1. Truck drives completely across the screen
      Animated.timing(truckTranslateX, {
        toValue: width + 100,
        duration: 3500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),

      // 2. Buildings rise from the ground (Staggered)
      Animated.stagger(150, [
        Animated.timing(pillar1Y, { toValue: 0, duration: 600, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
        Animated.timing(pillar2Y, { toValue: 0, duration: 600, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
        Animated.timing(pillar3Y, { toValue: 0, duration: 600, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
      ]),

      // 3. Dion Logo Image drops in like a heavy block
      Animated.sequence([
        Animated.delay(600),
        Animated.parallel([
          Animated.spring(logoTranslateY, {
            toValue: 0,
            friction: 5, // low friction makes it bounce like a heavy impact
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]),

      // 4. Subtitle and Tagline fade in
      Animated.sequence([
        Animated.delay(1200),
        Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    // Run auth check in parallel with the splash animation
    const runStartup = async () => {
      const [destination] = await Promise.all([
        determineDestination(),
        new Promise<void>((resolve) => setTimeout(() => resolve(), 3800)),
      ]);

      if (isMounted) {
        navigation.replace(destination);
      }
    };

    runStartup();

    return () => {
      isMounted = false;
    };
  }, [
    navigation, logoTranslateY, logoOpacity, 
    subtitleOpacity, taglineOpacity, truckTranslateX, 
    pillar1Y, pillar2Y, pillar3Y
  ]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* --- BACKGROUND DIORAMA --- */}
      
      {/* 1. Static Crane */}
      <View style={styles.craneContainer}>
        <View style={styles.craneBase} />
        <View style={styles.craneArm} />
        <View style={styles.craneCounterWeight} />
        <View style={styles.craneLine} />
        <View style={styles.craneHook} />
      </View>

      {/* 2. Rising Buildings */}
      <View style={styles.buildingsContainer}>
        <Animated.View style={[styles.pillar1, { transform: [{ translateY: pillar1Y }] }]}>
          <View style={styles.window} /><View style={styles.window} />
        </Animated.View>
        <Animated.View style={[styles.pillar2, { transform: [{ translateY: pillar2Y }] }]}>
          <View style={styles.window} /><View style={styles.window} /><View style={styles.window} />
        </Animated.View>
        <Animated.View style={[styles.pillar3, { transform: [{ translateY: pillar3Y }] }]}>
          <View style={styles.window} />
        </Animated.View>
      </View>

      {/* 3. The Ground */}
      <View style={styles.ground} />

      {/* 4. Animated Flatbed Truck */}
      <Animated.View style={[styles.truckWrapper, { transform: [{ translateX: truckTranslateX }] }]}>
        <View style={styles.truckBed} />
        <View style={styles.truckCab} />
        <View style={[styles.wheel, { left: 10 }]} />
        <View style={[styles.wheel, { left: 40 }]} />
        <View style={[styles.wheel, { left: 70 }]} />
      </Animated.View>

      {/* --- FOREGROUND CONTENT (Logo & Text) --- */}
      <View style={styles.contentOverlay}>
        
        {/* Animated Custom Logo */}
        <Animated.View
          style={[
            styles.logoWrapper,
            {
              opacity: logoOpacity,
              transform: [{ translateY: logoTranslateY }],
            },
          ]}
        >
          {/* UPDATE THIS PATH TO MATCH WHERE YOU SAVED "dion logo.png" */}
          <Image 
            source={require('../../src/assets/images/dion logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          RIVERSIDE TOWNSHIP
        </Animated.Text>

        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Building Your Future Home
        </Animated.Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827", 
  },
  
  // -- Foreground Overlay --
  contentOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 120, // <--- THIS PUSHES THE LOGO AND TEXT DOWN
    zIndex: 20, 
  },
  
  // White wrapper so the black text in the logo is visible against the dark background
  logoWrapper: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  logoImage: {
    width: 200, 
    height: 80, 
  },

  subtitle: { 
    fontSize: 16, 
    color: "#FFFFFF", 
    fontWeight: "700", 
    letterSpacing: 4, 
    marginTop: 8 
  },
  tagline: { 
    position: "absolute", 
    bottom: 80, 
    color: "#9CA3AF", 
    fontSize: 13, 
    letterSpacing: 1, 
    textTransform: "uppercase", 
    fontWeight: "500" 
  },

  // -- Background Diorama Elements --
  ground: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 12,
    backgroundColor: "#1F2937",
    zIndex: 8,
  },
  
  // Crane
  craneContainer: { position: "absolute", right: 20, bottom: 0, width: 170, height: "60%", opacity: 0.7, zIndex: 1 },
  craneBase: { position: "absolute", right: 30, bottom: 0, width: 12, height: "100%", backgroundColor: "#F59E0B", borderLeftWidth: 3, borderColor: "#D97706" },
  craneArm: { position: "absolute", right: 30, top: 40, width: 140, height: 12, backgroundColor: "#F59E0B", borderBottomWidth: 3, borderColor: "#D97706" },
  craneCounterWeight: { position: "absolute", right: 10, top: 35, width: 20, height: 25, backgroundColor: "#374151", borderRadius: 4 },
  craneLine: { position: "absolute", right: 150, top: 52, width: 2, height: 140, backgroundColor: "#9CA3AF" },
  craneHook: { position: "absolute", right: 145, top: 192, width: 12, height: 12, borderWidth: 3, borderColor: "#9CA3AF", borderTopWidth: 0, borderBottomLeftRadius: 6, borderBottomRightRadius: 6 },

  // Buildings
  buildingsContainer: { position: "absolute", bottom: 12, left: 20, flexDirection: "row", alignItems: "flex-end", height: 200, zIndex: 5 },
  pillar1: { width: 40, height: 100, backgroundColor: "#374151", marginRight: 15, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  pillar2: { width: 55, height: 160, backgroundColor: "#4B5563", marginRight: 15, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  pillar3: { width: 35, height: 80, backgroundColor: "#1F2937", borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  window: { width: 12, height: 12, backgroundColor: "#60A5FA", opacity: 0.2, marginTop: 15, alignSelf: "center", borderRadius: 2 },

  // Truck
  truckWrapper: { position: "absolute", bottom: 12, left: 0, width: 100, height: 40, zIndex: 10 },
  truckCab: { position: "absolute", right: 0, bottom: 5, width: 30, height: 25, backgroundColor: "#FCD34D", borderTopRightRadius: 8, borderTopLeftRadius: 4 },
  truckBed: { position: "absolute", right: 32, bottom: 5, width: 60, height: 10, backgroundColor: "#F59E0B", borderBottomLeftRadius: 4 },
  wheel: { position: "absolute", bottom: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: "#111827", borderColor: "#6B7280", borderWidth: 2 },
});

export default SplashScreen;