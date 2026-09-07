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

import { apiClient, getBaseUrl, isAxiosError } from "../api/client";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";

import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Dashboard"
>;

interface User {
  id: number;
  name: string;
  email?: string;
  mobile?: string;
  username?: string;
  role?: string;
}

interface UsersResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    items: User[];
  };
}

const DashboardScreen = ({ navigation }: Props) => {
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);

  // ==========================================
  // GET USER NAME
  // ==========================================

  const fetchUser = async () => {
    try {
      setLoading(true);

      console.log("=================================");
      console.log("GET USER NAME REQUEST");
      console.log("URL:", `${getBaseUrl()}/api/users`);
      console.log("=================================");

      const response = await apiClient.get<UsersResponse>("/api/users", {
        timeout: 15000,
      });

      console.log("=================================");
      console.log("GET USER NAME RESPONSE");
      console.log(JSON.stringify(response.data, null, 2));
      console.log("=================================");

      if (
        response.data?.success &&
        response.data?.data?.items?.length > 0
      ) {
        const user = response.data.data.items[0];

        setUserName(user.name || "User");
      } else {
        setUserName("User");

        Alert.alert(
          "Error",
          response.data?.message || "User not found"
        );
      }
    } catch (error: any) {
      console.log("=================================");
      console.log("GET USER NAME ERROR");
      console.log(error);
      console.log("=================================");

      if (isAxiosError(error)) {
        console.log("Status:", error.response?.status);

        console.log(
          "Response:",
          JSON.stringify(error.response?.data, null, 2)
        );

        Alert.alert(
          "Error",
          error.response?.data?.message ||
            "Unable to load user"
        );
      } else {
        Alert.alert(
          "Error",
          error?.message || "Something went wrong"
        );
      }

      setUserName("User");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD USER WHEN DASHBOARD OPENS
  // ==========================================

  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [])
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ================= HEADER ================= */}

        <View style={styles.header}>
          <View style={styles.headerUserSection}>
            <Text style={styles.small}>
              Welcome
            </Text>

            {loading ? (
              <View style={styles.loadingNameContainer}>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text style={styles.nameLoadingText}>
                  Loading...
                </Text>
              </View>
            ) : (
              <Text style={styles.name}>
                {userName}
              </Text>
            )}
          </View>

          <Text style={styles.notification}>
            🔔
          </Text>
        </View>

        {/* ================= PROJECTS ================= */}

        <View style={styles.projectsContainer}>
          <Text style={styles.sectionTitle}>
            DION Projects
          </Text>

          {/* Project Card */}
          <TouchableOpacity
            style={styles.projectCard}
            activeOpacity={0.9}
            onPress={() =>
              navigation.navigate("Project")
            }
          >
            <Text style={styles.projectTitle}>
              DION Riverside Township
            </Text>

            <Text style={styles.projectSubtitle}>
              Find your perfect home
            </Text>

            <View style={styles.exploreButton}>
              <Text style={styles.exploreText}>
                Explore Project
              </Text>

              <Text style={styles.arrowIcon}>
                →
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ================= BOTTOM NAVIGATION ================= */}

      <View style={styles.bottomBar}>
        {/* HOME */}

        <TouchableOpacity
          style={styles.bottomTab}
          activeOpacity={1}
        >
          <Text style={styles.bottomIcon}>
            🏠
          </Text>

          <Text style={styles.bottomActive}>
            Home
          </Text>
        </TouchableOpacity>

        {/* PROFILE */}

        <TouchableOpacity
          style={styles.bottomTab}
          onPress={() =>
            navigation.navigate("Profile" as any)
          }
        >
          <Text style={styles.bottomIcon}>
            👤
          </Text>

          <Text style={styles.bottomText}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F6",
  },

  scrollContent: {
    paddingBottom: 20,
  },

  // ==========================================
  // HEADER
  // ==========================================

  header: {
    backgroundColor: "#5383ebff",
    padding: 22,
    paddingTop: 55,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  headerUserSection: {
    flex: 1,
  },

  small: {
    color: "#DBEAFE",
    fontSize: 13,
  },

  name: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 4,
  },

  notification: {
    fontSize: 24,
  },

  loadingNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  nameLoadingText: {
    color: "#FFF",
    fontSize: 18,
    marginLeft: 8,
    fontWeight: "600",
  },

  // ==========================================
  // PROJECTS
  // ==========================================

  projectsContainer: {
    padding: 20,
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2563EB",
    marginBottom: 16,
  },

  projectCard: {
    backgroundColor: "#1D4ED8",
    borderRadius: 18,
    padding: 25,

    shadowColor: "#000",

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  projectTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "800",
  },

  projectSubtitle: {
    color: "#DBEAFE",
    marginTop: 8,
    fontSize: 15,
  },

  exploreButton: {
    backgroundColor: "#FFF",
    alignSelf: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
  },

  exploreText: {
    color: "#2563EB",
    fontWeight: "800",
    fontSize: 15,
  },

  arrowIcon: {
    color: "#2563EB",
    fontWeight: "800",
    fontSize: 18,
    marginLeft: 8,
  },

  // ==========================================
  // BOTTOM BAR
  // ==========================================

  bottomBar: {
    height: 70,
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EAEAEA",
    paddingBottom: 10,
  },

  bottomTab: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  bottomIcon: {
    fontSize: 20,
    marginBottom: 4,
  },

  bottomText: {
    color: "#777",
    fontSize: 12,
    fontWeight: "500",
  },

  bottomActive: {
    color: "#2563EB",
    fontWeight: "800",
    fontSize: 12,
  },
});

export default DashboardScreen;