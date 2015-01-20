define(function (require) {
    var extend = require('extend');
    return Injector;

    function Injector() {
        var self = this;
        this.fixDependencyCasing = allUpperCase;

        function resolve(name, dependencyAbove, dependencyTree, registeredModules) {
            var originalName = name;
            name = self.fixDependencyCasing(name);
            if (!(name in self.dependencies)) {
                //debugger;
                var message = originalName + ' not registered';
                console.error(message);
                throw message;
            }
            if (dependencyAbove && name in dependencyTree)
                throw dependencyAbove + ' has a circular dependency on ' + name;
            dependencyTree = extend({}, dependencyTree);
            dependencyTree[name] = '';

            return registeredModules[name].initializer.initialize(dependencyTree, registeredModules);
        }

        function inject(module, substitutions) {
            return new Initializer(self, '', module, false).initialize({}, registerSubstitutions(substitutions));
        }

        function register(registeredModules, name, item, isSingleton) {
            registeredModules[self.fixDependencyCasing(name)] = {
                item: item,
                initializer: new Initializer(self, name, item, isSingleton)
            };
        }

        function registerSubstitutions(substitutions) {
            var registeredModules = self.dependencies;
            if (substitutions !== undefined && substitutions.length) {
                registeredModules = extend({}, self.dependencies);
                var keys = Object.keys(substitutions);
                for (var i = 0; i < keys.length; i++)
                    register(registeredModules, keys[i], substitutions[keys[i]]);
            }
            return registeredModules;
        }

        var injector = {

            dependencies: {},

            getDependencies: function (name, dependencies, dependencyTree, registeredModules) {
                return dependencies.length === 1 && dependencies[0] === '' ? []
                    : dependencies.map(function (value) {
                        return resolve(value, name, dependencyTree, registeredModules);
                    }
                );
            },

            inject: inject,

            register: function (name, item, isSingleton) {
                register(self.dependencies, name, item, isSingleton);
            },

            resolve: function (name, substitutions) {
                return resolve(name, null, {}, registerSubstitutions(substitutions));

            }

        };
        extend(self, injector);

        function allUpperCase(name) {
            return name.toUpperCase();
        }

        function firstLetterUpperCase(value) {
            return value[0].toUpperCase() + value.substring(1);
        }
    }

    function Initializer(injector, name, item, isSingleton) {
        var self = this;
        createInitializationSteps();

        function createInitializationSteps() {
            if (isFunction(item))
                createFunctionInitializationSteps();
            else
                createObjectInitializationSteps();
        }

        function isFunction(functionToCheck) {
            var getType = {};
            return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
        }

        function createFunctionInitializationSteps() {
            var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
            var text = item.toString();
            var dependencies = text.match(FN_ARGS)[1].split(',');
            dependencies = dependencies.map(function (dependency) {
                return dependency.replace(/\s+/g, '');
            });

            self.initialize = function (dependencyTree, registeredModules) {
                var initializedItem = construct(item, injector.getDependencies(name, dependencies, dependencyTree, registeredModules));
                if (isSingleton) {
                    item = initializedItem;
                    createObjectInitializationSteps();
                }

                return initializedItem;
            };
        }

        function construct(constructor, args) {
            function F() {
                return constructor.apply(this, args);
            }

            F.prototype = constructor.prototype;
            return new F();
        }

        function createObjectInitializationSteps() {
            self.initialize = function () {
                return item;
            };
        }
    }

});