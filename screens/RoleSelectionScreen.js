import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RoleSelectionScreen({ route, navigation }) {
    const { username } = route.params; // Get the username passed from the registration screen
    const [roleSelected, setRoleSelected] = useState(false);

    // Check if the user already has a role
    const checkRole = async () => {
        try {
            const usersData = await AsyncStorage.getItem('users');
            const users = usersData ? JSON.parse(usersData) : [];
            const user = users.find(user => user.username === username);

            if (user?.role) {
                setRoleSelected(true); // User already has a role
                navigation.navigate('Home', { username, role: user.role });
            }
        } catch (error) {
            console.error('Error checking role:', error);
        }
    };

    useEffect(() => {
        checkRole();
    }, []);

    const handleRoleSelection = async (role) => {
        if (roleSelected) {
            Alert.alert('Error', 'You have already selected a role.');
            return;
        }

        try {
            const usersData = await AsyncStorage.getItem('users');
            const users = usersData ? JSON.parse(usersData) : [];
            const userIndex = users.findIndex(user => user.username === username);

            if (userIndex !== -1) {
                users[userIndex].role = role;
                await AsyncStorage.setItem('users', JSON.stringify(users));

                if (role === 'Owner') {
                    navigation.navigate('OwnerCodeVerification', { username });
                } else {
                    navigation.navigate('Home', { username, role });
                }
            }
        } catch (error) {
            console.error('Error saving role:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select Your Role</Text>
            <Button title="Pet Owner" onPress={() => handleRoleSelection('PetOwner')} />
            <Button title="Non-Pet Owner" onPress={() => handleRoleSelection('NonPetOwner')} />
            <Button title="Animal Shelter" onPress={() => handleRoleSelection('AnimalShelter')} />
            <Button title="Owner" onPress={() => handleRoleSelection('Owner')} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 20,
    },
});
