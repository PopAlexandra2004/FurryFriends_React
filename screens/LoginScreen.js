import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const loadUsers = async () => {
        try {
            const usersData = await AsyncStorage.getItem('users');
            return usersData ? JSON.parse(usersData) : [];
        } catch (error) {
            console.error('Error loading users', error);
            return [];
        }
    };

    const handleLogin = async () => {
        const users = await loadUsers();
        const user = users.find(user => user.username === username);
    
        if (!user) {
            Alert.alert('Error', 'User does not exist.');
        } else if (user.password !== password) {
            Alert.alert('Error', 'Incorrect password.');
        } else {
            // Add login timestamp
            try {
                const loginTimestamp = new Date().toISOString();
                if (!user.logins) user.logins = [];
                user.logins.push(loginTimestamp);
    
                // Update the user in AsyncStorage
                const updatedUsers = users.map(u => (u.username === username ? user : u));
                await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
            } catch (error) {
                console.error('Error updating login timestamps', error);
            }
    
            // Navigate based on role
            if (user.role === 'Owner') {
                navigation.navigate('OwnerCodeVerification', { username }); // Owner needs code verification
            } else {
                navigation.navigate('Home', { username, role: user.role });
            }
        }
    };
    

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
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
            <Button title="Login" onPress={handleLogin} />
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.createAccountText}>Don't have an account? Create one</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
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
    },
    createAccountText: {
        marginTop: 20,
        color: '#007BFF',
        textAlign: 'center',
    },
});
