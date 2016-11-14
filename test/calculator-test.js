/// <reference path="../typings/mocha/mocha.d.ts" />
// import Calculator from '../index';

// describe('Calculator', () => {
//     var subject : Calculator;

//     beforeEach(function () {
//         subject = new Calculator();
//     });

//     describe('#add', () => {
//         it('should add two numbers together', () => {
//             var result : number = subject.add(2, 3);
//             if (result !== 5) {
//                 throw new Error('Expected 2 + 3 = 5 but was ' + result);
//             }
//         });
//     });
// });

const zeroable = require('../build/es6/cats/zeroable');
// import {Zeroable, isZeroable} from '../build/es6/cats/zeroable';

class ZeroableInteger extends zeroable.Zeroable {
    constructor(data) {
        super()
        this.data = data;
    }
    zero() {
        return new ZeroableInteger(0);
    }
    add(other) {
        return new ZeroableInteger(this.data + other.data);
    }
    equal(other) {
        return this.data == other.data;
    }
    equalInt(y){
        return (this.data == y);
    }
}

describe('Zeroable', () =>{
    var subject;

    describe('#add', ()=>{
        it('should add two zeroable numbers together', () => {
            var x = new ZeroableInteger(5);
            var y = new ZeroableInteger(3);
            var xy = x.add(y);
            if (!xy.equalInt(8)) {
                throw new Error('Expected 8 but received ' + xy.data);
            }3
        });
    });
});
