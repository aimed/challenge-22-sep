/**
 * A mock CreditCardPaymentService.
 *
 * @export
 * @class CreditCardPaymentService
 */
export class CreditCardPaymentService {
    constructor() {
    }

    pay(params) {
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), 100)
        })
    }
}