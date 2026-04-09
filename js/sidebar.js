document.addEventListener('DOMContentLoaded', function(){
  const toggles = Array.from(document.querySelectorAll('.menu-toggle'));
  const left = document.querySelector('.left-panel');
  const shell = document.querySelector('.app-shell');
  if(!toggles.length || !left) return;

  // create backdrop if missing
  let backdrop = document.querySelector('.sidebar-backdrop');
  if(!backdrop){
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
  }

  // ensure a close button exists inside the panel for mobile
  let closeBtn = left.querySelector('.menu-close');
  if(!closeBtn){
    closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'menu-close';
    closeBtn.setAttribute('aria-label','Close menu');
    closeBtn.innerHTML = '<i class="ph ph-x"></i>';
    left.insertBefore(closeBtn, left.firstChild);
  }

  function openSidebar(){
    left.classList.add('open');
    backdrop.classList.add('open');
    shell && shell.classList.add('sidebar-open');
    document.body.style.overflow = 'hidden';
    // focus first focusable in sidebar for accessibility
    const focusable = left.querySelector('a,button,input') || left;
    focusable && focusable.focus();
  }
  function closeSidebar(){
    left.classList.remove('open');
    backdrop.classList.remove('open');
    shell && shell.classList.remove('sidebar-open');
    document.body.style.overflow = '';
  }

  toggles.forEach(t => t.addEventListener('click', function(){
    if(left.classList.contains('open')) closeSidebar(); else openSidebar();
  }));

  closeBtn.addEventListener('click', closeSidebar);
  backdrop.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeSidebar(); });

  // close sidebar automatically on resize to large screens
  let resizeTimer;
  window.addEventListener('resize', function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){
      if(window.innerWidth > 860) closeSidebar();
    }, 120);
  });
});
