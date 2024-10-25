import { ErrorPayload } from '@nhost/react'
import { GraphQLError } from 'graphql'

export const getGraphqlErrorMessage = (e: ErrorPayload | GraphQLError[]) => {
  if (Array.isArray(e)) {
    return e[0]?.message
  }

  return e.message
}
