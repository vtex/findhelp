import {isCommand, isNamespace, isOptions, toArray} from './finder'
import {map, mapObjIndexed, values, pipe, length, filter} from 'ramda'
import pad from 'pad'

export function help (tree, pkg) {
  const rootOptions = filter(isOptions)(tree)
  const namespaces = {
    root: filter(node => isCommand(node) && !isNamespace(node))(tree),
    ...filter(isNamespace)(tree),
  }

  return `
  Usage: ${pkg.name} <command> [options]

  Commands:

${values(mapObjIndexed(formatNamespace, namespaces)).join('\n\n')}

  Options:

${map(formatOption, rootOptions.options).join('\n')}
`
}

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
  const commands = filter(isCommand)(node)

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
