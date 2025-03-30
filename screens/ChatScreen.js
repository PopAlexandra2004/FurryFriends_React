import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    FlatList,
    StyleSheet,
    Modal,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatScreen({ route }) {
    const { username, chatWith, dogName } = route.params;
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [playdateModalVisible, setPlaydateModalVisible] = useState(false);
    const [playdateDetails, setPlaydateDetails] = useState(null);
    const [playdateInputs, setPlaydateInputs] = useState({
        date: '',
        time: '',
        location: '',
        duration: '',
    });
    const [contactModalVisible, setContactModalVisible] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');

    useEffect(() => {
        fetchMessages();
        fetchPlaydateDetails();
    }, []);

    const getChatId = (user1, user2) => {
        return [user1, user2].sort().join('_');
    };

    const fetchMessages = async () => {
        try {
            const messagesData = await AsyncStorage.getItem('chats');
            const allChats = messagesData ? JSON.parse(messagesData) : {};
            const chatId = getChatId(username, chatWith);
            setMessages(allChats[chatId] || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchPlaydateDetails = async () => {
        try {
            const playdateData = await AsyncStorage.getItem('playdateDetails');
            const playdates = playdateData ? JSON.parse(playdateData) : {};
            const chatId = getChatId(username, chatWith);
            setPlaydateDetails(playdates[chatId] || null);
        } catch (error) {
            console.error('Error fetching playdate details:', error);
        }
    };

    const savePlaydateDetails = async (updatedDetails) => {
        try {
            const playdateData = await AsyncStorage.getItem('playdateDetails');
            const playdates = playdateData ? JSON.parse(playdateData) : {};
            const chatId = getChatId(username, chatWith);
            playdates[chatId] = updatedDetails;
            await AsyncStorage.setItem('playdateDetails', JSON.stringify(playdates));
            setPlaydateDetails(updatedDetails);
        } catch (error) {
            console.error('Error saving playdate details:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        const newChatMessage = {
            sender: username,
            recipient: chatWith,
            message: newMessage,
            timestamp: new Date(),
            dogName,
            read: false,
        };

        try {
            const messagesData = await AsyncStorage.getItem('chats');
            const allChats = messagesData ? JSON.parse(messagesData) : {};
            const chatId = getChatId(username, chatWith);
            const updatedChat = allChats[chatId] ? [...allChats[chatId], newChatMessage] : [newChatMessage];
            allChats[chatId] = updatedChat;
            await AsyncStorage.setItem('chats', JSON.stringify(allChats));
            setMessages(updatedChat);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handlePlaydateSubmit = () => {
        if (!playdateInputs.date || !playdateInputs.time || !playdateInputs.location || !playdateInputs.duration) {
            Alert.alert('Error', 'Please fill in all playdate details.');
            return;
        }

        const updatedDetails = {
            ...playdateInputs,
            submittedBy: username,
            status: playdateDetails ? 'Proposed' : 'Initial',
        };

        savePlaydateDetails(updatedDetails);
        setPlaydateModalVisible(false);
        Alert.alert('Success', 'Playdate details submitted.');
    };

    const schedulePlaydateReminder = (playdate) => {
        const playdateTime = new Date(`${playdate.date}T${playdate.time}`);
        const reminderTime = new Date(playdateTime.getTime() - 3600000); // 1 hour before
    
        
    };
    
    const handlePlaydateAccept = () => {
        if (playdateDetails.submittedBy === username) {
            Alert.alert('Error', 'You cannot accept your own playdate proposal.');
            return;
        }

        const updatedDetails = {
            ...playdateDetails,
            status: 'Accepted',
        };

        savePlaydateDetails(updatedDetails);
        schedulePlaydateReminder(updatedDetails); // Schedule the reminder
        setContactModalVisible(true);
        // Save the accepted playdate to AsyncStorage for reminders
        AsyncStorage.setItem(
            `acceptedPlaydate_${username}`,
            JSON.stringify(updatedDetails)
        );
        Alert.alert('Success', 'Playdate accepted. Proceed to exchange phone numbers.');
    };

    const submitPhoneNumber = async () => {
        if (!phoneNumber.trim()) {
            Alert.alert('Error', 'Please enter a valid phone number.');
            return;
        }

        const updatedDetails = {
            ...playdateDetails,
            [username]: phoneNumber,
        };

        savePlaydateDetails(updatedDetails);

        if (playdateDetails[chatWith]) {
            Alert.alert('Success', 'Phone numbers exchanged successfully!');
        } else {
            Alert.alert('Waiting for the other user to share their phone number.');
        }

        setContactModalVisible(false);
    };

    const renderPlaydateStatus = () => {
        if (!playdateDetails) return null;

        return (
            <View style={styles.playdateStatusContainer}>
                <Text style={styles.playdateStatusTitle}>Playdate Details:</Text>
                <Text>Date: {playdateDetails.date}</Text>
                <Text>Time: {playdateDetails.time}</Text>
                <Text>Location: {playdateDetails.location}</Text>
                <Text>Duration: {playdateDetails.duration}</Text>
                <Text>Status: {playdateDetails.status}</Text>
                {playdateDetails.submittedBy !== username && playdateDetails.status !== 'Accepted' && (
                    <Button title="Accept Playdate" onPress={handlePlaydateAccept} />
                )}
                {playdateDetails.status === 'Accepted' && !playdateDetails[username] && (
                    <Button title="Share Phone Number" onPress={() => setContactModalVisible(true)} />
                )}
            </View>
        );
    };


    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <Text style={styles.conversationTitle}>Playdate with {dogName} ({chatWith})</Text>

            <FlatList
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View
                        style={[
                            styles.message,
                            item.sender === username ? styles.myMessage : styles.theirMessage,
                        ]}
                    >
                        <Text>{item.message}</Text>
                        <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
                    </View>
                )}
            />

            {renderPlaydateStatus()}

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message..."
                />
                <Button title="Send" onPress={sendMessage} />
            </View>

            <Button title="Schedule Playdate" onPress={() => setPlaydateModalVisible(true)} />

            <Modal visible={playdateModalVisible} animationType="slide">
                <ScrollView contentContainerStyle={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Playdate Details</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Date (YYYY-MM-DD)"
                        value={playdateInputs.date}
                        onChangeText={(text) => setPlaydateInputs({ ...playdateInputs, date: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Time (HH:MM)"
                        value={playdateInputs.time}
                        onChangeText={(text) => setPlaydateInputs({ ...playdateInputs, time: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Location"
                        value={playdateInputs.location}
                        onChangeText={(text) => setPlaydateInputs({ ...playdateInputs, location: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Duration (e.g., 1 hour)"
                        value={playdateInputs.duration}
                        onChangeText={(text) => setPlaydateInputs({ ...playdateInputs, duration: text })}
                    />
                    <Button title="Submit" onPress={handlePlaydateSubmit} />
                    <Button title="Cancel" onPress={() => setPlaydateModalVisible(false)} />
                </ScrollView>
            </Modal>

            <Modal visible={contactModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <ScrollView contentContainerStyle={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Enter Your Phone Number</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Phone Number"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                        />
                        <Button title="Submit" onPress={submitPhoneNumber} />
                    </ScrollView>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    conversationTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        maxWidth: '70%',
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#d1e7ff',
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#f1f1f1',
    },
    timestamp: {
        fontSize: 10,
        color: '#555',
        marginTop: 5,
        alignSelf: 'flex-end',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        padding: 10,
        marginRight: 10,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});
