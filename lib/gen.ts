import {Random} from 'lcg';

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
   * Run a generator. The size passed to the generator is always 30;
   * if you want another size then you should explicitly use #resize.
   */
  generate(): A {
    return this._.runGen(new Random(5489), 30).val;
  }

  private static _traverseForest<A, B>(f: (a: A) => Gen<B>, forest: () => IterableIterator<Tree<A>>): Gen<() => IterableIterator<Tree<B>>> {
    return new Gen({
      runGen: (rng, size) => {
        const split = rng.split();
        return {
          rng: split[1],
          val: function*() {
            let subrng = split[2];
            for (let tree of forest()) {
              const res = Gen.traverseTree(f, tree)._.runGen(subrng, size);
              subrng = res.rng;
              yield res.val;
            }
          }
        };
      }
    });
  }

  static traverseTree<A, B>(f: (a: A) => Gen<B>, tree: Tree<A>): Gen<Tree<B>> {
    return f(tree.outcome).chain(b => {
      return Gen._traverseForest(f, () => tree.shrink()).map(shrink => {
        return new Tree({
          outcome: b,
          shrink: shrink
        });
      });
    });
  }
}
