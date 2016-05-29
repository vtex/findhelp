#!/usr/bin/env node
import minimist from 'minimist'
import {tree} from './fixtures'
import {
  find,
  help,
  run,
  MissingRequiredArgsError,
} from './index'

try {
  const found = find(tree, process.argv.slice(2), minimist)
  if (found.command) {
    run(found)
  } else {
    if (!(found.options.h || found.options.help) && found.argv._.length > 0) {
      console.error('Command not found:', found.argv._)
    }
    console.log(help(tree, {name: 'findhelp'}))
  }
} catch (e) {
  switch (e.constructor) {
    case MissingRequiredArgsError:
      console.error('Missing required arguments:', e.message)
      break
    default:
      console.error('Something exploded :(')
      console.error(e)
  }
}
