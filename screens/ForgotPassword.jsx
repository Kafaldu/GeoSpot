import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  const handleSubmit = () => {
    if (email === '') {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    console.log('Password reset requested for:', email);
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Reset Password</Text>

      {/* Icon */}
      <FontAwesome name="lock" size={50} color="#68d391" style={styles.icon} />

      {/* Forgot Password Form */}
      <View style={styles.form}>
        <Text style={styles.instruction}>
          Enter your email to receive reset instructions.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TouchableOpacity onPress={handleSubmit} style={styles.button}>
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2d3748',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#68d391',
    marginBottom: 20,
  },
  icon: {
    marginBottom: 20,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#4a5568',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  instruction: {
    color: 'gray',
    marginBottom: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#48bb78',
    color: 'black',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    width: '100%',
  },
  button: {
    backgroundColor: '#48bb78',
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
  },
  link: {
    color: '#3182ce',
    textDecorationLine: 'underline',
    marginTop: 20,
  },
});

export default ForgotPassword;
