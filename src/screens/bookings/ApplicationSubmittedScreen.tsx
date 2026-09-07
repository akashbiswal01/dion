import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "ApplicationSubmitted"
>;

const ApplicationSubmittedScreen = ({
  navigation,
  route,
}: Props) => {

  const {
    applicationNumber,
    flatNumber,
  } = route.params;

  return (
    <View style={styles.container}>

      <View style={styles.circle}>
        <Text style={styles.check}>
          ✓
        </Text>
      </View>

      <Text style={styles.title}>
        Application Submitted
      </Text>

      <Text style={styles.subtitle}>
        Your flat booking application has
        been submitted successfully.
      </Text>

      <View style={styles.card}>

        <Text style={styles.label}>
          Application Number
        </Text>

        <Text style={styles.application}>
          {applicationNumber}
        </Text>

        <Text style={styles.label}>
          Flat
        </Text>

        <Text style={styles.flat}>
          {flatNumber}
        </Text>

        <Text style={styles.status}>
          Application Status: Submitted
        </Text>

      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("MyBooking")}
      >
        <Text style={styles.buttonText}>
          VIEW MY BOOKING
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.replace("Dashboard")}
      >
        <Text style={styles.home}>
          Back to Dashboard
        </Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F6",
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },

  circle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#DCEAE5",
    alignItems: "center",
    justifyContent: "center",
  },

  check: {
    fontSize: 45,
    color: "#2563EB",
    fontWeight: "800",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 20,
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginTop: 10,
  },

  card: {
    backgroundColor: "#FFF",
    width: "100%",
    padding: 22,
    borderRadius: 15,
    marginTop: 25,
  },

  label: {
    color: "#777",
    marginTop: 8,
  },

  application: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2563EB",
    marginTop: 5,
  },

  flat: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 5,
  },

  status: {
    marginTop: 15,
    color: "#2E7D32",
    fontWeight: "600",
  },

  button: {
    width: "100%",
    height: 54,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "800",
  },

  home: {
    color: "#2563EB",
    fontWeight: "700",
    marginTop: 18,
  },
});

export default ApplicationSubmittedScreen;