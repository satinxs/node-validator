function format(str, placeholders) {
    for (var propertyName in placeholders) {
        let re = new RegExp('{' + propertyName + '}', 'gm');
        str = str.replace(re, placeholders[propertyName]);
    }
    return str;
}

function _isObject(obj) {
    if (!_isRequired(obj))
        return true;

    return typeof obj === 'object';
}

function _isNumber(obj) {
    if (!_isRequired(obj))
        return true;

    return typeof obj === 'number';
}

function _isInteger(obj) {
    if (!_isRequired(obj))
        return true;

    return _isNumber(obj) && obj === Math.floor(obj);
}

function _isString(obj) {
    if (!_isRequired(obj))
        return true;

    return typeof obj === 'string';
}

function _isArray(obj) {
    if (!_isRequired(obj))
        return true;

    return typeof obj === 'array';
}

function _isRequired(obj) {
    return (obj !== undefined) && (obj !== null);
}

function _isMax(obj, max) {
    if (!_isRequired(obj))
        return true;

    if (_isString(obj) || _isArray(obj))
        return (obj.length <= max);

    if (_isNumber(obj))
        return (obj <= max);

    return false;
}

function _isMin(obj, min) {
    if (!_isRequired(obj))
        return true;

    if (_isString(obj) || _isArray(obj))
        return (obj.length >= min);

    if (_isNumber(obj))
        return (obj >= min);

    return false;
}

module.exports = class Validator {
    constructor(schemaName) {
        if (!schemaName)
            throw new Error("Schema name is required");

        this.Name = schemaName;

        this.Validators = [];
    }

    add(f, msg) {
        this.Validators.push(o => f(o) || msg);
    }

    check(obj) {
        let results = [];

        for (let val of this.Validators) {
            let result = val(obj);

            if (result !== true)
                results.push(format(result, { prop: this.Name }));
        }

        return { isValid: results.length == 0, results: results };
    }

    with(schema) {

        for (let prop in schema) {
            let validator = o => {
                let val = schema[prop];

                let result = val.check(o[prop]);

                if (!result.isValid)
                    return result.results.join('\n');

                return true;
            }

            this.Validators.push(validator);
        }

        return this;
    }

    isObject(msg) {
        this.add(_isObject, msg || '{prop} is not an object');

        return this;
    }

    isNumber(msg) {
        this.add(_isNumber, msg || '{prop} is not a number');

        return this;
    }

    isInteger(msg) {
        this.add(_isInteger, msg || '{prop} is not an integer');

        return this;
    }

    isString(msg) {
        this.add(_isString, msg || '{prop} is not a string');

        return this;
    }

    isArray(msg) {
        this.add(_isArray, msg || '{prop} is not an array');

        return this;
    }

    isRequired(msg) {
        this.add(_isRequired, msg || '{prop} is required');

        return this;
    }

    isMax(max, msg) {
        this.add(o => _isMax(o, max), msg || '{prop} is bigger than it\'s maximum allowed value');

        return this;
    }

    isMin(min, msg) {
        this.add(o => _isMin(o, min), msg || '{prop} is lower than it\'s minimum allowed value');

        return this;
    }
}