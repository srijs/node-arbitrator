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
  shrink(): IterableIterator<Tree<A>>;
}

export class Tree<A> implements ITree<A> {
  constructor(private _: ITree<A>) {}

  get outcome() {
    return this._.outcome;
  }

  shrink(): IterableIterator<Tree<A>> {
    return this._.shrink();
  }

  static of<A>(a: A): Tree<A> {
    return new Tree({
      outcome: a,
      shrink: () => new Array<Tree<A>>().values()
    });
  }

  map<B>(f: (a: A) => B): Tree<B> {
    const tree = this._;
    return new Tree({
      outcome: f(tree.outcome),
      shrink: function* () {
        for (let shrink of tree.shrink()) {
          yield shrink.map(f);
        }
      }
    });
  }

  flatMap<B>(f: (a: A) => Tree<B>): Tree<B> {
    const tree = this._;
    const nextTree = f(tree.outcome);
    return new Tree({
      outcome: nextTree._.outcome,
      shrink: function* () {
        for (let subTree of tree.shrink()) {
          yield subTree.flatMap(f);
        }
        yield* nextTree._.shrink();
      }
    });
  }

  static flatten<A>(tt: Tree<Tree<A>>): Tree<A> {
    return tt.flatMap(t => t);
  }

  /**
   * Fold over a tree.
   */
  foldTree<B, X>(f: (a: A, x: X) => B, g: (bs: IterableIterator<B>) => X): B {
    return f(this._.outcome, Tree.foldForest(f, g, this._.shrink()));
  }

  /**
   * Fold over a list of trees.
   */
  static foldForest<A, B, X>(
    f: (a: A, x: X) => B,
    g: (bs: IterableIterator<B>) => X,
    forest: IterableIterator<Tree<A>>
  ): X {
    function* map() {
      for (let tree of forest) {
          yield tree.foldTree(f, g);
      }
    }
    return g(map());
  }

  /**
   * Build a tree from an unfolding function and a seed value.
   */
  static unfoldTree<A, B>(
    f: (b: B) => A,
    g: (b: B) => IterableIterator<B>,
    x: B
  ): Tree<A> {
    return new Tree({
      outcome: f(x),
      shrink: () => Tree.unfoldForest(f, g, x)
    });
  }

  /**
   * Build a list of trees from an unfolding function and a seed value.
   */
  static unfoldForest<A, B>(
    f: (b: B) => A,
    g: (b: B) => IterableIterator<B>,
    x: B
  ): IterableIterator<Tree<A>> {
    function *map() {
      for (let b of g(x)) {
        yield Tree.unfoldTree(f, g, b);
      }
    }
    return map();
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
  expandTree(f: (a: A) => IterableIterator<A>): Tree<A> {
    const tree = this._;
    return new Tree({
      outcome: tree.outcome,
      shrink: function* () {
        for (let subTree of tree.shrink()) {
          yield subTree.expandTree(f);
        }
        yield *Tree.unfoldForest(x => x, f, tree.outcome);
      }
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
      shrink: () => Tree.filterForest(f, tree.shrink())
    });
  }

  /**
   * Recursively discard any trees whose outcome does not pass the predicate.
   */
  static filterForest<A>(
    f: (a: A) => boolean,
    forest: IterableIterator<Tree<A>>
  ): IterableIterator<Tree<A>> {
    function* map() {
      for (let tree of forest) {
        if (f(tree._.outcome)) {
          yield tree.filterTree(f);
        }
      }
    }
    return map();
  }
}
