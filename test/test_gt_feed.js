/* global describe, it, context */

'use strict';
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;
var GTHelper = require('../gt_feed_helper');
chai.config.includeStack = true;

describe('GTHelper', function() {
  var subject = new GTHelper();
  describe('#getFirstHeadline', function() {
    context('with the Gympie Times Homepage RSS', function() {
      it('returns matching url', function() {
        var value = subject.getHeadlines(1).then(function(headLine) {return headLine});
        return expect(value).to.eventually.eq("Planner: Widgee Engineering's survival 'in public interest'");
      })
    })
  })
})