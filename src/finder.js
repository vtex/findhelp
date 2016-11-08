import ExtendableError from 'es6-error'
import {
  any,
  map,
  pipe,
  prop,
  type,
  isNil,
  props,
  reject,
  reduce,
  propEq,
  values,
  length,
  compose,
  groupBy,
  flatten,
  find as rfind,
} from 'ramda'

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
  return type(node) === 'Object' && any(v => isCommand(v) || isModule(v), values(node)) && node
}

export function isModule (node) {
  return !isNil(node) && type(node.module) === 'String' && node
}

export function loadModule (node) {
  return require(node.module).default || require(node.module)
}

export function isOptions (node) {
  return Array.isArray(node) && node
}

export function findByAlias (key, node) {
  return rfind(propEq('alias', key), values(node))
}

export function findNext (key, node) {
  if (!key) {
    return null
  }
  const next = node[key] || findByAlias(key, node)
  return isModule(next) ? loadModule(next) : next
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
  const argsNumber = getArgsNumber(command)
  const passedArgsNumber = passedArgs.length
  const filledArgs = passedArgsNumber < argsNumber
    ? passedArgs.slice(0, argsNumber).concat(new Array(argsNumber - passedArgsNumber).fill(null))
    : passedArgs.slice(0, argsNumber)

  return {
    command,
    node: node,
    args: filledArgs.concat(argv),
  }
}

export function run ({command, args}) {
  return command.handler.apply(this, args)
}
