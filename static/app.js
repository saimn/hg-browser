/** @jsx React.DOM */

/**
 * Mercurial browser.
 * Copyright (c) 2014 - Simon Conseil
 * Licensed under the MIT license.
 */

var $ = require('jquery');
var _ = require('underscore');
var React = require('react');
var prettyDate = require('./vendor/pretty');

$(function(){
  'use strict';

  var ReposBox = React.createClass({
    getInitialState: function() {
      return {data: []};
    },
    componentWillMount: function() {
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        success: function (data) {
          this.setState({data: _.sortBy(data.results, function(o) { return o.name; })});
        }.bind(this),
        error: function (xhr, status, err) {
          console.error("/repos", status, err.toString());
        }.bind(this)
      });
    },
    handleSort: function(order) {
      console.log('Sorting by ' + order);
      this.setState({data: _.sortBy(this.state.data, function(o) {
        return order === 'date' ? - new Date(o.date) : o.name;
      })});
    },
    render: function() {
      console.log('Render ReposBox', this.state.data);
      return (
        /* jshint ignore:start */
        <section className="repos_box">
          <header>
            <h2>Repositories</h2>
          </header>
          <RepoList data={this.state.data}  onSort={this.handleSort} />
          <footer>
            <b>{this.state.data.length}</b> {this.state.data.length > 1 ? "repositories" : "repository" }
          </footer>
        </section>
        /* jshint ignore:end */
      );
    }
  });

  var RepoList = React.createClass({
    sortByName: function() {
      console.log("sortByName");
      this.props.onSort('name');
    },
    sortByDate: function() {
      console.log("sortByDate");
      this.props.onSort('date');
    },
    render: function() {
      console.log('Render ReposList');
      var repos = this.props.data.map(function(repo) {
        /* jshint ignore:start */
        return <Repo repo={repo}></Repo>;
        /* jshint ignore:end */
      }, this);

      return (
        /* jshint ignore:start */
        <table className="table table-hover table-condensed">
        <thead>
          <tr>
            <th><span onClick={this.sortByName}>Name</span></th>
            <th>Last commit</th>
            <th><span onClick={this.sortByDate}>Last modified</span></th>
          </tr>
        </thead>
        <tbody>
        {repos}
        </tbody>
        </table>
        /* jshint ignore:end */
      );
    }
  });

  var Repo = React.createClass({
    getInitialState: function() {
      // console.log(this.props.repo.name, this.props.repo.date, prettyDate(this.props.repo.date));
      return { seen: true, };
    },
    markRead: function() {
      console.log("markRead");
    },
    render: function() {
      return (
        /* jshint ignore:start */
        <tr className={this.state.seen ? true : "well" } onClick={this.markRead}>
          <td><a href={this.props.repo.url}>{this.props.repo.name}</a></td>
          <td><span title={this.props.repo.author + ': ' + this.props.repo.desc}>{this.props.repo.rev}</span></td>
          <td><span title={this.props.repo.date}>{prettyDate(this.props.repo.date)}</span></td>
        </tr>
        /* jshint ignore:end */
      );
    }
  });

  React.renderComponent(
    /* jshint ignore:start */
    <ReposBox url="/repos" />,
    /* jshint ignore:end */
    document.getElementById('app')
  );
});
