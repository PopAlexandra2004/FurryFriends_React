import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatListScreen({ route, navigation }) {
    const { username } = route.params;
    const [chatList, setChatList] = useState([]);

    useEffect(() => {
        fetchChatList();
    }, []);

    const fetchChatList = async () => {
        try {
            const chatsData = await AsyncStorage.getItem('chats');
            const allChats = chatsData ? JSON.parse(chatsData) : {};

            // Filter chats where the user is either sender or recipient
            const userChats = Object.keys(allChats)
                .filter((chatId) => chatId.includes(username))
                .map((chatId) => {
                    const [user1, user2] = chatId.split('_');
                    const chatWith = user1 === username ? user2 : user1;
                    const lastMessage = allChats[chatId][allChats[chatId].length - 1];
                    return { chatId, chatWith, lastMessage };
                });

            setChatList(userChats);
        } catch (error) {
            console.error('Error fetching chat list:', error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chats</Text>
            {chatList.length > 0 ? (
                <FlatList
                    data={chatList}
                    keyExtractor={(item) => item.chatId}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.chatItem}
                            onPress={() =>
                                navigation.navigate('ChatScreen', {
                                    username,
                                    chatWith: item.chatWith,
                                    dogName: item.lastMessage.dogName || 'Playdate', // Optional dog name
                                })
                            }
                        >
                            <Text style={styles.chatWith}>{item.chatWith}</Text>
                            <Text style={styles.lastMessage}>{item.lastMessage.message}</Text>
                        </TouchableOpacity>
                    )}
                />
            ) : (
                <Text style={styles.noChatsText}>No chats yet.</Text>
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
    chatItem: {
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 10,
        elevation: 2,
    },
    chatWith: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    lastMessage: {
        fontSize: 14,
        color: '#777',
    },
    noChatsText: {
        fontSize: 16,
        color: '#aaa',
        textAlign: 'center',
        marginTop: 20,
    },
});
