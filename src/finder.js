import path from 'path'
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
  forEachObjIndexed,
} from 'ramda'
import minimist from 'minimist'

export class HandlerNotFoundError extends ExtendableError {}

export class MissingRequiredArgsError extends ExtendableError {}

export class CommandNotFoundError extends ExtendableError {}

export const toArray = a => Array.isArray(a) ? a : (a == null ? [] : [a])

export const getOptions = reduce((r, o) => flatten([r, map(toArray, [o.short, o.long])]), [])

export const groupByType = groupBy(prop('type'))

export const optionsByType = compose(map(getOptions), groupByType)

export const getArgsNumber = pipe(props(['requiredArgs', 'optionalArgs']), flatten, reject(isNil), length)

export function validateCommand (command, args) {
  if (!command) {
    throw new CommandNotFoundError()
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
  return !isNil(node) && (node.handler || node.options || node.requiredArgs || node.optionalArgs || node.alias || node.description) && node
}

export function isNamespace (node) {
  return type(node) === 'Object' && any(v => isCommand(v), values(node)) && node
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
  return next
}

export function find (node, args) {
  if (!node.path) {
    node.path = '.'
  }

  forEachObjIndexed((child, key) => {
    if (isCommand(child) || isNamespace(child)) {
      child.path = `${node.path}/${key}`
    }
  }, node)

  const [head, ...tail] = args
  const next = findNext(head, node)

  // Prioritize following namespaces
  if (isNamespace(next)) {
    return find(next, tail)
  }

  // Prioritize first arg as command name
  const nextIsCommand = isCommand(next)
  const passedArgs = nextIsCommand ? tail : args
  const command = validateCommand(nextIsCommand || isCommand(node), passedArgs)
  const argv = minimist(args, optionsByType(findOptions(command || node)))
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

function loadModule (path) {
  return require(path).default || require(path)
}

function loadHandler (path) {
  let handler
  try {
    handler = loadModule(path)
  } catch (e) {
    throw new HandlerNotFoundError()
  }
  return handler
}

export function run ({command, args}, root) {
  let handler
  if (typeof command.handler === 'function') {
    handler = command.handler
  } else if (typeof command.handler === 'string') {
    handler = loadHandler(path.join(root, command.handler))
  } else if (typeof command.handler === 'undefined') {
    handler = loadHandler(path.join(root, command.path))
  }

  return handler.apply(this, args)
}
