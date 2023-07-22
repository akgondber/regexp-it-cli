# regexp-it-cli [![NPM version][npm-image]][npm-url]

> Command line application to search text by regular expressions

## Install

```bash
$ npm install --global regexp-it-cli
```

## CLI

```
$ regexp-it-cli --help

  Usage
  $ regexp-it-cli

  Options
    --source, -s Optional source string (can be typed through terminal ui after launching)
    --file, -f   Optional file which content's should be used as a source
    --regexp-str, -r Optional regexp string (can be typed through terminal ui after launching)

  Examples
    $ regexp-it-cli
    $ regexp-it-cli --source "My text which\nis going to be used for regexp expectations"
    $ regexp-it-cli --source "My sample text\nas a source for regexp expectations" --regexp-str "t[a-t]"
    $ regexp-it-cli --file "samples/content.txt" --regexp-str "([Tt]he|a) \w{4,6}\b"
```

## Screenshots

Demo with a source using `\b\w{7,8}\b` regular expression
![](media/regexp-it-cli-demo-with-source.png)

Demo with a file source
![](media/regexp-cli-example-from-file.png)

## Demo

![](media/demo.gif)

## License

MIT © [Rushan Alyautdinov](https://github.com/akgondber)

[npm-image]: https://img.shields.io/npm/v/regexp-it-cli.svg?style=flat
[npm-url]: https://npmjs.org/package/regexp-it-cli
