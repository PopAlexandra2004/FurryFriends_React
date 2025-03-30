import React from 'react';
import { View, Text, StyleSheet, Image, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PetProfileScreen({ route, navigation }) {
    const { pet, username } = route.params; // Get the pet and username passed from the HomeScreen

    const deletePet = async () => {
        try {
            const usersData = await AsyncStorage.getItem('users');
            const users = usersData ? JSON.parse(usersData) : [];
            const user = users.find((user) => user.username === username);

            if (user) {
                user.pets = user.pets.filter((p) => p.name !== pet.name);
                await AsyncStorage.setItem('users', JSON.stringify(users));
                Alert.alert('Success', `${pet.name} has been removed.`);
                navigation.goBack(); // Return to the previous screen
            }
        } catch (error) {
            console.error('Error deleting pet', error);
            Alert.alert('Error', 'An error occurred while deleting the pet.');
        }
    };

    const confirmDelete = () => {
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete ${pet.name}'s profile?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: deletePet },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Add a profile picture if available */}
            {pet.image ? (
                <Image source={{ uri: pet.image }} style={styles.image} />
            ) : (
                <Text style={styles.noImageText}>No image available</Text>
            )}
            <Text style={styles.name}>{pet.name}</Text>
            <Text style={styles.breed}>Breed: {pet.breed}</Text>
            <Text style={styles.description}>
                {pet.name} is a friendly and adorable {pet.breed} looking for a playdate!
            </Text>

            {/* Buttons for editing or deleting */}
            <Button title="Edit Pet" onPress={() => navigation.navigate('EditPet', { pet, username })} />
            <Button title="Delete Pet" color="red" onPress={confirmDelete} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f8f8f8',
    },
    image: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 20,
    },
    noImageText: {
        fontSize: 14,
        color: '#aaa',
        marginBottom: 20,
    },
    name: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    breed: {
        fontSize: 18,
        marginBottom: 20,
        color: '#555',
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 20,
    },
});
