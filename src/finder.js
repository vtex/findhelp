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
  if (!command || !isCommand(command)) {
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

export function find (node, argv) {
  if (!node.path) {
    node.path = '.'
  }

  forEachObjIndexed((child, key) => {
    if (isCommand(child) || isNamespace(child)) {
      child.path = `${node.path}/${key}`
    }
  }, node)

  const [head, ...tail] = argv
  const next = findNext(head, node)
  const nextIsNamespace = isNamespace(next)
  const nextIsCommand = isCommand(next)

  // Prioritize following namespaces
  if (nextIsNamespace || nextIsCommand) {
    return find(next, tail)
  }

  const parsedArgv = minimist(argv, optionsByType(findOptions(node)))
  const givenArgs = parsedArgv._.slice(0)
  const command = validateCommand(node, givenArgs)
  const argsNumber = getArgsNumber(command)
  const givenArgsNumber = givenArgs.length

  const filledArgs = givenArgs.slice(0, argsNumber)
  if (givenArgsNumber < argsNumber) {
    filledArgs.push(...new Array(argsNumber - givenArgsNumber).fill(null))
  }

  return {
    command,
    node: node,
    args: filledArgs.concat(parsedArgv),
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
