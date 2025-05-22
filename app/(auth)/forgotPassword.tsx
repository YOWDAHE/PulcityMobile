import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { router } from "expo-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword, forgotPasswordSchema } from "../../actions/auth.actions";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type FormData = {
  email: string;
};

const { width } = Dimensions.get('window');

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      setError("");
      setSuccessMessage("");

      const response = await resetPassword(data.email);
      if (response && response.message) {
        setSuccessMessage(response.message);
      } else {
        throw new Error("Error sending reset instructions");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#3B82F6', '#1E40AF']}
        style={styles.gradientBackground}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.innerContainer}>
                <View style={styles.header}>
                  <View style={styles.logoContainer}>
                    <Ionicons name="lock-open-outline" size={48} color="#ffffff" />
                  </View>
                  <Text style={styles.appName}>Pulcity</Text>
                  <Text style={styles.subtitle}>Account Recovery</Text>
                </View>

                <View style={styles.formContainer}>
                  <View style={styles.formHeader}>
                    <Text style={styles.formTitle}>Forgot Password?</Text>
                    <Text style={styles.formSubtitle}>
                      Enter your email to receive reset instructions
                    </Text>
                  </View>

                  <View style={styles.form}>
                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { onChange, value, onBlur } }) => (
                        <View style={styles.inputContainer}>
                          <Text style={styles.label}>Email</Text>
                          <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
                            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                              style={styles.input}
                              placeholder="Enter your email"
                              placeholderTextColor="#999"
                              keyboardType="email-address"
                              autoCapitalize="none"
                              value={value}
                              onChangeText={onChange}
                              onBlur={onBlur}
                            />
                          </View>
                          {errors.email && (
                            <Text style={styles.errorText}>{errors.email.message}</Text>
                          )}
                        </View>
                      )}
                    />

                    {error !== "" && (
                      <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={18} color="#ff4444" />
                        <Text style={styles.errorText}>{error}</Text>
                      </View>
                    )}

                    {successMessage !== "" && (
                      <View style={styles.successContainer}>
                        <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                        <Text style={styles.successText}>{successMessage}</Text>
                      </View>
                    )}

                    <Pressable
                      style={[styles.button, isLoading && styles.buttonDisabled]}
                      onPress={handleSubmit(onSubmit)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <Text style={styles.buttonText}>Send Reset Instructions</Text>
                          <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
                        </>
                      )}
                    </Pressable>

                    <Pressable
                      style={styles.secondaryButton}
                      onPress={() => router.push("/(auth)/login")}
                    >
                      <Text style={styles.secondaryButtonText}>Back to Login</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
    width: '100%',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
  },
  inputWrapperError: {
    borderColor: '#ff4444',
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 10,
    borderRadius: 8,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 13,
    marginLeft: 8,
  },
  successText: {
    color: '#4CAF50',
    fontSize: 13,
    marginLeft: 8,
  },
  button: {
    height: 56,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  secondaryButton: {
    height: 56,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
}); 