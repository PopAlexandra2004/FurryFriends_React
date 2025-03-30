import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swiper from 'react-native-deck-swiper';

export default function BrowseDogsScreen({ navigation, route }) {
    const { username } = route.params; // Get the logged-in user's username
    const [dogs, setDogs] = useState([]);

    useEffect(() => {
        fetchDogs();
    }, []);

    const fetchDogs = async () => {
        try {
            const usersData = await AsyncStorage.getItem('users');
            const users = usersData ? JSON.parse(usersData) : [];

            // Fetch all dog profiles from users excluding the current user's pets
            const allDogs = users
                .filter((user) => user.username !== username && user.pets && user.pets.length > 0)
                .flatMap((user) => user.pets.map((pet) => ({ ...pet, owner: user.username })));

            setDogs(allDogs);
        } catch (error) {
            console.error('Error fetching dogs:', error);
            Alert.alert('Error', 'Unable to load dog profiles.');
        }
    };

    const handleSwipeRight = async (dog) => {
        Alert.alert('Playdate Request Sent!', `You have shown interest in ${dog.name}.`);
        await sendNotification(dog.owner, dog.name);
    };
    
    const sendNotification = async (owner, dogName) => {
        try {
            const notificationsData = await AsyncStorage.getItem('notifications');
            const notifications = notificationsData ? JSON.parse(notificationsData) : [];
    
            const newNotification = {
                owner,
                sender: username, // The user swiping right
                message: `Someone is interested in scheduling a playdate with ${dogName}.`,
                dogName,
            };
    
            notifications.push(newNotification);
            await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };
    

    const handleSwipeLeft = () => {
        // Do nothing for now
    };

    const saveNotification = async (owner, dogName) => {
        try {
            const notificationsData = await AsyncStorage.getItem('notifications');
            const notifications = notificationsData ? JSON.parse(notificationsData) : [];

            const newNotification = {
                owner,
                message: `Someone is interested in scheduling a playdate with ${dogName}.`,
            };

            notifications.push(newNotification);
            await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
        } catch (error) {
            console.error('Error saving notification:', error);
        }
    };

    return (
        <View style={styles.container}>
            {dogs.length > 0 ? (
                <Swiper
                    cards={dogs}
                    renderCard={(dog) => (
                        <View style={styles.card}>
                            {dog.pictures && dog.pictures.length > 0 ? (
                                <Image source={{ uri: dog.pictures[0] }} style={styles.image} />
                            ) : (
                                <Text style={styles.noImageText}>No image available</Text>
                            )}
                            <Text style={styles.name}>{dog.name}</Text>
                            <Text style={styles.details}>Breed: {dog.breed}</Text>
                            <Text style={styles.details}>Age: {dog.age}</Text>
                            <Text style={styles.description}>{dog.description}</Text>
                        </View>
                    )}
                    onSwipedRight={(cardIndex) => handleSwipeRight(dogs[cardIndex])}
                    onSwipedLeft={handleSwipeLeft}
                    backgroundColor="white"
                    cardVerticalMargin={50}
                    stackSize={3}
                />
            ) : (
                <Text style={styles.noDogsText}>No dogs available to browse.</Text>
            )}
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        flex: 1,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 100,
        marginBottom: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    details: {
        fontSize: 18,
        color: '#555',
    },
    description: {
        fontSize: 16,
        color: '#777',
        textAlign: 'center',
        marginHorizontal: 10,
    },
    noDogsText: {
        fontSize: 18,
        color: '#888',
    },
});
