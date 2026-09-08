import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    applicationId,
    applicationNumber,
  } = (route.params as any) || {};

  const [plan, setPlan] =
    useState<"Down Payment" | "Installment Plan">(
      applicant?.paymentPlan === "Down Payment" ? "Down Payment" : "Installment Plan"
    );

  const [selectedMilestones, setSelectedMilestones] = useState<
    Record<string, boolean>
  >({});

  const toggleMilestone = (name: string) => {
    setSelectedMilestones((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const scheduleList = [
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
  ];

  const handleSelectPlan = async (selectedPlan: "Down Payment" | "Installment Plan") => {
    setPlan(selectedPlan);
    try {
      const cached = await AsyncStorage.getItem("@latest_booking_application");
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.paymentPlan = selectedPlan;
        if (parsed.applicant) parsed.applicant.paymentPlan = selectedPlan;
        await AsyncStorage.setItem("@latest_booking_application", JSON.stringify(parsed));
      }
    } catch (_) {}
  };

  const proceedToPayment = async () => {
    await handleSelectPlan(plan);
    navigation.navigate("BookingAmount", {
      flat,
      applicant: {
        ...applicant,
        paymentPlan: plan,
      },
      secondApplicant,
      paymentPlan: plan,
      applicationId,
      applicationNumber,
    });
  };

  const proceedToSummary = async () => {
    await handleSelectPlan(plan);
    navigation.navigate("BookingSummary", {
      flat,
      applicant: {
        ...applicant,
        paymentPlan: plan,
      },
      secondApplicant,
      paymentPlan: plan,
      applicationId,
      applicationNumber,
    });
  };

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
        onPress={() => handleSelectPlan("Down Payment")}
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
        onPress={() => handleSelectPlan("Installment Plan")}
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

      {scheduleList.map(([name, percentage]) => {
        const isSelected = !!selectedMilestones[name];

        return (
          <TouchableOpacity
            style={styles.schedule}
            key={name}
            activeOpacity={0.7}
            onPress={() => toggleMilestone(name)}
          >
            <Text style={styles.scheduleName}>
              {name}
            </Text>

            <View style={styles.scheduleRight}>
              <Text style={styles.percentage}>
                {percentage}
              </Text>

              <View
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                ]}
              >
                {isSelected && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        style={styles.button}
        onPress={proceedToPayment}
      >
        <Text style={styles.buttonText}>
          PROCEED TO PAYMENT
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={proceedToSummary}
      >
        <Text style={styles.secondaryButtonText}>
          VIEW BOOKING SUMMARY
        </Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />

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
    marginTop: 10,
    fontSize: 18,
    color: "#2563EB",
  },

  scheduleTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 15,
  },

  schedule: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  scheduleName: {
    fontWeight: "600",
    color: "#374151",
    flex: 1,
  },

  scheduleRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  percentage: {
    fontWeight: "700",
    color: "#2563EB",
    fontSize: 15,
    marginRight: 14,
  },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  checkboxSelected: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  checkmark: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
    lineHeight: 15,
  },

  button: {
    backgroundColor: "#2563EB",
    height: 54,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
    marginBottom: 12,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 15,
  },

  secondaryButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#2563EB",
    height: 52,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },

  secondaryButtonText: {
    color: "#2563EB",
    fontWeight: "700",
    fontSize: 14,
  },
});

export default PaymentPlanScreen;