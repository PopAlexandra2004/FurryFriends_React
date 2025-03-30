import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TouchableOpacity } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

export default function HomeScreen({ route, navigation }) {
    const { username, role } = route.params;
    const [notifications, setNotifications] = useState([]);
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [playdateReminder, setPlaydateReminder] = useState(null);

    useEffect(() => {
        if (role === 'PetOwner' || role === 'AnimalShelter') {
            fetchNotifications();
            fetchPlaydateReminder(); // Fetch playdate reminder for these roles
        }
        fetchUnreadMessages(); // Fetch unread messages
    }, []);

    const getChatId = (user1, user2, dogName) => {
        return [user1, user2, dogName].sort().join('_'); // Unique chat for each dog
    };

    const fetchUnreadMessages = async () => {
        try {
            const messagesData = await AsyncStorage.getItem('messages');
            const messages = messagesData ? JSON.parse(messagesData) : [];
            const userUnreadMessages = messages.filter(
                (message) => message.recipient === username && !message.read
            ).length;
            setUnreadMessages(userUnreadMessages);
        } catch (error) {
            console.error('Error fetching unread messages:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const notificationsData = await AsyncStorage.getItem('notifications');
            const notifications = notificationsData ? JSON.parse(notificationsData) : [];
            const userNotifications = notifications.filter((notif) => notif.owner === username);
            setNotifications(userNotifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const fetchPlaydateReminder = async () => {
        try {
            const playdateData = await AsyncStorage.getItem(`acceptedPlaydate_${username}`);
            if (playdateData) {
                const playdate = JSON.parse(playdateData);
                const playdateTime = new Date(`${playdate.date}T${playdate.time}`);
                const now = new Date();

                // Check if playdate time is still in the future
                if (playdateTime > now) {
                    setPlaydateReminder(playdate);
                } else {
                    // Remove expired playdate reminder
                    await AsyncStorage.removeItem(`acceptedPlaydate_${username}`);
                }
            }
        } catch (error) {
            console.error('Error fetching playdate reminder:', error);
        }
    };

    const clearReminder = async () => {
        try {
            await AsyncStorage.removeItem(`acceptedPlaydate_${username}`);
            setPlaydateReminder(null);
            Alert.alert('Reminder cleared.');
        } catch (error) {
            console.error('Error clearing reminder:', error);
        }
    };

    const handleAcceptRequest = async (notification) => {
        try {
            Alert.alert('Accepted', `You accepted the request for ${notification.dogName}.`);
            await sendInitialMessage(notification.sender, notification.dogName);
            await openChat(notification);
            await removeNotification(notification);
        } catch (error) {
            console.error('Error handling accept request:', error);
        }
    };

    const sendInitialMessage = async (recipient, dogName) => {
        const initialMessage = {
            sender: username,
            recipient,
            message: `Hi! Let's schedule a playdate for ${dogName}.`,
            timestamp: new Date(),
            dogName,
            read: false,
        };

        try {
            const messagesData = await AsyncStorage.getItem('messages');
            const allMessages = messagesData ? JSON.parse(messagesData) : [];
            const updatedMessages = [...allMessages, initialMessage];
            await AsyncStorage.setItem('messages', JSON.stringify(updatedMessages));
        } catch (error) {
            console.error('Error sending initial message:', error);
        }
    };

    const handleDenyRequest = async (notification) => {
        Alert.alert('Denied', `You denied the request for ${notification.dogName}.`);
        await removeNotification(notification);
    };

    const removeNotification = async (notificationToRemove) => {
        try {
            const notificationsData = await AsyncStorage.getItem('notifications');
            const notifications = notificationsData ? JSON.parse(notificationsData) : [];
            const updatedNotifications = notifications.filter(
                (notif) => notif.message !== notificationToRemove.message
            );
            await AsyncStorage.setItem('notifications', JSON.stringify(updatedNotifications));
            fetchNotifications();
        } catch (error) {
            console.error('Error removing notification:', error);
        }
    };

    const openChat = async (notification) => {
        try {
            const chatId = getChatId(username, notification.sender, notification.dogName);
            navigation.navigate('ChatScreen', {
                chatId,
                username,
                chatWith: notification.sender,
                dogName: notification.dogName,
            });
        } catch (error) {
            console.error('Error opening chat:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome, {username}</Text>
            <Text style={styles.subTitle}>Role: {role}</Text>

            {/* Playdate Reminder */}
            {playdateReminder && (
                <View style={styles.reminderContainer}>
                    <Text style={styles.reminderTitle}>Upcoming Playdate Reminder</Text>
                    <Text>Date: {playdateReminder.date}</Text>
                    <Text>Time: {playdateReminder.time}</Text>
                    <Text>Location: {playdateReminder.location}</Text>
                    <Text>Duration: {playdateReminder.duration}</Text>
                    <Button title="Clear Reminder" onPress={clearReminder} />
                </View>
            )}

            {/* Chat Icon */}
            <TouchableOpacity
                style={styles.chatIcon}
                onPress={() => navigation.navigate('ChatListScreen', { username })}
            >
                <FontAwesome name="comments" size={24} color="black" />
                {unreadMessages > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unreadMessages}</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Notifications */}
            {(role === 'PetOwner' || role === 'AnimalShelter') && notifications.length > 0 && (
                <View style={styles.notificationsContainer}>
                    <Text style={styles.notificationHeader}>Notifications</Text>
                    {notifications.map((notif, index) => (
                        <View key={index} style={styles.notificationItem}>
                            <Text style={styles.notificationText}>{notif.message}</Text>
                            <Button title="Accept" onPress={() => handleAcceptRequest(notif)} color="green" />
                            <Button title="Deny" onPress={() => handleDenyRequest(notif)} color="red" />
                        </View>
                    ))}
                </View>
            )}

            {/* Role-specific buttons */}
            {role === 'PetOwner' && (
                <>
                    <Button
                        title="Add Pet Profile"
                        onPress={() => navigation.navigate('PetProfileCreation', { username })}
                    />
                    <Button
                        title="View Current Pets"
                        onPress={() => navigation.navigate('ViewPetsScreen', { username })}
                    />
                    <Button
                        title="Browse Dogs or Shelters"
                        onPress={() => navigation.navigate('BrowseDogs', { username })}
                    />
                </>
            )}

            {role === 'NonPetOwner' && (
                <Button
                    title="Browse Dogs or Shelters"
                    onPress={() => navigation.navigate('BrowseDogs', { username })}
                />
            )}

            {role === 'AnimalShelter' && (
                <>
                    <Button
                        title="Add Pet Profile"
                        onPress={() => navigation.navigate('PetProfileCreation', { username })}
                    />
                    <Button
                        title="View Current Pets"
                        onPress={() => navigation.navigate('ViewPetsScreen', { username })}
                    />
                    <Button
                        title="Browse Dogs or Shelters"
                        onPress={() => navigation.navigate('BrowseDogs', { username })}
                    />
                </>
            )}

            {role === 'Owner' && (
                <>
                    <Button
                        title="View Statistics"
                        onPress={() => navigation.navigate('Statistics', { role })}
                    />
                    <Button
                        title="Manage Users"
                        onPress={() => navigation.navigate('UserManagement')}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 16 },
    title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
    subTitle: { fontSize: 16, color: '#666', marginBottom: 20, textAlign: 'center' },
    chatIcon: { position: 'absolute', top: 10, right: 10 },
    notificationsContainer: { marginVertical: 20 },
    notificationHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    notificationItem: { marginVertical: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 10 },
    notificationText: { fontSize: 16, marginBottom: 5 },
    badge: { position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 10, padding: 5 },
    badgeText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    reminderContainer: { marginBottom: 20, padding: 16, backgroundColor: '#e7f3ff', borderRadius: 10 },
    reminderTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
});
