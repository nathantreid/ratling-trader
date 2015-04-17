define(function (require) {
    var extend = require('extend');
    return Injector;

    function Injector() {
        var self = this;
        this.fixDependencyCasing = allUpperCase;

        function resolve(name, dependencyAbove, dependencyTree, registeredModules, substitutions) {
            var originalName = name;
            name = self.fixDependencyCasing(name);
            if (substitutions !== undefined && name in substitutions)
                return substitutions[name];

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
            return new Initializer(self, '', module, false).initialize({}, self.dependencies, registerSubstitutions(substitutions));
        }

        function register(registeredModules, name, item, isSingleton) {
            registeredModules[self.fixDependencyCasing(name)] = {
                item: item,
                initializer: new Initializer(self, name, item, isSingleton)
            };
        }

        function registerSubstitutions(subs) {
            var substitutions = {};
            if (subs === undefined)
                return {};

            var keys = Object.keys(subs);
            for (var i = 0; i < keys.length; i++)
                substitutions[self.fixDependencyCasing(keys[i])] = subs[keys[i]];
            return substitutions;
        }

        var injector = {

            dependencies: {},

            getDependencies: function (name, dependencies, dependencyTree, registeredModules, substitutions) {
                return dependencies.length === 1 && dependencies[0] === '' ? []
                    : dependencies.map(function (value) {
                        return resolve(value, name, dependencyTree, registeredModules, substitutions);
                    }
                );
            },

            inject: inject,

            register: function (name, item, isSingleton) {
                register(self.dependencies, name, item, isSingleton);
            },

            resolve: function (name, substitutions) {
                return resolve(name, null, {}, self.dependencies, registerSubstitutions(substitutions));

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
                return dependency.replace(/\s+/g, '').replace(/.*\$/, '');
            });

            self.initialize = function (dependencyTree, registeredModules, substitutions) {
                var initializedItem = construct(item, injector.getDependencies(name, dependencies, dependencyTree, registeredModules, substitutions));
                if (isSingleton) {
                    item = initializedItem;
                    createObjectInitializationSteps();
                }

                return initializedItem;
            };
        }

        function construct(constructor, args) {
            return new (Function.prototype.bind.apply(constructor, [null].concat(args)));
        }

        function createObjectInitializationSteps() {
            self.initialize = function () {
                return item;
            };
        }
    }

});