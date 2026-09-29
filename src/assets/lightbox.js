(function(){
  var figs=[].slice.call(document.querySelectorAll('.sheet figure'));
  if(!figs.length) return;
  var items=figs.map(function(f){var i=f.querySelector('img');return{src:i.getAttribute('src'),alt:i.alt,cap:(f.querySelector('figcaption')||{}).textContent||''}});
  var lb=document.createElement('div');
  lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Photo viewer');
  lb.innerHTML='<figure><img alt=""><figcaption></figcaption></figure>'+
    '<button class="lb-btn lb-close" aria-label="Close">&times;</button>'+
    '<button class="lb-btn lb-prev" aria-label="Previous photo">&larr;</button>'+
    '<button class="lb-btn lb-next-img" aria-label="Next photo">&rarr;</button>';
  document.body.appendChild(lb);
  var img=lb.querySelector('img'),cap=lb.querySelector('figcaption'),cur=0,last=null;
  function show(i){cur=(i+items.length)%items.length;img.src=items[cur].src;img.alt=items[cur].alt;cap.textContent=items[cur].cap+'  ·  '+(cur+1)+' / '+items.length;}
  function open(i){last=document.activeElement;show(i);lb.classList.add('open');document.body.style.overflow='hidden';lb.querySelector('.lb-close').focus();}
  function close(){lb.classList.remove('open');document.body.style.overflow='';if(last)last.focus();}
  figs.forEach(function(f,i){var b=f.querySelector('button')||f;b.addEventListener('click',function(){open(i)})});
  lb.querySelector('.lb-close').addEventListener('click',close);
  lb.querySelector('.lb-prev').addEventListener('click',function(e){e.stopPropagation();show(cur-1)});
  lb.querySelector('.lb-next-img').addEventListener('click',function(e){e.stopPropagation();show(cur+1)});
  lb.addEventListener('click',function(e){if(e.target===lb)close()});
  document.addEventListener('keydown',function(e){
    if(!lb.classList.contains('open'))return;
    if(e.key==='Escape')close();else if(e.key==='ArrowLeft')show(cur-1);else if(e.key==='ArrowRight')show(cur+1);
  });
  var x0=null;
  lb.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>50)show(cur+(dx<0?1:-1));x0=null});
})();
