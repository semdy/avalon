var share = require('./share')

function toJson(val) {
    var xtype = avalon.type(val)
    if (xtype === 'array') {
        var array = []
        for (var i = 0; i < val.length; i++) {
            array[i] = toJson(val[i])
        }
        return array
    } else if (xtype === 'object') {
        var obj = {}
        for (i in val) {
            if (i === '__proxy__' || i === '__data__' || i === '__const__')
                continue
            if (val.hasOwnProperty(i)) {
                var value = val[i]
                obj[i] = value && value.nodeType ? value : toJson(value)
            }
        }
        return obj
    }
    return val
}

function hideProperty(host, name, value) {
    Object.defineProperty(host, name, {
        value: value,
        writable: true,
        enumerable: false,
        configurable: true
    })
}

var modelAccessor = {
    get: function () {
        return toJson(this)
    },
    set: avalon.noop,
    enumerable: false,
    configurable: true
}

share.$$midway.hideProperty = hideProperty

function makeObserver($vmodel, options, heirloom, keys, accessors) {

    if (options.array) {
        hideProperty($vmodel, '$model', modelAccessor)
    } else {
        function hasOwnKey(key) {
            return keys[key] === true
        }
        hideProperty($vmodel, '$accessors', accessors)
        hideProperty($vmodel, 'hasOwnProperty', hasOwnKey)
    }
    hideProperty($vmodel, '$id', options.id)
    hideProperty($vmodel, '$hashcode', options.hashcode)
    if (options.master === true) {
        makeFire($vmodel, heirloom)
    }
}


var mixin = {
    toJson: toJson,
    makeObserver: makeObserver,
    modelAccessor: modelAccessor
}
for (var i in share) {
    mixin[i] = share[i]
}

module.exports = mixin
