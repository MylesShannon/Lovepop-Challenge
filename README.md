# Lovepop Code Challenge 1

My solution can be found under ```./modules/cartSuggestionsService.js```

### Setup
``` npm install ```

##### If mocha is giving you trouble...
``` npm install -g mocha ```

### Run example
``` npm start ```

### Run tests
``` npm test ```

#### Suggestions schema
```javascript
cart: {
    // Discounts are applied and returned with cart data
},
suggestions: { // Each suggestion will return [] if nothing qualifies
    freeShipping: [
        {
            threshold: 'Why did the cart qualify for free shipping?', // Either a cart value or member type threshold
            lineItemContext: 'At what line item did the cart first qualify for free shipping?' // If `lineItemContext` is -1, the user is a Lovepop Prime Member
        }
    ],
    discounts: [
        {
            discounted: ['Which line items qualify for discounts? (by index of line item in cart)'],
            lineItemContext: 'At what line item did the cart first qualify for a discount?'
        }
    ],
    upsales: [ // Upsale will only include the first qualifying line item, no double upsales
        {
            upsell: 'What product is the cart offer for an upsale?',
            lineItemContext: 'At what line item did the cart qualify for an upsale?'
        }
    ]
}
```