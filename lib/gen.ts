import {Random} from 'lcg';

import {List} from './list';
import {Tree} from './tree';

export interface IGen<A> {
  runGen(rng: Random, size: number): {rng: Random, val: A};
}

export class Gen<A> {
  constructor(private _: IGen<A>) {}

  static of<A>(val: A): Gen<A> {
    return new Gen({runGen: rng => ({rng, val})});
  }

  map<B>(f: (a: A) => B): Gen<B> {
    return new Gen({
      runGen: (rng, size) => {
        let res = this._.runGen(rng, size);
        return {rng: res.rng, val: f(res.val)};
      }
    });
  }

  chain<B>(f: (a: A) => Gen<B>): Gen<B> {
    return new Gen({
      runGen: (rng, size) => {
        let res = this._.runGen(rng, size);
        return f(res.val)._.runGen(res.rng, size);
      }
    });
  }

  /**
   * Used to construct generators that depend on the size parameter.
   */
  static sized<A>(f: (size: number) => Gen<A>): Gen<A> {
    return new Gen({
      runGen: (rng, size) => f(size)._.runGen(rng, size)
    });
  }

  /**
   * Overrides the size parameter. Returns a generator which uses
   * the given size instead of the runtime-size parameter.
   */
  resize(size: number): Gen<A> {
    return new Gen({
      runGen: (rng) => this._.runGen(rng, size)
    });
  }

  /**
   * Adjust the size parameter, by transforming it with the given
   * function.
   */
  scale(f: (size: number) => number): Gen<A> {
    return Gen.sized(size => this.resize(size));
  }

  /**
   * Create a random generator which chooses uniformly distributed
   * integers from the closed interval `[a, b]`.
   */
  static chooseInt(min: number, max: number): Gen<number> {
    return new Gen({
      runGen: (rng, size) => ({rng: rng.next(), val: rng.getIntegerBetween(min, max)})
    });
  }

  /**
   * Create a random generator which generates an array of random values of a specified size.
   */
  asArrayWithLength(len: number): Gen<Array<A>> {
    return new Gen<Array<A>>({
      runGen: (rng, size) => {
        const arr = new Array<A>();
        while (arr.length < len) {
          const res = this._.runGen(rng, size);
          arr.push(res.val);
          rng = res.rng;
        }
        return {rng, val: arr};
      }
    });
  }

  /**
   * Create a random generator which generates an array of random values.
   */
  asArray(): Gen<Array<A>> {
    return Gen.sized(n => Gen.chooseInt(0, n).chain(len => this.asArrayWithLength(len)));
  }

  /**
   * Create a random generator which selects and executes a random generator from
   * a non-empty collection of random generators with uniform probability.
   */
  static oneOf<A>(choice: Gen<A>, choices: Array<Gen<A>>): Gen<A> {
    return Gen.chooseInt(0, choices.length).chain(idx => {
      if (idx < 1) {
        return choice;
      } else {
        return choices[idx - 1];
      }
    });
  }

  /**
   * Create a random generator which selects a value from a non-empty collection with
   * uniform probability.
   */
  static elements<A>(choice: A, choices: Array<A>): Gen<A> {
    return Gen.chooseInt(0, choices.length).map(idx => {
      if (idx < 1) {
        return choice;
      } else {
        return choices[idx - 1];
      }
    });
  }

  /**
   * A random generator which approximates a uniform random variable on `[0, 1]`.
   */
  static uniform(): Gen<number> {
    return new Gen({
      runGen: (rng) => ({rng: rng.next(), val: rng.get()})
    });
  }

  /**
   * Run a generator. The size passed to the generator is always 30;
   * if you want another size then you should explicitly use #resize.
   */
  generate(): A {
    return this._.runGen(new Random(5489), 30).val;
  }

  private static _traverseForest<A, B>(f: (a: A) => Gen<B>, forest: List<Tree<A>>): Gen<List<Tree<B>>> {
    return new Gen({
      runGen: (rng, size) => {
        const split = rng.split();
        return {
          rng: split[1],
          val: new List(function*() {
            let subrng = split[2];
            for (let tree of forest) {
              const res = Gen.traverseTree(f, tree)._.runGen(subrng, size);
              subrng = res.rng;
              yield res.val;
            }
          })
        };
      }
    });
  }

  static traverseTree<A, B>(f: (a: A) => Gen<B>, tree: Tree<A>): Gen<Tree<B>> {
    return f(tree.outcome).chain(b => {
      return Gen._traverseForest(f, tree.shrinks).map(shrinks => {
        return new Tree({
          outcome: b,
          shrinks: shrinks
        });
      });
    });
  }
}
