import React, { useState } from 'react';
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
	SafeAreaView,
	TouchableWithoutFeedback,
	Keyboard,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { router } from 'expo-router';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '../hooks/useAuth';
import { login } from '../../actions/auth.actions';
import { Ionicons } from '@expo/vector-icons';

// Form validation schema
const schema = yup.object({
	email: yup.string().email('Invalid email').required('Email is required'),
	password: yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
});

type FormData = yup.InferType<typeof schema>;

export default function Login() {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const { saveAuthData } = useAuth();

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: yupResolver(schema),
		defaultValues: {
			email: '',
			password: '',
		},
	});

	const onSubmit = async (data: FormData) => {
		try {
			setIsLoading(true);
			setError('');

			const verifiedUser = await login(data.email, data.password);

			await saveAuthData(verifiedUser);

			router.replace('/(tabs)/home');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.keyboardAvoidingView}
			>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<View style={styles.innerContainer}>
							<View style={styles.header}>
								<Ionicons name="ticket-outline" size={80} />
								<Text style={styles.appName}>Pulcity</Text>
								<Text style={styles.subtitle}>Sign in to continue</Text>
							</View>

							<View style={styles.form}>
								<Controller
									control={control}
									name="email"
									render={({ field: { onChange, value, onBlur } }) => (
										<View style={styles.inputContainer}>
											<Text style={styles.label}>Email</Text>
											<TextInput
												style={[styles.input, errors.email && styles.inputError]}
												placeholder="Enter your email"
												keyboardType="email-address"
												autoCapitalize="none"
												value={value}
												onChangeText={onChange}
												onBlur={onBlur}
											/>
											{errors.email && (
												<Text style={styles.errorText}>{errors.email.message}</Text>
											)}
										</View>
									)}
								/>

								<Controller
									control={control}
									name="password"
									render={({ field: { onChange, value, onBlur } }) => (
										<View style={styles.inputContainer}>
											<Text style={styles.label}>Password</Text>
											<TextInput
												style={[styles.input, errors.password && styles.inputError]}
												placeholder="Enter your password"
												secureTextEntry
												autoCapitalize="none"
												value={value}
												onChangeText={onChange}
												onBlur={onBlur}
											/>
											{errors.password && (
												<Text style={styles.errorText}>{errors.password.message}</Text>
											)}
										</View>
									)}
								/>

								{error !== "" && <Text style={styles.errorText}>{error}</Text>}

								<Pressable
									style={[styles.button, isLoading && styles.buttonDisabled]}
									onPress={handleSubmit(onSubmit)}
									disabled={isLoading}
								>
									{isLoading ? (
										<ActivityIndicator color="#fff" />
									) : (
										<Text style={styles.buttonText}>Sign In</Text>
									)}
								</Pressable>

								<Pressable
									onPress={() => router.push("/(auth)/signUp")}
									style={styles.linkButton}
								>
									<Text style={styles.linkText}>
										Don't have an account?{" "}
										<Text style={styles.linkTextBold}>Sign Up</Text>
									</Text>
								</Pressable>
							</View>
						</View>
					</TouchableWithoutFeedback>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
	},
	keyboardAvoidingView: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
	},
	innerContainer: {
		flex: 1,
	},
	header: {
		padding: 24,
		paddingTop: Platform.OS === "android" ? 48 : 24,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
	},
	appName: {
		fontSize: 30,
		fontWeight: "semibold",
		marginTop: 10,
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
	},
	form: {
		flex: 1,
		padding: 24,
		gap: 20,
	},
	inputContainer: {
		gap: 8,
	},
	label: {
		fontSize: 14,
		fontWeight: "500",
		color: "#333",
	},
	input: {
		height: 48,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 8,
		paddingHorizontal: 16,
		fontSize: 16,
		backgroundColor: "#f8f8f8",
	},
	inputError: {
		borderColor: "#ff4444",
	},
	errorText: {
		color: "#ff4444",
		fontSize: 12,
		marginTop: 4,
	},
	button: {
		height: 48,
		backgroundColor: "#007AFF",
		borderRadius: 24,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 12,
	},
	buttonDisabled: {
		opacity: 0.7,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	linkButton: {
		alignItems: "center",
		padding: 12,
	},
	linkText: {
		color: "#666",
		fontSize: 14,
	},
	linkTextBold: {
		color: "#007AFF",
		fontWeight: "600",
	},
});
