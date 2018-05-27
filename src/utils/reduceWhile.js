import reduceWhile from 'ramda/src/reduceWhile'

export const returnsExpected = (reducedResult) => {
  return reducedResult.expected
}

const getInitialState = () => ({
  validators: [],
  expected: true,
  rejectedRules: [],
})

const createReducer = (...args) => {
  return (acc, func) => {
    const { rejectedRules: prevRejectedRules } = acc

    console.groupCollapsed('reduceWhileExpected')
    console.log('acc:', acc)
    console.log('current func:', func)

    const funcResult = func(...args)
    console.log('func result:', funcResult)
    console.groupEnd()

    if (!funcResult) {
      return acc
    }

    const nextValidators = funcResult.name
      ? acc.validators.concat(funcResult.name)
      : acc.validators

    const nextExpected = funcResult.expected
    const nextRejectedRules = funcResult.rejectedRules
      ? prevRejectedRules.concat(funcResult.rejectedRules)
      : prevRejectedRules

    const nextAcc = {
      expected: nextExpected,
      rejectedRules: nextRejectedRules,
      validators: nextValidators,
    }

    console.log('returning "nextAcc":', nextAcc)

    return nextAcc
  }
}

/**
 * Reduces the given list of functions that return validation result
 * into accumulated validation result.
 */
export const reduceResults = (funcs) => {
  return (...args) => {
    return funcs.reduce(createReducer(...args), getInitialState())
  }
}

/**
 * Reduces the list of functions that return validation result
 * into accumulated validation result while each function satisfies
 * the given predicate.
 */
export const reduceResultsWhile = (predicate, funcs) => {
  return (...args) => {
    return reduceWhile(
      predicate,
      createReducer(...args),
      getInitialState(),
      funcs,
    )
  }
}