import test from 'ava'
import {tree} from './fixtures'
import {help} from './helper'

test('help should include settings namespace handler', t => {
  let result = createHelp()
  t.truthy(result.includes('settings <app> [field]'))
})

test('help should include settings namespace commmand', t => {
  let result = createHelp()
  t.truthy(result.includes('settings set <app> <field>'))
})

test('help should place namespace handler before its commands', t => {
  let result = createHelp()
  t.truthy(result.indexOf('settings <app>') < result.indexOf('settings set'))
})

const createHelp = () => help(tree, {name: 'findhelp'})
