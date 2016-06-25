'use strict';

describe('gen builders', () => {
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
      },
      toBeApprx(value, epsilon) {
        epsilon = epsilon || 0.333;
        return Math.abs(this.actual - value) < epsilon;
      }
    })
  });

  it('generates an exact value', () => {
    const vals = Generator.from('wow').sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => value === 'wow');
  });

  it('generates one of a collection of values', () => {
    const vals = Generator.fromOneOf(['foo', 'bar', 'baz']).sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      return value === 'foo' || value === 'bar' || value === 'baz';
    });
  });

  it('generates one of other generators', () => {
    const vals = Generator.oneOf([Generator.int, Generator.boolean]).sample({times: 100});
    expect(vals.length).toBe(100);
    expect(vals).toAllPass((value) => {
      const type = typeof value;
      return type === 'number' || type === 'boolean';
    });
  });

  it('generates one of other generators in a weighted fashion', () => {
    const vals = Generator.fromOneOfWeighted([[2, 'foo'], [1, 'bar'], [6, 'baz']]).sample({times: 10000});
    expect(vals.length).toBe(10000);
    expect(vals).toAllPass((value) => {
      const type = typeof value;
      return value === 'foo' || value === 'bar' || value === 'baz';
    });
    const fooCount = vals.reduce((count, val) => count + (val === 'foo'), 0);
    const barCount = vals.reduce((count, val) => count + (val === 'bar'), 0);
    const bazCount = vals.reduce((count, val) => count + (val === 'baz'), 0);
    expect(fooCount / barCount).toBeApprx(2);
    expect(bazCount / barCount).toBeApprx(6);
    expect(bazCount / fooCount).toBeApprx(3);
  });

  it('generates one of other generators in a weighted fashion', () => {
    const vals = Generator.oneOfWeighted([[2, Generator.int], [1, Generator.boolean]]).sample({times: 10000});
    expect(vals.length).toBe(10000);
    expect(vals).toAllPass((value) => {
      const type = typeof value;
      return type === 'number' || type === 'boolean';
    });
    const intCount = vals.reduce((count, val) => count + (typeof val === 'number'), 0);
    const boolCount = vals.reduce((count, val) => count + (typeof val === 'boolean'), 0);
    expect(intCount / boolCount).toBeApprx(2);
  });

});
