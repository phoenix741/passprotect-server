'use strict'

export function parseErrors (data) {
  if (data && data.errors) {
    for (const serverError of data.errors) {
      const error = new Error(serverError.message)
      error.fieldName = serverError.fieldName
      throw error
    }
  }
}
