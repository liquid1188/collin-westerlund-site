(function(){
  var nav=document.querySelector('nav');
  var onScroll=function(){nav.classList.toggle('scrolled',window.scrollY>20)};
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  var pill=document.getElementById('work-pill');
  if(pill){
    var blockers=document.querySelectorAll('.hero-actions,.signup,.cta-band,footer'),onScreen=0;
    var onPill=function(){pill.classList.toggle('show',window.scrollY>window.innerHeight*0.6 && onScreen===0)};
    if('IntersectionObserver' in window){
      var seen=new Map();
      var bio=new IntersectionObserver(function(en){en.forEach(function(e){seen.set(e.target,e.isIntersecting)});onScreen=0;seen.forEach(function(v){if(v)onScreen++});onPill();});
      blockers.forEach(function(b){bio.observe(b)});
    }
    window.addEventListener('scroll',onPill,{passive:true});onPill();
  }
  var els=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window && els.length){
    var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}})},{threshold:.12});
    els.forEach(function(el){io.observe(el)});
  } else { els.forEach(function(el){el.classList.add('in')}); }
})();
