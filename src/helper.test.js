import test from 'ava'
import {tree} from './fixtures'
import {help} from './helper'

test('help', () => {
  help(tree, {name: 'findhelp', version: '0.0.0'})
})
