'use strict';

var test = require('unit.js');
var index = require('../src/main/index.js');

describe('Tests index', function () {
  it('verifies successful response', function (done) {
    index.get({ /* event */ }, { /* context */ }, (err, result) => {
      if (err) test.fail();
      try {
        test.number(result.statusCode).is(200);
        test.object(JSON.parse(result.body)).hasProperty('greeting', 'Hello world!');
        test.value(result).hasHeader('content-type', 'application/json');
        done();
      } catch (error) {
        done(error);
      }
    });
  });
});
