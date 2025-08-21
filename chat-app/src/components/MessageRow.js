import React from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";

export default function MessageItem({ message, own, onDelete }) {
  const handleLongPress = () => {
    Alert.alert(
      "Delete Message",
      "Do you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(message._id) },
      ]
    );
  };

  return (
    <TouchableOpacity onLongPress={handleLongPress}>
      <View style={[styles.container, own ? styles.ownContainer : styles.otherContainer]}>
        {message.replyContent && (
          <View style={styles.replyBox}>
            <Text style={styles.replyText} numberOfLines={1}>
              {message.replyContent}
            </Text>
          </View>
        )}
        <View style={styles.messageRow}>
          <Text style={[styles.messageText, own && { color: "#fff" }]}>{message.content}</Text>
          {own && (
            <Text style={styles.statusText}>
              {message.status === "sent" ? "✓" :
               message.status === "delivered" ? "✓✓" :
               message.status === "read" ? "✓✓" : ""}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: "80%",
    padding: 8,
    borderRadius: 8,
  },
  ownContainer: {
    backgroundColor: "#075E54",
    alignSelf: "flex-end",
  },
  otherContainer: {
    backgroundColor: "#fff",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
    color: "#000",
  },
  statusText: {
    fontSize: 12,
    color: "#e0e0e0",
    marginLeft: 5,
  },
  replyBox: {
    backgroundColor: "#dfe7fd",
    padding: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#4a90e2",
    marginBottom: 2,
  },
  replyText: {
    fontSize: 12,
    color: "#555",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
