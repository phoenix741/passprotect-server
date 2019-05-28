export const REGISTER_USER_QUERY = `
mutation($input: RegistrationUserInput!) {
  registerUser(input: $input) {
    __typename
    ... on User {
      _id
    }
    ... on Errors {
      errors {
        fieldName
        message
      }
    }
  }
}`;

export const REGISTER_USER_1_VARIABLES = {
  input: {
    _id: 'demo2',
    password: 'demodemo',
    encryption: {
      salt: 'dGVzdA==',
      iv: 'dGVzdA==',
      content: 'dGVzdA==',
      authTag: 'dGVzdA==',
    },
  },
};

export const REGISTER_USER_2_VARIABLES = {
  input: {
    _id: 'demo3',
    password: 'demodemo',
    encryption: {
      salt: 'dGVzdA==',
      iv: 'dGVzdA==',
      content: 'dGVzdA==',
      authTag: 'dGVzdA==',
    },
  },
};

export const LOGIN_USER_QUERY = `
mutation createSession($input: ConnectionInformationInput!) {
  createSession(input: $input) {
    __typename
    ... on Errors {
      errors {
        fieldName
        message
      }
    }
    ... on ConnectionInformation {
      token
      user {
        _id
        encryption {
          iv
          salt
          content
          authTag
        }
      }
    }
  }
}
`;

export const LOGIN_USER_1_VARIABLES = {
  input: {
    username: 'demo2',
    password: 'demodemo',
  },
};

export const LOGIN_USER_2_VARIABLES = {
  input: {
    username: 'demo3',
    password: 'demodemo',
  },
};
