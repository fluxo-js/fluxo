#Fluxo [![Build Status](https://travis-ci.org/samuelsimoes/fluxo.svg?branch=master)](https://travis-ci.org/samuelsimoes/fluxo)

Fluxo is a simple, lightweight (~300LOC) and dependency free data infrastructure lib based
on [Facebook Flux](https://facebook.github.io/flux) and [Backbone.js](http://backbonejs.org). It's compatible with [React.js](https://facebook.github.io/react), but you can use
with whatever you want to the view/component layer.

:warning: **This project is under development and experimental phase and because
of this many things may change.**

:ballot_box_with_check: Read the **[Getting started](https://github.com/samuelsimoes/fluxo/wiki/Getting-Started)**.

:ballot_box_with_check: Check the **[TodoMVC implementation](https://github.com/samuelsimoes/todomvc-fluxo)** with Fluxo.

##How to use

:warning: Before I highly recomend you to read about the [React.js](https://facebook.github.io/react) and [Facebook Flux](https://facebook.github.io/flux) to a better understanding.

###Installation

Install with bower and include on your page or use some module loader.
```
$ bower install --save fluxo
```

##Actions

The action handlers are where you should put the _mediation code_. Example: when
our user click on a button on our view that should give a new name to our presented
person, this click event will invoke an action on the action layer that will
mediate the intended result.

Fluxo hasn't any opinion or something like "action creator wrapper". We really
believe that simple javascript objects can does this job quite well.

```javascript
var CommentActionHandler = {
  initialize: function (comment) {
    this.comment = comment;
  },

  update: function (content) {
    this.comment.setContent(content);
  }
};

var store = new Fluxo.Store({ content: "Hello!" });

CommentActionHandler.initialize(store);

CommentActionHandler.update("Hello world!");
```

## Stores

You hold the state of your Fluxo app on the store, the stores should emit an event
to the component/view layer when something change and then your view layer renders the
changes.

On Fluxo, the store is a convenient wrapper to your literal javascript objects or
array with literal objects.

You can create stores like this:

```javascript
// Create a Comment Store class extending the Fluxo.Store class
var Comment = Fluxo.Store.extend({
  myStoreMethod: function() {
    // ...
  }
});

// Instantiate a new Comment Store with some initial data on the constructor
var comment = new Comment({ content: "This is my comment" });
```

If you need update your data, use the `Fluxo.Store#set` method.

```javascript
comment.set({ content: "This is my edited comment" });
```

All your data lives on your store's `data` property.

```javascript
comment.data.content // => "This is my comment"
```

##CollectionStore

Fluxo.CollectionStore is a wrapper to your array of objects. When you create
a CollectionStore, each item of your array is wrapped on a instance of Fluxo.Store,
which you can change extending the Fluxo.CollectionStore and specifying your
store class.

Note: Fluxo.CollectionStore has the same methods of the Fluxo.Store, so you
can use methods like `set` of Fluxo.Store.

```javascript
var MyComments = Fluxo.CollectionStore.extend({
  store: MyComment
});
```

When a child store of a collection emits a signal of change, this signal is propagated
to the collection that also emits a change signal.

All your stores instances lives on the `stores` property.

##Using with React.js

Fluxo is view layer agnostic, you can use whatever you want, but we highly recommend
the React.js. If you choose the React.js we already created a way to connect your
stores on your React.js components.

**Read more: https://github.com/samuelsimoes/fluxo-react-connect-stores**

###And more...

* [Store's Computed Properties](https://github.com/samuelsimoes/fluxo/wiki/Store's-Computed-Properties)
* [Store's Events](https://github.com/samuelsimoes/fluxo/wiki/Store's-Events)

-----------------------------------------

**Samuel Simões ~ [@samuelsimoes](https://twitter.com/samuelsimoes) ~ [samuelsimoes.com](http://samuelsimoes.com)**
