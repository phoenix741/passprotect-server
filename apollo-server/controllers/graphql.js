import { GraphQLScalarType } from 'graphql'
import { Kind } from 'graphql/language'

const GraphQLScalarDate = new GraphQLScalarType({
  name: 'Date',
  description: 'Date in format Timestamp',
  serialize (value) {
    return value.getTime()
  },
  parseValue (value) {
    return new Date(value)
  },
  parseLiteral (ast) {
    if (ast.kind === Kind.INT) {
      return parseInt(ast.value, 10) // ast value is always in string format
    }
    return null
  }
})

export const resolvers = {
  Date: GraphQLScalarDate
}
