import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "PaymentPlan"
>;

const PaymentPlanScreen = ({
  navigation,
  route,
}: Props) => {

  const {
    flat,
    applicant,
    secondApplicant,
  } = route.params;

  const [plan, setPlan] =
    useState<"Down Payment" | "Installment Plan">(
      "Installment Plan"
    );

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        Payment Plan
      </Text>

      <Text style={styles.subtitle}>
        Choose your preferred payment plan
      </Text>

      <TouchableOpacity
        style={[
          styles.card,
          plan === "Down Payment" &&
            styles.active,
        ]}
        onPress={() => setPlan("Down Payment")}
      >
        <Text style={styles.cardTitle}>
          Down Payment
        </Text>

        <Text style={styles.cardText}>
          Pay according to the down payment plan.
        </Text>

        <Text style={styles.radio}>
          {plan === "Down Payment" ? "●" : "○"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.card,
          plan === "Installment Plan" &&
            styles.active,
        ]}
        onPress={() =>
          setPlan("Installment Plan")
        }
      >
        <Text style={styles.cardTitle}>
          Installment Plan
        </Text>

        <Text style={styles.cardText}>
          Pay according to construction milestones.
        </Text>

        <Text style={styles.radio}>
          {plan === "Installment Plan" ? "●" : "○"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.scheduleTitle}>
        Payment Schedule
      </Text>

      {[
        ["On Booking", "5%"],
        ["Agreement For Sale", "10%"],
        ["Foundation / Raft", "5%"],
        ["Basement Roof Slab", "5%"],
        ["Stilt Roof Slab", "5%"],
        ["1st Floor Roof Slab", "5%"],
        ["3rd Floor Roof Slab", "5%"],
        ["6th Floor Roof Slab", "5%"],
        ["9th Floor Roof Slab", "5%"],
        ["12th Floor Roof Slab", "5%"],
        ["15th Floor Roof Slab", "5%"],
        ["18th Floor Roof Slab", "5%"],
        ["21st Floor Roof Slab", "5%"],
        ["24th Floor Roof Slab", "5%"],
        ["27th Floor Roof Slab", "5%"],
        ["Bricks Work", "10%"],
        ["Flooring", "5%"],
        ["Possession", "5%"],
      ].map(([name, percentage]) => (

        <View style={styles.schedule} key={name}>
          <Text style={styles.scheduleName}>
            {name}
          </Text>

          <Text style={styles.percentage}>
            {percentage}
          </Text>
        </View>

      ))}

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          navigation.navigate("BookingSummary", {
            flat,
            applicant,
            secondApplicant,
            paymentPlan: plan,
          })
        }
      >
        <Text style={styles.buttonText}>
          CONTINUE
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
  },

  subtitle: {
    color: "#666",
    marginTop: 7,
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 14,
    padding: 20,
    marginBottom: 15,
  },

  active: {
    borderColor: "#2563EB",
    backgroundColor: "#EDF4F1",
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  cardText: {
    marginTop: 7,
    color: "#666",
  },

  radio: {
    position: "absolute",
    right: 20,
    top: 20,
    color: "#2563EB",
    fontSize: 20,
  },

  scheduleTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 15,
    marginBottom: 10,
  },

  schedule: {
    backgroundColor: "#FFF",
    padding: 15,
    marginBottom: 7,
    borderRadius: 9,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  scheduleName: {
    flex: 1,
  },

  percentage: {
    fontWeight: "700",
    color: "#2563EB",
  },

  button: {
    backgroundColor: "#2563EB",
    height: 54,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 25,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "800",
  },
});

export default PaymentPlanScreen;