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
  "Project"
>;

const ProjectScreen = ({ navigation }: Props) => {

  return (
    <ScrollView style={styles.container}>

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          DION Riverside Township
        </Text>

        <Text style={styles.location}>
          📍 Mauza Naranpur, Trisulia, Cuttack
        </Text>

        <Text style={styles.rera}>
          RERA No. RP/7/2025/01349
        </Text>
      </View>

      <View style={styles.content}>

        <Text style={styles.title}>
          About Project
        </Text>

        <Text style={styles.description}>
          DION Riverside Township is a residential
          development located at Trisulia, Cuttack.
        </Text>

        <Text style={styles.title}>
          Project Information
        </Text>

        <View style={styles.infoCard}>
          <Text>Residential Project</Text>
          <Text>Multiple Towers</Text>
          <Text>Modern Apartments</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Tower")}
        >
          <Text style={styles.buttonText}>
            Browse Available Flats
          </Text>
        </TouchableOpacity>

      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7F6",
  },

  hero: {
    backgroundColor: "#2563EB",
    padding: 25,
    paddingTop: 65,
    paddingBottom: 35,
  },

  heroTitle: {
    color: "#FFF",
    fontSize: 27,
    fontWeight: "800",
  },

  location: {
    color: "#DBEAFE",
    marginTop: 12,
  },

  rera: {
    color: "#FFF",
    marginTop: 15,
    fontWeight: "600",
  },

  content: {
    padding: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 10,
  },

  description: {
    color: "#555",
    lineHeight: 23,
  },

  infoCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 20,
    gap: 15,
  },

  button: {
    backgroundColor: "#2563EB",
    height: 52,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "700",
  },
});

export default ProjectScreen;