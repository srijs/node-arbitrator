'use strict';

describe('check', () => {
  const arbitrator = require('../dist/arbitrator.js');
  const Gen = arbitrator.Gen;
  const Property = arbitrator.Property;

  it('checks true properties', () => {
    const seedVal = 1234567890;
    let calls = 0;

    const result = Property.forAll(Gen.posInt, (intValue) => {
      calls++;
      return intValue >= 0;
    }).check({times: 100, seed: seedVal});

    expect(calls).toBe(100);
    expect(result.result).toBe(true);
    expect(result['num-tests']).toBe(100);
    expect(result.seed).toBe(seedVal);
  });

  it('checks false properties', () => {
    const seedVal = 1234567890;
    let calls = 0;

    const result = Property.forAll(Gen.posInt, (intValue) => {
        calls++;
        return intValue >= 0 && intValue < 42;
      }
    ).check({times: 100, seed: seedVal});

    expect(calls).toBeLessThan(100);
    expect(calls).toBe(result['num-tests'] + result.shrunk['total-nodes-visited']);
    expect(result.result).toBe(false);
    expect(result.fail).toEqual(jasmine.any(Array))
    expect(result.fail.length).toBe(1);
    expect(result.shrunk).toEqual(jasmine.any(Object));
    expect(result.shrunk.smallest).toEqual([42]);
  });

});
