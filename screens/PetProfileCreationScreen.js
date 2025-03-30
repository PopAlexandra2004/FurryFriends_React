import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker'; // Use expo-image-picker for Expo apps

export default function PetProfileCreationScreen({ route, navigation }) {
    const { username, role } = route.params; // Get the username and role passed from HomeScreen
    const [petName, setPetName] = useState('');
    const [petBreed, setPetBreed] = useState('');
    const [petAge, setPetAge] = useState('');
    const [description, setDescription] = useState('');
    const [pictures, setPictures] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    const selectPictures = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
        if (!permissionResult.granted) {
            Alert.alert("Permission Required", "You need to grant permission to access the gallery.");
            return;
        }
    
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });
    
        if (!result.canceled) {
            const selectedPictures = result.assets.map((asset) => asset.uri);
            console.log('Selected Pictures:', selectedPictures); // Debugging
            setPictures((prev) => [...prev, ...selectedPictures]);
        } else {
            Alert.alert("Selection Canceled", "You did not select any pictures.");
        }
    };
    
    const savePet = async () => {
        setIsSaving(true);
        try {
            const usersData = await AsyncStorage.getItem('users');
            const users = usersData ? JSON.parse(usersData) : [];
            const user = users.find((user) => user.username === username);
    
            if (user) {
                const newPet = {
                    name: petName,
                    breed: petBreed,
                    age: parseInt(petAge, 10),
                    description,
                    pictures, // Pictures array
                };
    
                console.log('New Pet Data:', newPet); // Debugging
    
                user.pets = user.pets ? [...user.pets, newPet] : [newPet];
                await AsyncStorage.setItem('users', JSON.stringify(users));
                Alert.alert('Success', `${petName}'s profile has been created.`);
                setPetName('');
                setPetBreed('');
                setPetAge('');
                setDescription('');
                setPictures([]);
                navigation.navigate('Home', { username, role });
            } else {
                Alert.alert('Error', 'User not found.');
            }
        } catch (error) {
            console.error('Error saving pet:', error);
            Alert.alert('Error', 'An error occurred while saving the pet profile.');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleCreatePetProfile = () => {
        if (!petName || !petBreed || !petAge || !description) {
            Alert.alert('Validation Error', 'All fields are required.');
        } else if (isNaN(petAge) || parseInt(petAge, 10) <= 0) {
            Alert.alert('Validation Error', 'Age must be a positive number.');
        } else {
            savePet();
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>
                {role === 'AnimalShelter' ? 'Add Animal for Adoption' : 'Create Pet Profile'}
            </Text>
            <TextInput
                style={styles.input}
                placeholder="Pet Name"
                value={petName}
                onChangeText={setPetName}
            />
            <TextInput
                style={styles.input}
                placeholder="Pet Breed"
                value={petBreed}
                onChangeText={setPetBreed}
            />
            <TextInput
                style={styles.input}
                placeholder="Pet Age (years)"
                value={petAge}
                onChangeText={setPetAge}
                keyboardType="numeric"
            />
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Short Description"
                value={description}
                onChangeText={setDescription}
                multiline
            />
            <Button title="Select Pictures" onPress={selectPictures} />
            <ScrollView horizontal style={styles.picturesContainer}>
                {pictures.map((uri, index) => (
                    <Image key={index} source={{ uri }} style={styles.image} />
                ))}
            </ScrollView>
            {isSaving ? (
                <ActivityIndicator size={50} color="#0000ff" />
            ) : (
                <Button title="Create Profile" onPress={handleCreatePetProfile} />
            )}
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    picturesContainer: {
        marginVertical: 10,
        flexDirection: 'row',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 10,
    },
});