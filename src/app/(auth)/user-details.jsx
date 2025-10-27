import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { auth } from '../../config/firebaseConfig';
import { saveUserDetails } from '../../services/userService';
import { LinearGradient } from 'expo-linear-gradient';
import { User, MapPin, Briefcase, Phone } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function UserDetailsScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [occupation, setOccupation] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validatePhoneNumber = (phone) => {
    // Basic phone validation - at least 10 digits
    const cleanedPhone = phone.replace(/\D/g, '');
    return cleanedPhone.length >= 10;
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!occupation.trim()) {
      newErrors.occupation = 'Occupation is required';
    }
    
    // Validate all 3 emergency contacts
    emergencyContacts.forEach((contact, index) => {
      if (!contact.trim()) {
        newErrors[`contact${index}`] = `Contact ${index + 1} is required`;
      } else if (!validatePhoneNumber(contact)) {
        newErrors[`contact${index}`] = 'Invalid phone number (min 10 digits)';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDetails = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const user = auth.currentUser;
      
      if (!user) {
        Alert.alert('Error', 'No user logged in');
        router.replace('/(auth)/login');
        return;
      }

      // Clean phone numbers (remove non-digits)
      const cleanedContacts = emergencyContacts.map(contact => 
        contact.replace(/\D/g, '')
      );

      // Save user details to Firestore
      await saveUserDetails(user.uid, {
        name: name.trim(),
        address: address.trim(),
        occupation: occupation.trim(),
        emergencyContacts: cleanedContacts,
      });

      console.log('✅ User details saved successfully!');
      console.log('Redirecting to dashboard...');
      
      // Immediate redirect without alert
      setLoading(false);
      router.replace('/(tabs)');
      
    } catch (error) {
      console.error('❌ Error saving user details:', error);
      setLoading(false);
      
      let errorMessage = 'Failed to save your details. Please try again.';
      
      // Provide specific error messages
      if (error.message && error.message.includes('Firestore')) {
        errorMessage = 'Database connection error.\n\nPlease ensure:\n1. You have internet connection\n2. Firestore is enabled in Firebase Console\n\nCheck FIRESTORE_SETUP_GUIDE.md for instructions.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Cannot connect to database. Please check your internet connection and try again.';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please contact support.';
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  const updateEmergencyContact = (index, value) => {
    const newContacts = [...emergencyContacts];
    newContacts[index] = value;
    setEmergencyContacts(newContacts);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#E91E63', '#9C27B0', '#673AB7']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Help us know you better for emergency situations
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <User size={20} color="#E91E63" strokeWidth={2} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                  value={name}
                  onChangeText={setName}
                  data-testid="name-input"
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* Address Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <MapPin size={20} color="#E91E63" strokeWidth={2} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your address"
                  placeholderTextColor="#999"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  data-testid="address-input"
                />
              </View>
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            </View>

            {/* Occupation Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Occupation</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconContainer}>
                  <Briefcase size={20} color="#E91E63" strokeWidth={2} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your occupation"
                  placeholderTextColor="#999"
                  value={occupation}
                  onChangeText={setOccupation}
                  data-testid="occupation-input"
                />
              </View>
              {errors.occupation && <Text style={styles.errorText}>{errors.occupation}</Text>}
            </View>

            {/* Emergency Contacts */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Emergency Contacts</Text>
              <Text style={styles.helperText}>
                Add 3 emergency contact numbers. They will be notified in case of emergency.
              </Text>

              {emergencyContacts.map((contact, index) => (
                <View key={index}>
                  <View style={styles.inputContainer}>
                    <View style={styles.inputIconContainer}>
                      <Phone size={20} color="#E91E63" strokeWidth={2} />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder={`Contact ${index + 1} Phone Number`}
                      placeholderTextColor="#999"
                      value={contact}
                      onChangeText={(value) => updateEmergencyContact(index, value)}
                      keyboardType="phone-pad"
                      data-testid={`emergency-contact-${index + 1}`}
                    />
                  </View>
                  {errors[`contact${index}`] && (
                    <Text style={styles.errorText}>{errors[`contact${index}`]}</Text>
                  )}
                </View>
              ))}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveDetails}
              disabled={loading}
              data-testid="save-details-button"
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Details</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    lineHeight: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: '#DC143C',
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: '#E91E63',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#E91E63',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
