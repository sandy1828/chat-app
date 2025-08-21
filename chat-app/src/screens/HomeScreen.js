import React, { useEffect, useState, useContext } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from "react-native";
import { getUsers } from "../api/api";
import { AuthContext } from "../contexts/AuthContext";
import { connectSocket } from "../socket";
import moment from "moment";

export default function HomeScreen({ navigation }) {
  const { token, user, logout } = useContext(AuthContext); // fixed logout function
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return;

    const s = connectSocket(token);
    setSocket(s);
    fetchUsers();

    // Online/offline updates
    s.on("user:status", ({ userId, online }) => {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, online, updatedAt: new Date() } : u
        )
      );
    });

    // New message indicator + last message
    s.on("message:received", ({ fromUserId, message }) => {
      setUsers((prev) =>
        prev.map((u) =>
          u._id === fromUserId
            ? { ...u, hasNewMessage: true, lastMessage: message }
            : u
        )
      );
    });

    // ✅ Naya user add hone par update karo
    s.on("user:new", (newUser) => {
      setUsers((prev) => {
        const exists = prev.some((u) => u._id === newUser._id);
        if (exists) return prev;
        return [...prev, { ...newUser, hasNewMessage: false, lastMessage: "" }];
      });
    });

    return () => s.disconnect();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await getUsers(token);
      setUsers(
        res.data.map((u) => ({ ...u, hasNewMessage: false, lastMessage: "" }))
      );
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch users");
    }
  };

  // ✅ Logout function
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout(); // clear token and user
          navigation.replace("Login"); // go to login screen
        },
      },
    ]);
  };

  const openChat = (recipient) => {
    setUsers((prev) =>
      prev.map((u) =>
        u._id === recipient._id ? { ...u, hasNewMessage: false } : u
      )
    );
    navigation.navigate("Chat", { recipient });
  };

  const renderUser = ({ item }) => {
    const lastActive = item.online
      ? "Online"
      : item.updatedAt
      ? `Last active: ${moment(item.updatedAt).fromNow()}`
      : "Offline";

    return (
      <TouchableOpacity style={styles.userCard} onPress={() => openChat(item)}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: item.online ? "green" : "#ccc" },
          ]}
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.username}>{item.username || item.email}</Text>
          <Text style={{ color: "#555", fontSize: 13 }} numberOfLines={1}>
            {item.lastMessage
              ? `${item.hasNewMessage ? "📩 " : ""}${item.lastMessage}`
              : lastActive}
          </Text>
        </View>

        {item.hasNewMessage && <View style={styles.newMsgDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Users</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutBtn}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderUser}
        contentContainerStyle={{ paddingVertical: 10 }}
        refreshing={false}
        onRefresh={fetchUsers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heading: { fontSize: 22, fontWeight: "700", color: "#222" },
  logoutBtn: { color: "#ff4d4d", fontWeight: "600", fontSize: 16 },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 10,
    padding: 15,
    borderRadius: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statusDot: { width: 14, height: 14, borderRadius: 7 },
  username: { fontSize: 16, fontWeight: "600", color: "#222" },
  newMsgDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ff4d4d",
    marginLeft: 8,
  },
});
