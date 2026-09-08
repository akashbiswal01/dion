import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient, getBaseUrl, isAxiosError } from "../api/client";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Profile"
>;

interface User {
  id: number;
  name: string;
  email: string;
  mobile: string;
  username: string;
  role: string;
  agent_id: number;
  is_active: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  is_deleted: number;
}

interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    items: User[];
  };
}

const ProfileScreen = ({ navigation }: Props) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);

      // 1. Read local storage first
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const user = JSON.parse(storedUserData);
          if (user) {
            setProfile(user);
          }
        }
      } catch (storageErr) {
        console.log("Local storage read error in profile:", storageErr);
      }

      // 2. Try fetching latest profile from API
      try {
        const response = await apiClient.get<UsersResponse>("/api/users", {
          timeout: 4000,
        });

        if (
          response.data?.success &&
          response.data?.data?.items?.length > 0
        ) {
          const user = response.data.data.items[0];
          setProfile(user);
        }
      } catch (apiErr) {
        console.log("Profile API unreachable, using local profile.");
      }
    } catch (error: any) {
      console.log("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [])
  );

  const getInitials = () => {
    if (!profile?.name) {
      return "U";
    }

    const words = profile.name.trim().split(" ");

    if (words.length >= 2) {
      return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
      ).toUpperCase();
    }

    return profile.name.charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeMany([
              "authToken",
              "userData",
              "loginTime",
            ]);
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          } catch (e) {
            navigation.replace("Login");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            MY <Text style={styles.blueText}>PROFILE</Text>
          </Text>

          <Text style={styles.headerSubtitle}>
            Manage your account
          </Text>
        </View>

        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color="#2563EB"
              />

              <Text style={styles.loadingText}>
                Loading profile...
              </Text>
            </View>
          ) : !profile ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Profile not found
              </Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={fetchProfile}
              >
                <Text style={styles.retryButtonText}>
                  Retry
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.profileTop}>
                {/* AVATAR */}
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {getInitials()}
                  </Text>
                </View>

                {/* USER INFORMATION */}
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>
                    {profile.name}
                  </Text>

                  <Text style={styles.userEmail}>
                    {profile.email}
                  </Text>

                  <Text style={styles.userPhone}>
                    {profile.mobile}
                  </Text>
                </View>
              </View>

              {/* EDIT PROFILE */}
              <TouchableOpacity
                style={styles.editButton}
                activeOpacity={0.8}
                onPress={() => {
                  // navigation.navigate("EditProfile" as any);
                }}
              >
                <Text style={styles.editIcon}>
                  ✎
                </Text>

                <Text style={styles.editButtonText}>
                  Edit Profile
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ACCOUNT TITLE */}
        <Text style={styles.sectionTitle}>
          ACCOUNT
        </Text>

        {/* ACCOUNT CARD */}
        <View style={styles.accountCard}>
          {/* BOOKING DETAILS */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate("BookingSummary")
            }
          >
            <View
              style={[
                styles.menuIcon,
                styles.greenIcon,
              ]}
            >
              <Text style={styles.menuIconText}>
                🏠
              </Text>
            </View>

            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>
                Booking Details
              </Text>

              <Text style={styles.menuSubtitle}>
                View your property booking
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* PAYMENT DETAILS */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate("Payments")
            }
          >
            <View
              style={[
                styles.menuIcon,
                styles.orangeIcon,
              ]}
            >
              <Text style={styles.menuIconText}>
                💳
              </Text>
            </View>

            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>
                Payment Details
              </Text>

              <Text style={styles.menuSubtitle}>
                Payments & transactions
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* DOCUMENTS */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate("Documents")
            }
          >
            <View
              style={[
                styles.menuIcon,
                styles.purpleIcon,
              ]}
            >
              <Text style={styles.menuIconText}>
                📄
              </Text>
            </View>

            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>
                Documents
              </Text>

              <Text style={styles.menuSubtitle}>
                Booking & KYC documents
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* NOTIFICATIONS */}
        <Text style={styles.sectionTitle}>
          NOTIFICATIONS
        </Text>

        <View style={styles.accountCard}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.menuIcon,
                styles.redIcon,
              ]}
            >
              <Text style={styles.menuIconText}>
                🔔
              </Text>
            </View>

            <View style={styles.menuContent}>
              <View
                style={styles.notificationTitleRow}
              >
                <Text style={styles.menuTitle}>
                  Notifications
                </Text>

                <View
                  style={styles.notificationBadge}
                >
                  <Text
                    style={
                      styles.notificationBadgeText
                    }
                  >
                    3
                  </Text>
                </View>
              </View>

              <Text style={styles.menuSubtitle}>
                View your latest notifications
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* LOGOUT */}
        <View style={[styles.accountCard, { marginTop: 4 }]}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={handleLogout}
          >
            <View
              style={[
                styles.menuIcon,
                styles.redIcon,
              ]}
            >
              <Text style={styles.menuIconText}>
                🚪
              </Text>
            </View>

            <View style={styles.menuContent}>
              <Text
                style={[
                  styles.menuTitle,
                  { color: "#EF4444" },
                ]}
              >
                Log Out
              </Text>

              <Text style={styles.menuSubtitle}>
                Sign out of your account
              </Text>
            </View>

            <Text style={styles.arrow}>
              ›
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 50,
  },

  /* HEADER */
  header: {
    marginTop: 20,
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: 0.5,
  },

  blueText: {
    color: "#2563EB",
  },

  headerSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 5,
    letterSpacing: 0.8,
  },

  /* PROFILE */
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    marginBottom: 28,
    minHeight: 150,
  },

  profileTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
  },

  userInfo: {
    flex: 1,
    marginLeft: 16,
  },

  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  userEmail: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  userPhone: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 3,
  },

  loadingContainer: {
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 13,
  },

  emptyContainer: {
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 12,
  },

  retryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  editButton: {
    height: 46,
    borderRadius: 9,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },

  editIcon: {
    fontSize: 16,
    color: "#2563EB",
    marginRight: 7,
  },

  editButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },

  /* SECTION */
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
    letterSpacing: 1.2,
    marginBottom: 10,
    marginTop: 4,
  },

  /* ACCOUNT CARD */
  accountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    marginBottom: 22,
  },

  menuItem: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginLeft: 76,
  },

  menuIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  blueIcon: {
    backgroundColor: "#DBEAFE",
  },

  greenIcon: {
    backgroundColor: "#DCFCE7",
  },

  orangeIcon: {
    backgroundColor: "#FFEDD5",
  },

  purpleIcon: {
    backgroundColor: "#F3E8FF",
  },

  redIcon: {
    backgroundColor: "#FEE2E2",
  },

  menuIconText: {
    fontSize: 20,
  },

  menuContent: {
    flex: 1,
    marginLeft: 14,
  },

  menuTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  menuSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  arrow: {
    fontSize: 28,
    color: "#9CA3AF",
    marginLeft: 8,
  },

  /* NOTIFICATION */
  notificationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  notificationBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    paddingHorizontal: 5,
  },

  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
});

export default ProfileScreen;