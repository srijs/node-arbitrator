'use strict';

describe('value generator', () => {
  const arbitrator = require('../dist/arbitrator.js');
  const Gen = arbitrator.Gen;
  const Property = arbitrator.Property;

  beforeEach(function () {
    this.addMatchers({
      toAllPass(predicate) {
        let failedValue;
        const pass = this.actual.every((value) => {
          if (predicate(value)) {
            return true;
          } else {
            failedValue = value;
          }
        });
        this.message = () => {
          return 'Expected ' + JSON.stringify(failedValue) + ' to pass ' + predicate;
        };
        return pass;
      }
    })
  });

  it('generates NaN', () => {
    const vals = Gen.NaN.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return isNaN(value) && value !== value;
    });
  });

  it('generates undefined', () => {
    const vals = Gen.undefined.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return value === undefined && value === value;
    });
  });

  it('generates null', () => {
    const vals = Gen.null.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return value === null && value === value;
    });
  });

  it('generates booleans', () => {
    const vals = Gen.boolean.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return (value === true || value === false) && value === value;
    });
  });

  it('generates ints', () => {
    const vals = Gen.int.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return Math.floor(value) === value && !isNaN(value);
    });
  });

  it('generates positive ints', () => {
    const vals = Gen.posInt.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return Math.floor(value) === value && !isNaN(value) && value >= 0;
    });
  });

  it('generates negative ints', () => {
    const vals = Gen.negInt.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return Math.floor(value) === value && !isNaN(value) && value <= 0;
    });
  });

  it('generates strictly positive ints', () => {
    const vals = Gen.strictPosInt.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return Math.floor(value) === value && !isNaN(value) && value > 0;
    });
  });

  it('generates strictly negative ints', () => {
    const vals = Gen.strictNegInt.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return Math.floor(value) === value && !isNaN(value) && value < 0;
    });
  });

  it('generates ints in a range', () => {
    const vals = Gen.intWithin(100, 200).sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return Math.floor(value) === value && !isNaN(value) &&
        value >= 100 && value <= 200;
    });
  });

  it('generates strings', () => {
    const vals = Gen.string.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return typeof value === 'string' && JSON.parse(JSON.stringify(value)) === value;
    });
  });

  var ALPHA_NUM_RX = /^[a-zA-Z0-9]*$/;

  it('generates alphanum strings', () => {
    const vals = Gen.alphaNumString.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return typeof value === 'string' && ALPHA_NUM_RX.test(value);
    });
  });

  it('generates arrays', () => {
    const vals = Gen.null.array().sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return Array.isArray(value) &&
        value.length >= 0 && value.every(x => x === null);
    });
  });

  it('generates arrays of a certain length', () => {
    const vals = Gen.null.arrayWithLength(3).sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return Array.isArray(value) &&
        value.length === 3 && value.every(x => x === null);
    });
  });

  it('generates arrays within a length range', () => {
    const vals = Gen.null.arrayWithLengthBetween(3, 5).sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return Array.isArray(value) &&
        value.length >= 3 && value.length <= 5 &&
        value.every(x => x === null);
    });
  });

  it('generates objects', () => {
    const vals = Gen.null.object().sample({times: 50});
    expect(vals.length).toBe(50);
    expect(vals).toAllPass((value) => {
      const keys = Object.keys(value);
      return value.constructor === Object &&
        keys.length >= 0 &&
        keys.every((key) => {
          return typeof key === 'string' && value[key] === null;
        });
    });
  });

  it('generates objects with alphanum keys', () => {
    const vals = Gen.null.objectWithKeys(Gen.alphaNumString).sample({times: 50});
    expect(vals.length).toBe(50);
    expect(vals).toAllPass((value) => {
      const keys = Object.keys(value);
      return value.constructor === Object &&
        keys.length >= 0 &&
        keys.every((key) => {
          return typeof key === 'string' && ALPHA_NUM_RX.test(key) && value[key] === null;
        });
    });
  });

  it('generates nested collections', () => {
    const vals = Gen.int.nested(x => x.array()).sample({times: 20});
    expect(vals.length).toBe(20);
    function isNestedArrayOfInt(arrayOrInt) {
      return typeof arrayOrInt === 'number' ||
        (arrayOrInt.every && arrayOrInt.every(isNestedArrayOfInt));
    }
    expect(vals).toAllPass(isNestedArrayOfInt);
  });

});
