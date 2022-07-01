!(function (e) {
  var t,
    c,
    n,
    o,
    i,
    d =
      '<svg><symbol id="icon-search" viewBox="0 0 1024 1024"><path d="M192 480a256 256 0 1 1 512 0 256 256 0 0 1-512 0m631.776 362.496l-143.2-143.168A318.464 318.464 0 0 0 768 480c0-176.736-143.264-320-320-320S128 303.264 128 480s143.264 320 320 320a318.016 318.016 0 0 0 184.16-58.592l146.336 146.368c12.512 12.48 32.768 12.48 45.28 0 12.48-12.512 12.48-32.768 0-45.28"  ></path></symbol><symbol id="icon-caidan" viewBox="0 0 1024 1024"><path d="M382.3 165.6h-165c-47.5 0-86 38.4-86 86v165c0 47.5 38.4 86 86 86h165c47.5 0 86.5-38.4 86-86v-165c0-47.6-38.5-86-86-86z m43.3 251c0 11.2-4.3 21.9-12.3 29.9-8 8.5-19.2 12.8-31 12.8h-165c-24 0-43.2-19.2-43.2-43.2V251c0-24 19.2-43.2 43.2-43.2h165v0.5c24 0 43.2 19.2 43.2 43.2v165.1zM382.3 557.5h-165c-47.5 0-86 38.4-86 86v165c0 47.5 38.4 86 86 86h165c47.5 0 86.5-38.4 86-86v-165c0-47.6-38.5-86-86-86z m43.3 251c0 11.2-4.3 21.9-12.3 29.9-8 8.5-19.2 12.8-31 12.8h-165c-24 0-43.2-19.2-43.2-43.2V643.5c0-24 19.2-43.2 43.2-43.2h165c24 0 43.2 19.2 43.2 43.2v165zM871.4 273.5L755 157.1c-16-16-37.9-25.1-60.9-25.1s-44.8 9.1-60.9 25.1L516.9 273.5c-33.6 33.6-33.6 88.1 0 121.7l116.4 116.4c16 16 37.9 25.1 60.9 25.1s44.8-8.5 60.9-25.1l116.4-116.4c33.5-33.6 33.5-88.1-0.1-121.7zM841 364.8L724.6 481.2c-7.5 8-18.2 12.3-30.4 12.3-11.7 0-22.4-4.8-30.4-12.8L547.3 364.2c-8-8-12.8-19.2-12.8-30.4 0-11.7 4.3-22.4 12.8-30.4L663.7 187c8-7.5 19.2-12.3 30.4-12.3 11.7 0 22.4 4.8 30.4 12.8L841 303.9c8 8 12.8 19.2 12.8 30.4 0 11.8-4.3 22.5-12.8 30.5zM776.4 557.5h-165c-47.5 0-86 38.4-86 86v165c0 47.5 38.4 86 86 86h165c47.5 0 86.5-38.4 86-86v-165c-0.1-47.6-38.5-86-86-86z m43.2 251c0 11.2-4.3 21.9-12.3 29.9-8 8.5-19.2 12.8-31 12.8h-165c-24 0-43.2-19.2-43.2-43.2V643.5c0-24 19.2-43.2 43.2-43.2h165c24 0 43.2 19.2 43.2 43.2v165z"  ></path></symbol></svg>',
    a = (a = document.getElementsByTagName('script'))[
      a.length - 1
    ].getAttribute('data-injectcss'),
    s = function (e, t) {
      t.parentNode.insertBefore(e, t);
    };
  if (a && !e.__iconfont__svg__cssinject__) {
    e.__iconfont__svg__cssinject__ = !0;
    try {
      document.write(
        '<style>.svgfont {display: inline-block;width: 1em;height: 1em;fill: currentColor;vertical-align: -0.1em;font-size:16px;}</style>',
      );
    } catch (e) {
      console && console.log(e);
    }
  }
  function l() {
    i || ((i = !0), n());
  }
  function r() {
    try {
      o.documentElement.doScroll('left');
    } catch (e) {
      return void setTimeout(r, 50);
    }
    l();
  }
  (t = function () {
    var e,
      t = document.createElement('div');
    (t.innerHTML = d),
      (d = null),
      (t = t.getElementsByTagName('svg')[0]) &&
        (t.setAttribute('aria-hidden', 'true'),
        (t.style.position = 'absolute'),
        (t.style.width = 0),
        (t.style.height = 0),
        (t.style.overflow = 'hidden'),
        (t = t),
        (e = document.body).firstChild ? s(t, e.firstChild) : e.appendChild(t));
  }),
    document.addEventListener
      ? ~['complete', 'loaded', 'interactive'].indexOf(document.readyState)
        ? setTimeout(t, 0)
        : ((c = function () {
            document.removeEventListener('DOMContentLoaded', c, !1), t();
          }),
          document.addEventListener('DOMContentLoaded', c, !1))
      : document.attachEvent &&
        ((n = t),
        (o = e.document),
        (i = !1),
        r(),
        (o.onreadystatechange = function () {
          'complete' == o.readyState && ((o.onreadystatechange = null), l());
        }));
})(window);
