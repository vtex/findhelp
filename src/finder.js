import {type, values, find as rfind, propEq, map, groupBy, prop, compose, flatten, reduce, reject, isNil, pipe, props, length, any} from 'ramda'
import ExtendableError from 'es6-error'

export class MissingRequiredArgsError extends ExtendableError {}

export const toArray = a => Array.isArray(a) ? a : (a == null ? [] : [a])

export const getOptions = reduce((r, o) => flatten([r, map(toArray, [o.short, o.long])]), [])

export const groupByType = groupBy(prop('type'))

export const optionsByType = compose(map(getOptions), groupByType)

export const getArgsNumber = pipe(props(['requiredArgs', 'optionalArgs']), flatten, reject(isNil), length)

export function validateCommand (command, args) {
  if (!command) {
    return command
  }
  if (toArray(command.requiredArgs).length > args.length) {
    throw new MissingRequiredArgsError(command.requiredArgs)
  }
  return command
}

export function findOptions (node) {
  return node.options || []
}

export function isCommand (node) {
  return !isNil(node) && type(node.handler) === 'Function' && node
}

export function isNamespace (node) {
  return type(node) === 'Object' && any(isCommand, values(node)) && node
}

export function isOptions (node) {
  return Array.isArray(node) && node
}

export function findByAlias (key, node) {
  return rfind(propEq('alias', key), values(node))
}

export function findNext (key, node) {
  return key ? (node[key] || findByAlias(key, node)) : null
}

export function find (node, args, raw, minimist) {
  // Accept (node, raw, minimist) as initial arguments
  if (arguments.length === 3) {
    const argv = raw(args, optionsByType(findOptions(node)))
    return find(node, argv._.slice(0), args, raw)
  }

  const [head, ...tail] = args
  const next = findNext(head, node)

  // Prioritize following namespaces
  if (isNamespace(next)) {
    return find(next, tail, raw, minimist)
  }

  // Prioritize first arg as command name
  const nextIsCommand = isCommand(next)
  const passedArgs = nextIsCommand ? tail : args
  const command = validateCommand(nextIsCommand || isCommand(node), passedArgs)
  const argv = minimist(raw, optionsByType(findOptions(command || node)))

  return {
    command,
    node: node,
    args: passedArgs.slice(0, getArgsNumber(command)).concat(argv),
  }
}

export function run ({command, args}) {
  return command.handler.apply(this, args)
}
