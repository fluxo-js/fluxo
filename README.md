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

Install with bower:
```
$ bower install --save fluxo
```

or with npm:

```
$ npm install --save fluxo-js
```

and include on your page or use some module loader.

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

var store = new Fluxo.ObjectStore.create({ data: { content: "Hello!" } });

CommentActionHandler.initialize(store);

CommentActionHandler.update("Hello world!");
```

## Stores

You hold the state of your Fluxo app on the store, the stores should emit an event
to the component/view layer when something change and then your view layer renders the
changes.

On Fluxo, the store is a javascript literal object that inherits some conveniences
from Fluxo.ObjectStore (attributes parser, computed properties and things like this).

You can create stores like this:

```javascript
// Create a comment store object that inherits the Fluxo.ObjectStore capacities
var comment = Fluxo.ObjectStore.create({
  data: { content: "This is my comment"  },

  myStoreMethod: function() {
    // ...
  }
});
```

If you need update your data, use the `Fluxo.ObjectStore#set` method.

```javascript
comment.set({ content: "This is my edited comment" });
```

All your data lives on your store's `data` property.

```javascript
comment.data.content // => "This is my comment"
```

You can provide default values to the store which may be overriden:

```javascript
var comment = Fluxo.ObjectStore.create({
  defaults: { title: "This is my title", content: "This is my default comment" },

  data: { content: "This is my comment" }
});

comment.data // => { title: "This is my title", content: "This is my comment" }
```

##CollectionStore

If you need deal with multiple stores you can use a javascript array with your
stores, using Fluxo.CollectionStore you can give some habilites to your array,
like emit change signal when some children store change, compute changes on children
stores and more.

You create collection stores like this:

```javascript
var myComments = Fluxo.CollectionStore.create({
  stores: [{ content: "children content" }],

  store: {
    childrenStoreMethod: function () {}
  }
});
```

Note: Fluxo.CollectionStore has the same methods of the Fluxo.ObjectStore, so you
can use methods like `set` of Fluxo.ObjectStore.

If you want to keep the stores always sorted, you may define a sort method:

```javascript
var myComments = Fluxo.CollectionStore.create({
  stores: [{ content: "children content", at: (new Date()) }],

  sort: function(a, b) {
    return a.data.at - b.data.at;
  }
});
```

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
