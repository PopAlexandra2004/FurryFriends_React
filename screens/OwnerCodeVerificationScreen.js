import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OwnerCodeVerificationScreen({ route, navigation }) {
    const { username } = route.params;  // Get the username from the previous screen
    const [code, setCode] = useState('');

    const saveOwnerRole = async () => {
        try {
            const usersData = await AsyncStorage.getItem('users');
            const users = usersData ? JSON.parse(usersData) : [];
            const user = users.find(user => user.username === username);

            if (user) {
                user.role = 'Owner';  // Set the role as 'Owner'
                await AsyncStorage.setItem('users', JSON.stringify(users));
                Alert.alert('Success', 'Code verified!');

                // Navigate to Home and pass username and role
                navigation.navigate('Home', { username, role: 'Owner' });
            }
        } catch (error) {
            console.error('Error saving owner role', error);
        }
    };

    const handleVerifyCode = () => {
        if (code === '12345678') {
            saveOwnerRole();  // Save the owner role if the code is correct
        } else {
            Alert.alert('Error', 'Incorrect 8-digit code.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Enter 8-digit Code</Text>
            <TextInput
                style={styles.input}
                placeholder="8-digit Code"
                value={code}
                onChangeText={setCode}
                secureTextEntry={true}
            />
            <Button title="Verify" onPress={handleVerifyCode} />
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
});
