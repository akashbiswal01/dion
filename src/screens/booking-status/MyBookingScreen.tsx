import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "MyBooking"
>;

const MyBookingScreen = ({ navigation }: Props) => {

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        My Booking
      </Text>

      <View style={styles.bookingCard}>

        <Text style={styles.application}>
          DRT-2026-000125
        </Text>

        <Text style={styles.flat}>
          Tower B • Flat B-304
        </Text>

        <View style={styles.statusBox}>
          <Text style={styles.status}>
            Application Submitted
          </Text>
        </View>

        <Text style={styles.section}>
          Booking Progress
        </Text>

        {[
          ["Application Submitted", true],
          ["Payment Received", true],
          ["Documents Verification", true],
          ["Application Accepted", false],
          ["Agreement Signed", false],
          ["Possession", false],
        ].map(([name, complete]) => (

          <View style={styles.timeline} key={String(name)}>

            <View
              style={[
                styles.dot,
                complete && styles.completed,
              ]}
            >
              {complete && (
                <Text style={styles.tick}>✓</Text>
              )}
            </View>

            <Text style={styles.timelineText}>
              {name}
            </Text>

          </View>

        ))}

      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Payments")}
      >
        <Text style={styles.buttonText}>
          VIEW PAYMENT SCHEDULE
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.outline}
        onPress={() => navigation.navigate("Documents")}
      >
        <Text style={styles.outlineText}>
          VIEW DOCUMENTS
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F6",
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 40,
    marginBottom: 20,
  },

  bookingCard: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
  },

  application: {
    fontSize: 18,
    fontWeight: "800",
    color: "#2563EB",
  },

  flat: {
    marginTop: 7,
    fontSize: 17,
  },

  statusBox: {
    backgroundColor: "#E7F2ED",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },

  status: {
    color: "#28664D",
    fontWeight: "700",
  },

  section: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 25,
    marginBottom: 15,
  },

  timeline: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#BBB",
    alignItems: "center",
    justifyContent: "center",
  },

  completed: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  tick: {
    color: "#FFF",
    fontSize: 12,
  },

  timelineText: {
    marginLeft: 12,
    color: "#555",
  },

  button: {
    height: 52,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "800",
  },

  outline: {
    height: 52,
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    marginBottom: 30,
  },

  outlineText: {
    color: "#2563EB",
    fontWeight: "800",
  },
});

export default MyBookingScreen;