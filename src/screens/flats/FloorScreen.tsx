import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { apiClient } from "../../api/client";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Floor"
>;

// ============================================
// FLOOR API DATA TYPE
// ============================================

interface Floor {
  floor_id: number;
  block_id: number;
  floor_number: number;
  floor_label: string;
  total_flats: number;
  created_at: string;
  is_active: number;
  society_id: number;
}

interface FloorApiResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    items: Floor[];
  };
}

const FloorScreen = ({
  navigation,
  route,
}: Props) => {
  // ============================================
  // GET ROUTE PARAMS
  // ============================================

  const { towerName, block_id } = route.params;

  // ============================================
  // STATES
  // ============================================

  const [floors, setFloors] = useState<Floor[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [refreshing, setRefreshing] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");

  // ============================================
  // GET FLOORS API
  // ============================================

  const getFloors = async () => {
    try {
      setError("");

      console.log(
        "Getting floors for block:",
        block_id
      );

      const response =
        await apiClient.get<FloorApiResponse>(
          "/api/floor"
        );

      console.log(
        "Floor API Response:",
        response.data
      );

      if (response.data.success) {
        // ========================================
        // FILTER FLOORS FOR SELECTED BLOCK
        // ========================================

        const blockFloors =
          response.data.data.items.filter(
            (floor) =>
              floor.block_id === block_id &&
              floor.is_active === 1
          );

        // ========================================
        // SORT BY FLOOR NUMBER
        // ========================================

        blockFloors.sort(
          (a, b) =>
            a.floor_number - b.floor_number
        );

        setFloors(blockFloors);
      } else {
        setError(
          response.data.message ||
            "Unable to retrieve floors"
        );
      }
    } catch (error: any) {
      console.log(
        "Get Floors Error:",
        error
      );

      if (error.response) {
        console.log(
          "API Error:",
          error.response.data
        );

        setError(
          error.response.data?.message ||
            "Server error while retrieving floors"
        );
      } else if (error.request) {
        setError(
          "Unable to connect to server. Please check your API URL and network."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================
  // LOAD FLOORS WHEN SCREEN OPENS
  // ============================================

  useEffect(() => {
    getFloors();
  }, [block_id]);

  // ============================================
  // REFRESH
  // ============================================

  const onRefresh = () => {
    setRefreshing(true);
    getFloors();
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading floors...
        </Text>
      </View>
    );
  }

  // ============================================
  // ERROR
  // ============================================

  if (
    error &&
    floors.length === 0
  ) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>
          ⚠️
        </Text>

        <Text style={styles.errorTitle}>
          Unable to Load Floors
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={getFloors}
        >
          <Text style={styles.retryText}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ============================================
  // MAIN UI
  // ============================================

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={
        styles.contentContainer
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      {/* HEADER */}

      <Text style={styles.title}>
        Select Floor
      </Text>

      <Text style={styles.subtitle}>
        Choose a floor in {towerName}
      </Text>

      {/* FLOOR COUNT */}

      <Text style={styles.countText}>
        {floors.length} Floors Available
      </Text>

      {/* FLOOR LIST */}

      {floors.map((floor) => (
        <TouchableOpacity
          key={floor.floor_id}
          style={styles.card}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate(
              "FlatList",
              {
                towerName,
                floor: floor.floor_number,
                block_id,
                floor_id: floor.floor_id,
              }
            )
          }
        >
          {/* ICON */}

          <View style={styles.icon}>
            <Text style={styles.iconText}>
              🏢
            </Text>
          </View>

          {/* FLOOR INFORMATION */}

          <View style={styles.info}>
            <Text style={styles.name}>
              {floor.floor_label}
            </Text>

            <Text style={styles.flats}>
              {floor.total_flats} Apartments
            </Text>

            <Text style={styles.floorNumber}>
              Floor {floor.floor_number}
            </Text>
          </View>

          {/* ARROW */}

          <Text style={styles.arrow}>
            →
          </Text>
        </TouchableOpacity>
      ))}

      {/* EMPTY STATE */}

      {floors.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>
            🏢
          </Text>

          <Text style={styles.emptyTitle}>
            No Floors Found
          </Text>

          <Text style={styles.emptyText}>
            No active floors were found for{" "}
            {towerName}.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F6",
  },

  contentContainer: {
    padding: 20,
    paddingBottom: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 45,
    color: "#111827",
  },

  subtitle: {
    color: "#666",
    marginTop: 7,
    marginBottom: 10,
    fontSize: 14,
  },

  countText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 20,
  },

  // ==========================================
  // FLOOR CARD
  // ==========================================

  card: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,

    flexDirection: "row",
    alignItems: "center",

    elevation: 2,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  icon: {
    width: 55,
    height: 55,
    borderRadius: 12,

    backgroundColor: "#E7EFEC",

    alignItems: "center",
    justifyContent: "center",
  },

  iconText: {
    fontSize: 25,
  },

  info: {
    flex: 1,
    marginLeft: 15,
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  flats: {
    marginTop: 5,
    color: "#555",
    fontSize: 14,
  },

  floorNumber: {
    marginTop: 4,
    color: "#999",
    fontSize: 12,
  },

  arrow: {
    fontSize: 25,
    color: "#2563EB",
    marginLeft: 10,
  },

  // ==========================================
  // LOADING
  // ==========================================

  loadingContainer: {
    flex: 1,
    backgroundColor: "#F5F7F6",

    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },

  // ==========================================
  // ERROR
  // ==========================================

  errorContainer: {
    flex: 1,
    backgroundColor: "#F5F7F6",

    alignItems: "center",
    justifyContent: "center",

    padding: 30,
  },

  errorIcon: {
    fontSize: 45,
    marginBottom: 15,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },

  errorText: {
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },

  retryText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },

  // ==========================================
  // EMPTY
  // ==========================================

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 70,
  },

  emptyIcon: {
    fontSize: 50,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  emptyText: {
    color: "#777",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default FloorScreen;

