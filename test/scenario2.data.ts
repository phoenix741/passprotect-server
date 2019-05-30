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

export const SUBSCRIPTION_QUERY = `
subscription transactionSubscription {
  transactionAdded {
    type
    before {
      type
      label
    }
    after {
      type
      label
    }
    user {
      _id
    }
  }
}
`;

export const CREATE_LINE_QUERY = `
mutation createLine($input: WalletLineCreateInput!) {
  createLine(input: $input) {
    __typename
    ... on Errors {
      errors {
        fieldName
        message
      }
    }
  }
}`;

export const CREATE_LINE_TEXT_VARIABLES_1 = {
  input: {
    type: 'text',
    label: 'Mon texte 1',
    group: 'Mon groupe',
    encryption: {
      salt: 'dGVzdA==',
      iv: 'dGVzdA==',
      content: 'dGVzdA==',
      authTag: 'dGVzdA==',
    },
  },
};

export const CREATE_LINE_TEXT_VARIABLES_2 = {
  input: {
    type: 'text',
    label: 'Mon texte 2',
    group: 'Mon groupe',
    encryption: {
      salt: 'dGVzdA==',
      iv: 'dGVzdA==',
      content: 'dGVzdA==',
      authTag: 'dGVzdA==',
    },
  },
};

export const CREATE_LINE_TEXT_VARIABLES_3 = {
  input: {
    type: 'text',
    label: 'Mon texte 3',
    group: 'Mon groupe',
    encryption: {
      salt: 'dGVzdA==',
      iv: 'dGVzdA==',
      content: 'dGVzdA==',
      authTag: 'dGVzdA==',
    },
  },
};
