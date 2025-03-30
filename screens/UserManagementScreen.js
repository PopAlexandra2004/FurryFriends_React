import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserManagementScreen() {
    const [users, setUsers] = useState([]);

    const loadUsers = async () => {
        try {
            const usersData = await AsyncStorage.getItem('users');
            const parsedUsers = usersData ? JSON.parse(usersData) : [];
            setUsers(parsedUsers);
        } catch (error) {
            console.error('Error loading users', error);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const deleteUser = async (username) => {
        try {
            const updatedUsers = users.filter(user => user.username !== username);
            await AsyncStorage.setItem('users', JSON.stringify(updatedUsers));
            setUsers(updatedUsers);
            Alert.alert('User Deleted', `${username} has been banned.`);
        } catch (error) {
            console.error('Error deleting user', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>User Management</Text>
            <FlatList
                data={users}
                keyExtractor={(item) => item.username}
                renderItem={({ item }) => (
                    <View style={styles.userContainer}>
                        <Text style={styles.username}>{item.username}</Text>
                        <Button
                            title="Ban User"
                            color="red"
                            onPress={() => deleteUser(item.username)}
                        />
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    userContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    username: {
        fontSize: 18,
    },
});
