import gql from 'graphql-tag';

export const GET_USERS = gql`
  query Users($where: UserWhereInput) {
    users(where: $where) {
      id
      gender
      lookingFor {
        name
      }
      updatedAt
      createdAt
      audioPref
      accAudioPrefs {
        name
      }
    }
  }
`;

export const FIND_ROOM = gql`
  query FindRoom($where: UserWhereInput) {
    users(where: $where) {
      id
      gender
      lookingFor {
        name
      }
      age
      minAge
      maxAge
      audioPref
      accAudioPrefs {
        name
      }
      lastActive
      isConnected
      isHost
      visited {
        id
        gender
        age
      }
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      gender
      lookingFor {
        name
      }
      age
      minAge
      maxAge
      audioPref
      accAudioPrefs {
        name
      }
      lastActive
      isHost
      isConnected
      visited {
        id
        gender
        age
      }
    }
  }
`;
