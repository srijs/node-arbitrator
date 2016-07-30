import {List} from './list';
import {Tree} from './tree';
import {Gen} from './gen';
import * as shrink from './shrink';

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

  /**
   * Create an arbitrary integer which is chosen uniformly distributed
   * from the closed interval `[a, b]`.
   */
  static chooseInt(min: number, max: number): Arbitrary<number> {
    return Arbitrary.fromGenWithShrink(Gen.chooseInt(min, max), shrink.shrinkTowards(min));
  }

  /**
   * Create an arbitrary array of random values of a specified size.
   */
  asArrayWithLength(len: number): Arbitrary<Array<A>> {
    return new Arbitrary({
      generator: this._.generator.asArrayWithLength(len).map(shrink.sequenceShrinkOne)
    });
  }

  /**
   * Create an arbitrary array of random values.
   */
  asArray(): Arbitrary<Array<A>> {
    return new Arbitrary({
      generator: this._.generator.asArray().map(shrink.sequenceShrinkList)
    });
  }

  /**
   * Selects and execute an arbitrary from
   * a non-empty collection of arbitraries with uniform probability.
   */
  static oneOf<A>(choice: Arbitrary<A>, choices: Array<Arbitrary<A>>): Arbitrary<A> {
    return Arbitrary.chooseInt(0, choices.length).chain(idx => {
      if (idx < 1) {
        return choice;
      } else {
        return choices[idx - 1];
      }
    });
  }

  /**
   * Selects an arbitrary value from a non-empty collection with
   * uniform probability.
   */
  static elements<A>(choice: A, choices: Array<A>): Arbitrary<A> {
    return Arbitrary.chooseInt(0, choices.length).map(idx => {
      if (idx < 1) {
        return choice;
      } else {
        return choices[idx - 1];
      }
    });
  }
}
