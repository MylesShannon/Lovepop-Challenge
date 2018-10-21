var uniqid = require('uniqid');
var productData = require('../assets/json/challenge_1_product_data');

var cartBuilderService = function(customerData, lineItems, primeMember) {
    var compileLineItems = function(lineItems) {
        var processedLineItems = [];
        for(var i = 0; i < lineItems.length; i++) {
            var key = Object.keys(lineItems[i])[0];
            processedLineItems.push(
                Object.assign(Object.create(productData[key]), { quantity: lineItems[i][key] })
            );
        }
        return processedLineItems;
    }
    
    return {
        customer: Object.assign(Object.create(customerData), { isPrimeMember: primeMember || false }),
        cart: {
            id: uniqid('guid-'),
            lineItems: compileLineItems(lineItems)
        }
    }
};

module.exports = cartBuilderService;