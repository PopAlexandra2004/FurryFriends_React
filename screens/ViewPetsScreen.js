import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ViewPetsScreen({ route }) {
    const { username } = route.params; // Get the username passed from navigation
    const [pets, setPets] = useState([]);

    // Fetch the user's pets
    const fetchPets = async () => {
        try {
            const usersData = await AsyncStorage.getItem('users');
            const users = usersData ? JSON.parse(usersData) : [];
            const user = users.find((user) => user.username === username);

            if (user?.pets) {
                setPets(user.pets);
            } else {
                setPets([]);
                Alert.alert('No Pets', 'This user has no pets registered.');
            }
        } catch (error) {
            console.error('Error fetching pets', error);
            Alert.alert('Error', 'Unable to fetch pet data.');
        }
    };

    useEffect(() => {
        fetchPets();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Pets</Text>
            {pets.length > 0 ? (
                <FlatList
                    data={pets}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.petItem}>
                            <Text style={styles.petName}>Name: {item.name}</Text>
                            <Text style={styles.petBreed}>Breed: {item.breed}</Text>
                        </View>
                    )}
                />
            ) : (
                <Text style={styles.noPetsText}>No pets registered.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    petItem: {
        padding: 10,
        marginVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    petName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    petBreed: {
        fontSize: 16,
        color: '#555',
    },
    noPetsText: {
        fontSize: 16,
        textAlign: 'center',
        color: '#888',
    },
});
