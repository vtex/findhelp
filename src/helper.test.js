import test from 'ava'
import {tree} from './fixtures'
import {help} from './helper'

const expected = `
  Usage: findhelp <command> [options]

  Commands:

    login <store> [email]      Login with your account
    logout                     Logout from current account
    list [query]               List your packages
    install <app>              Install the given app
    uninstall <app>            Remove the given app
    publish <app>              Publish this app

    workspace new <name>         Create a new workspace
    workspace delete <name>      Delete this workspace
    workspace promote <name>     Promote this workspace to master
    workspace list               List available workspaces

    settings <app> [field]                     Get an app's settings
    settings set <app> <field> <value>         Set an app's settings value
    settings unset <app> <field>               Unset an app's settings value

  Options:

    --verbose  show all logs
    -h, --help  show help information
    -v, --version  show version number
`

test('help', t => {
  const output = help(tree, {name: 'findhelp', version: '0.0.0'})
  t.true(output === expected)
})
