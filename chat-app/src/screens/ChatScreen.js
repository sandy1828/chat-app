import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Swipeable } from "react-native-gesture-handler";
import { AuthContext } from "../contexts/AuthContext";
import { getMessages, sendMessage, deleteMessage } from "../api/api";
import { getSocket } from "../socket";
import MessageItem from "../components/MessageRow";

export default function ChatScreen({ route, navigation }) {
  const { recipient } = route.params;
  const { token, user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [onlineStatus, setOnlineStatus] = useState({
    online: false,
    lastSeen: null,
  });
  const [recipientTyping, setRecipientTyping] = useState(false);

  const flatListRef = useRef();
  const socket = getSocket();
  const typingTimeout = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit("join", { userId: user._id, recipientId: recipient._id });

    socket.on("message:new", (msg) => {
      if ([msg.senderId, msg.recipientId].includes(recipient._id)) {
        setMessages((prev) => [...prev, msg]);
        scrollToEnd();
      }
    });

    socket.on("message:status", ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, status } : msg))
      );
    });

    socket.on("user:status", ({ userId, online, lastSeen }) => {
      if (userId === recipient._id)
        setOnlineStatus({ online, lastSeen: online ? null : lastSeen });
    });

    socket.on("typing:start", ({ userId }) => {
      if (userId === recipient._id) setRecipientTyping(true);
    });
    socket.on("typing:stop", ({ userId }) => {
      if (userId === recipient._id) setRecipientTyping(false);
    });

    socket.emit("messages:read", {
      senderId: recipient._id,
      recipientId: user._id,
    });

    socket.emit("get:userStatus", { userId: recipient._id });

    return () => {
      socket.off("message:new");
      socket.off("message:status");
      socket.off("user:status");
      socket.off("typing:start");
      socket.off("typing:stop");
    };
  }, [recipient]);

  const fetchMessages = async () => {
    try {
      const res = await getMessages(recipient._id, token);
      const data = res.data.map((msg) => ({
        ...msg,
        senderId:
          typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId,
        recipientId:
          typeof msg.recipientId === "object"
            ? msg.recipientId._id
            : msg.recipientId,
      }));
      setMessages(data);
      scrollToEnd();
    } catch (err) {
      console.error(err);
    }
  };

const handleTextChange = (val) => {
  setText(val);
  if (!socket) return;

  socket.emit("typing:start", { userId: user._id, recipientId: recipient._id });

  if (typingTimeout.current) clearTimeout(typingTimeout.current);

  typingTimeout.current = setTimeout(() => {
    socket.emit("typing:stop", { userId: user._id, recipientId: recipient._id });
    typingTimeout.current = null;
  }, 1000);
};


  const handleSend = async () => {
  if (!text.trim() || !socket) return;

  const messageData = {
    recipientId: recipient._id,
    senderId: user._id,
    content: text,
    replyTo: replyTo ? replyTo._id : null,
    replyContent: replyTo ? replyTo.content : null,
    status: "sending",
  };

  setText("");
  setReplyTo(null);

  // Emit message to server
  socket.emit("message:send", messageData);

  // ❌ Remove this, server will emit "message:new"
  // setMessages((prev) => [...prev, messageData]); ❌
  // scrollToEnd(); ❌

  try {
    await sendMessage(
      {
        recipientId: recipient._id,
        content: text,
        replyTo: messageData.replyTo,
      },
      token
    );
  } catch (err) {
    console.error(err);
    Alert.alert("Error", "Failed to send message");
  }
};


  const handleDelete = async (messageId) => {
    try {
      await deleteMessage(messageId, token);
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to delete message");
    }
  };

  const handleReply = (msg) => setReplyTo(msg);

  const renderLeftAction = () => (
    <View style={styles.replyAction}>
      <Text style={{ color: "#fff", fontWeight: "bold" }}>Reply</Text>
    </View>
  );

  const scrollToEnd = () => {
    if (flatListRef.current)
      flatListRef.current.scrollToEnd({ animated: true });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 110}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>⬅</Text>
        </TouchableOpacity>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerText}>
            {recipient.username || recipient.email}
          </Text>
          <Text style={styles.statusText}>
            {onlineStatus.online
              ? "Online"
              : onlineStatus.lastSeen
              ? `Last seen: ${new Date(
                  onlineStatus.lastSeen
                ).toLocaleTimeString()}`
              : "Offline"}
          </Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item._id || index.toString()}
        contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 12 }}
        renderItem={({ item }) => (
          <Swipeable
            renderLeftActions={renderLeftAction}
            onSwipeableLeftOpen={() => handleReply(item)}
          >
            <MessageItem
              message={item}
              own={item.senderId === user._id} // ✅ pass prop
              onDelete={handleDelete}
            />
          </Swipeable>
        )}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollToEnd}
        onLayout={scrollToEnd}
        style={{ flex: 1 }}
      />

      {recipientTyping && (
        <View style={styles.typingIndicator}>
          <Text style={{ color: "#555" }}>
            {recipient.username || "User"} is typing...
          </Text>
        </View>
      )}

      <View style={styles.inputWrapper}>
        {replyTo && (
          <View style={styles.replyPreview}>
            <Text style={styles.replyText} numberOfLines={1}>
              Replying: {replyTo.content}
            </Text>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Text style={styles.replyCancel}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={handleTextChange}
            placeholder="Type a message..."
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e5ddd5" },
  header: {
    height: 70,
    backgroundColor: "#075E54",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  backButton: { position: "absolute", left: 15 },
  backText: { fontSize: 24, color: "#fff" },
  headerText: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  statusText: { fontSize: 12, color: "#d1f0d1", marginTop: 2 },
  inputWrapper: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 25,
    alignItems: "center",
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    color: "#000",
  },
  sendButton: {
    backgroundColor: "#075E54",
    borderRadius: 20,
    padding: 10,
    marginLeft: 5,
  },
  sendText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  replyPreview: {
    backgroundColor: "#dfe7fd",
    padding: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#4a90e2",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  replyText: { color: "#555" },
  replyCancel: { color: "#4a90e2", fontWeight: "bold", marginLeft: 5 },
  replyAction: {
    backgroundColor: "#4a90e2",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    marginVertical: 5,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  typingIndicator: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 2,
    marginLeft: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
});
