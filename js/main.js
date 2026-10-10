(function(){
  var doc=document.documentElement;

  // ----- language -----
  var titles={ja:'こもれび動物病院｜地域に根差した、安心感のある動物病院',en:'Komorebi Animal Hospital | A caring animal hospital rooted in the community'};
  function setLang(l,save){
    doc.lang=l; document.title=titles[l];
    document.querySelectorAll('[data-alt-ja]').forEach(function(e){e.alt=e.getAttribute('data-alt-'+l);});
    document.querySelectorAll('[data-al-ja]').forEach(function(e){e.setAttribute('aria-label',e.getAttribute('data-al-'+l));});
    document.querySelectorAll('.lang button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.l===l);});
    if(save){try{localStorage.setItem('komorebi-lang',l)}catch(e){}}
    updateStatus();
  }
  document.querySelectorAll('.lang button').forEach(function(b){b.addEventListener('click',function(){setLang(b.dataset.l,true)})});
  var saved=null; try{saved=localStorage.getItem('komorebi-lang')}catch(e){}

  // ----- opening status (Japan time) -----
  var AM=[1,1,1,0,1,1,1], PM=[1,1,1,0,1,1,0]; // index: 0=Sun..6=Sat  (Wed=3)
  var DN={ja:['日','月','火','水','木','金','土'],en:['Sun','Mon','Tue','Wed','Thu','Fri','Sat']};
  function jst(){
    var p=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',weekday:'short',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date()),o={};
    p.forEach(function(x){o[x.type]=x.value});
    var d=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(o.weekday);
    return {d:d,m:(parseInt(o.hour,10)%24)*60+parseInt(o.minute,10)};
  }
  function slots(d){var s=[];if(AM[d])s.push([540,720]);if(PM[d])s.push([960,1200]);return s}
  function fmt(m){return Math.floor(m/60)+':'+('0'+m%60).slice(-2)}
  function updateStatus(){
    var l=doc.lang,t=jst(),box=document.getElementById('status'),main=document.getElementById('stMain'),sub=document.getElementById('stSub');
    var cur=slots(t.d).filter(function(s){return t.m>=s[0]&&t.m<s[1]})[0], open=!!cur;
    box.classList.toggle('open',open);
    if(open){
      main.textContent=l==='ja'?'現在、診療中です':'Open now';
      sub.textContent=l==='ja'?('本日 '+fmt(cur[0])+'〜'+fmt(cur[1])+' ／ ご予約はお電話で'):('Today '+fmt(cur[0])+'–'+fmt(cur[1])+' · call to book');
    }else{
      var next=null;
      for(var k=0;k<8&&!next;k++){var dd=(t.d+k)%7;slots(dd).forEach(function(s){if(!next&&(k>0||s[0]>t.m))next={k:k,d:dd,s:s[0]}})}
      main.textContent=l==='ja'?'現在、診療時間外です':'Currently closed';
      var when=!next?'':(next.k===0?(l==='ja'?'本日':'today'):next.k===1?(l==='ja'?'明日':'tomorrow'):DN[l][next.d]+(l==='ja'?'曜日':''));
      sub.textContent=next?(l==='ja'?('次回の診療：'+when+' '+fmt(next.s)+'〜'):('Next opening: '+when+' at '+fmt(next.s))):'';
    }
    document.querySelectorAll('#tbl [data-d]').forEach(function(c){c.classList.toggle('today',+c.dataset.d===t.d)});
  }
  setLang(saved==='en'?'en':'ja',false);
  setInterval(updateStatus,60000);

  // ----- drawer -----
  var mb=document.getElementById('menuBtn'),dr=document.getElementById('drawer');
  function tog(o){dr.classList.toggle('open',o);mb.setAttribute('aria-expanded',o);mb.querySelector('use').setAttribute('href',o?'#i-close':'#i-menu');document.body.style.overflow=o?'hidden':''}
  mb.addEventListener('click',function(){tog(!dr.classList.contains('open'))});
  dr.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){tog(false)})});

  // ----- brand link: back to top -----
  document.getElementById('brand').addEventListener('click',function(e){
    e.preventDefault(); if(dr.classList.contains('open'))tog(false);
    window.scrollTo({top:0,behavior:'smooth'});
  });

  // ----- reveal -----
  var els=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
    els.forEach(function(e){io.observe(e)});
  }else{els.forEach(function(e){e.classList.add('in')})}

  // ----- scroll: header, parallax, bottom bar -----
  var hdr=document.querySelector('.hdr'),bar=document.getElementById('bar'),contact=document.getElementById('contact'),par=document.querySelectorAll('[data-par]'),ticking=false;
  function onScroll(){
    var y=window.scrollY||0;
    hdr.classList.toggle('scrolled',y>8);
    if(y<900){par.forEach(function(p){p.style.transform='translateY('+(y*parseFloat(p.dataset.par))+'px)'})}
    var r=contact.getBoundingClientRect();
    bar.classList.toggle('hide',r.top<window.innerHeight*0.7&&r.bottom>0);
    ticking=false;
  }
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
  onScroll();
})();
