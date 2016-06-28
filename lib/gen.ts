import {Tree} from './tree';
import {RandomState} from './random';

export interface IGen<A> {
  runGen(rng: RandomState, size: number): A;
}

export class Gen<A> {
  constructor(private _: IGen<A>) {}

  static of<A>(a: A): Gen<A> {
    return new Gen({runGen: () => a});
  }

  map<B>(f: (a: A) => B): Gen<B> {
    return new Gen({
      runGen: (chance, size) => f(this._.runGen(chance, size))
    });
  }

  chain<B>(f: (a: A) => Gen<B>): Gen<B> {
    return new Gen({
      runGen: (chance, size) => f(this._.runGen(chance, size))._.runGen(chance, size)
    });
  }

  /**
   * Used to construct generators that depend on the size parameter.
   */
  static sized<A>(f: (size: number) => Gen<A>): Gen<A> {
    return new Gen({
      runGen: (chance, size) => f(size)._.runGen(chance, size)
    });
  }

  /**
   * Overrides the size parameter. Returns a generator which uses
   * the given size instead of the runtime-size parameter.
   */
  resize(size: number): Gen<A> {
    return new Gen({
      runGen: (chance) => this._.runGen(chance, size)
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
    return this._.runGen(new RandomState(), 30);
  }

  private static _traverseForest<A, B>(f: (a: A) => Gen<B>, forest: () => IterableIterator<Tree<A>>): Gen<() => IterableIterator<Tree<B>>> {
    return new Gen({
      runGen: (chance, size) => {
        return function*() {
          for (let tree of forest()) {
            yield Gen.traverseTree(f, tree)._.runGen(chance, size);
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
