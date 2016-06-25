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

class Generator {
  constructor(coreGen) {
    this._coreGen = coreGen;
  }

  sample(opts) {
    return core.sample(this._coreGen, opts);
  }

  suchThat(predicate, maxTries) {
    return new Generator(core.gen.suchThat(predicate, this._coreGen, maxTries));
  }

  notEmpty(maxTries) {
    return new Generator(core.gen.notEmpty(this._coreGen, maxTries));
  }

  map(f) {
    return new Generator(core.gen.map(f, this._coreGen));
  }

  chain(f) {
    return new Generator(core.gen.chain(this._coreGen, x => f(x)._coreGen));
  }

  static sized(sizedGenFn) {
    return new Generator(core.gen.sized(size => sizedGenFn(size)._coreGen));
  }

  resized(size) {
    return new Generator(core.gen.resized(size, this._coreGen));
  }

  noShrink() {
    return new Generator(core.gen.noShrink(this._coreGen));
  }

  shrink() {
    return new Generator(core.gen.shrink(this._coreGen));
  }

  static oneOf(generators) {
    return new Generator(core.gen.oneOf(generators.map(gen => gen._coreGen)));
  }

  static oneOfWeighted(generators) {
    return new Generator(core.gen.oneOfWeighted(generators.map(weighted => {
      return [weighted[0], weighted[1]._coreGen];
    })));
  }

  static from(x) {
    return new Generator(core.gen.return(x));
  }

  static fromOneOf(xs) {
    return new Generator(core.gen.returnOneOf(xs));
  }

  static fromOneOfWeighted(generators) {
    return new Generator(core.gen.returnOneOfWeighted(generators));
  }

  array() {
    return new Generator(core.gen.array(this._coreGen));
  }

  arrayWithLength(len) {
    return new Generator(core.gen.array(this._coreGen, len));
  }

  arrayWithLengthBetween(min, max) {
    return new Generator(core.gen.array(this._coreGen, min, max));
  }

  object() {
    return new Generator(core.gen.object(this._coreGen));
  }

  objectWithKeys(keyGen) {
    return new Generator(core.gen.object(keyGen._coreGen, this._coreGen));
  }

  arrayOrObject() {
    return new Generator(core.gen.arrayOrObject(this._coreGen));
  }

  nested(collectionGenFn) {
    return new Generator(core.gen.nested(gen => {
      return collectionGenFn(new Generator(gen))._coreGen;
    }, this._coreGen));
  }

  static get NaN() {
    return new Generator(core.gen.NaN);
  }

  static get undefined() {
    return new Generator(core.gen.undefined);
  }

  static get null() {
    return new Generator(core.gen.null);
  }

  static get boolean() {
    return new Generator(core.gen.boolean);
  }

  static get int() {
    return new Generator(core.gen.int);
  }

  static get posInt() {
    return new Generator(core.gen.posInt);
  }

  static get negInt() {
    return new Generator(core.gen.negInt);
  }

  static get strictPosInt() {
    return new Generator(core.gen.strictPosInt);
  }

  static get strictNegInt() {
    return new Generator(core.gen.strictNegInt);
  }

  static intWithin(min, max) {
    return new Generator(core.gen.intWithin(min, max));
  }

  static get char() {
    return new Generator(core.gen.char);
  }

  static get asciiChar() {
    return new Generator(core.gen.asciiChar);
  }

  static get alphaNumChar() {
    return new Generator(core.gen.alphaNumChar);
  }

  static get string() {
    return new Generator(core.gen.string);
  }

  static get asciiString() {
    return new Generator(core.gen.asciiString);
  }

  static get alphaNumString() {
    return new Generator(core.gen.alphaNumString);
  }
}

module.exports = {
  Property: Property,
  Generator: Generator
}
