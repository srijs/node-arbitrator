export class List<T> implements Iterable<T> {
  constructor(private _run: () => IterableIterator<T>) {}

  static empty<T>(): List<T> {
    return List.fromArray([]);
  }

  static fromArray<T>(arr: Array<T>): List<T> {
    return new List(() => arr.values());
  }

  toArray(): Array<T> {
    return Array.from(this);
  }

  map<U>(f: (t: T) => U): List<U> {
    const list = this;
    return new List(function* () {
      for (let t of list._run()) {
        yield f(t);
      }
    });
  }

  flatMap<U>(f: (t: T) => List<U>): List<U> {
    const list = this;
    return new List(function* () {
      for (let t of list._run()) {
        yield* f(t)._run();
      }
    });
  }

  filter(pred: (t: T) => boolean): List<T> {
    const list = this;
    return new List(function* () {
      for (let t of list._run()) {
        if (pred(t)) {
          yield t;
        }
      }
    });
  }

  concat(other: List<T>): List<T> {
    const list = this;
    return new List(function* () {
      yield* list._run();
      yield* other._run();
    });
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this._run();
  }
}
