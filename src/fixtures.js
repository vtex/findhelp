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
  ],
  handler: () => {},
  login: {
    requiredArgs: 'store',
    optionalArgs: 'email',
    description: 'Login with your account',
    handler: () => {},
  },
  logout: {
    description: 'Logout from current account',
    handler: () => {},
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
    handler: () => {},
  },
  install: {
    requiredArgs: 'app',
    alias: 'i',
    description: 'Install the given app',
    handler: () => {},
  },
  uninstall: {
    requiredArgs: 'app',
    description: 'Remove the given app',
    handler: () => {},
  },
  publish: {
    requiredArgs: 'app',
    description: 'Publish this app',
    handler: () => {},
  },
  workspace: {
    new: {
      requiredArgs: 'name',
      description: 'Create a new workspace',
      handler: () => {},
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
      handler: () => {},
    },
    promote: {
      description: 'Promote this workspace to master',
      requiredArgs: 'name',
      handler: () => {},
    },
    list: {
      description: 'List available workspaces',
      handler: () => {},
    },
  },
}
