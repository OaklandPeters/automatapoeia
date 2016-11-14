var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }


function updateObject(first, second) {
    Object.keys(second).forEach(function (key) {
        first[key] = second[key];
    });
    return first;
}

var Invokable = function () {
    function Invokable() {
        _classCallCheck(this, Invokable);
    }

    _createClass(Invokable, null, [{
        key: "is",
        value: function is(value) {
            return value.invoke instanceof Function;
        }
    }]);

    return Invokable;
}();

var InvokableFunction = function (_Invokable) {
    _inherits(InvokableFunction, _Invokable);

    function InvokableFunction(func) {
        _classCallCheck(this, InvokableFunction);

        var _this = _possibleConstructorReturn(this, (InvokableFunction.__proto__ || Object.getPrototypeOf(InvokableFunction)).call(this));

        _this.func = func;
        return _this;
    }

    _createClass(InvokableFunction, [{
        key: "invoke",
        value: function invoke(input) {
            return this.func(input);
        }
    }]);

    return InvokableFunction;
}(Invokable);

function makeMorphism(callable) {
    /**
     * We have two related objects.
     * Callable - an object in JS terms. It will have a 'call' function.
     *     This cannot be directly called via normal Javascript mechanisms.
     * Morphism - a JS function wrapped around a Callable. It can be called via
     *     normal JS mechanisms. It also has all of the attributes and methods
     *     of the Callable pinned to it.
     *
     */
    function f(arg) {
        return this.invoke(arg);
    }
    var bound = f.bind(callable);
    bound.__proto__ = callable.__proto__;
    return updateObject(bound, callable);
}


// Building test values for use in testing from Chrome console
var invokable = new InvokableFunction(function(x) { return x; });
var morphism = makeMorphism(invokable);


console.log(invokable);
console.log(morphism);
