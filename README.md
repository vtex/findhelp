# findhelp

> A simple and hackable lib to help create modular command line programs.

For those times when you just need to find some help to structure your CLI. 🔎 ℹ️

## What

Given a `tree` of commands and an arguments vector, `findhelp` can:

- Create a pretty "help" menu.
- Traverse the tree and find the correct command.
- *(Optionally)* Run the command `handler` with given `args` and `options`.

For example, [this tree](./src/fixtures.js) generates this help content:

```
Usage: findhelp <command> [options]

Commands:

  login <store> [email]    Login with your account
  logout                   Logout from current account
  list [query]             List your packages
  install <app>            Install the given app
  uninstall <app>          Remove the given app
  publish <app>            Publish this app

  workspace new <name>       Create a new workspace
  workspace delete <name>    Delete this workspace
  workspace promote <name>   Promote this workspace to master
  workspace list             List available workspaces

Options:

  --verbose  show all logs
  -h, --help  show help information
  -v, --version  show version number
```

What's interesting is that you can assemble that tree any way you want, so your commands might be handled by completely different modules - no problem.

For a real-life usage example, take a look at [VTEX Toolbelt](https://github.com/vtex/toolbelt/).

## Why

Node has some pretty good, full-feature CLI libs, like [commander](https://github.com/tj/commander.js), [yargs](https://github.com/yargs/yargs) and [neodoc](https://github.com/felixschl/neodoc). Why write another one?  

First, those projects are *very* opinionated. This is excellent for small and quick projects - they got the 95% of the cases covered. You won't go wrong with any of them!  

However, the structure comes at the price of control. They tend to _own_ the entire lifecycle of your CLI, which might be bad if you want fine-grained control over how your program behaves.  

Second, I had a free weekend. 🙃

## How

Unlike other CLI solutions available, `findhelp` won't *actually do* anything for you. It finds the command based on arguments, and gets out of your way.

### `find(tree, argv)` and `run(command, root)`

Here's a minimal example of the `find` usage:

```js
#!/usr/bin/env node
import {find, run, MissingRequiredArgsError, CommandNotFoundError} from 'findhelp'
import {tree} from './fixtures' // Your tree defining the commands

try {
  const found = find(tree, process.argv.slice(2))
  run(found) // This will run the command called by the user
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
```

That's it. You pass to `find` your command `tree` and your `argv`, and it will return an object like:

```js
{
    command: <the Object with a handler function that matches>,
    args: ['any', 'required', 'or', 'optional', 'args', argv]
}
```

The last argument is always `argv`, as parsed by `minimist`. It will contain any flag `options` defined by your command.

You can optionally use `run`, which calls `command.handler` with the provided `args` for you.

### `help(tree, {name})`

You can use that same `tree` to output a pretty help menu. The second parameter is an object with the name of the command line application. Here's the handler for the root command in that example:

```js
import {help} from 'findhelp'

handler: (options) => {
  if (options.h || options.help) {
    console.log(help(tree, {name: 'findhelp'}))
  } else if (options.v || options.version) {
    console.log(pkg.version)
  } else {
    console.log('Hi, there! :)')
  }
}
```

No automatic anything. You're in control. (Use your power wisely).

### The command tree

A command tree is composed of one or many command objects with:

- **`requiredArgs`**: Required arguments to run the command
- **`optinalArgs`**: Optional arguments
- **`description`**: Description to be displayed in the `help()` function
- **`handler`**: Function that will be called with the `run()` function passing the required and optional arguments as parameters
- **`alias`**: An alias for the command
- **`options`**: An object of [`options`](#options)

The `handler` can be either a function or a string that locates the module where the handling function is the default export. The `root` parameter in `run()` will be used to resolve the full path of the module in the case a string is passed. If `handler` is not specified, findhelp will try to locate the module following the folders maching the command tree structure from the specified `root` (see the examples below).

#### Examples

```js
login: {
  requiredArgs: 'store',
  optionalArgs: 'email',
  description: 'Login with your account',
  handler: (store, email, options) => { /* do awesome stuff! */ },
logout: {
  description: 'Logout from current account',
  handler: './logout'
},
workspace: {
  new: {
    requiredArgs: 'name',
    description: 'Create a new workspace',
    // will look at './workspace/new' (from root) for handling function
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
    // will look at './workspace/delete' (from root) for handling function
  },
}
```

Here is how './workspace/delete' could look like:

```js
export default async (name, {account}) => {
  // ...
}
```

These will define the following commands:
- `yourapp login <store> [email]`
- `yourapp crazy <mustbegiven> [thisisfine]`

#### Namespaces

Namespaces enable commands with 2 or more levels. Example:

```js
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
}
```

These will define the following commands:
- `yourapp workspace new <name>`
- `yourapp workspace delete <name>`

### Options

An array containing options:

```js
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
]
```

These will enable the following options:
- `yourapp --verbose`

- `yourapp --help` or `yourapp -h`
- `yourapp --version` or `yourapp -v`

## That's it

Now you know everything. Go play! Then, submit a sweet pull request to make this shinier. Thanks. 🤓
