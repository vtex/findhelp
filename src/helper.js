import pad from 'pad'
import {
  toArray,
  isCommand,
  isOptions,
  isNamespace,
} from './finder'
import {
  __,
  map,
  pipe,
  keys,
  pick,
  filter,
  length,
  values,
  groupBy,
  compose,
  mapObjIndexed,
} from 'ramda'

export function help (tree, pkg) {
  const {rootOptions, root, ns} = groupTree(tree)
  const namespaces = {root, ...ns}

  return `
  Usage: ${pkg.name} <command> [options]

  Commands:

${values(mapObjIndexed(formatNamespace, namespaces)).join('\n\n')}

  Options:

${map(formatOption, rootOptions.options).join('\n')}
`
}

const criteria = tree => key =>
  isOptions(tree[key]) ? 'rootOptions'
  : isCommand(tree[key]) && !isNamespace(tree[key]) ? 'root'
  : isNamespace(tree[key]) ? 'ns'
  : '_'

const groupTree = tree => compose(
  map(pick(__, tree)),
  groupBy(criteria(tree)),
  keys,
)(tree)

function formatCommand (padLength) {
  return (c, k) => {
    return `    ${pad(formatCommandArgs(c, k), padLength + 2)}${c.description}`
  }
}

function formatRequiredArgs (c) {
  return c.requiredArgs ? `<${toArray(c.requiredArgs).join('> <')}> ` : ''
}

function formatOptionalArgs (c) {
  return c.optionalArgs ? `[${toArray(c.optionalArgs).join('] [')}]` : ''
}

function formatCommandArgs (c, k) {
  return `${c.__ns ? c.__ns + ' ' : ''}${k} ${formatRequiredArgs(c)}${formatOptionalArgs(c)}`
}

function addNamespace (namespace) {
  return (command) => {
    command.__ns = namespace
    return command
  }
}

function formatNamespace (node, namespace) {
  const ns = namespace === 'root' ? undefined : namespace
  const commands = filter(n => isCommand(n), node)

  let namespaced = {}
  if (isCommand(node)) {
    namespaced[namespace] = node
  }
  namespaced = {...namespaced, ...map(addNamespace(ns), commands)}

  const maxLength = Math.max(...values(map(pipe(formatCommandArgs, length), namespaced)))
  return values(mapObjIndexed(formatCommand(maxLength), namespaced)).join('\n')
}

function formatOption (o) {
  return `    ${formatFlags(o)} ${o.description}`
}

function formatFlags (o) {
  const short = o.short ? `-${o.short}` : null
  const long = o.long ? `--${o.long}` : null
  return short && long ? `${[short, long].join(', ')} ` : `${(short || long)} `
}
