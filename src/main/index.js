'use strict';

exports.get = (event, context, callback) => {
  var result = {
    statusCode: 200,
    body: JSON.stringify({
      greeting: 'Hello world!',
      event,
      context
    }, null, 2),
    headers: {
      'content-type': 'application/json'
    }
  };
  callback(null, result);
};
