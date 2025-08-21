// src/components/UserRow.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function UserRow({ user }) {
  return (
    <View style={styles.container}>
      {/* Wrap all strings in <Text> */}
      <Text style={styles.username}>{user.username || 'No Name'}</Text>
      <Text style={styles.email}>{user.email || ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
  },
  username: { fontSize: 16, fontWeight: 'bold' },
  email: { fontSize: 14, color: '#555' },
});
