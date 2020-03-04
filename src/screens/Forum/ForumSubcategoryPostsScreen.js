import React from 'react';
import {
  Text, View, ScrollView,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { ActivityIndicator } from 'react-native-paper';
import PropTypes from 'prop-types';
import ForumPost from './ForumPost';

export default class ForumSubcategoryPostsScreen extends React.Component {
  constructor(props) {
    super(props);
    const { navigation } = this.props;
    this.state = {
      posts: [],
      loading: true,
      categoryID: navigation.getParam('categoryID'),
    };
  }

  componentDidMount() {
    const { categoryID } = this.state;
    /* Only query posts w/ categoryID matching categoryID passed in from navigation */
    firestore().collection('forum_posts').where('categoryID', '==', categoryID)
      .get()
      .then((snapshot) => {
        const forumPosts = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        const posts = forumPosts.map((post) => {
          const date = post.createdAt ? post.createdAt.toDate() : null;
          const time = date ? date.toTimeString() : null;
          return (
            <ForumPost
              key={post.id}
              name={post.userID}
              time={time}
              numReplies={5}
            >
              {post.title}
            </ForumPost>
          );
        });
        this.setState({ posts, loading: false });
      })
      .catch((error) => {
        this.setState({ errorMessage: error.message, loading: false });
      });
  }

  render() {
    const { posts, loading, errorMessage } = this.state;

    return (
      <View>
        <ScrollView>
          {errorMessage && <Text>{errorMessage}</Text>}
          {posts}
          {loading
          && (
          <View>
            <ActivityIndicator />
          </View>
          ) }
        </ScrollView>
      </View>
    );
  }
}

ForumSubcategoryPostsScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func,
    getParam: PropTypes.func,
    categoryID: PropTypes.string,
  }).isRequired,
};