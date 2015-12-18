# Intro

The new Celestial UI

# Usage
In order to build first install:

```bash
$ sudo npm install -g grunt-cli --save-dev
$ npm install grunt --save-dev
$ npm install grunt-contrib-watch --save-dev
$ npm install grunt-contrib-clean --save-dev
$ npm install grunt-elm --save-dev
```

JS depdencies:

```bash
$ npm install bower --save-dev
$ bower install
```

Elm packages:

```bash
$ git submodule update --init
$ elm package install
``
Then run:

```bash
$ grunt watch
```

