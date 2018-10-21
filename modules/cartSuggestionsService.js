var productData = require('../assets/json/challenge_1_product_data');

var cartSuggestionService = function(cartData) {
    if(
        !cartData.hasOwnProperty('customer') ||
        !cartData.hasOwnProperty('cart') ||
        !cartData.cart.hasOwnProperty('id') ||
        (!cartData.cart.hasOwnProperty('lineItems') || cartData.cart.lineItems.length <= 0)
    ) {
        return;
    }

    var customer = cartData.customer;
    var cart = cartData.cart;
    var lineItems = cart.lineItems;
    var compiledSuggestion = {
        freeShipping: [],
        discounts: [],
        upsales: []
    };
    var checkTags = function(tags, target) {
        for(var i = 0; i < tags.length; i++) {
            if(tags[i] === target) {
                return true;
            }
        }
        return false;
    }

    var freeShippingTests = [
        { // If user is a Lovepop Prime Member, offer free shipping
            data: customer.isPrimeMember,
            test: function(data, perk) {
                if(data === true) {
                    return { threshold: perk, lineItemContext: -1 };
                } else {
                    return false;
                }
            },
            perk: { freeShipping: 'prime' }
        },
        { // If the cart is valued over perk price, offer free shipping
            data: lineItems,
            test: function(data, perk) {
                var runningTotal = 0;
                for(var i = 0; i < data.length; i++) {
                    runningTotal += data[i].price * data[i].quantity;
                    if(runningTotal > perk+'00') {
                        return { threshold: perk, lineItemContext: i };
                    }
                }
                return false;
                
            },
            perk: { freeShipping: '100' }
        }
    ];
    var discountTests = [
        { // If user is a Lovepop Prime Member, reduce all Greeting Cards to perk price
            data: { isPrimeMember: customer.isPrimeMember, lineItems: lineItems },
            test: function(data, perk) {
                if(data.isPrimeMember === true) {
                    var discounted = [];
                    for(var i = 0; i < data.lineItems.length; i++) {
                        if(data.lineItems[i].type === 'Greeting Card') {
                            data.lineItems[i].price = perk+'00';
                            discounted.push(i);
                        }
                    }
                    return { discounted: discounted, lineItemContext: -1 }
                } else {
                    return false;
                }
            },
            perk: { discounts: 10 }
        },
        { // If cart has 5 or more Greeting Cards, reduce all Greeting Cards to perk price
            data: lineItems,
            test: function(data, perk) {
                var greetingCardTotal = 0;
                var tippingPoint = -1;
                var discountedLineItems = [];
                for(var i = 0; i < data.length; i++) {
                    if(data[i].type === 'Greeting Card' && !checkTags(data[i].tags, 'licensed')) {
                        discountedLineItems.push(i);
                        greetingCardTotal += data[i].quantity;
                        if(greetingCardTotal >= 5 && tippingPoint === -1) {
                            tippingPoint = i;
                        }
                    }
                }
                if(greetingCardTotal >= 5) {
                    for(var i = 0; i < discountedLineItems.length; i++) {
                        data[discountedLineItems[i]].price = perk+'00';
                    }
                    return { discounted: discountedLineItems, lineItemContext: tippingPoint };
                } else {
                    return false;
                }
            },
            perk: { discounts: 10 }
        }
    ];
    var upsellTests = [
        { // If cart has a card pack, upsell a Lovepop Note 5-Pack
            data: lineItems,
            test: function(data, perk) {
                for(var i = 0; i < data.length; i++) {
                    for(var j = 0; j < data[i].tags.length; j++) {
                        if(data[i].tags[j] === 'card-pack') {
                            return { upsell: perk, lineItemContext: i};
                        }
                    }
                }
                return false;
            },
            perk: { upsales: productData['10011'] }
        },
        { // If cart has a holiday card, upsell a Santa Biker T-Shirt
            data: lineItems,
            test: function(data, perk) {
                for(var i = 0; i < data.length; i++) {
                    for(var j = 0; j < data[i].tags.length; j++) {
                        if(data[i].tags[j] === 'holiday') {
                            return { upsell: perk, lineItemContext: i};
                        }
                    }
                }
                return false;
            },
            perk: { upsales: productData['10002'] }
        },
        { // If cart has one card and that card has a matching T-Shirt, upsell the shirt
            data: lineItems,
            test: function(data) {
                if(data.length === 1 && data[0].quantity === 1) {
                    for(var i in productData) {
                        if(productData[i].name === data[0].name + ' T-Shirt') {
                            return { upsell: productData[i], lineItemContext: 0};
                        }
                    }
                }
                return false;
            },
            perk: { upsales: {} }
        }
    ];

    var doTest = function(tests) {
        for(var i = 0; i < tests.length; i++) {
            var suggestion = Object.keys(tests[i].perk)[0];
            var res = tests[i].test(tests[i].data, tests[i].perk[suggestion]);
            if(res !== false) {
                compiledSuggestion[suggestion].push(res);
            }
        }
    }

    doTest(freeShippingTests);
    doTest(discountTests);
    doTest(upsellTests);

    return Object.assign(cartData, { suggestions: compiledSuggestion });
};

module.exports = { get: cartSuggestionService };