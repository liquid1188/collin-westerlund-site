/* Listen band — shuffle player for Collin's catalog via SoundCloud Widget API.
   Lazy: nothing loads until first press of play. */
(function(){
  var band = document.getElementById('listen-band');
  if (!band) return;
  document.body.classList.add('has-band');

  var playBtn = band.querySelector('.lb-play');
  var nextBtn = band.querySelector('.lb-next');
  var titleEl = band.querySelector('.lb-title');
  var widget = null, order = [], pos = 0, ready = false, isPlaying = false;

  function shuffle(n){
    var a = []; for (var i=0;i<n;i++) a.push(i);
    for (var j=a.length-1;j>0;j--){ var k=Math.floor(Math.random()*(j+1)); var t=a[j]; a[j]=a[k]; a[k]=t; }
    return a;
  }

  function setTitle(t){ titleEl.textContent = t; }

  function updateTitle(){
    widget.getCurrentSound(function(s){ if (s && s.title) setTitle(s.title); });
  }

  function playIndex(i){
    widget.skip(i);
    widget.play();
  }

  function nextTrack(){
    if (!ready) return;
    pos = (pos + 1) % order.length;
    playIndex(order[pos]);
  }

  function boot(){
    setTitle('Warming up the room\u2026');
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
          order = shuffle(n); pos = 0; ready = true;
          playIndex(order[0]);
        });
      });
      widget.bind(SC.Widget.Events.PLAY, function(){
        isPlaying = true; playBtn.classList.add('playing'); updateTitle();
      });
      widget.bind(SC.Widget.Events.PAUSE, function(){
        isPlaying = false; playBtn.classList.remove('playing');
      });
      widget.bind(SC.Widget.Events.FINISH, nextTrack);
      widget.bind(SC.Widget.Events.ERROR, nextTrack);
    };
    s.onerror = function(){ setTitle('Player unavailable \u2014 listen on SoundCloud \u2192'); };
    document.head.appendChild(s);
  }

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
