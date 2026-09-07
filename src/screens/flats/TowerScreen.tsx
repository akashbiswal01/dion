
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

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { apiClient } from "../../api/client";

import { RootStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Tower"
>;

// ============================================
// API DATA TYPE
// ============================================

interface Block {
  block_id: number;
  society_id: number;
  block_name: string;
  block_code: string;
  total_floors: number;
  total_flats: number;
  block_type_id: number | null;
  year_built: number;
  lift_count: number;
  created_at: string;
  is_active: number;
}

interface BlockApiResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    items: Block[];
  };
}

const TowerScreen = ({ navigation }: Props) => {
  // ============================================
  // STATES
  // ============================================

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // ============================================
  // GET BLOCKS API
  // ============================================

  const getBlocks = async () => {
    try {
      setError("");

      const response = await apiClient.get<BlockApiResponse>(
        "/api/block"
      );

      console.log("Block API Response:", response.data);

      if (response.data.success) {
        setBlocks(response.data.data.items);
      } else {
        setError(
          response.data.message || "Unable to retrieve blocks"
        );
      }
    } catch (error: any) {
      console.log("Get Blocks Error:", error);

      if (error.response) {
        console.log("API Error Response:", error.response.data);

        setError(
          error.response.data?.message ||
            "Server error while retrieving blocks"
        );
      } else if (error.request) {
        setError(
          "Unable to connect to server. Please check your API URL and network."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============================================
  // LOAD API WHEN SCREEN OPENS
  // ============================================

  useEffect(() => {
    getBlocks();
  }, []);

  // ============================================
  // REFRESH
  // ============================================

  const onRefresh = () => {
    setRefreshing(true);
    getBlocks();
  };

  // ============================================
  // LOADING SCREEN
  // ============================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading towers...
        </Text>
      </View>
    );
  }

  // ============================================
  // ERROR SCREEN
  // ============================================

  if (error && blocks.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>

        <Text style={styles.errorTitle}>
          Unable to Load Towers
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={getBlocks}
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
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
    >
      {/* HEADER */}

      <Text style={styles.title}>
        Select Tower
      </Text>

      <Text style={styles.subtitle}>
        Choose a tower to view available flats
      </Text>

      {/* BLOCK COUNT */}

      <Text style={styles.countText}>
        {blocks.length} Towers Available
      </Text>

      {/* BLOCK LIST */}

      {blocks.map((block) => (
        <TouchableOpacity
          key={block.block_id}
          style={styles.card}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate("Floor", {
              towerName: block.block_name,
              block_id: block.block_id,
            })
          }
        >
          {/* ICON */}

          <View style={styles.icon}>
            <Text style={styles.iconText}>
              🏢
            </Text>
          </View>

          {/* INFORMATION */}

          <View style={styles.info}>
            <Text style={styles.name}>
              {block.block_name}
            </Text>

            <Text style={styles.flats}>
              {block.total_flats} Apartments
            </Text>

            <Text style={styles.details}>
              {block.total_floors} Floors •{" "}
              {block.lift_count} Lifts
            </Text>
          </View>

          {/* ARROW */}

          <Text style={styles.arrow}>
            →
          </Text>
        </TouchableOpacity>
      ))}

      {/* EMPTY STATE */}

      {blocks.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>
            🏢
          </Text>

          <Text style={styles.emptyTitle}>
            No Towers Found
          </Text>

          <Text style={styles.emptyText}>
            There are currently no active towers
            available.
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
    fontSize: 13,
    color: "#2563EB",
    fontWeight: "600",
    marginBottom: 20,
  },

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

  details: {
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
  },
});

export default TowerScreen;

