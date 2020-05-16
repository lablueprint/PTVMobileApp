import React from 'react';
import {
  Text, View, ScrollView, StyleSheet,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { ActivityIndicator } from 'react-native-paper';
import PropTypes from 'prop-types';
import ForumPost from './ForumPost';
import { theme } from '../../style';

export default class ForumSubcategoryPostsScreen extends React.Component {
  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.state = {
      forumPosts: [],
      loading: true,
      categoryID: navigation.getParam('categoryID'),
    };

    /* Function to navigate to post when post pressed, fx passed to ForumPost */
    this.navigateToPostScreen = this.navigateToPostScreen.bind(this);
  }

  componentDidMount() {
    const { categoryID } = this.state;
    const { navigation } = this.props;

    // Get the name of the category w/ this ID, pass the name to navigation
    firestore().collection('forum_categories').doc(categoryID)
      .get()
      .then((snapshot) => {
        const categoryData = snapshot.data();
        navigation.setParams(
          { subcategoryName: categoryData.title ? categoryData.title : 'Uncategorized' },
        );
      })
      .catch((error) => this.setState({ errorMessage: error.message, loading: false }));

    this.unsubscribeFromAuth = auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ currentUserID: user.uid });
      }
    });

    /* Only query posts w/ categoryID matching categoryID passed in from navigation */
    this.unsubscribeFromFirestore = firestore().collection('forum_posts')
      .where('categoryID', '==', categoryID)
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const forumPosts = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        this.setState({ forumPosts, loading: false });
      }, (error) => {
        this.setState({ errorMessage: error.message, loading: false });
      });
  }

  componentWillUnmount() {
    this.unsubscribeFromAuth();
    this.unsubscribeFromFirestore();
  }

  navigateToPostScreen(postID, userID) {
    const { navigation } = this.props;
    navigation.navigate('ForumPost', { postID, userID });
  }

  render() {
    const {
      forumPosts, loading, errorMessage, currentUserID,
    } = this.state;

    return (
      <View style={styles.mainContainer}>
        <ScrollView style={styles.scrollContainer}>
          {errorMessage && <Text style={{ color: 'red' }}>{errorMessage}</Text>}
          {loading
          && (
          <View>
            <ActivityIndicator />
          </View>
          ) }
          {forumPosts.map((post) => {
            const date = post.createdAt ? post.createdAt.toDate() : null;
            const time = date ? date.toTimeString() : null;

            return (
              <ForumPost
                belongsToCurrentUser={currentUserID === post.userID}
                key={post.id}
                userID={post.userID ? post.userID : null}
                time={time}
                postID={post.id}
                navigateToPostScreen={this.navigateToPostScreen}
              >
                {post.title}
              </ForumPost>
            );
          })}
        </ScrollView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  postContainer: {
    height: '100%',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    height: '100%',
    backgroundColor: theme.colors.background,
  },
});

ForumSubcategoryPostsScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    getParam: PropTypes.func,
    setParams: PropTypes.func,
    categoryID: PropTypes.string,
  }).isRequired,
};
