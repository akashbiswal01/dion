import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { API_BASE_URL_KEY, DEFAULT_BASE_URL, setBaseUrl } from '../api/client';
import Icon from 'react-native-vector-icons/Ionicons';

type ApiConfigScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ApiConfig'>;

const ApiConfigScreen = () => {
  const [url, setUrl] = useState('');
  const navigation = useNavigation<ApiConfigScreenNavigationProp>();

  useEffect(() => {
    const loadUrl = async () => {
      try {
        const savedUrl = await AsyncStorage.getItem(API_BASE_URL_KEY);
        if (savedUrl) {
          setUrl(savedUrl);
        } else {
          setUrl(DEFAULT_BASE_URL);
        }
      } catch (error) {
        console.error('Failed to load API URL:', error);
      }
    };
    loadUrl();
  }, []);

  const handleSave = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'API URL cannot be empty');
      return;
    }

    // Simple validation (you can make this more robust)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      Alert.alert('Error', 'API URL must start with http:// or https://');
      return;
    }

    try {
      await AsyncStorage.setItem(API_BASE_URL_KEY, url.trim());
      setBaseUrl(url.trim());
      Alert.alert('Success', 'API URL updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Failed to save API URL:', error);
      Alert.alert('Error', 'Failed to save API URL');
    }
  };

  const handleReset = () => {
    setUrl(DEFAULT_BASE_URL);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>API Configuration</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Base URL</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="e.g. http://192.168.1.99:5000"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />

        <Text style={styles.helpText}>
          Configure the API endpoint your application connects to.
          Use 'http://192.168.1.99:5000' for Android Emulator connecting to local server.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.resetButton]} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset to Default</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A202C',
    marginBottom: 10,
  },
  helpText: {
    fontSize: 13,
    color: '#718096',
    lineHeight: 20,
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#EDF2F7',
    marginRight: 10,
  },
  resetButtonText: {
    color: '#4A5568',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#3182CE',
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ApiConfigScreen;
