/* Listen band — shuffle player for Collin's catalog via SoundCloud Widget API.
   Lazy: nothing loads until first press of play.
   Progress persists across pages via sessionStorage — one click resumes mid-song. */
(function(){
  var band = document.getElementById('listen-band');
  if (!band) return;
  document.body.classList.add('has-band');

  var KEY = 'cw-listen-state';
  var playBtn = band.querySelector('.lb-play');
  var nextBtn = band.querySelector('.lb-next');
  var titleEl = band.querySelector('.lb-title');
  var widget = null, order = [], pos = 0, ready = false, isPlaying = false;
  var resumeMs = 0, lastSave = 0;

  function load(){
    try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch(e){ return null; }
  }
  function save(ms){
    try {
      sessionStorage.setItem(KEY, JSON.stringify({
        order: order, pos: pos, ms: Math.round(ms || 0),
        title: titleEl.textContent, ts: Date.now()
      }));
    } catch(e){}
  }
  var saved = load();
  if (saved && saved.title && saved.order && saved.order.length){
    titleEl.textContent = 'Resume \u2014 ' + saved.title.replace(/^Resume \u2014 /,'');
  }

  function shuffle(n){
    var a = []; for (var i=0;i<n;i++) a.push(i);
    for (var j=a.length-1;j>0;j--){ var k=Math.floor(Math.random()*(j+1)); var t=a[j]; a[j]=a[k]; a[k]=t; }
    return a;
  }

  function updateTitle(){
    widget.getCurrentSound(function(s){
      if (s && s.title) titleEl.textContent = s.title;
    });
  }

  function playIndex(i){ widget.skip(i); widget.play(); }

  function nextTrack(){
    if (!ready) return;
    resumeMs = 0;
    pos = (pos + 1) % order.length;
    playIndex(order[pos]);
    save(0);
  }

  function boot(){
    titleEl.textContent = 'Warming up the room\u2026';
    var s = document.createElement('script');
    s.src = 'https://w.soundcloud.com/player/api.js';
    s.onload = function(){
      var holder = document.getElementById('lb-frame-holder');
      var f = document.createElement('iframe');
      f.width = '100%'; f.height = '166';
      f.setAttribute('allow','autoplay');
      f.setAttribute('frameborder','no');
      f.title = 'Collin Westerlund on SoundCloud';
      f.src = 'https://w.soundcloud.com/player/?url=' +
        encodeURIComponent('https://api.soundcloud.com/users/930190459') +
        '&auto_play=false&show_teaser=false&single_active=true';
      holder.appendChild(f);
      widget = SC.Widget(f);
      widget.bind(SC.Widget.Events.READY, function(){
        widget.getSounds(function(sounds){
          var n = (sounds && sounds.length) ? sounds.length : 1;
          var st = load();
          if (st && st.order && st.order.length === n && typeof st.pos === 'number'){
            order = st.order; pos = st.pos % n; resumeMs = st.ms || 0;
          } else {
            order = shuffle(n); pos = 0; resumeMs = 0;
          }
          ready = true;
          playIndex(order[pos]);
        });
      });
      widget.bind(SC.Widget.Events.PLAY, function(){
        isPlaying = true; playBtn.classList.add('playing');
        if (resumeMs > 1500){ widget.seekTo(resumeMs); resumeMs = 0; }
        updateTitle();
      });
      widget.bind(SC.Widget.Events.PAUSE, function(){
        isPlaying = false; playBtn.classList.remove('playing');
        widget.getPosition(function(ms){ save(ms); });
      });
      widget.bind(SC.Widget.Events.PLAY_PROGRESS, function(e){
        var now = Date.now();
        if (now - lastSave > 3000){ lastSave = now; save(e.currentPosition); }
      });
      widget.bind(SC.Widget.Events.FINISH, nextTrack);
      widget.bind(SC.Widget.Events.ERROR, nextTrack);
    };
    s.onerror = function(){ titleEl.textContent = 'Player unavailable \u2014 listen on SoundCloud \u2192'; };
    document.head.appendChild(s);
  }

  window.addEventListener('pagehide', function(){
    if (widget && ready && isPlaying){
      widget.getPosition(function(ms){ save(ms); });
    }
  });

  playBtn.addEventListener('click', function(){
    if (!widget) { boot(); return; }
    if (!ready) return;
    if (isPlaying) widget.pause(); else widget.play();
  });

  nextBtn.addEventListener('click', function(){
    if (!widget) { boot(); return; }
    nextTrack();
  });
})();
