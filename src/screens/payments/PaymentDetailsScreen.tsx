import React from "react";
import {
  View,
  Text,
  StyleSheet,
} from "react-native";

const PaymentDetailsScreen = () => {

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Payment Details
      </Text>

      <View style={styles.card}>

        <Text style={styles.label}>
          Transaction ID
        </Text>

        <Text style={styles.value}>
          TXN123456789
        </Text>

        <Text style={styles.label}>
          Payment Amount
        </Text>

        <Text style={styles.amount}>
          ₹4,28,750
        </Text>

        <Text style={styles.label}>
          Payment Method
        </Text>

        <Text style={styles.value}>
          UPI
        </Text>

        <Text style={styles.label}>
          Payment Status
        </Text>

        <Text style={styles.success}>
          SUCCESS
        </Text>

      </View>

    </View>
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

  card: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 22,
  },

  label: {
    color: "#777",
    marginTop: 15,
  },

  value: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 5,
  },

  amount: {
    fontSize: 25,
    fontWeight: "800",
    color: "#2563EB",
    marginTop: 5,
  },

  success: {
    color: "#2E7D32",
    fontWeight: "800",
    marginTop: 5,
  },
});

export default PaymentDetailsScreen;