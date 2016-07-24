import {List} from './list';
import {Tree} from './tree';
import {Gen} from './gen';

export interface IArbitrary<A> {
  generator: Gen<Tree<A>>;
}

export class Arbitrary<A> {
  constructor(private _: IArbitrary<A>) {}

  static of<A>(a: A): Arbitrary<A> {
    return new Arbitrary({
      generator: Gen.of(Tree.of(a))
    });
  }

  map<B>(f: (a: A) => B): Arbitrary<B> {
    return new Arbitrary({
      generator: this._.generator.map(tree => tree.map(f))
    });
  }

  chain<B>(f: (a: A) => Arbitrary<B>): Arbitrary<B> {
    return new Arbitrary({
      generator: this._.generator
        .chain(tree => Gen.traverseTree(a => f(a)._.generator, tree))
        .map(Tree.flatten)
    });
  }

  static fromGenWithShrink<A>(gen: Gen<A>, shrink: (a: A) => List<A>): Arbitrary<A> {
    return new Arbitrary({
      generator: gen.map(a => Tree.unfoldTree(x => x, shrink, a))
    });
  }

  static fromGen<A>(gen: Gen<A>): Arbitrary<A> {
    return new Arbitrary({
      generator: gen.map(Tree.of)
    });
  }
}
