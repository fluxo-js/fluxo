#Fluxo [![Build Status](https://travis-ci.org/samuelsimoes/fluxo.svg?branch=master)](https://travis-ci.org/samuelsimoes/fluxo)

Fluxo is a simple, lightweight (~300LOC) and dependency free entity foundation to your
javascript app. It's inspired on [Backbone.js](http://backbonejs.org) models/collections
and other good ideas.

:warning: **This project is under development and experimental phase and because
of this many things may change.**

:ballot_box_with_check: Read the **[Getting started](https://github.com/samuelsimoes/fluxo/wiki/Getting-Started)**.

:ballot_box_with_check: Check the **[TodoMVC implementation](https://github.com/samuelsimoes/todomvc-fluxo)** with Fluxo.

##Usage

###Installation

Install with bower or npm and include on your app with some module loader
(browserify/webpack/require.js) or include directly on your app through script tag.

```
$ bower install --save fluxo
```
or
```
$ npm install --save fluxo-js
```

## Giving super powers to your bare objects

Javascript's literal objects most of time can be the best tool for your
app and you probably will hold the state of your app on one of then, but working
with bare objects sometimes can generates some boilerplate. You may need compute
attributes, emit events, manipulate collections and so on. On apps that use
some pattern like Facebook's Flux these kind of things is crucial.

So Fluxo is a foundation to "entities" with useful capabilities with a tiny
dependency amount on your application. These entities objects we call **store**.

##Fluxo.ObjectStore

For objects that represents a "single entity" you instante the class `Fluxo.ObjectStore`
passing on the first constructor argument the store's attributes, like this:

```js
let jon = new Fluxo.ObjectStore({ name: "John Doe" });
```

##Reading and Updating your store data

To read your store's data you need access the `data` property. To update your
data you should avoid change the `data` property directly, because Fluxo will
run some important tasks, like **[emits the change events](#events)**.

####\#setAttribute
`setAttribute(attributeName, newValue)`

Change a store attribute. This emits `change` and `change:<ATTRIBUTE-NAME>` events.

```js
jon.setAttribute("name", "John Doe");
jon.data.name //=> "John Doe"
```

####\#set
`set(attributesSet)`

Similar to `setAttribute`, but receives an object and allows change multiple
attributes at the same time. Notice that `set` merges the actual `data` with the
attributes passed to the method.

```js
jon.set({ "name": "John Bar" });
jon.data.name //=> "John Bar"
```

####\#reset
`reset(attributes)`

Similar to `set`, but removes the other attributes that aren't included on the
attributes object.

```js
jon.set({ "name": "John Bar" });
jon.reset({ "age": 30 });
jon.data.name // => undefined
jon.data.age // => 30
```

####\#unsetAttribute
`unsetAttribute(attributeName)`

Remove an attribute, this emit `change:<ATRIBUTE-NAME>`.

```js
jon.unsetAttribute("age");
jon.data.age // => undefined
```

##Extending a Store

You may want attach some custom behaviors to your stores, you can do this
creating your own [ES6 class](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) and extending `Fluxo.ObjectStore` or `Fluxo.CollectionStore`.

```js
class Person extend Fluxo.ObjectStore {
  sayHello () {
    return "hello";
  }
};
```

##Fluxo.CollectionStore

Sometimes you'll need stores that behaves like collections of stores, so you
can manipulate them, emit events, compute attributes based on your children objects and
so on, for this task you may use the `Fluxo.CollectionStore`.

Before anything keep in mind that `Fluxo.CollectionStore` is a extension of
`Fluxo.ObjectStore`, so all the features available to object stores are available
to Fluxo collection stores.

The usage is pretty like the object store usage, but on the first constructor's
argument you should place an array with your children objects and on the second you
should place the collection store's data.

```js
let people =
  new Fluxo.CollectionStore(
    [{ name: "John Doe" }, { name: "Ruth Anderson" }],
    { peopleCountry: "Brazil" }
  );
```

Every object on the first constructor's argument will be transformed on Fluxo object
store.

```js
people.stores[0].data.name //=> "John Doe"
people.stores[1].data.name //=> "Ruth Anderson"
```

###Updating your collection

You should avoid add or remove items on your `stores` property directly, instead, you
should use the following methods:

####\#addStore
`addStore(object|Fluxo.ObjectStore)`

Add a single store. If it isn't a Fluxo store it will be parsed. This emits `change`
and `add` events.

```js
people.addStore({ name: "Neo" });
people.stores[0].data.name //=> "Neo"
```

####\#addStores
`addStores(array[object|Fluxo.ObjectStore])`

Same that `addStore` but accepts an array with objects to add at the same time.

```js
people.addStores([{ name: "Neo" }, { name: "John" }]);
people.stores[0].data.name //=> "Neo"
people.stores[0].data.name //=> "John"
```

####\#removeStore
`removeStore(Fluxo.ObjectStore)`

Remove a single store. Emits `change` and `remove` events.

```js
let jon = new Fluxo.ObjectCreate({ name: "John" });
people.addStore(jon);
people.stores[0] //=> <the store>
people.removeStore(jon);
people.stores[0] //=> undefined
```

####\#resetStores
`resetStores(array[object|Fluxo.ObjectStore])`

Same that `addStores`, but it will removes all the other stores that isn't included on
stores array passed on the first argument.

```js
people.addStores([{ name: "Neo" }, { name: "John" }]);
people.resetStores([{ name: "Neo" }]);
people.stores[0].data.name //=> "Neo"
people.stores[1] //=> undefined
```

###Children stores extension

You can specify what class the children stores may have when it's added on
collection on the key `store` of your collection class, like this:

```js
class Person extends Fluxo.ObjectStore {
  sayHello () {
    return this.data.name;
  }
};

class People extends Fluxo.CollectionStore {};

People.store = Person;

people.addStore({ name: "John" });

people.stores[0].sayHello(); //=> "John"
```

###Searching

Sometimes you will want get some stores of your collection, to this you can
use the follow methods:

####\#find
`find(cid|id)`

Returns the first store with the matching `id` attribute or matching `cid` ([what's cid?](#cid))

####\#where
`where(criteriaObject)`

It returns an array containing the matching stores. You must pass on first argument
an object with search criteria.

```js
let jon = new Fluxo.ObjectStore({ name: "John", age: 30 }),
    ruth = new Fluxo.ObjectStore({ name: "Ruth", age: 31  });

people.addStores([jon, ruth]);
people.where({ age: 30 }); //=> [jon];
```

###Ordering

If you want to keep the stores always sorted, you may define a sort method:

```js
class People extends Fluxo.CollectionStore {
  sort (a, b) {
    return a.data.at - b.data.at;
  }
};
```

##Attributes parsers

Fluxo object stores and collections can enforce casting or parsing on some store's
attributes, like the example below:

```js
class Person extends Fluxo.ObjectStore.create {};

Person.attributeParsers = {
  age: function (age) {
    return parseInt(age);
  }
};

let jon = new Person();

jon.setAttribute("age", "30");

jon.data.age //=> 30 (integer)
```

##toJSON
Eventually you will pass the state that you are holding on your store to other
parts to your app, like the view layer. You should avoid pass the `data` or `stores`
properteis directly, the `toJSON` it's the right tool for this job.

On object stores the `toJSON` will include all the properties of your data and the `cid`,
like this:

```js
{
  cid: "FS:1",
  name: "John Doe"
}
```

On collection stores the `toJSON` will include the same things of object store
toJSON, but it'll also include the `stores` property with all data of your children
stores (it will call `toJSON` on its children), like this:

```js
{
  cid: "FS:2",
  doneCount: 1,
  stores: [
    { cid: "FS:3", done: true, content: "Buy milk!" },
    { cid: "FS:4", done: false, content: "Buy a car!" }
  ]
}
```

:warning: On the object store `toJSON` returns a new JSON copy everytime that
your store changes, if not, the same copy is returned.

##CID

Every Fluxo store has an internal CID (client ID) that are used to many internal tasks
but you can use to reference your object on your interface as well. The CID value
is placed on the store's `cid` property.

```js
jon.cid //=> "FS:1"
```

##Events

Stores can emit and react on events using the `on`, `triggerEvent` and `triggerEvents`
methods.

The `on` method accepts two arguments, the first is an array of events names
and the second is the callback.

To cancel the event subscription you can invoke the returned canceler on the
event subscription.

```js
// Registers the event
let eventCanceler = jon.on(["change:name"], function (store) {
  alert("wow, you changed the name");
});

// Cancels the event
eventCanceler.call();
```

The first argument method of `triggerEvents` is an array with the events names that
you want trigger, the other arguments are passed to the signed callbacks. If you
want trigger only one event you can use the `triggerEvent`.

```js
myStore.triggerEvents(["myCustomEvent", "change"], "myCustomArgument");
```

###Collections and event bubbling

The Fluxo collections propagates all the children store event's with the prefix
`stores:`, so, if you trigger an event like "sayHello" on a store of a collection,
your collection will trigger the `stores:sayHello` event.

:warning: The `change` event on the collection **isn't triggered** when it's children
stores change, this kind of event is triggered upon the `stores:change` name.

###Wildcard event

Every triggered event emits a wildcard event.

Example: if you trigger the event `sayHello` on your object, the event called `*`
will be triggered, but the arguments to the callback for this event is diferrent
of other events. The first argument will be the name of event that was triggered,
the rest is the same of other events.

```js
jon.on(["sayHello"], function (store) {
  //...
});

jon.on(["*"], function (eventName, store) {
  // triggering the  "sayHello" event will trigger this event with the
  // argument "eventName" with value "sayHello".
});

jon.triggerEvent("sayHello");
```

##Computed properties

Fluxo object store and collection stores can have computed properties like
Ember.js computed properties, this feature let you declare attributes that are
computed on some events of your store. Look the example below:

```js
class Person extends Fluxo.ObjectStore {
  fullName: function () {
    return (this.data.firstName + " " + this.data.lastName);
  }
};

Person.computed = {
  computed: {
    fullName: ["change:firstName", "change:lastName"]
  }
};

let person = new Person({ firstName: "John", lastName:  "Doe" });

person.data.fullName; // => "John Doe"

person.setAttribute("lastName", "Anderson");

person.data.fullName; // => "John Anderson"
```

Or a more complex example with collection store:

```js
class Todos extends Fluxo.CollectionStore {
  doneCount () {
    return this.stores.filter(todo => todo.data.done).length;
  }
}

Todos.computed = {
  doneCount: ["stores:change:done"]
};

let todos = new Todos([{ done: true }, { done: false }]);

todos.data.doneCount; // => 1

todos.stores[1].setAttribute("done", true);

todos.data.doneCount; // => 2
```

:warning: Computed properties **are computed on the store's creation**.

##Using with React.js

Fluxo is view layer agnostic, you can use whatever you want, but we highly recommend
the React.js. If you choose the React.js we already created a way to connect your
stores on your React.js components.

**Read more: https://github.com/samuelsimoes/fluxo-react-connect-stores**
