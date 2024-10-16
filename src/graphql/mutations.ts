export const UPDATE_DISPLAY_NAME = `
  mutation UpdateUserDisplayName($userId: uuid!, $displayName: String!){
    updateUser(pk_columns: {id: $userId} ,_set: {displayName: $displayName}) {
      id
    }
  }
`
