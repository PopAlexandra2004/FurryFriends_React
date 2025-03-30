import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';

export default function StatisticsScreen({ route }) {
    const { role } = route.params || {};
    const [loginStats, setLoginStats] = useState([]);

    useEffect(() => {
        if (role !== 'Owner') {
            console.warn('Unauthorized access to statistics.');
            return;
        }
        fetchLoginStatistics();
    }, [role]);

    const fetchLoginStatistics = async () => {
        try {
            const usersData = await AsyncStorage.getItem('users');
            const users = usersData ? JSON.parse(usersData) : [];
    
            // Example data generation logic
            const loginData = [
                { month: 'Jan', count: 5 },
                { month: 'Feb', count: null }, // Simulating invalid data
                { month: 'Mar', count: undefined },
                { month: 'Apr', count: 20 },
                { month: 'May', count: 25 },
                { month: 'Jun', count: Infinity }, // Simulating invalid data
            ];
    
            // Validate and sanitize data
            const validData = loginData.map((stat) => ({
                month: stat.month,
                count: isFinite(stat.count) && stat.count > 0 ? stat.count : 0,
            }));
    
            setLoginStats(validData);
        } catch (error) {
            console.error('Error fetching statistics', error);
        }
    };
    
    
    

    if (role !== 'Owner') {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Unauthorized Access</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>User Login Statistics</Text>
            {loginStats.length > 0 ? (
                <LineChart
                    data={{
                        labels: loginStats.map((stat) => stat.month),
                        datasets: [
                            {
                                data: loginStats.map((stat) => stat.count),
                            },
                        ],
                    }}
                    width={Dimensions.get('window').width - 20}
                    height={220}
                    chartConfig={{
                        backgroundColor: '#e26a00',
                        backgroundGradientFrom: '#fb8c00',
                        backgroundGradientTo: '#ffa726',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                        propsForDots: {
                            r: '6',
                            strokeWidth: '2',
                            stroke: '#ffa726',
                        },
                    }}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 16,
                    }}
                />
            ) : (
                <Text style={styles.errorText}>No data available for the chart.</Text>
            )}
        </View>
    );
    
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8f8f8',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        fontWeight: 'bold',
    },
    errorText: {
        fontSize: 18,
        color: 'red',
    },
});
