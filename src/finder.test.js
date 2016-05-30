import test from 'ava'
import minimist from 'minimist'
import {filter, omit, last, init} from 'ramda'
import {tree} from './fixtures'
import {
  find,
  run,
  findOptions,
  optionsByType,
  isCommand,
  isNamespace,
  isOptions,
  getArgsNumber,
  MissingRequiredArgsError,
} from './finder'

const cases = [
  {
    argv: ['--verbose'],
    command: tree,
    args: [{
      verbose: true,
      help: false,
      h: false,
    }],
  },
  {
    argv: ['list'],
    command: tree.list,
    args: [{
      a: false,
      all: false,
    }],
  },
  {
    argv: ['list', '-a'],
    command: tree.list,
    args: [{
      a: true,
      all: false,
    }],
  },
  {
    argv: ['workspace', 'list'],
    command: tree.workspace.list,
    args: [{}],
  },
  {
    argv: ['install', 'cool-app'],
    command: tree.install,
    args: ['cool-app', {}],
  },
  {
    argv: ['i', 'cool-app'],
    command: tree.install,
    args: ['cool-app', {}],
  },
  {
    argv: ['list', 'query'],
    command: tree.list,
    args: ['query', {
      a: false,
      all: false,
    }],
  },
  {
    argv: ['login', 'bestever', 'me@there.com'],
    command: tree.login,
    args: ['bestever', 'me@there.com', {}],
  },
  {
    argv: ['login', 'bestever', 'me@there.com', 'extra'],
    command: tree.login,
    args: ['bestever', 'me@there.com', {}],
  },
  {
    argv: ['workspace', 'foo'],
    command: false,
    args: [{}],
  },
  {
    argv: ['workspace', 'delete', 'app', '-a', 'test'],
    command: tree.workspace.delete,
    args: ['app', {
      a: 'test',
    }],
  },
]

cases.forEach((c) => {
  test(`finds ${c.argv.join(' ')}`, t => {
    const found = find(tree, c.argv, minimist)
    t.is(c.command, found.command)
    t.deepEqual(c.args, init(found.args).concat(omit('_', last(found.args))))
  })

  test(`runs ${c.argv.join(' ')}`, t => {
    const _this = {}
    const args = ['foo', 'bar', {}]
    const found = {
      command: {
        handler: function (...passed) {
          // Passes argv as last argument
          t.deepEqual(passed, args)
          // Preserves context
          t.is(this, _this)
        },
      },
      args,
    }
    t.plan(2)
    run.call(_this, found)
  })
})

test('fails if not given required args', t => {
  t.throws(() => find(tree, ['workspace', 'new'], minimist), MissingRequiredArgsError)
})

test('finds options', t => {
  const options = findOptions(tree)
  t.true(options.indexOf(tree.options[0]) >= 0)
  t.true(options.indexOf(tree.options[1]) >= 0)
  t.true(options.indexOf(tree.list.options[0]) === -1)
})

test('groups options by type', t => {
  const options = findOptions(tree)
  const types = optionsByType(options);
  ['verbose', 'h', 'help']
  .forEach(o => t.true(types.boolean.indexOf(o) >= 0))
})

test('filters commands', t => {
  const commands = filter(isCommand)(tree)
  t.true(commands.login === tree.login)
})

test('filters namespaces', t => {
  const namespaces = filter(isNamespace)(tree)
  t.true(namespaces.workspace === tree.workspace)
})

test('filters options', t => {
  const options = filter(isOptions)(tree)
  t.true(options.options === tree.options)
})

test('gets args length', t => {
  t.is(getArgsNumber(tree.login), 2)
  t.is(getArgsNumber(tree.install), 1)
})
