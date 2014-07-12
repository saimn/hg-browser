// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  var app = {
    Models: {},
    Collections: {},
    Views: {},
  };

  app.Models.Repo = Backbone.Model.extend({
    // Default attributes for the todo item.
    defaults: function() {
      return {
        author: "",
        branch: "default",
        date: "",
        desc: "",
        name: "",
        node: "",
        rev: "",
        tags: "tip",
        url: "",
      };
    },

    idAttribute: "name",

    parse : function(response, options){
      // console.log('parse model: ' + response);
      response.date = new Date(response.date);
      return response;
    }
  });

  app.Collections.RepoList = Backbone.Collection.extend({
    model: app.Models.Repo,

    url: "/repos",

    // comparator: 'date',
    comparators: {
      name: function(item) {return item.get('name');},
      date: function(item) {return - item.get('date').getTime();},
    },

    initialize: function() {
      this.comparator = this.comparators.date;
    },

    parse : function(response){
      console.log('parse response: ' + response);
      return response.results;
    }
  });

  // Create our global collection of **Repos**.
  var Repos = new app.Collections.RepoList();
  Repos.on("all", function(eventName){
    console.log(eventName + ' was triggered!');
  });

  app.Views.RepoView = Backbone.View.extend({
    tagName:  "li",
    className: "list-group-item",
    template: Handlebars.compile($('#item-template').html()),

    initialize: function() {
      // this.listenTo(this.model, 'all', this.render);
      // this.listenTo(this.model, 'change', this.render);
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
  });

  var RepoListView = Backbone.View.extend({
    el: $("#repo-list"),
    collection: Repos,
    statsTemplate: Handlebars.compile($('#stats-template').html()),

    events: {
      'click p#sort-by a': 'sort'
    },

    initialize: function() {
      this.listenTo(this.collection, 'sort', this.render);
      this.listenTo(this.collection, 'sync', this.render);
      this.collection.fetch();
    },

    render: function() {
      var ul = this.$el.children('ul');
      ul.empty();
      this.collection.each(function(item) {
        var view = new app.Views.RepoView({model: item});
        ul.append(view.render().el);
      }, this);

      if (this.collection.length) {
        this.$el.show();
        this.$el.children('footer').html(this.statsTemplate({
          count: this.collection.length
        }));
      } else {
        this.$el.hide();
      }

      return this;
    },

    sort: function(ev) {
      // console.log('sort ' + $(ev.currentTarget));
      var sortOrder = $(ev.currentTarget).data('sort');
      this.collection.comparator = this.collection.comparators[sortOrder];
      this.collection.sort();
    },
  });

  // The Application
  // ---------------

  var AppView = Backbone.View.extend({
    el: $("#app"),

    events: {
    },

    initialize: function() {
      this.repoView = new RepoListView();
    },

    render: function() {
      console.log('Render AppView' + this);
      this.repoView.render();
    },
  });

  // The Router
  // ----------

  var AppRouter = Backbone.Router.extend({
    routes: {
      '*filter' : 'setFilter'
    },

    setFilter: function(params) {
      console.log('app.router.params = ' + params); // just for didactical purposes.
      if( params ){
        window.filter = params.trim() || '';
      } else {
        window.filter = '';
      }
      // app.todoList.trigger('reset');
    }
  });

  // Finally, we kick things off by creating the **App**.
  app.view = new AppView();
  app.router = new AppRouter();
  Backbone.history.start();

});
