#!/usr/bin/env node
import minimist from 'minimist'
import {tree} from './fixtures'
import {
  find,
  run,
  MissingRequiredArgsError,
} from './index'

try {
  const found = find(tree, process.argv.slice(2), minimist)
  if (found.command) {
    run(found)
  } else {
    console.error('Command not found:', process.argv.slice(2))
  }
} catch (e) {
  switch (e.constructor) {
    case MissingRequiredArgsError:
      console.error('Missing required arguments:', e.message)
      break
    default:
      console.error('Something exploded :(')
      console.error(e, e.stack)
  }
}
