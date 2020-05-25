import React, { useState } from 'react';
import {
  Text, View,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import PropTypes from 'prop-types';
import { Title, Button } from 'react-native-paper';
import styles from '../../style';

export default function HomeScreen(props) {
  const { navigation } = props;
  const [errorMessage, setErrorMessage] = useState(null);

  const { currentUser } = auth();

  function handleSignOut() {
    auth()
      .signOut()
      .then(() => {
        navigation.navigate('Auth');
      }).catch((error) => {
        setErrorMessage(error.message);
      });
  }

  return (
    <View style={styles.container}>
      {errorMessage
        && (
        <Text style={{ color: 'red' }}>
          {errorMessage}
        </Text>
        )}
      <Title>
        {`Hi ${currentUser.displayName}!`}
      </Title>
      <Button
        style={styles.button}
        mode="contained"
        onPress={handleSignOut}
      >
        Sign Out
      </Button>
    </View>
  );
}

HomeScreen.propTypes = {
  navigation: PropTypes.shape({ navigate: PropTypes.func }).isRequired,
};
