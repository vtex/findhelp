import {isCommand, isNamespace, isOptions, toArray} from './finder'
import {map, mapObjIndexed, values, pipe, length, filter} from 'ramda'
import pad from 'pad'

export function help (tree, pkg) {
  const rootOptions = filter(isOptions)(tree)
  const namespaces = {
    root: filter(isCommand)(tree),
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
    return `    ${pad(formatCommandArgs(c, k), padLength)}${c.description}`
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
  const namespaced = map(addNamespace(ns), node)
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
