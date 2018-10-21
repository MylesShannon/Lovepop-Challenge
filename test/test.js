var expect = require('chai').expect;
var cartSuggestions = require('../modules/cartSuggestionsService');
var cartBuilder = require('../modules/cartBuilderService');
var productData = require('../assets/json/challenge_1_product_data');
var customerData = {
    "id": "90042",
    "firstName": "Joe",
    "lastName": "Smith",
    "emailAddcarts": "jsmith@fakeemail.com",
    "isPrimeMember": false
};

describe('Consumer Cart Suggestions', function() {
    describe('Free shipping', function() {
        it('should qualify for free shipping if cart value is over $100', function() {
            var cart = cartBuilder(customerData, [{'10003': 2}, {'10004': 3}, {'10005': 10}]);
            var expected = Object.assign(Object.create(cart),
                {
                    suggestions: {
                        freeShipping: [
                            {
                                threshold: '100',
                                lineItemContext: 2
                            }
                        ], 
                        discounts: [
                            {
                                discounted: [2],
                                lineItemContext: 2
                            }
                        ],
                        upsales: []
                    }
                }
            );
            cartSuggestions.get(cart);
            expect(cart.cart.lineItems[0].price).to.equal('2000');
            expect(cart.cart.lineItems[1].price).to.equal('1500');
            expect(cart.cart.lineItems[2].price).to.equal('1000');
            expect(cart).to.deep.equal(expected);
        });

        it('should not qualify for free shipping if cart value is below $100', function() {
            var cart = cartBuilder(customerData, [{'10004': 1}, {'10005': 1}]);
            var expected = Object.assign(Object.create(cart),
                {
                    suggestions: {
                        freeShipping: [], 
                        discounts: [],
                        upsales: []
                    }
                }
            );
            cartSuggestions.get(cart);
            expect(cart).to.deep.equal(expected);
        });

        it('should qualify for free shipping and Greeting Card discount because user is Lovepop Prime Member', function() {
            var cart = cartBuilder(customerData, [{'10000': 1}], true);
            var expected = Object.assign(Object.create(cart),
                {
                    suggestions: {
                        freeShipping: [
                            {
                                threshold: 'prime',
                                lineItemContext: -1
                            }
                        ],
                        discounts: [
                            {
                                discounted: [0],
                                lineItemContext: -1
                            }
                        ],
                        upsales: []
                    }
                }
            );
            cartSuggestions.get(cart);
            expect(cart.cart.lineItems[0].price).to.equal('1000');
            expect(cart).to.deep.equal(expected);
        });
    });

    describe('Lovepop Note 5-Pack upsell', function() {
        it('should upsell a Lovepop Note 5-Pack and a Santa Biker T-Shirt', function() {
            var cart = cartBuilder(customerData, [{'10006': 1}, {'10001': 1}]);
            var expected = Object.assign(Object.create(cart),
                {
                    suggestions: {
                        freeShipping: [],
                        discounts: [],
                        upsales: [
                            {
                                upsell: productData['10011'],
                                lineItemContext: 1
                            },
                            {
                                upsell: productData['10002'],
                                lineItemContext: 1
                            }
                        ]
                    }
                }
            );
            cartSuggestions.get(cart);
            expect(cart).to.deep.equal(expected);
        });

        it('should not upsell a Lovepop Note 5-Pack, but should offer free shipping', function() {
            var cart = cartBuilder(customerData, [{'10005': 1}, {'10003': 9}]);
            var expected = Object.assign(Object.create(cart),
                {
                    suggestions: {
                        freeShipping: [
                            {
                                threshold: '100',
                                lineItemContext: 1
                            }
                        ],
                        discounts: [],
                        upsales: []
                        
                    }
                }
            );
            cartSuggestions.get(cart);
            expect(cart).to.deep.equal(expected);
        });
    });

    describe('Santa Biker T-Shirt upsell', function() {
        it('should upsell a Santa Biker T-Shirt, offer free shipping, and discount the Greeting Cards', function() {
            var cart = cartBuilder(customerData, [{'10004': 3}, {'10005': 2}, {'10007': 2}, {'10008': 1}]);
            var expected = Object.assign(Object.create(cart),
                {
                    suggestions: {
                        freeShipping: [
                            {
                                threshold: '100',
                                lineItemContext: 3
                            }
                        ],
                        discounts: [
                            {
                                discounted: [1, 2, 3],
                                lineItemContext: 3
                            }
                        ],
                        upsales: [
                            {
                                upsell: productData['10002'],
                                lineItemContext: 2
                            }
                        ]
                    }
                }
            );
            cartSuggestions.get(cart);
            expect(cart.cart.lineItems[0].price).to.equal('1500');
            expect(cart.cart.lineItems[1].price).to.equal('1000');
            expect(cart.cart.lineItems[2].price).to.equal('1000');
            expect(cart.cart.lineItems[3].price).to.equal('1000');
            expect(cart).to.deep.equal(expected);
        });
    });

    describe('5 for $50 sale on Greeting Cards', function() {
        it('should qualify because cart has more than five Greeitng Cards', function() {
            var cart = cartBuilder(customerData, [{'10000': 3}, {'10005': 2}, {'10009': 1}]);
            var expected = Object.assign(Object.create(cart),
                {
                    suggestions: {
                        freeShipping: [],
                        discounts: [
                            {
                                discounted: [0, 1, 2],
                                lineItemContext: 1
                            }
                        ],
                        upsales: []
                    }
                }
            );
            cartSuggestions.get(cart);
            expect(cart.cart.lineItems[0].price).to.equal('1000');
            expect(cart.cart.lineItems[1].price).to.equal('1000');
            expect(cart.cart.lineItems[2].price).to.equal('1000');
            expect(cart).to.deep.equal(expected);
        });

        it('should not qualify because cart does not have enough unlicensed Greeting Cards', function() {
            var cart = cartBuilder(customerData, [{'10000': 3}, {'10004': 2}, {'10009': 1}]);
            var expected = Object.assign(Object.create(cart),
                {
                    suggestions: {
                        freeShipping: [],
                        discounts: [],
                        upsales: []
                    }
                }
            );
            cartSuggestions.get(cart);
            expect(cart.cart.lineItems[0].price).to.equal('1300');
            expect(cart.cart.lineItems[1].price).to.equal('1500');
            expect(cart.cart.lineItems[2].price).to.equal('1300');
            expect(cart).to.deep.equal(expected);
        });
    });

    describe('Greeting Card with matching T-Shirt upsell', function() {
        it('should qualify if cart has one Greeting Card and a matching T-Shirt', function() {
            var cart = cartBuilder(customerData, [{'10009': 1}]);
            var expected = Object.assign(Object.create(cart),
                {
                    suggestions: {
                        freeShipping: [],
                        discounts: [],
                        upsales: [
                            {
                                upsell: productData['10003'],
                                lineItemContext: 0
                            }
                        ]
                    }
                }
            );
            cartSuggestions.get(cart);
            expect(cart).to.deep.equal(expected);
        });

        it('should not qualify because cart too big', function() {
            var cart = cartBuilder(customerData, [{'10009': 2}]);
            var expected = Object.assign(Object.create(cart),
                {
                    suggestions: {
                        freeShipping: [],
                        discounts: [],
                        upsales: []
                    }
                }
            );
            cartSuggestions.get(cart);
            expect(cart).to.deep.equal(expected);
        });

        it('should qualify for a free matching T-Shirt and upsell a Santa Biker T-Shirt', function() {
            var cart = cartBuilder(customerData, [{'10008': 1}]);
            var expected = Object.assign(Object.create(cart),
                {
                    suggestions: {
                        freeShipping: [],
                        discounts: [],
                        upsales: [
                            {
                                upsell: productData['10002'],
                                lineItemContext: 0
                            },
                            {
                                upsell: productData['10002'],
                                lineItemContext: 0
                            }
                        ]
                    }
                }
            );
            cartSuggestions.get(cart);
            expect(cart).to.deep.equal(expected);
        })
    });
});