import {List} from './list';

/**
 * A rose tree which represents a random generated outcome, and all the ways
 * in which it can be made smaller.
 */
export interface ITree<A> {
  /**
   * The generated outcome.
   */
  outcome: A;

  /**
   * All the possible shrinks of this outcome. This should be ordered
   * smallest to largest as if property still fails with the first shrink in
   * the list then we will commit to that path and none of the others will
   * be tried (i.e. there is no backtracking).
   */
  shrinks: List<Tree<A>>;
}

export class Tree<A> implements ITree<A> {
  constructor(private _: ITree<A>) {}

  get outcome() {
    return this._.outcome;
  }

  get shrinks(): List<Tree<A>> {
    return this._.shrinks;
  }

  static of<A>(a: A): Tree<A> {
    return new Tree({
      outcome: a,
      shrinks: List.empty<Tree<A>>()
    });
  }

  map<B>(f: (a: A) => B): Tree<B> {
    return new Tree({
      outcome: f(this.outcome),
      shrinks: this.shrinks.map(t => t.map(f))
    });
  }

  flatMap<B>(f: (a: A) => Tree<B>): Tree<B> {
    const next = f(this.outcome);
    return new Tree({
      outcome: next.outcome,
      shrinks: this.shrinks.map(t => t.flatMap(f)).concat(next.shrinks)
    });
  }

  static flatten<A>(tt: Tree<Tree<A>>): Tree<A> {
    return tt.flatMap(t => t);
  }

  /**
   * Fold over a tree.
   */
  foldTree<B, X>(f: (a: A, x: X) => B, g: (bs: List<B>) => X): B {
    return f(this._.outcome, Tree.foldForest(f, g, this.shrinks));
  }

  /**
   * Fold over a list of trees.
   */
  static foldForest<A, B, X>(
    f: (a: A, x: X) => B,
    g: (bs: List<B>) => X,
    forest: List<Tree<A>>
  ): X {
    return g(forest.map(t => t.foldTree(f, g)));
  }

  /**
   * Build a tree from an unfolding function and a seed value.
   */
  static unfoldTree<A, B>(
    f: (b: B) => A,
    g: (b: B) => List<B>,
    x: B
  ): Tree<A> {
    return new Tree({
      outcome: f(x),
      shrinks: Tree.unfoldForest(f, g, x)
    });
  }

  /**
   * Build a list of trees from an unfolding function and a seed value.
   */
  static unfoldForest<A, B>(
    f: (b: B) => A,
    g: (b: B) => List<B>,
    x: B
  ): List<Tree<A>> {
    return g(x).map(b => Tree.unfoldTree(f, g, b));
  }

  /**
   * Apply an additional unfolding function to an existing tree.
   *
   * The root outcome remains intact, only the shrinks are affected, this
   * applies recursively, so shrinks can only ever be added using this
   * function.
   *
   * If you want to replace the shrinks altogether, try:
   *
   * > oldTree.extract().unfoldTree(f)
   */
  expandTree(f: (a: A) => List<A>): Tree<A> {
    return new Tree({
      outcome: this.outcome,
      shrinks: this.shrinks.map(t => t.expandTree(f))
        .concat(Tree.unfoldForest(x => x, f, this.outcome))
    });
  }

  /**
   * Recursively discard any shrinks whose outcome does not pass the predicate.
   *
   * Note that the root outcome can never be discarded.
   */
  filterTree(f: (a: A) => boolean): Tree<A> {
    const tree = this._;
    return new Tree({
      outcome: tree.outcome,
      shrinks: tree.shrinks.filter(t => f(t.outcome))
    });
  }
}
