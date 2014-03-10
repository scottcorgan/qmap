var flatten = require('flat-arguments');
var asArray = require('as-array');
var drainer = require('drainer');
var isArguments = require('lodash.isarguments');

var Qmap = function (context) {
  
  // this._isQueue = true; // TODO: use this so that we can make a queue of queues
  
  this._items = [];
  this._methods = {};
  this._context = context;
};

Qmap.prototype.method = function (name, fn) {
  this._methods[name] = fn;
};

Qmap.prototype.push = function () {
  flatten(arguments).forEach(addToItems, this);
  
  function addToItems (arg) {
    if (typeof arg === 'string') arg = this._methods[arg];
    
    var fn = (this._context)
      ? arg.bind(this._context)
      : arg; 
      
    this._items.push(fn);
  }
};

Qmap.prototype.drain = function () {
  var drain = drainer(this._items);
  var args = [].slice.call(arguments, 0);
  var callback = args.pop();
  
  // Block having args passed in with callback.
  // If args are passed in, drainer automatically passes them
  // to the next item in the queue. That's bad!
  args.push(function (err) {
    (callback)
      ? callback(err)
      : function () {};
  });
  
  drain.apply(drain, args);
};

module.exports = Qmap;