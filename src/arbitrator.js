'use strict';

const core = require('./core');

class Property {
  constructor(coreGen) {
    this._coreGen = coreGen;
  }

  check(opts) {
    return core.check(this._coreGen, opts);
  }

  static forAll(gen, fn) {
    return new Property(core.property([gen._coreGen], fn));
  }

  static forAll2(gen1, gen2, fn) {
    return new Property(core.property([gen1._coreGen, gen2._coreGen], fn));
  }

  static forAll3(gen1, gen2, gen3, fn) {
    return new Property(core.property([gen1._coreGen, gen2._coreGen, gen3._coreGen], fn));
  }

  static forAll4(gen1, gen2, gen3, gen4, fn) {
    return new Property(core.property([gen1._coreGen, gen2._coreGen, gen3._coreGen, gen4._coreGen], fn));
  }

  static forAll5(gen1, gen2, gen3, gen4, gen5, fn) {
    return new Property(core.property([gen1._coreGen, gen2._coreGen, gen3._coreGen, gen4._coreGen, gen5._coreGen], fn));
  }
}

class Gen {
  constructor(coreGen) {
    this._coreGen = coreGen;
  }

  sample(opts) {
    return core.sample(this._coreGen, opts);
  }

  suchThat(predicate, maxTries) {
    return new Gen(core.gen.suchThat(predicate, this._coreGen, maxTries));
  }

  notEmpty(maxTries) {
    return new Gen(core.gen.notEmpty(this._coreGen, maxTries));
  }

  map(f) {
    return new Gen(core.gen.map(f, this._coreGen));
  }

  chain(f) {
    return new Gen(core.gen.chain(this._coreGen, x => f(x)._coreGen));
  }

  static sized(sizedGenFn) {
    return new Gen(core.gen.sized(size => sizedGenFn(size)._coreGen));
  }

  withFixedSize(size) {
    return new Gen(core.gen.resized(size, this._coreGen));
  }

  whichNeverShrinks() {
    return new Gen(core.gen.noShrink(this._coreGen));
  }

  whichAlwaysShrinks() {
    return new Gen(core.gen.shrink(this._coreGen));
  }

  static oneOf(generators) {
    return new Gen(core.gen.oneOf(generators.map(gen => gen._coreGen)));
  }

  static oneOfWeighted(generators) {
    return new Gen(core.gen.oneOfWeighted(generators.map(weighted => {
      return [weighted[0], weighted[1]._coreGen];
    })));
  }

  static of(x) {
    return new Gen(core.gen.return(x));
  }

  static ofOneOf(xs) {
    return new Gen(core.gen.returnOneOf(xs));
  }

  static ofOneOfWeighted(generators) {
    return new Gen(core.gen.returnOneOfWeighted(generators));
  }

  array() {
    return new Gen(core.gen.array(this._coreGen));
  }

  arrayWithLength(len) {
    return new Gen(core.gen.array(this._coreGen, len));
  }

  arrayWithLengthBetween(min, max) {
    return new Gen(core.gen.array(this._coreGen, min, max));
  }

  object() {
    return new Gen(core.gen.object(this._coreGen));
  }

  objectWithKeys(keyGen) {
    return new Gen(core.gen.object(keyGen._coreGen, this._coreGen));
  }

  arrayOrObject() {
    return new Gen(core.gen.arrayOrObject(this._coreGen));
  }

  nested(collectionGenFn) {
    return new Gen(core.gen.nested(gen => {
      return collectionGenFn(new Gen(gen))._coreGen;
    }, this._coreGen));
  }

  static get NaN() {
    return new Gen(core.gen.NaN);
  }

  static get undefined() {
    return new Gen(core.gen.undefined);
  }

  static get null() {
    return new Gen(core.gen.null);
  }

  static get boolean() {
    return new Gen(core.gen.boolean);
  }

  static get int() {
    return new Gen(core.gen.int);
  }

  static get posInt() {
    return new Gen(core.gen.posInt);
  }

  static get negInt() {
    return new Gen(core.gen.negInt);
  }

  static get strictPosInt() {
    return new Gen(core.gen.strictPosInt);
  }

  static get strictNegInt() {
    return new Gen(core.gen.strictNegInt);
  }

  static intWithin(min, max) {
    return new Gen(core.gen.intWithin(min, max));
  }

  static get char() {
    return new Gen(core.gen.char);
  }

  static get asciiChar() {
    return new Gen(core.gen.asciiChar);
  }

  static get alphaNumChar() {
    return new Gen(core.gen.alphaNumChar);
  }

  static get string() {
    return new Gen(core.gen.string);
  }

  static get asciiString() {
    return new Gen(core.gen.asciiString);
  }

  static get alphaNumString() {
    return new Gen(core.gen.alphaNumString);
  }
}

module.exports = {
  Property: Property,
  Gen: Gen
}
