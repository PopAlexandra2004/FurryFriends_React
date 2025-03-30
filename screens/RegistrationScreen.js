import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegistrationScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const saveUser = async (newUser) => {
        try {
            const usersData = await AsyncStorage.getItem('users');
            const users = usersData ? JSON.parse(usersData) : [];
            users.push(newUser);
            await AsyncStorage.setItem('users', JSON.stringify(users));
        } catch (error) {
            console.error('Error saving user', error);
        }
    };

    const handleRegister = async () => {
        if (!username || !password || !confirmPassword) {
            Alert.alert('Validation Error', 'All fields are required.');
        } else if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
        } else {
            const usersData = await AsyncStorage.getItem('users');
            const users = usersData ? JSON.parse(usersData) : [];

            if (users.find(user => user.username === username)) {
                Alert.alert('Error', 'Username already exists.');
            } else {
                const newUser = { username, password, pets: [], role: null };  // Role is null initially
                await saveUser(newUser);
                Alert.alert('Success', 'Registration complete.');
                navigation.navigate('RoleSelection', { username }); // Pass username to the RoleSelection screen
            }
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Register</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
            />
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
            />
            <Button title="Register" onPress={handleRegister} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 12,
        paddingLeft: 8,
        borderRadius: 4,
    },
});
