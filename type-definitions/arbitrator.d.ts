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

  static forAll<A>(gen: Gen<A>, fn: (a: A) => boolean): Property;
  static forAll2<A, B>(gen1: Gen<A>, gen2: Gen<B>, fn: (a: A, b: B) => boolean): Property;
  static forAll3<A, B, C>(gen1: Gen<A>, gen2: Gen<B>, gen3: Gen<C>, fn: (a: A, b: B, c: C) => boolean): Property;
  static forAll4<A, B, C, D>(gen1: Gen<A>, gen2: Gen<B>, gen3: Gen<C>, gen4: Gen<D>, fn: (a: A, b: B, c: C, d: D) => boolean): Property;
  static forAll5<A, B, C, D, E>(gen1: Gen<A>, gen2: Gen<B>, gen3: Gen<C>, gen4: Gen<D>, gen5: Gen<E>, fn: (a: A, b: B, c: C, d: D, e: E) => boolean): Property;
}

/**
 * Gens of values.
 */
export class Gen<T> {

  /**
   * Handy tool for checking the output of your generators. Given a generator,
   * it returns an array of the results of the generator.
   *
   *     var results = Gen.int.sample({seed: 123});
   *     // [ 0, 1, 1, 2, 3, 3, -6, 1, -3, -8 ]
   *
   * If no options are provided, they default to:
   *
   *     {times: 10, maxSize: 200, seed: <Random>}
   *
   */
  sample(options?: Options): Array<T>;


  // Gen Builders
  // ------------------

  /**
   * Creates a new Gen which ensures that all values Generated adhere to
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
  ): Gen<T>;

  /**
   * Creates a new Gen of collections (Arrays or Objects) which are
   * not empty.
   */
  notEmpty(
    maxTries?: number
  ): Gen<T>;

  /**
   * Creates a new Gen which is the mapped result of another generator.
   *
   *     var genSquares = Gen.posInt.map(n => n * n);
   *
   */
  map<S>(
    mapper: (value: T) => S
  ): Gen<S>;

  /**
   * Creates a new Gen which passes the result of `generator` into the
   * `chain` function which should return a new Gen. This allows you to
   * create new Gens that depend on the values of other Gens.
   * For example, to create a Gen which first generates an array of
   * integers, and then chooses a random element from that array:
   *
   *     Gen.int.array().notEmpty().chain(Gen.fromOneOf)
   *
   */
  chain<T, S>(
    f: (value: T) => Gen<S>
  ): Gen<S>;

  /**
   * Creates a Gen that relies on a size. Size allows for the "shrinking"
   * of Gens. Larger "size" should result in a larger generated value.
   *
   * For example, `Gen.int` is shrinkable because it is implemented as:
   *
   *     Gen.int = Gen.sized(size => Gen.intWithin(-size, size))
   *
   */
  static sized<T>(sizedGenFn: (size: number) => Gen<T>): Gen<T>;

  /**
   * Given an explicit size, and a Gen that relies on size, returns a new
   * Gen which always uses the provided size and is not shrinkable.
   */
  withFixedSize(size: number): Gen<T>;

  /**
   * Given a shrinkable Gen, return a new Gen which will never
   * shrink. This can be useful when shrinking is taking a long time or is not
   * applicable to the domain.
   */
  whichNeverShrinks(): Gen<T>;

  /**
   * Given a shrinkable Gen, return a new Gen which will always
   * consider shrinking, even if the property passes (up to one
   * additional level).
   */
  whichAlwaysShrinks(): Gen<T>;


  // Simple Gens
  // -----------------

  /**
   * Creates a Gen which will generate values from one of the
   * provided generators.
   *
   *     var numOrBool = Gen.oneOf([Gen.int, Gen.boolean])
   *
   */
  static oneOf<T>(generators: Gen<T>[]): Gen<T>;

  /**
   * Similar to `oneOf`, except provides probablistic "weights" to
   * each generator.
   *
   *     var numOrRarelyBool = Gen.oneOf([[99, Gen.int], [1, Gen.boolean]])
   */
  static oneOfWeighted<T>(
    generators: Array<[number, Gen<T>]>[]
  ): Gen<T>;

  /**
   * Creates a Gen which will always generate the provided value.
   *
   *     var alwaysThree = Gen.of(3)
   *
   */
  static of<T>(value: T): Gen<T>;

  /**
   * Creates a Gen which will always generate one of the provided values.
   *
   *     var alphabetSoup = Gen.ofOneOf(['a', 'b', 'c'])
   *
   */
  static ofOneOf<T>(values: T[]): Gen<T>;

  /**
   * Similar to `ofOneOf`, except provides probablistic "weights" to
   * each generator.
   *
   *     var fizzBuzz = Gen.ofOneOfWeighted([[1, 'fizz'], [5, 'buzz']])
   */
  static ofOneOfWeighted<T>(
    generators: Array<[number, T]>[]
  ): Gen<T>;


  // Collections: Arrays and Objects
  // -------------------------------

  array(): Gen<Array<T>>;
  arrayWithLength(len: number): Gen<Array<T>>;
  arrayWithLengthBetween(min: number, max: number): Gen<Array<T>>;

  object(): Gen<{[key: string]: T}>;
  objectWithKeys(keyGen: Gen<string>): Gen<{[key: string]: T}>;

  arrayOrObject(): Gen<{[key: string]: T} | T[]>;

  /**
   * Given a function which takes a generator and returns a generator (such as
   * `Gen.array` or `Gen.object`), and a Gen to use as values, creates
   * potentially nested values.
   *
   *     Gen.int.nested(Gen.array)
   *     // [ [ 0, [ -2 ], 1, [] ]
   *
   */
  nested<C>(
    collectionGenFn: (valueGen: Gen<T>) => Gen<C>
  ): Gen<C>;


  // JS Primitives
  // -------------

  static NaN: Gen<number>;
  static undefined: Gen<void>;
  static null: Gen<void>;
  static boolean: Gen<boolean>;

  /**
   * A sized, shrinkable generator producing integers.
   */
  static int: Gen<number>;

  /**
   * Only positive integers (0 through +Inf)
   */
  static posInt: Gen<number>;

  /**
   * Only negative integers (0 through -Inf)
   */
  static negInt: Gen<number>;

  /**
   * Only strictly positive integers (1 through +Inf)
   */
  static strictPosInt: Gen<number>;

  /**
   * Only strictly negative integers (1 through -Inf)
   */
  static strictNegInt: Gen<number>;

  /**
   * Generates an integer within the provided (inclusive) range.
   * The resulting Gen is not shrinkable.
   */
  static intWithin(min: number, max: number): Gen<number>;

  /**
   * Generates ascii characters (code 0 through 255).
   */
  static char: Gen<string>;

  /**
   * Generates printable ascii characters (code 32 through 126).
   */
  static asciiChar: Gen<string>;

  /**
   * Generates ascii characters matching /a-zA-Z0-9/
   */
  static alphaNumChar: Gen<string>;

  /**
   * Generates strings. Note: strings of arbitrary characters may result in
   * Unicode characters and non-printable characters.
   */
  static string: Gen<string>;

  /**
   * Generates strings of printable Ascii characters.
   */
  static asciiString: Gen<string>;

  /**
   * Generates strings of [a-zA-Z0-9]*
   */
  static alphaNumString: Gen<string>;
}
