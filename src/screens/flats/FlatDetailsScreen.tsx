import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../types/navigation";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "FlatDetails"
>;

const FlatDetailsScreen = ({ navigation, route }: Props) => {

  const { flat } = route.params;

  return (
    <ScrollView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.tower}>
          {flat.tower}
        </Text>

        <Text style={styles.flat}>
          {flat.flatNumber}
        </Text>

        <Text style={styles.type}>
          {flat.type}
        </Text>
      </View>

      <View style={styles.content}>

        <Text style={styles.title}>
          Flat Details
        </Text>

        <Info
          label="Carpet Area"
          value={`${flat.carpetArea} sqft`}
        />

        <Info
          label="Built-up Area"
          value={`${flat.builtUpArea} sqft`}
        />

        <Info
          label="Super Built-up Area"
          value={`${flat.superBuiltUpArea} sqft`}
        />

        <Info
          label="Rate per Sqft"
          value={`₹${flat.ratePerSqft.toLocaleString("en-IN")}`}
        />

        <Info
          label="Total Cost"
          value={`₹${flat.totalCost.toLocaleString("en-IN")}`}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("ApplicantDetails", {
              flat,
            })
          }
        >
          <Text style={styles.buttonText}>
            BOOK THIS FLAT
          </Text>
        </TouchableOpacity>

      </View>

    </ScrollView>
  );
};

const Info = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <View style={styles.info}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F6",
  },

  header: {
    backgroundColor: "#2563EB",
    padding: 25,
    paddingTop: 65,
  },

  tower: {
    color: "#DBEAFE",
  },

  flat: {
    color: "#FFF",
    fontSize: 32,
    fontWeight: "800",
    marginTop: 5,
  },

  type: {
    color: "#DBEAFE",
    marginTop: 8,
  },

  content: {
    padding: 20,
  },

  title: {
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 15,
  },

  info: {
    backgroundColor: "#FFF",
    padding: 17,
    borderRadius: 10,
    marginBottom: 10,
  },

  label: {
    color: "#777",
  },

  value: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 5,
  },

  button: {
    height: 55,
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
});

export default FlatDetailsScreen;