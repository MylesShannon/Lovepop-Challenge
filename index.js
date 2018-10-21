var prettyjson = require('prettyjson');
var cartSuggestions = require('./modules/cartSuggestionsService');
var cart = require('./assets/json/example_cart');

cartSuggestions.get(cart);
console.log(prettyjson.render(cart));