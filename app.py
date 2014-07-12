# -*- coding: utf-8 -*-

import bottle
import hglib
from os.path import dirname, join
from pprint import pprint
from bottle import route, run, request, static_file

# from hglib.client import cmdbuilder, templates
# out = REPO.rawcommand(cmdbuilder('log', template=templates.changeset,
#                                     patch=True, verbose=True, rev=rev))
# out = REPO._parserevs(out.split('\0')[:-1])

app = bottle.Bottle()
app.config.load_config('app.ini')

repos = {k.split('.', 1)[-1]: hglib.open(app.config[k])
         for k in app.config.keys() if k.startswith('repos.')}


def rev_to_dict(revision):
    """Convert a ``hglib.client.revision`` to dict."""
    resp = {key: getattr(revision, key)
            for key in ('rev', 'node', 'tags', 'branch', 'author', 'desc')}
    resp['date'] = revision.date.isoformat()
    return resp


def json_response(func):
    def wrapper(*args, **kwargs):
        resp = func(*args, **kwargs)
        resp['url'] = request.path
        print func
        pprint(resp)
        return resp
    return wrapper


@route('/static/<filepath:path>')
def serve_static(filepath):
    return static_file(filepath, root=join(dirname(__file__), 'static'))


@route('/repos')
@json_response
def index():
    results = []
    for repo_name, repo in repos.iteritems():
        d = rev_to_dict(repo.tip())
        d.update({
            'name': repo_name,
            'author': d['author'].split('<')[0][:-1],
            'url': '/repos/{}'.format(repo_name),
        })
        results.append(d)

    return {'results': results}


@route('/repos/<repository>')
@json_response
def repo_index(repository):
    return {'resources': {
        'commits': '/{}/commits'.format(repository),
        'tags': '/{}/tags'.format(repository),
    }}


@route('/repos/<repository>/commits')
@json_response
def commits(repository):
    repo = repos[repository]
    try:
        limit = int(request.query.limit)
    except ValueError:
        limit = 10
    return {'commits': [rev_to_dict(l) for l in repo.log(limit=limit)]}


@route('/repos/<repository>/commits/<revs>')
@json_response
def commit(repository, revs):
    repo = repos[repository]
    resp = rev_to_dict(repo.log(revrange=revs)[0])
    resp.update(diff=repo.diff(revs=revs))
    return resp


@route('/repos/<repository>/tags')
@json_response
def tags(repository):
    return {'tags': [dict(zip(('name', 'rev', 'node', 'islocal'), t))
                     for t in repos[repository].tags()]}


if __name__ == '__main__':
    # from bottle_debugtoolbar import DebugToolbarPlugin

    # config = {
    #     'DEBUG_TB_ENABLED': True,
    #     'DEBUG_TB_INTERCEPT_REDIRECTS': True,
    # }
    # plugin = DebugToolbarPlugin(config)
    # bottle.install(plugin)

    # bottle.debug(True)
    run(host='localhost', port=8080, debug=True, reloader=True)
