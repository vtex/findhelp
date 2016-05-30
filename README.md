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

### `find(tree, argv, minimist)` and `run(command)`

Here's a minimal example of the `find` usage:

```
#!/usr/bin/env node
import minimist from 'minimist'
import {tree} from './fixtures'
import {find, run, MissingRequiredArgsError} from 'findhelp'

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
```

That's it. You pass to `find` your command `tree`, your `argv` and any `minimist`-like argv parser. It will return an object like:

```
{
    command: <the Object with a handler function that matches>,
    args: ['any', 'required', 'or', 'optional', 'args', argv]
}
```

The last argument is always `argv`, as parsed by `minimist`. It will contain any flag `options` defined by your command.

You can optionally use `run`, which calls `command.handler` with the provided `args` for you.

### `help(tree, {name})`

You can use that same `tree` to output a pretty help menu. Here's the handler for the root command in that example:

```
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

A command tree is composed of three primitives: [`command`, `namespace`, `options`]:

#### Commands

Any objects with a `handler()` function.

```
login: {
  requiredArgs: 'store',
  optionalArgs: 'email',
  description: 'Login with your account',
  handler: (store, email, options) => { // do awesome stuff! },
},
crazy: {
  alias: 'c',
  description: 'Full-fledged command example',
  requiredArgs: 'mustbegiven',
  optionalArgs: 'thisisfine',
  options: [
    {
      short: 'a',
      long: 'all',
      description: 'show hidden',
      type: 'boolean',
    },
  ],
  handler: (mustbegiven, thisisfine, options) => { // do awesome stuff! },
},
```

#### Namespaces

These contain other commands. Hooray nesting!

```
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

### Options

An array containing options:

```
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

## That's it

Now you know everything. Go play! Then, submit a sweet pull request to make this shinier. Thanks. 🤓
