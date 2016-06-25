/**
 * Optional arguments to `check` and `sample`.
 */
export interface Options {

  // Number of times to run `check` or `sample`.
  times?: number;

  // The maximum "size" to provide to sized generators. Default: 200
  maxSize?: number;

  // The seed to use for the random number generator. Default: Random
  seed?: number;
}

/**
 * The result of running `check`.
 */
export interface Result {

  // True of the check passed.
  result: boolean;

  // The number of generated checks ran.
  'num-tests': number;

  // The seed used for this check.
  seed?: number;

  // The arguments generated when and if this check failed.
  fail?: Array<any>;

  // The size used when and if this check failed
  'failing-size'?: number;

  /**
   * When a check fails, the failing arguments shrink to find the smallest
   * value that fails.
   */
  shrunk?: {
    // True if the check passed, otherwise false.
    result: boolean;

    // The smallest arguments with this result.
    smallest: Array<any>;

    // The depth of the shrunk result.
    depth: number;

    // The number of nodes shrunk to result in this smallest failing value.
    'total-nodes-visited': number;
  }
}

export class Property {
  /**
   * Given a property to check, return the result of the check.
   *
   * If no options are provided, they default to:
   *
   *     {times: 100, maxSize: 200, seed: <Random>}
   *
   */
  check(options?: Options): Result;

  static forAll<A>(gen: Generator<A>, fn: (a: A) => boolean): Property;
  static forAll2<A, B>(gen1: Generator<A>, gen2: Generator<B>, fn: (a: A, b: B) => boolean): Property;
  static forAll3<A, B, C>(gen1: Generator<A>, gen2: Generator<B>, gen3: Generator<C>, fn: (a: A, b: B, c: C) => boolean): Property;
  static forAll4<A, B, C, D>(gen1: Generator<A>, gen2: Generator<B>, gen3: Generator<C>, gen4: Generator<D>, fn: (a: A, b: B, c: C, d: D) => boolean): Property;
  static forAll5<A, B, C, D, E>(gen1: Generator<A>, gen2: Generator<B>, gen3: Generator<C>, gen4: Generator<D>, gen5: Generator<E>, fn: (a: A, b: B, c: C, d: D, e: E) => boolean): Property;
}

/**
 * Generators of values.
 */
export class Generator<T> {

  /**
   * Handy tool for checking the output of your generators. Given a generator,
   * it returns an array of the results of the generator.
   *
   *     var results = sample(gen.int, { seed: 123 });
   *     // [ 0, 1, 1, 2, 3, 3, -6, 1, -3, -8 ]
   *
   * If no options are provided, they default to:
   *
   *     {times: 10, maxSize: 200, seed: <Random>}
   *
   */
  sample(options?: Options): Array<T>;


  // Generator Builders
  // ------------------

  /**
   * Creates a new Generator which ensures that all values Generated adhere to
   * the given `predicate`.
   *
   * Care is needed to ensure there is a high chance the predicate will pass.
   * By default, `suchThat` will try 10 times to generate a satisfactory
   * value. If no value adheres to the predicate, an exception will throw. You
   * can pass an optional third argument to change the number of times tried.
   * Note that each retry will increase the size of the generator.
   */
  suchThat(
    predicate: (value: T) => boolean,
    maxTries?: number // default 10
  ): Generator<T>;

  /**
   * Creates a new Generator of collections (Arrays or Objects) which are
   * not empty.
   */
  notEmpty(
    maxTries?: number
  ): Generator<T>;

  /**
   * Creates a new Generator which is the mapped result of another generator.
   *
   *     var genSquares = Generator.posInt.map(n => n * n);
   *
   */
  map<S>(
    mapper: (value: T) => S
  ): Generator<S>;

  /**
   * Creates a new Generator which passes the result of `generator` into the
   * `chain` function which should return a new Generator. This allows you to
   * create new Generators that depend on the values of other Generators.
   * For example, to create a Generator which first generates an array of
   * integers, and then chooses a random element from that array:
   *
   *     Generator.int.array().notEmpty().chain(Generator.fromOneOf)
   *
   */
  chain<T, S>(
    f: (value: T) => Generator<S>
  ) => Generator<S>;

  /**
   * Creates a Generator that relies on a size. Size allows for the "shrinking"
   * of Generators. Larger "size" should result in a larger generated value.
   *
   * For example, `Generator.int` is shrinkable because it is implemented as:
   *
   *     Generator.int = Generator.sized(size => Generator.intWithin(-size, size))
   *
   */
  static sized<T>(sizedGenFn: (size: number) => Generator<T>): Generator<T>;

  /**
   * Given an explicit size, and a Generator that relies on size, returns a new
   * Generator which always uses the provided size and is not shrinkable.
   */
  resized(size: number): Generator<T>;

  /**
   * Given a shrinkable Generator, return a new Generator which will never
   * shrink. This can be useful when shrinking is taking a long time or is not
   * applicable to the domain.
   */
  noShrink(): Generator<T>;

  /**
   * Given a shrinkable Generator, return a new Generator which will always
   * consider shrinking, even if the property passes (up to one
   * additional level).
   */
  shrink(): Generator<T>;


  // Simple Generators
  // -----------------

  /**
   * Creates a Generator which will generate values from one of the
   * provided generators.
   *
   *     var numOrBool = Generator.oneOf([Generator.int, Generator.boolean])
   *
   */
  static oneOf<T>(generators: Generator<T>[]) => Generator<T>;

  /**
   * Similar to `oneOf`, except provides probablistic "weights" to
   * each generator.
   *
   *     var numOrRarelyBool = Generator.oneOf([[99, Generator.int], [1, Generator.boolean]])
   */
  static oneOfWeighted<T>(
    generators: Array<[number, Generator<T>]>[]
  ): Generator<T>;

  /**
   * Creates a Generator which will always generate the provided value.
   *
   *     var alwaysThree = Generator.from(3)
   *
   */
  static from<T>(value: T): Generator<T>;

  /**
   * Creates a Generator which will always generate one of the provided values.
   *
   *     var alphabetSoup = Generator.fromOneOf(['a', 'b', 'c'])
   *
   */
  static fromOneOf<T>(values: T[]): Generator<T>;

  /**
   * Similar to `fromOneOf`, except provides probablistic "weights" to
   * each generator.
   *
   *     var fizzBuzz = Generator.fromOneOfWeighted([[1, 'fizz'], [5, 'buzz']])
   */
  static fromOneOfWeighted<T>(
    generators: Array<[number, T]>[]
  ): Generator<T>;


  // Collections: Arrays and Objects
  // -------------------------------

  array(): Generator<Array<T>>;
  arrayWithLength(len: number): Generator<Array<T>>;
  arrayWithLengthBetween(min: number, max: number): Generator<Array<T>>;

  object(): Generator<{[key: string]: T}>;
  objectWithKeys(keyGen: Generator<string>): Generator<{[key: string]: T}>;

  arrayOrObject(): Generator<{[key: string]: T} | T[]>;

  /**
   * Given a function which takes a generator and returns a generator (such as
   * `Generator.array` or `Generator.object`), and a Generator to use as values, creates
   * potentially nested values.
   *
   *     Generator.int.nested(Generator.array)
   *     // [ [ 0, [ -2 ], 1, [] ]
   *
   */
  nested<C>(
    collectionGenFn: (valueGen: Generator<T>) => Generator<C>
  ): Generator<C>;


  // JS Primitives
  // -------------

  static NaN: Generator<number>;
  static undefined: Generator<void>;
  static null: Generator<void>;
  static boolean: Generator<boolean>;

  /**
   * A sized, shrinkable generator producing integers.
   */
  static int: Generator<number>;

  /**
   * Only positive integers (0 through +Inf)
   */
  static posInt: Generator<number>;

  /**
   * Only negative integers (0 through -Inf)
   */
  static negInt: Generator<number>;

  /**
   * Only strictly positive integers (1 through +Inf)
   */
  static strictPosInt: Generator<number>;

  /**
   * Only strictly negative integers (1 through -Inf)
   */
  static strictNegInt: Generator<number>;

  /**
   * Generates an integer within the provided (inclusive) range.
   * The resulting Generator is not shrinkable.
   */
  static intWithin(min: number, max: number): Generator<number>;

  /**
   * Generates ascii characters (code 0 through 255).
   */
  static char: Generator<string>;

  /**
   * Generates printable ascii characters (code 32 through 126).
   */
  static asciiChar: Generator<string>;

  /**
   * Generates ascii characters matching /a-zA-Z0-9/
   */
  static alphaNumChar: Generator<string>;

  /**
   * Generates strings. Note: strings of arbitrary characters may result in
   * Unicode characters and non-printable characters.
   */
  static string: Generator<string>;

  /**
   * Generates strings of printable Ascii characters.
   */
  static asciiString: Generator<string>;

  /**
   * Generates strings of [a-zA-Z0-9]*
   */
  static alphaNumString: Generator<string>;
}
