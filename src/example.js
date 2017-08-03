#!/usr/bin/env node
import {tree} from './fixtures'
import {find, run, MissingRequiredArgsError, CommandNotFoundError} from './index'

try {
  const found = find(tree, process.argv.slice(2))
  run(found)
} catch (e) {
  switch (e.constructor) {
    case MissingRequiredArgsError:
      console.error('Missing required arguments:', e.message)
      break
    case CommandNotFoundError:
      console.error('Command not found:', process.argv.slice(2))
      break
    default:
      console.error('Something exploded :(')
      console.error(e, e.stack)
  }
}
