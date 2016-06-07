<p align="center">
  <img alt="Fluxo" src="https://s3.amazonaws.com/samuel-misc/banner.png" >
</p>

[![Build Status](https://travis-ci.org/samuelsimoes/fluxo.svg?branch=master)](https://travis-ci.org/samuelsimoes/fluxo)

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

####Using with CommonJS module loaders (Webpack/Browserify)
```js
var Fluxo = require("fluxo-js");
var jon = new Fluxo.ObjectStore({ name: "John Doe" });
```

## Giving super powers to your bare objects

Javascript's literal objects most of time can be the best tool for your
app and you probably will hold the state of your app on one of then, but working
with bare objects sometimes can generates some boilerplate. You may need compute
attributes, emit events, manipulate collections and so on. On apps that use
some pattern like Facebook's Flux these kind of things is crucial.

So Fluxo is a foundation to "entities" with useful capabilities with a tiny
dependency amount on your application. These entities objects we call **store**.

#Summary
* [Fluxo.ObjectStore](#fluxoobjectstore)
  * [Reading and Updating your store data](#reading-and-updating-your-store-data)
    * [setAttribute](#setattribute)
    * [set](#set)
    * [reset](#reset)
    * [clear](#clear)
    * [unsetAttribute](#unsetattribute)
  * [Extending a Store](#extending-a-store)
  * [Attributes Contracts](#attributes-contracts)
* [Fluxo.CollectionStore](#fluxocollectionstore)
    * [Updating your collection](#updating-your-collection)
      * [addStore](#addstore)
      * [addStores](#addstores)
      * [setStores](#setstores)
      * [removeAll](#removeall)
      * [remove](#remove)
      * [resetStores](#resetstores)
    * [Children stores extension](#children-stores-extension)
    * [Searching](#searching)
      * [find](#find)
      * [where](#where)
    * [Ordering](#ordering)
    * [Collection children delegations](#collection-children-delegations)
    * [Collection Subsets](#collection-subsets)
* [toJSON](#tojson)
* [CID](#cid)
* [Events](#events)
  * [Nested Stores event bubbling](#nested-stores-event-bubbling)
  * [Collections and event bubbling](#collections-and-event-bubbling)
  * [Wildcard event](#wildcard-event)
* [Computed properties](#computed-properties)
* [Using with React.js](#using-with-reactjs)
* [License](#license)

##Fluxo.ObjectStore

For objects that represents a "single entity" you must instante the class `Fluxo.ObjectStore`
passing on the first constructor argument the store's attributes, like this:

```js
var jon = new Fluxo.ObjectStore({ name: "John Doe" });
```

##Reading and Updating your store data

To read your store's data you need access the `data` property. To update your
data you should avoid change the `data` property directly because Fluxo will
run some important tasks, like **[emits the change events](#events)** and **[parse values](#attributes-contracts)**.

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

Similar to [set](#set), but removes the other attributes that aren't included on the attributes object and **restore the default values**.

```js
jon.set({ "name": "John Bar" });
jon.reset({ "age": 30 });
jon.data.name // => undefined
jon.data.age // => 30
```

####\#clear
`clear()`

Remove all attributes of your store.

```js
jon.set({ "name": "John Bar", age: 25 });
jon.clear();
jon.data.name // => undefined
jon.data.age // => undefined
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
class Person extends Fluxo.ObjectStore {
  sayHello () {
    return "hello";
  }
};
```

##Attributes Contracts
Attributes contracts allow you to define default values and custom parsing/dumping logics to your store's attributes. To use them you need to specify the contracts on the class property `attributes` with the following properties:

* `defaultValue`: the default value used on the store initialization and the [#reset method](#reset).
* `parser`: the function that receives the value on the argument and returns the value parsed.
* `dump`: the function that receives the value on the argument and returns the result to [#toJSON method](#tojson). The default dump logic calls `toJSON` on the value.
* `required` (boolean): warning on the console when an attribute is required and is missing on the initialization or [#unsetAttribute method](#unsetattribute).

Take a look at the examples below:

```js
class Comment extends Fluxo.ObjectStore {}

Comment.attributes = {
  title: { defaultValue: "This is my title" },
  content: { defaultValue: "This is my default comment" }
};

var comment = new Comment({ content: "This is my comment" });

comment.data // => { title: "This is my title", content: "This is my comment" }
```

Using the parsers:

```js
class Person extends Fluxo.ObjectStore {};

Person.attributes = {
  age: { parser: function (value) { return parseInt(value); } }
};

var jon = new Person();

jon.setAttribute("age", "30");

jon.data.age //=> 30 (integer)
```

You can also use the attribute parsers to easily transform objects into nested stores if you need this.

```js
class Author extends Fluxo.ObjectStore {};

class Post extends Fluxo.ObjectStore {};

Post.attributes = {
  author: {
    defaultValue: {},
    parser: function (value) {
      return (value instanceof Author) ? value : new Author(value);
    }
  }
};

var post = new Post({ content: "My Post", author: { name: "John" } });

post.data.author //=> <a instance of Author store>
```

You can specify how the attribute should be generated to [#toJSON method](#tojson).

```js
class Post extends Fluxo.ObjectStore {};

Post.attributes = {
  date: {
    dump: function (value) {
      return value.customToJSONMethod();
    }
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
var people =
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
people.stores[1].data.name //=> "John"
```
:warning: **If you pass an already added store it will be ignored!**

####\#setStores
`setStores(array[object|Fluxo.ObjectStore], options={ removeMissing: false })`

Like `addStores` but **if a store on the parameter is already added it will be updated**.

You can specify the option `removeMissing: true` to remove all stores that aren't specified on the payload.

```js
var collection =
  new Fluxo.CollectionStore([
    { id: 1, name: "Foo", gender: "m" },
    { id: 2, name: "Bar" }
  ]);

collection.setStores([{ id: 1, name: "FooBar" }], { removeMissing: true });

collection.stores[0].data.name // => FooBar
collection.stores[0].data.gender // => m
collection.stores[1] // => undefined
```

####\#removeAll
`removeAll()`

Remove all stores. Emits `change` and `remove` events.

####\#remove
`remove(Fluxo.ObjectStore)`

Remove a single store. Emits `change` and `remove` events.

```js
var jon = new Fluxo.ObjectStore({ name: "John" });
people.addStore(jon);
people.stores[0] //=> <the store>
people.remove(jon);
people.stores[0] //=> undefined
```

####\#resetStores
`resetStores(array[object|Fluxo.ObjectStore])`

Remove all previous children stores and add the argument's stores.

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
var jon = new Fluxo.ObjectStore({ name: "John", age: 30 }),
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

##Collection children delegations
When you are manipulating collections you usually will manipulate the children
stores, you can do this accessing the store directly on the `stores` property, but
it breaks the [law of demeter](https://en.wikipedia.org/wiki/Law_of_Demeter), so, to
avoid this you can use the children delegations.

Children delegations allows you to invoke methods on your children stores through the
collection. To delegate you need declare on the `childrenDelegate` class property an
array with the name of methods that you want proxy, like this:

```js
class Todo extends Fluxo.ObjectStore {
  setAsDone () {
    this.setAttribute("done", true);
  }
};

class Todos extends Fluxo.CollectionStore {};

Todos.store = Todo;
Todos.childrenDelegate = ["setAsDone"];

var todos = new Todos([{ id: 2, done: "false" }]);

todos.setAsDone(2);

todos.stores[0].data.done // true
```

The first argument on the delegated method should be the ID of the child that you want
invoke the method (you can use the [cid](#cid) too), the rest will be passed to
child's method.

The last line of our example above will call `setAsDone` on the todo with id 2.

##Collection Subsets
Sometimes you'll need compute filtered subsets of your collection. Imagine that you
want show only the done todos on your interface, you can compute this filtered subset
with the collection subsets.

Collection subsets works pretty much like the **[computed properties](#computed-properties)**, you define what
are your subsets on the `subset` class property with subset name on the key and on
the value the events that should trigger the computation of your subset. The subset value
will be stored on the `subsets` collection store's property, **it's a basic Fluxo.CollectionStore**.

Look the example below:

```js
class Todos extends Fluxo.CollectionStore {
  pending () {
    return this.where({ done: false });
  }
}

Todos.subset = { pending: ["add", "remove", "stores:change:done"] };

var todo1 = new Fluxo.ObjectStore({ done: true }),
    todo2 = new Fluxo.ObjectStore({ done: true }),
    todos = new Todos([todo1, todo2]);

todos.subsets.pending; // [] (Empty Fluxo.CollectionStore)

todo1.setAttribute("done", false);

todos.subsets.pending; // [todo1] (it's a Fluxo.CollectionStore)
```

##toJSON
Eventually you will pass the state that you are holding on your store to other
parts to your app, like the view layer. You should avoid pass the `data` or `stores`
properties directly, the `toJSON` is the right tool for this job.

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
stores (it will call `toJSON` on its children) and the **[subsets](#collection-subsets)** on the same way, like this:

```js
{
  cid: "FS:2",
  doneCount: 1,
  pending: [
    { cid: "FS:4", done: false, content: "Buy a car!" }
  ],
  stores: [
    { cid: "FS:3", done: true, content: "Buy milk!" },
    { cid: "FS:4", done: false, content: "Buy a car!" }
  ]
}
```

:warning: **The `#toJSON` method returns a new JSON copy everytime that your store changes, if not,
  the same copy is returned. It can be very useful for things like [React's PureRenderMixin](https://facebook.github.io/react/docs/pure-render-mixin.html)**

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
var eventCanceler = jon.on(["change:name"], function (store) {
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

###Nested Stores event bubbling
Every nested Fluxo store bubbles its events to its parents, like the example below:

```js
var author = new Fluxo.ObjectStore({ name: "John" });
var post = new Fluxo.ObjectStore({ content: "My post", author: author });

post.data.author.setAttribute("name", "Ruth");

// Triggered Events on "post" store:
// * change:author:name
// * change:author
// * change
```

###Collections and event bubbling

The Fluxo collections propagates all the children store event's with the prefix
`stores:`, so, if you trigger an event like "sayHello" on a store of a collection,
your collection will trigger the `stores:sayHello` event.

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
Ember.js computed properties, this feature allows you declare attributes that are
computed on some **[events of your store](#events)**.

Computed properties are very great to normalize the access of store's information
(you don't want deal with `store.fullName()`, right?)
and "caching" the computed results helping to avoid possible not necessary expensive
recomputations.

Look the example below:

```js
class Person extends Fluxo.ObjectStore {
  fullName: function () {
    return (this.data.firstName + " " + this.data.lastName);
  }
};

Person.computed = {
  fullName: ["change:firstName", "change:lastName"]
};

var person = new Person({ firstName: "John", lastName:  "Doe" });

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
  doneCount: ["add", "remove", "stores:change:done"]
};

var todos = new Todos([{ done: true }, { done: false }]);

todos.data.doneCount; // => 1

todos.stores[1].setAttribute("done", true);

todos.data.doneCount; // => 2
```

:warning: Computed properties **are computed on the store's creation**.

:warning: Don't create computed properties that hold collection subsets, use the specific
**[subset feature](#collection-subsets)** to this.

##Using with React.js

Fluxo is view layer agnostic, you can use whatever you want, but we highly recommend
the React.js. If you choose the React.js we already created a way to connect your
stores on your React.js components.

**Read more: https://github.com/fluxo-js/fluxo-react-connect-stores**

##License
Fluxo is released under the [MIT License](http://opensource.org/licenses/MIT).
