const N = 624;
const M = 397;
const A = new Uint32Array([0x0, 0x9908b0df]);
const HI = 0x80000000;
const LO = 0x7fffffff;

export class RandomOutput {
  constructor(private _int: number) {}

  /**
   * Returns the output as a number in the [0,0xffffffff] interval
   */
  get asInt(): number {
    return this._int;
  }

  /**
   * Returns the output as a number in the [0,0x7fffffff] interval
   */
  get asInt31(): number {
    return this._int >>> 1;
  }

  /**
   * Returns the output as a number in the [0,1] real interval
   */
  get asInclFloat(): number {
    return this._int * (1.0 / 4294967295.0);
  }

  /**
   * Returns the output as a number in the [0,1) real interval
   */
  get asFloat(): number {
    return this._int * (1.0 / 4294967296.0);
  }

  /**
   * Returns the output as a number in the (0,1) real interval
   */
  get asExclFloat(): number {
    return (this._int + 0.5) * (1.0 / 4294967296.0);
  }
}

export class RandomState {
  private y = new Uint32Array(N);
  private index = N+1;

  constructor(seed?: number) {
    this._seed(seed || 5489);
  }

  private _seed(seed: number) {
    this.y[0] = seed >>> 0;
    for (this.index = 1; this.index < N; this.index++) {
      seed = this.y[this.index-1] ^ (this.y[this.index-1] >>> 30);
      this.y[this.index] = (((((seed & 0xffff0000) >>> 16) * 1812433253) << 16) + (seed & 0x0000ffff) * 1812433253) + this.index;
      this.y[this.index] >>>= 0;
    }
  }

  private _reseed() {
    let i = 0;
    let h: number;

    for (; i < N-M; i++) {
      h = (this.y[i] & HI) | (this.y[i+1] & LO);
      this.y[i] = this.y[i+M] ^ (h >>> 1) ^ A[h & 0x1];
    }

    for (; i < N-1; i++) {
      h = (this.y[i] & HI) | (this.y[i+1] & LO);
      this.y[i] = this.y[i+(M-N)] ^ (h >>> 1) ^ A[h & 0x1];
    }

    h = (this.y[N-1] & HI) | (this.y[0] & LO);
    this.y[N-1] = this.y[M-1] ^ (h >>> 1) ^ A[h & 0x1];
  }

  random(): RandomOutput {
    if (this.index >= N) {
      this._reseed();
      this.index = 0;
    }

    let e = this.y[this.index++];

    e ^= (e >>> 11);
    e ^= (e << 7) & 0x9d2c5680;
    e ^= (e << 15) & 0xefc60000;
    e ^= (e >>> 18);

    return new RandomOutput(e >>> 0);
  }
}
