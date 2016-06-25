'use strict';

describe('value generator', () => {
  const arbitrator = require('../dist/arbitrator.js');
  const Generator = arbitrator.Generator;
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
    const vals = Generator.NaN.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return isNaN(value) && value !== value;
    });
  });

  it('generates undefined', () => {
    const vals = Generator.undefined.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return value === undefined && value === value;
    });
  });

  it('generates null', () => {
    const vals = Generator.null.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return value === null && value === value;
    });
  });

  it('generates booleans', () => {
    const vals = Generator.boolean.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return (value === true || value === false) && value === value;
    });
  });

  it('generates ints', () => {
    const vals = Generator.int.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return Math.floor(value) === value && !isNaN(value);
    });
  });

  it('generates positive ints', () => {
    const vals = Generator.posInt.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return Math.floor(value) === value && !isNaN(value) && value >= 0;
    });
  });

  it('generates negative ints', () => {
    const vals = Generator.negInt.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return Math.floor(value) === value && !isNaN(value) && value <= 0;
    });
  });

  it('generates strictly positive ints', () => {
    const vals = Generator.strictPosInt.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return Math.floor(value) === value && !isNaN(value) && value > 0;
    });
  });

  it('generates strictly negative ints', () => {
    const vals = Generator.strictNegInt.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return Math.floor(value) === value && !isNaN(value) && value < 0;
    });
  });

  it('generates ints in a range', () => {
    const vals = Generator.intWithin(100, 200).sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return Math.floor(value) === value && !isNaN(value) &&
        value >= 100 && value <= 200;
    });
  });

  it('generates strings', () => {
    const vals = Generator.string.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return typeof value === 'string' && JSON.parse(JSON.stringify(value)) === value;
    });
  });

  var ALPHA_NUM_RX = /^[a-zA-Z0-9]*$/;

  it('generates alphanum strings', () => {
    const vals = Generator.alphaNumString.sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return typeof value === 'string' && ALPHA_NUM_RX.test(value);
    });
  });

  it('generates arrays', () => {
    const vals = Generator.null.array().sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return Array.isArray(value) &&
        value.length >= 0 && value.every(x => x === null);
    });
  });

  it('generates arrays of a certain length', () => {
    const vals = Generator.null.arrayWithLength(3).sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return Array.isArray(value) &&
        value.length === 3 && value.every(x => x === null);
    });
  });

  it('generates arrays within a length range', () => {
    const vals = Generator.null.arrayWithLengthBetween(3, 5).sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return Array.isArray(value) &&
        value.length >= 3 && value.length <= 5 &&
        value.every(x => x === null);
    });
  });

  it('generates objects', () => {
    const vals = Generator.null.object().sample({times: 50});
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
    const vals = Generator.null.objectWithKeys(Generator.alphaNumString).sample({times: 50});
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
    const vals = Generator.int.nested(x => x.array()).sample({times: 20});
    expect(vals.length).toBe(20);
    function isNestedArrayOfInt(arrayOrInt) {
      return typeof arrayOrInt === 'number' ||
        (arrayOrInt.every && arrayOrInt.every(isNestedArrayOfInt));
    }
    expect(vals).toAllPass(isNestedArrayOfInt);
  });

});
