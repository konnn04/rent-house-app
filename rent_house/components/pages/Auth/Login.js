import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import {
    Button,
    HelperText,
    Text,
    TextInput,
    useTheme as usePaperTheme
} from 'react-native-paper';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { login } from '../../../utils/Authentication';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigation = useNavigation();
    const { colors } = useTheme();
    const paperTheme = usePaperTheme();
    const { signIn } = useAuth();

    // Handle login with spam prevention and loading state
    const handleLogin = async () => {
        if (isLoading) return;

        setMessage('');

        // Input validation
        if (!username || username.trim() === '') {
            setMessage('Vui lòng nhập tên đăng nhập');
            return;
        }

        if (!password || password.trim() === '') {
            setMessage('Vui lòng nhập mật khẩu');
            return;
        }

        setIsLoading(true);

        try {
            const result = await login(username, password);
            await signIn(result.access_token);
        } catch (error) {
            console.error('Login error:', error);
            setMessage(error.message || 'Đăng nhập thất bại, vui lòng thử lại sau');
        } finally {
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('@assets/logo.png')}
                    style={styles.logo}
                />
            </View>

            <Text variant="headlineLarge" style={styles.title}>RENT HOUSE</Text>
            <Text variant="titleLarge" style={styles.title}>
                Đăng nhập tài khoản
            </Text>

            <TextInput
                label="Tên đăng nhập"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
                mode="outlined"
                autoCapitalize="none"
            />

            <TextInput
                label="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.input}
                mode="outlined"
                right={
                    <TextInput.Icon 
                        icon={showPassword ? "eye-off" : "eye"} 
                        onPress={() => setShowPassword(!showPassword)} 
                    />
                }
            />

            {message ? (
                <HelperText type="error" visible={true}>
                    {message}
                </HelperText>
            ) : null}

            <Button
                mode="contained"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}
                contentStyle={styles.buttonContent}
            >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>

            <Button
                mode="text"
                onPress={() => navigation.navigate('Register')}
                style={styles.linkButton}
            >
                Chưa có tài khoản? Đăng ký
            </Button>

            <Button
                mode="text"
                onPress={() => navigation.navigate('CantLogin')}
                style={styles.linkButton}
            >
                Không thể đăng nhập?
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 10,
    },
    title: {
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        marginBottom: 15,
    },
    button: {
        marginTop: 10,
        marginBottom: 10,
    },
    buttonContent: {
        paddingVertical: 8,
    },
    linkButton: {
        marginTop: 5,
    }
});