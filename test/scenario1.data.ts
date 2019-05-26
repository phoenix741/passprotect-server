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

export const REGISTER_USER_VARIABLES = {
  input: {
    _id: 'demo',
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

export const LOGIN_USER_VARIABLES = {
  input: {
    username: 'demo',
    password: 'demodemo',
  },
};

export const LINES_QUERY = `
query getLines {
  user(id: "demo") {
    _id
    encryption {
      salt
      iv
      content
      authTag
    }
    lines {
      label
    }
  },
  session {
    _id
    encryption {
      salt
      iv
      content
      authTag
    }
    lines {
      label
    }
  }
  lines {
    type
    label
    group
    logo
    _rev
    encryption {
      salt
      iv
      content
      authTag
    }
    user {
      _id
    }
  }
  groups
  transactions(earliest: 0) {
    type
    before { label }
    after { label }
    user {
      _id
    }
    line {
      label
    }
  }
}`;

export const LINES_VARIABLE = {};

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

export const CREATE_LINE_TEXT_VARIABLES = {
  input: {
    type: 'text',
    label: 'Mon texte',
    group: 'Mon groupe',
    encryption: {
      salt: 'dGVzdA==',
      iv: 'dGVzdA==',
      content: 'dGVzdA==',
      authTag: 'dGVzdA==',
    },
  },
};

export const CREATE_LINE_CARD_VARIABLES = {
  input: {
    type: 'card',
    label: 'Ma carte',
    group: 'Mon groupe',
    encryption: {
      salt: 'dGVzdA==',
      iv: 'dGVzdA==',
      content: 'dGVzdA==',
      authTag: 'dGVzdA==',
    },
  },
};

export const CREATE_LINE_PASSWORD_VARIABLES = {
  input: {
    type: 'password',
    label: 'Mon mot de passe',
    group: 'Mon groupe de mot de passe',
    encryption: {
      salt: 'dGVzdA==',
      iv: 'dGVzdA==',
      content: 'dGVzdA==',
      authTag: 'dGVzdA==',
    },
  },
};
