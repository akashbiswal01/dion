import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";

const documents = [
  "Booking Application",
  "Payment Receipt",
  "Allotment Letter",
  "Apartment Buyers Agreement",
  "Payment Statement",
  "Possession Letter",
];

const DocumentsScreen = () => {

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        My Documents
      </Text>

      {documents.map((document) => (

        <TouchableOpacity
          key={document}
          style={styles.card}
          onPress={() =>
            Alert.alert(
              document,
              "Document viewer/download will be connected to the API."
            )
          }
        >

          <Text style={styles.icon}>
            📄
          </Text>

          <View style={styles.info}>
            <Text style={styles.name}>
              {document}
            </Text>

            <Text style={styles.action}>
              View / Download
            </Text>
          </View>

          <Text style={styles.arrow}>
            →
          </Text>

        </TouchableOpacity>

      ))}

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

  card: {
    backgroundColor: "#FFF",
    padding: 17,
    borderRadius: 13,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  icon: {
    fontSize: 28,
  },

  info: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    fontWeight: "700",
  },

  action: {
    color: "#777",
    marginTop: 5,
    fontSize: 12,
  },

  arrow: {
    fontSize: 22,
    color: "#2563EB",
  },
});

export default DocumentsScreen;