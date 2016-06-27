import * as _ from 'lodash';

import {Tree} from './tree';

/**
 * Shrink an integral by edging towards a destination number.
 */
export function* shrinkTowards(
  destination: number,
  x: number
): IterableIterator<number> {
  if (destination === x) {
    return;
  }
  const diff = Math.trunc(x / 2) - Math.trunc(destination / 2);
  function* map() {
    for (let k of halves(diff)) {
      yield x - k;
    }
  }
  yield* consNub(destination, map());
}

function* consNub<A>(
  x: A,
  xs: IterableIterator<A>
): IterableIterator<A> {
  const next = xs.next();
  if (next.done) {
    yield x;
  } else if (x === next.value) {
    yield next.value;
    yield* xs;
  } else {
    yield x;
    yield next.value;
    yield* xs;
  }
}

/**
 * Turn a list of trees in to a tree of lists, opting to shrink only the
 * elements of the list (i.e. the size of the list will always be the same).
 */
export function sequenceShrinkOne<A>(
  forest: Array<Tree<A>>
): Tree<Array<A>> {
  return sequenceShrink(shrinkForest => shrinkOne(tree => tree.shrink(), shrinkForest), forest);
}

/**
 * Turn a list of trees in to a tree of lists, opting to shrink both the list
 * itself and the elements in the list during traversal.
 */
export function sequenceShrinkList<A>(
  forest: Array<Tree<A>>
): Tree<Array<A>> {
  return sequenceShrink(function* (shrinkForest) {
    yield* shrinkList(shrinkForest);
    yield* shrinkOne(tree => tree.shrink(), shrinkForest);
  }, forest);
}

/**
 * Turn a list of trees in to a tree of lists, using the supplied function to
 * merge shrinking options.
 */
export function sequenceShrink<A>(
  f: (forest: Array<Tree<A>>) => IterableIterator<Array<Tree<A>>>,
  forest: Array<Tree<A>>
): Tree<Array<A>> {
  return new Tree({
    outcome: forest.map(t => t.outcome),
    shrink: function* () {
      for (let shrinkForest of f(forest)) {
        yield sequenceShrink(f, shrinkForest);
      }
    }
  });
}

/**
 * Shrink each of the elements in input list using the supplied shrinking
 * function.
 */
export function* shrinkOne<A>(
  f: (a: A) => IterableIterator<A>,
  arr: Array<A>
): IterableIterator<Array<A>> {
  if (arr.length > 0) {
    const x0 = _.head(arr);
    const xs0 = _.tail(arr);
    for (let x1 of f(x0)) {
      yield [x1].concat(xs0);
    }
    for (let xs1 of shrinkOne(f, xs0)) {
      yield [x0].concat(xs1);
    }
  }
}

/**
 * Produce a smaller permutation of the input list.
 */
export function* shrinkList<A>(arr: Array<A>): IterableIterator<Array<A>> {
  for (let k of halves(arr.length)) {
    yield* removes(k, arr);
  }
}

/**
 * Produces a list containing the results of halving a number over and over
 * again.
 *
 * > halves(30) == [30,15,7,3,1]
 * > halves(128) == [128,64,32,16,8,4,2,1]
 * > halves(-10) == [-10,-5,-2,-1]
 */
export function* halves(n: number): IterableIterator<number> {
  do {
    yield n;
    n = Math.trunc(n / 2);
  } while (n !== 0);
}

/**
 * Permutes a list by removing 'k' consecutive elements from it:
 *
 * > removes(2, [1,2,3,4,5,6]) == [[3,4,5,6],[1,2,5,6],[1,2,3,4]]
 */
export function* removes<A>(k: number, xs0: Array<A>): IterableIterator<Array<A>> {
  let n = xs0.length;
  let xs = xs0;
  let prevHd = new Array<A>();
  while (n >= k) {
    const hd = _.take(xs, k);
    const tl = _.drop(xs, k);
    yield prevHd.concat(tl);
    n = n - k;
    xs = tl;
    prevHd = prevHd.concat(hd);
  }
}
