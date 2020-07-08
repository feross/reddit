# reddit [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url]

[travis-image]: https://img.shields.io/travis/feross/reddit/master.svg
[travis-url]: https://travis-ci.org/feross/reddit
[npm-image]: https://img.shields.io/npm/v/reddit.svg
[npm-url]: https://npmjs.org/package/reddit
[downloads-image]: https://img.shields.io/npm/dm/reddit.svg
[downloads-url]: https://npmjs.org/package/reddit

### Simple Reddit API client

## Install

```
npm install reddit
```

This package is used by [BitMidi](https://bitmidi.com) to post MIDI files to the [/r/BitMidi](https://www.reddit.com/r/BitMidi/) subreddit.

## Features

- Lightweight – no unecessary dependencies, easy-to-audit source code
- Modern API – uses async/await and promises
- Powered by the [official Reddit API](https://www.reddit.com/dev/api/)

## Usage

First, [create a Reddit App](https://www.reddit.com/prefs/apps).

- Click "Create app"
- For simple scripts, you can select a type of "script".
- You can enter anything in the "about URL" and "redirect URL" fields.
- Note your app ID (appears below the app name) and your app secret.

Now, let's take an action on Reddit:

```js
const Reddit = require('reddit')

const reddit = new Reddit({
  username: 'TODO',
  password: 'TODO',
  appId: 'TODO',
  appSecret: 'TODO',
  userAgent: 'MyApp/1.0.0 (http://example.com)'
})

// Submit a link to the /r/BitMidi subreddit
const res = await reddit.post('/api/submit', {
  sr: 'WeAreTheMusicMakers',
  kind: 'link',
  resubmit: true,
  title: 'BitMidi – 100K+ Free MIDI files',
  url: 'https://bitmidi.com'
})

console.log(res)
// Prints:
// {
//   json: {
//     errors: [],
//     data: {
//       url: 'https://www.reddit.com/r/WeAreTheMusicMakers/comments/96ak55/',
//       drafts_count: 0,
//       id: '96ak55',
//       name: 't3_96ak55'
//     }
//   }
// }
```

## API

### `reddit = new Reddit(opts)`

Create a new Reddit API client.

You must provide `opts`, an object with the following required properties:

- `username` - Username of the reddit user
- `password` - Password of the reddit user
- `appId` - Reddit App ID
- `appSecret` - Reddit App Secret

The following `opts` properties are optional:

- `opts.userAgent` - String to use as the `User-Agent` header in http requests

### `reddit.get(url, [data])`

Invoke the Reddit API using the `GET` HTTP method.

The `url` parameter is used to specify which API to invoke. For example, `/api/submit` or `/api/vote`. A complete listing of possible APIs is available in the [Reddit API documentation](https://www.reddit.com/dev/api/).

The optional `data` parameter is used to specify relevant data for the selected API. The necessary data varies depending on which API is being used. Again, see the [Reddit API documentation](https://www.reddit.com/dev/api/).

### `reddit.post(url, [data])`

Invoke the Reddit API using the `POST` HTTP method.

### `reddit.patch(url, [data])`

Invoke the Reddit API using the `PATCH` HTTP method.

### `reddit.put(url, [data])`

Invoke the Reddit API using the `PUT` HTTP method.

### `reddit.delete(url, [data])`

Invoke the Reddit API using the `DELETE` HTTP method.

## License

The Prosperity Public License. Copyright (c) [Feross Aboukhadijeh](http://feross.org).

To obtain a commercial license, visit [feross.org/commercial](https://feross.org/commercial).
