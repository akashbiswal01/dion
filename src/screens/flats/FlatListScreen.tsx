import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { apiClient } from "../../api/client";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  RootStackParamList,
  FlatData,
} from "../../types/navigation";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "FlatList"
>;

// =====================================================
// API FLAT TYPE
// =====================================================

interface ApiFlat {
  flat_id: number;
  floor_id: number | null;
  block_id: number;
  flat_number: string;
  bhk_type_id: number | null;
  balconies: number;
  facing_id: number | null;
  status_id: number | null;
  is_corner_flat: number;
  created_at: string;
  updated_at: string;
  is_active: number;
}

interface FlatApiResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    items: ApiFlat[];
  };
}

// =====================================================
// SCREEN
// =====================================================

const FlatListScreen = ({
  navigation,
  route,
}: Props) => {
  // ===================================================
  // ROUTE PARAMETERS
  // ===================================================

  const {
    towerName,
    floor,
    block_id,
    floor_id,
  } = route.params;

  // ===================================================
  // STATES
  // ===================================================

  const [flats, setFlats] = useState<ApiFlat[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [refreshing, setRefreshing] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");

  // ===================================================
  // GET FLATS
  // ===================================================

  const getFlats = async () => {
    try {
      setError("");

      console.log(
        "Getting flats..."
      );

      console.log(
        "Block ID:",
        block_id
      );

      console.log(
        "Floor ID:",
        floor_id
      );

      const response =
        await apiClient.get<FlatApiResponse>(
          "/api/flat"
        );

      console.log(
        "Flat API Response:",
        response.data
      );

      if (response.data.success) {

        // =============================================
        // FILTER BY BLOCK
        // =============================================

        let filteredFlats =
          response.data.data.items.filter(
            (flat) =>
              flat.block_id === block_id &&
              flat.is_active === 1
          );

        // =============================================
        // FILTER BY FLOOR ID
        // =============================================

        if (floor_id !== undefined) {
          filteredFlats =
            filteredFlats.filter(
              (flat) =>
                flat.floor_id === floor_id
            );
        }

        // =============================================
        // SORT BY FLAT NUMBER
        // =============================================

        filteredFlats.sort(
          (a, b) =>
            a.flat_number.localeCompare(
              b.flat_number,
              undefined,
              {
                numeric: true,
              }
            )
        );

        setFlats(filteredFlats);
      } else {
        setError(
          response.data.message ||
          "Unable to retrieve flats"
        );
      }

    } catch (error: any) {

      console.log(
        "Get Flats Error:",
        error
      );

      if (error.response) {

        console.log(
          "API Error Response:",
          error.response.data
        );

        setError(
          error.response.data?.message ||
          "Server error while retrieving flats"
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

  // ===================================================
  // LOAD FLATS
  // ===================================================

  useEffect(() => {
    getFlats();
  }, [block_id, floor_id]);

  // ===================================================
  // REFRESH
  // ===================================================

  const onRefresh = () => {
    setRefreshing(true);
    getFlats();
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading apartments...
        </Text>

      </View>
    );
  }

  // ===================================================
  // ERROR
  // ===================================================

  if (
    error &&
    flats.length === 0
  ) {
    return (
      <View style={styles.errorContainer}>

        <Text style={styles.errorIcon}>
          ⚠️
        </Text>

        <Text style={styles.errorTitle}>
          Unable to Load Apartments
        </Text>

        <Text style={styles.errorText}>
          {error}
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={getFlats}
        >
          <Text style={styles.retryText}>
            Retry
          </Text>
        </TouchableOpacity>

      </View>
    );
  }

  // ===================================================
  // MAIN UI
  // ===================================================

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
        {towerName} - Floor {floor}
      </Text>

      <Text style={styles.subtitle}>
        Available apartments
      </Text>

      {/* COUNT */}

      <Text style={styles.countText}>
        {flats.length} Apartments Found
      </Text>

      {/* FLATS */}

      {flats.map((flat) => {

        /*
         * IMPORTANT:
         * Your API currently gives status_id,
         * not status text.
         *
         * Until the status lookup API is connected,
         * we treat the flat as available when
         * status_id is 14.
         *
         * Change this when your actual status IDs
         * are confirmed.
         */

        const isAvailable =
          flat.status_id === 14;

        return (
          <TouchableOpacity
            key={flat.flat_id}
            style={[
              styles.card,
              !isAvailable &&
              styles.bookedCard,
            ]}
            disabled={!isAvailable}
            activeOpacity={0.8}
            onPress={() => {

              // Convert API object to your
              // existing FlatData structure.

              const flatData: FlatData = {
                id: String(
                  flat.flat_id
                ),

                flatNumber:
                  flat.flat_number,

                tower:
                  towerName,

                floor:
                  floor,

                type:
                  "Apartment",

                carpetArea:
                  0,

                builtUpArea:
                  0,

                superBuiltUpArea:
                  0,

                ratePerSqft:
                  0,

                totalCost:
                  0,

                status:
                  isAvailable
                    ? "AVAILABLE"
                    : "BOOKED",
              };

              navigation.navigate(
                "FlatDetails",
                {
                  flat: flatData,
                }
              );
            }}
          >

            {/* TOP */}

            <View style={styles.top}>

              <Text
                style={styles.flatNumber}
              >
                {flat.flat_number}
              </Text>

              <Text
                style={[
                  styles.status,
                  !isAvailable &&
                  styles.booked,
                ]}
              >
                {isAvailable
                  ? "AVAILABLE"
                  : "BOOKED"}
              </Text>

            </View>

            {/* TYPE */}

            <Text style={styles.type}>
              Apartment
            </Text>

            {/* DETAILS */}

            <View style={styles.details}>

              <Text style={styles.detailText}>
                Balconies:{" "}
                {flat.balconies}
              </Text>



            </View>

            {/* FLAT ID */}

            <Text style={styles.flatId}>
              Flat ID: {flat.flat_id}
            </Text>

          </TouchableOpacity>
        );
      })}

      {/* EMPTY */}

      {flats.length === 0 && (
        <View
          style={styles.emptyContainer}
        >

          <Text style={styles.emptyIcon}>
            🏠
          </Text>

          <Text style={styles.emptyTitle}>
            No Apartments Found
          </Text>

          <Text style={styles.emptyText}>
            No apartments were found for{" "}
            {towerName}, Floor {floor}.
          </Text>

        </View>
      )}

    </ScrollView>
  );
};

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
    marginBottom: 8,
  },

  countText: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 20,
  },

  // ===================================================
  // CARD
  // ===================================================

  card: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    elevation: 2,
  },

  bookedCard: {
    opacity: 0.65,
  },

  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  flatNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  status: {
    color: "#2E7D32",
    fontWeight: "700",
    fontSize: 13,
  },

  booked: {
    color: "#C62828",
  },

  type: {
    marginTop: 8,
    color: "#555",
    fontSize: 14,
  },

  details: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  detailText: {
    color: "#555",
    fontSize: 13,
  },

  flatId: {
    color: "#999",
    fontSize: 11,
    marginTop: 10,
  },

  // ===================================================
  // LOADING
  // ===================================================

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

  // ===================================================
  // ERROR
  // ===================================================

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
    textAlignVertical: "center",
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

  // ===================================================
  // EMPTY
  // ===================================================

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

export default FlatListScreen;

