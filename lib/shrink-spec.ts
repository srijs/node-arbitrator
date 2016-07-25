import {removes, halves} from './shrink';

describe('Shrink', () => {

  describe('removes', () => {
    it('permutes a list by removing k consecutive elements from it', () => {
      expect(removes(2, [1,2,3,4,5,6]).toArray())
        .toEqual([[3,4,5,6],[1,2,5,6],[1,2,3,4]]);
    });
  });

  describe('halves', () => {
    it('produces a list containing the results of halving a number over and over again', () => {
      expect(halves(30).toArray()).toEqual([30,15,7,3,1]);
      expect(halves(128).toArray()).toEqual([128,64,32,16,8,4,2,1]);
      expect(halves(-10).toArray()).toEqual([-10,-5,-2,-1]);
    });
  });

});
