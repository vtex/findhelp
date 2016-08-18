import {help} from './helper'
import pkg from '../package.json'

export const tree = {
  options: [
    {
      long: 'verbose',
      description: 'show all logs',
      type: 'boolean',
    },
    {
      short: 'h',
      long: 'help',
      description: 'show help information',
      type: 'boolean',
    },
    {
      long: 'version',
      short: 'v',
      description: 'show version number',
      type: 'boolean',
    },
  ],
  handler: (options) => {
    if (options.h || options.help) {
      console.log(help(tree, {name: 'findhelp'}))
    } else if (options.v || options.version) {
      console.log(pkg.version)
    } else {
      console.log('Hi, there! :)')
    }
  },
  login: {
    requiredArgs: 'store',
    optionalArgs: 'email',
    description: 'Login with your account',
    handler: console.log.bind(console),
  },
  logout: {
    description: 'Logout from current account',
    handler: console.log.bind(console),
  },
  list: {
    alias: 'ls',
    description: 'List your packages',
    optionalArgs: 'query',
    options: [
      {
        short: 'a',
        long: 'all',
        description: 'show hidden',
        type: 'boolean',
      },
    ],
    handler: console.log.bind(console),
  },
  install: {
    requiredArgs: 'app',
    alias: 'i',
    description: 'Install the given app',
    handler: console.log.bind(console),
  },
  uninstall: {
    requiredArgs: 'app',
    description: 'Remove the given app',
    handler: console.log.bind(console),
  },
  publish: {
    requiredArgs: 'app',
    description: 'Publish this app',
    handler: console.log.bind(console),
  },
  workspace: {
    new: {
      requiredArgs: 'name',
      description: 'Create a new workspace',
      handler: console.log.bind(console),
    },
    delete: {
      requiredArgs: 'name',
      description: 'Delete this workspace',
      options: [
        {
          short: 'a',
          long: 'account',
          type: 'string',
        },
      ],
      handler: console.log.bind(console),
    },
    promote: {
      description: 'Promote this workspace to master',
      requiredArgs: 'name',
      handler: console.log.bind(console),
    },
    list: {
      description: 'List available workspaces',
      handler: console.log.bind(console),
    },
  },
  settings: {
    requiredArgs: 'app',
    optionalArgs: 'field',
    description: 'Get an app\'s settings',
    handler: console.log.bind(console),

    set: {
      requiredArgs: ['app', 'field', 'value'],
      description: 'Set an app\'s settings value',
      handler: console.log.bind(console),
    },
    unset: {
      requiredArgs: ['app', 'field'],
      description: 'Unset an app\'s settings value',
      handler: console.log.bind(console),
    },
  },
}
