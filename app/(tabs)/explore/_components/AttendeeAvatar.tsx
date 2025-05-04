import { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

const AttendeeAvatar = () => {
  const [users, setUsers] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('https://randomuser.me/api/?results=5');
      const data = await response.json();
      setUsers(data.results);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <Text style={styles.loadingText}>..</Text>
      ) : (
        <View style={styles.content}>
          <View style={styles.imagesContainer}>
            {users.map((user, index) => (
              <View 
                key={user.login.uuid}
                style={[
                  styles.imageWrapper,
                  { marginLeft: index !== 0 ? -10 : 0 }
                ]}
              >
                <Image
                  source={{ uri: user.picture.large }}
                  style={[
                    styles.image,
                    { zIndex: 5 - index }
                  ]}
                />
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "auto",
    flexDirection: 'row',
    alignItems: "center",
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  content: {
    alignItems: 'center',
  },
  imagesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    // padding: 20,
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    width: 20,
    height: 20,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  genderBadge: {
    position: 'absolute',
    bottom: -20,
    alignSelf: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  genderText: {
    fontSize: 12,
    color: 'white',
    textTransform: 'capitalize',
  },
  button: {
    marginTop: 40,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default AttendeeAvatar;