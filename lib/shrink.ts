import * as _ from 'lodash';

import {List} from './list';
import {Tree} from './tree';

/**
 * Shrink an integral by edging towards a destination number.
 */
export function shrinkTowards(destination: number): (x: number) => List<number> {
  return function (x) {
    if (destination === x) {
      return List.empty<number>();
    }
    const diff = Math.trunc(x / 2) - Math.trunc(destination / 2);
    return consNub(destination, halves(diff).map(k => x - k));
  };
}

function consNub<A>(
  x: A,
  xs: List<A>
): List<A> {
  return new List(function* () {
    const gen = xs[Symbol.iterator]();
    const next = gen.next();
    if (next.done) {
      yield x;
    } else if (x === next.value) {
      yield next.value;
      yield* gen;
    } else {
      yield x;
      yield next.value;
      yield* gen;
    }
  });
}

/**
 * Turn a list of trees in to a tree of lists, opting to shrink only the
 * elements of the list (i.e. the size of the list will always be the same).
 */
export function sequenceShrinkOne<A>(
  forest: Array<Tree<A>>
): Tree<Array<A>> {
  return sequenceShrink(shrinkForest => shrinkOne(tree => tree.shrinks, shrinkForest), forest);
}

/**
 * Turn a list of trees in to a tree of lists, opting to shrink both the list
 * itself and the elements in the list during traversal.
 */
export function sequenceShrinkList<A>(
  forest: Array<Tree<A>>
): Tree<Array<A>> {
  return sequenceShrink((shrinkForest) => {
    return shrinkList(shrinkForest).concat(shrinkOne(tree => tree.shrinks, shrinkForest));
  }, forest);
}

/**
 * Turn a list of trees in to a tree of lists, using the supplied function to
 * merge shrinking options.
 */
export function sequenceShrink<A>(
  f: (forest: Array<Tree<A>>) => List<Array<Tree<A>>>,
  forest: Array<Tree<A>>
): Tree<Array<A>> {
  return new Tree({
    outcome: forest.map(t => t.outcome),
    shrinks: f(forest).map(t => sequenceShrink(f, t))
  });
}

/**
 * Shrink each of the elements in input list using the supplied shrinking
 * function.
 */
export function shrinkOne<A>(
  f: (a: A) => List<A>,
  arr: Array<A>
): List<Array<A>> {
  if (arr.length === 0) {
    return List.empty<Array<A>>();
  }
  const x0 = _.head(arr);
  const xs0 = _.tail(arr);
  const fst = f(x0).map(x1 => [x1].concat(xs0));
  const snd = shrinkOne(f, xs0).map(xs1 => [x0].concat(xs1));
  return fst.concat(snd);
}

/**
 * Produce a smaller permutation of the input list.
 */
export function shrinkList<A>(arr: Array<A>): List<Array<A>> {
  return halves(arr.length).flatMap(k => removes(k, arr));
}

/**
 * Produces a list containing the results of halving a number over and over
 * again.
 *
 * > halves(30) == [30,15,7,3,1]
 * > halves(128) == [128,64,32,16,8,4,2,1]
 * > halves(-10) == [-10,-5,-2,-1]
 */
export function halves(n: number): List<number> {
  return new List(function* () {
    do {
      yield n;
      n = Math.trunc(n / 2);
    } while (n !== 0);
  });
}

/**
 * Permutes a list by removing 'k' consecutive elements from it:
 *
 * > removes(2, [1,2,3,4,5,6]) == [[3,4,5,6],[1,2,5,6],[1,2,3,4]]
 */
export function removes<A>(k: number, xs0: Array<A>): List<Array<A>> {
  return new List(function* () {
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
  });
}
