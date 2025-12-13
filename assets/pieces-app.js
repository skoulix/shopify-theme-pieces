import{g as c,S as m,a as x,F as P}from"./pieces-gsap.js";import{L as $}from"./pieces-lenis.js";import{_ as F,s as O,i as N,l as R,o as B,r as z}from"./pieces-swup.js";c.registerPlugin(m);class U{constructor(){this.lenis=null,this.isInitialized=!1}init(){return this.isInitialized?this.lenis:(this.lenis=new $({duration:1.2,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),orientation:"vertical",gestureOrientation:"vertical",smoothWheel:!0,wheelMultiplier:1,touchMultiplier:2,infinite:!1,prevent:t=>t.closest(".cart-drawer__content")||t.closest(".mobile-nav__content")||t.closest("[data-lenis-prevent]")}),this.lenis.on("scroll",m.update),c.ticker.add(t=>{this.lenis.raf(t*1e3)}),c.ticker.lagSmoothing(0),document.documentElement.classList.add("lenis"),this.isInitialized=!0,this.lenis)}scrollTo(t,e={}){if(!this.lenis)return;const i={offset:0,duration:1.2,easing:n=>Math.min(1,1.001-Math.pow(2,-10*n)),immediate:!1,lock:!1,onComplete:null};this.lenis.scrollTo(t,{...i,...e})}stop(){this.lenis&&this.lenis.stop()}start(){this.lenis&&this.lenis.start()}resize(){this.lenis&&this.lenis.resize()}destroy(){this.lenis&&(this.lenis.destroy(),this.lenis=null,this.isInitialized=!1,document.documentElement.classList.remove("lenis"))}get scroll(){return this.lenis?.scroll||0}get progress(){return this.lenis?.progress||0}get isScrolling(){return this.lenis?.isScrolling||!1}}const f=new U;c.registerPlugin(m);class j{constructor(){this.swup=null,this.isInitialized=!1,this.pageTransitionDuration=.6,this.skipAnimation=!1,this.transitionStyle=window.themeSettings?.pageTransitionStyle||"slide",this.supportsViewTransitions=typeof document.startViewTransition=="function"}shouldUseViewTransitions(){return this.supportsViewTransitions&&window.themeSettings?.enableViewTransitions!==!1&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches}init(){if(this.isInitialized)return this.swup;if(window.Shopify&&window.Shopify.designMode)return null;window.addEventListener("error",e=>{if(e.message&&e.message.includes("Cannot assign to read only property 'protect'"))return e.preventDefault(),!0}),this.shouldUseViewTransitions()&&this.injectViewTransitionStyles();const t=[{from:"(.*)",to:"(.*)",out:async e=>{await this.animateOut(),e()},in:async e=>{await this.animateIn(),e()}}];return this.swup=new F({containers:["#swup-container"],cache:!0,animateHistoryBrowsing:!0,linkSelector:'a[href^="'+window.location.origin+'"]:not([data-no-swup]), a[href^="/"]:not([data-no-swup]):not([href^="//"]), a[href^="#"]:not([data-no-swup])',plugins:[new O(t),new N({persistAssets:!0,persistTags:'link[rel="stylesheet"], style, script[src]'}),new R({preloadVisibleLinks:!0}),new B,new z({head:!1,body:!0})]}),this.setupEventListeners(),this.isInitialized=!0,this.swup}setupEventListeners(){this.swup.hooks.on("visit:start",t=>{document.documentElement.classList.add("is-changing"),document.documentElement.classList.add("scroll-locked"),f.stop(),t.to.url.includes("/cart")&&this.swup.cache.delete(t.to.url)}),this.swup.hooks.on("content:replace",()=>{m.getAll().forEach(e=>e.kill()),this.reinitializeComponents();const t=document.querySelector("main");t&&(t.setAttribute("tabindex","-1"),t.focus({preventScroll:!0}),this.announcePageChange()),requestAnimationFrame(()=>{f.resize(),m.refresh()})}),this.swup.hooks.on("visit:end",()=>{document.documentElement.classList.remove("is-changing"),document.documentElement.classList.remove("scroll-locked"),f.start(),window.dispatchEvent(new CustomEvent("swup:transitionEnd"))}),this.swup.hooks.on("page:view",()=>{window.dispatchEvent(new CustomEvent("swup:pageview",{detail:{url:window.location.href}}))})}async animateOut(){if(this.skipAnimation||this.shouldUseViewTransitions()&&this._viewTransitionActive)return Promise.resolve();const t=document.querySelector("#swup-container"),e=document.querySelector(".page-transition-overlay"),i=c.timeline();switch(this.transitionStyle){case"fade":i.to(t,{opacity:0,duration:.4,ease:"power2.inOut"});break;case"slide":i.to(t,{y:-40,opacity:0,duration:.25,ease:"power2.in"});break;case"curtain":default:e&&(c.set(e,{transformOrigin:"bottom",scaleY:0}),i.to(e,{scaleY:1,duration:.4,ease:"power3.inOut"})),i.to(t,{y:-40,opacity:0,duration:.25,ease:"power2.in"},.1);break}return i}async animateIn(){f.scrollTo(0,{immediate:!0});const t=document.querySelector("#swup-container"),e=document.querySelector(".page-transition-overlay");if(this.skipAnimation)return this.skipAnimation=!1,c.set(t,{opacity:1,y:0,x:0}),e&&c.set(e,{scaleY:0,scaleX:0}),Promise.resolve();const i=c.timeline();switch(this.transitionStyle){case"fade":c.set(t,{opacity:0,x:0,y:0}),i.to(t,{opacity:1,duration:.4,ease:"power2.inOut"}),i.add(()=>{this.animateRevealElements()},.1);break;case"slide":c.set(t,{opacity:0,y:40,x:0}),i.to(t,{y:0,opacity:1,duration:.3,ease:"power2.out"}),i.add(()=>{this.animateRevealElements()},.1);break;case"curtain":default:c.set(t,{opacity:0,x:0,y:40}),e&&(c.set(e,{transformOrigin:"top",scaleY:1}),i.to(e,{scaleY:0,duration:.5,ease:"power3.inOut"})),i.to(t,{y:0,opacity:1,duration:.3,ease:"power2.out"},.2),i.add(()=>{this.animateRevealElements()},.3);break}return i}animateRevealElements(){document.querySelectorAll("[data-reveal]").forEach((e,i)=>{const n=e.dataset.revealDelay||i*.1;e.dataset.reveal,c.to(e,{opacity:1,x:0,y:0,scale:1,clipPath:"inset(0 0% 0 0)",duration:.8,delay:n,ease:"power2.out"})})}announcePageChange(){let t=document.getElementById("swup-announce");t||(t=document.createElement("div"),t.id="swup-announce",t.setAttribute("role","status"),t.setAttribute("aria-live","polite"),t.setAttribute("aria-atomic","true"),t.className="sr-only",document.body.appendChild(t));const e=document.title||"Page loaded";t.textContent="",setTimeout(()=>{t.textContent=e},100)}reinitializeComponents(){window.dispatchEvent(new CustomEvent("swup:contentReplaced")),window.Shopify&&window.Shopify.PaymentButton&&window.Shopify.PaymentButton.init(),document.querySelectorAll("details-disclosure, details-modal").forEach(t=>{t.connectedCallback&&t.connectedCallback()})}navigateTo(t,e=!1){this.swup?(this.skipAnimation=e,this.swup.navigate(t)):window.location.href=t}updateUrl(t,e=!1){e?window.history.replaceState({swupPreview:!0},"",t):window.history.pushState({swupPreview:!0},"",t)}goBack(){window.history.back()}clearCache(t){if(!this.swup||!this.swup.cache)return;const e=Array.isArray(t)?t:[t];this.swup.cache.all.forEach((i,n)=>{e.some(s=>n.includes(s))&&this.swup.cache.delete(n)})}clearAllCache(){this.swup&&this.swup.cache&&this.swup.cache.clear()}injectViewTransitionStyles(){if(document.getElementById("view-transition-styles"))return;const t=document.createElement("style");t.id="view-transition-styles",t.textContent=`
      /* View Transition API styles */
      @view-transition {
        navigation: auto;
      }

      /* Root transition - fade */
      ::view-transition-old(root) {
        animation: 0.3s ease-out both fade-out;
      }

      ::view-transition-new(root) {
        animation: 0.3s ease-out both fade-in;
      }

      /* Product card transitions - morph effect */
      .product-card {
        view-transition-name: var(--view-transition-name);
      }

      ::view-transition-old(product-card),
      ::view-transition-new(product-card) {
        animation-duration: 0.4s;
      }

      /* Header stays in place during transition */
      [data-header-wrapper] {
        view-transition-name: header;
      }

      ::view-transition-old(header),
      ::view-transition-new(header) {
        animation: none;
        mix-blend-mode: normal;
      }

      /* Animation keyframes */
      @keyframes fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
      }

      @keyframes slide-in {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slide-out {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-20px);
        }
      }

      /* Respect reduced motion */
      @media (prefers-reduced-motion: reduce) {
        ::view-transition-group(*),
        ::view-transition-old(*),
        ::view-transition-new(*) {
          animation: none !important;
        }
      }
    `,document.head.appendChild(t)}async startViewTransition(t){if(!this.shouldUseViewTransitions())return await t(),null;this._viewTransitionActive=!0;try{await document.startViewTransition(async()=>{await t()}).finished}catch{await t()}finally{this._viewTransitionActive=!1}}destroy(){this.swup&&(this.swup.destroy(),this.swup=null,this.isInitialized=!1)}}const k=new j;c.registerPlugin(m,x);class V{constructor(){this.animations=[],this.scrollTriggers=[],this.introObserver=null}getScrollTriggerStart(t="top 85%"){const e=window.themeSettings?.animationTriggerOffset||"md",i={none:t,sm:"top 90%",md:"top 80%",lg:"top 70%"};return i[e]||i.md}initRevealAnimations(){this.killScrollTriggers();const t=document.querySelectorAll("[data-reveal]"),e=this.getScrollTriggerStart();t.forEach(i=>{const n=i.dataset.reveal||"fade-up",s=parseFloat(i.dataset.revealDelay)||0,a=parseFloat(i.dataset.revealDuration)||.8,r=i.dataset.revealStart||e,o=this.getInitialState(n);c.set(i,o);const l=m.create({trigger:i,start:r,once:!0,onEnter:()=>{c.to(i,{opacity:1,x:0,y:0,scale:1,clipPath:"inset(0 0% 0 0)",duration:a,delay:s,ease:"power2.out"})}});this.scrollTriggers.push(l)})}getInitialState(t){const e={fade:{opacity:0},"fade-up":{opacity:0,y:40},"fade-down":{opacity:0,y:-40},"fade-left":{opacity:0,x:40},"fade-right":{opacity:0,x:-40},scale:{opacity:0,scale:.9},clip:{clipPath:"inset(0 100% 0 0)"},"clip-up":{clipPath:"inset(100% 0 0 0)"}};return e[t]||e.fade}initStaggerAnimations(){const t=document.querySelectorAll("[data-stagger]"),e=this.getScrollTriggerStart();t.forEach(i=>{const n=i.children,s=parseFloat(i.dataset.stagger)||.1,a=i.dataset.staggerStart||e;c.set(n,{opacity:0,y:20});const r=m.create({trigger:i,start:a,once:!0,onEnter:()=>{c.to(n,{opacity:1,y:0,duration:.6,stagger:s,ease:"power2.out"})}});this.scrollTriggers.push(r)})}initParallax(){document.querySelectorAll("[data-parallax]").forEach(e=>{const i=parseFloat(e.dataset.parallax)||.5,n=m.create({trigger:e,start:"top bottom",end:"bottom top",scrub:!0,onUpdate:s=>{const a=s.progress*100*i-50*i;c.set(e,{y:a})}});this.scrollTriggers.push(n)})}initImageReveals(){const t=document.querySelectorAll("[data-image-reveal]"),e=this.getScrollTriggerStart();t.forEach(i=>{const n=i.querySelector("img");if(!n)return;c.set(n,{scale:1.2,opacity:0});const s=m.create({trigger:i,start:e,once:!0,onEnter:()=>{c.to(n,{scale:1,opacity:1,duration:1.2,ease:"power2.out"})}});this.scrollTriggers.push(s)})}getAnimationRootMargin(){const t=window.themeSettings?.animationTriggerOffset||"md",e={none:"0px 0px 0px 0px",sm:"0px 0px -10% 0px",md:"0px 0px -20% 0px",lg:"0px 0px -30% 0px"};return e[t]||e.md}initIntroAnimations(){const t=document.querySelectorAll("[data-intro]:not(.intro-visible)");if(typeof window.shouldAnimate=="function"&&!window.shouldAnimate()){t.forEach(o=>{o.classList.add("intro-visible")});return}if(!("IntersectionObserver"in window)){t.forEach(o=>{o.classList.add("intro-visible")});return}this.introObserver&&(this.introObserver.disconnect(),this.introObserver=null);let e=[],i=!1;const n=100,s=()=>{if(e.length===0){i=!1;return}i=!0,e.shift().classList.add("intro-visible"),setTimeout(s,n)},a=this.getAnimationRootMargin();this.introObserver=new IntersectionObserver(o=>{o.forEach(l=>{if(l.isIntersecting){const h=l.target;this.introObserver.unobserve(h),e.push(h),i||s()}})},{root:null,rootMargin:a,threshold:.01});const r=o=>{const l=o.getBoundingClientRect(),h=window.innerHeight||document.documentElement.clientHeight,p=parseInt(a.split(" ")[2])||0;return l.top<h+p&&l.bottom>0};t.forEach(o=>{r(o)?(e.push(o),i||s()):this.introObserver.observe(o)})}splitTextReveal(t,e={}){if(!t)return null;const{timeline:i=null,duration:n=1.2,stagger:s=.1,ease:a="power4.out",delay:r=0,lineClass:o="split-line"}=e,l=new x(t,{type:"lines",linesClass:o});l.lines.forEach((g,b)=>{const S=document.createElement("div");S.style.overflow="hidden",S.style.display="block",g.parentNode.insertBefore(S,g),S.appendChild(g)}),c.set(l.lines,{yPercent:100});const h={yPercent:0,duration:n,ease:a,stagger:s};let p;return i?p=i.to(l.lines,h,r):(h.delay=r,p=c.to(l.lines,h)),{split:l,animation:p}}initSplitTextAnimations(){const t=document.querySelectorAll("[data-split-text]:not([data-split-initialized])"),e=this.getScrollTriggerStart();t.forEach(i=>{const n=i.dataset.splitLineClass||"split-line",s=parseFloat(i.dataset.splitDuration)||1.2,a=parseFloat(i.dataset.splitStagger)||.1,r=parseFloat(i.dataset.splitDelay)||0,o=i.dataset.splitScrollTrigger!=="false";if(i.dataset.splitInitialized="true",o){const l=m.create({trigger:i,start:e,once:!0,onEnter:()=>{this.splitTextReveal(i,{duration:s,stagger:a,delay:r,lineClass:n})}});this.scrollTriggers.push(l)}else this.splitTextReveal(i,{duration:s,stagger:a,delay:r,lineClass:n})})}animateHeaderSubtitle(t,e,i=.4){const n=e.querySelector("[data-subtitle-line]"),s=e.querySelector("[data-subtitle-text]");n&&c.set(n,{scaleX:0}),s&&c.set(s,{yPercent:100}),n&&t.to(n,{scaleX:1,duration:.8,ease:"power3.out"},i),s&&t.to(s,{yPercent:0,duration:.8,ease:"power4.out"},i+.2)}createHeroAnimation(t){const e=c.timeline(),i=t.querySelector("[data-hero-title]"),n=t.querySelector("[data-hero-subtitle]"),s=t.querySelector("[data-hero-cta]"),a=t.querySelector("[data-hero-image]");return a&&e.from(a,{scale:1.1,opacity:0,duration:1.2,ease:"power2.out"}),i&&e.from(i,{y:60,opacity:0,duration:.8,ease:"power2.out"},"-=0.8"),n&&e.from(n,{y:40,opacity:0,duration:.6,ease:"power2.out"},"-=0.5"),s&&e.from(s,{y:20,opacity:0,duration:.5,ease:"power2.out"},"-=0.3"),this.animations.push(e),e}killScrollTriggers(){this.scrollTriggers.forEach(t=>t.kill()),this.scrollTriggers=[]}killAnimations(){this.animations.forEach(t=>t.kill()),this.animations=[]}refresh(){m.refresh()}destroy(){this.killScrollTriggers(),this.killAnimations(),this.introObserver&&(this.introObserver.disconnect(),this.introObserver=null)}}const w=new V;class W{constructor(){this.container=null,this.queue=[],this.current=null}ensureContainer(){this.container||(this.container=document.createElement("div"),this.container.className="toast-container",this.container.setAttribute("role","status"),this.container.setAttribute("aria-live","polite"),document.body.appendChild(this.container))}show(t,e={}){const{type:i="info",duration:n=4e3}=e;this.ensureContainer();const s=document.createElement("div");return s.className=`toast toast--${i}`,s.innerHTML=`
      <span class="toast__icon">
        <i class="ph ${this.getIcon(i)}"></i>
      </span>
      <span class="toast__message">${t}</span>
      <button class="toast__close" aria-label="Dismiss">
        <i class="ph ph-x"></i>
      </button>
    `,s.querySelector(".toast__close").addEventListener("click",()=>this.dismiss(s),{once:!0}),this.container.appendChild(s),requestAnimationFrame(()=>{s.classList.add("toast--visible")}),n>0&&setTimeout(()=>this.dismiss(s),n),s}getIcon(t){const e={success:"ph-check-circle",error:"ph-warning-circle",info:"ph-info"};return e[t]||e.info}dismiss(t){!t||!t.parentNode||(t.classList.remove("toast--visible"),t.classList.add("toast--leaving"),setTimeout(()=>{t.remove()},300))}success(t,e=4e3){return this.show(t,{type:"success",duration:e})}error(t,e=5e3){return this.show(t,{type:"error",duration:e})}info(t,e=4e3){return this.show(t,{type:"info",duration:e})}}const y=new W;class Y{constructor(){this.cart=null,this.listeners=new Set,this.isUpdating=!1,this.requestTimeout=8e3}async fetchWithTimeout(t,e={}){const i=new AbortController,n=setTimeout(()=>i.abort(),this.requestTimeout);try{const s=await fetch(t,{...e,signal:i.signal});return clearTimeout(n),s}catch(s){throw clearTimeout(n),s}}async handleErrorResponse(t,e){if(t.status===429)y.error("Too many requests. Please wait a moment and try again.");else if(t.status>=500)y.error("Server error. Please try again later.");else{const i=await t.json().catch(()=>({}));y.error(i.description||e)}}async init(){await this.fetch()}async fetch(){try{const t=await this.fetchWithTimeout("/cart.js");return t.ok?(this.cart=await t.json(),this.notify(),this.cart):null}catch(t){return t.name==="AbortError"&&console.warn("Cart fetch timed out"),null}}get(){return this.cart}getItemCount(){return this.cart?.item_count||0}getTotalPrice(){return this.cart?.total_price||0}async updateLine(t,e){this.isUpdating=!0,this.notify();const i=window.cartStrings?.error||"Could not update cart";try{const n=await this.fetchWithTimeout("/cart/change.js",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({line:t,quantity:e})});n.ok?(this.cart=await n.json(),document.dispatchEvent(new CustomEvent("cart:updated",{detail:{cart:this.cart}}))):await this.handleErrorResponse(n,i)}catch(n){n.name==="AbortError"?y.error("Request timed out. Please check your connection."):y.error(i+". Please try again.")}finally{this.isUpdating=!1,this.notify()}return this.cart}async addItem(t,e=1,i={}){this.isUpdating=!0,this.notify();const n=window.cartStrings?.error||"Could not add to cart";try{const s=await this.fetchWithTimeout("/cart/add.js",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:t,quantity:e,properties:i})});s.ok?(await this.fetch(),document.dispatchEvent(new CustomEvent("cart:updated",{detail:{cart:this.cart}}))):await this.handleErrorResponse(s,n)}catch(s){s.name==="AbortError"?y.error("Request timed out. Please check your connection."):y.error(n+". Please try again.")}finally{this.isUpdating=!1,this.notify()}return this.cart}async updateNote(t){try{await fetch("/cart/update.js",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({note:t})}),this.cart&&(this.cart.note=t)}catch{}}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}notify(){this.listeners.forEach(t=>{try{t(this.cart,this.isUpdating)}catch{}})}formatMoney(t){typeof t=="string"&&(t=t.replace(/[^\d.-]/g,""),t.includes(".")?t=Math.round(parseFloat(t)*100):t=parseInt(t,10)),t=t||0;const e=window.themeSettings?.moneyFormat||"${{amount}}",i=t/100,n=Math.floor(i),s=i.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}),a=i.toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}),r=n.toLocaleString("de-DE"),o=i.toLocaleString("de-CH",{minimumFractionDigits:2,maximumFractionDigits:2}),l=i.toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2}),h=n.toLocaleString("fr-FR");return e.replace("{{amount_with_comma_separator}}",a).replace("{{amount_no_decimals_with_comma_separator}}",r).replace("{{amount_with_apostrophe_separator}}",o).replace("{{amount_no_decimals_with_space_separator}}",h).replace("{{amount_with_space_separator}}",l).replace("{{amount_no_decimals}}",n.toLocaleString("en-US")).replace("{{amount}}",s)}getSizedImageUrl(t,e){if(!t)return"";const i=t.match(/^(.+?)(\.(jpg|jpeg|png|gif|webp))(\?.*)?$/i);return i?`${i[1]}_${e}${i[2]}${i[4]||""}`:t}}const u=new Y;function K(d){const t=['button:not([disabled]):not([tabindex="-1"])','[href]:not([tabindex="-1"])','input:not([disabled]):not([tabindex="-1"])','select:not([disabled]):not([tabindex="-1"])','textarea:not([disabled]):not([tabindex="-1"])','[tabindex]:not([tabindex="-1"])'].join(", ");let e=[],i=null,n=null;function s(){e=[...d.querySelectorAll(t)],i=e[0],n=e[e.length-1]}function a(r){r.key==="Tab"&&(s(),e.length&&(r.shiftKey?document.activeElement===i&&(r.preventDefault(),n.focus()):document.activeElement===n&&(r.preventDefault(),i.focus())))}return d.addEventListener("keydown",a),s(),i&&requestAnimationFrame(()=>i.focus()),{update:s,destroy(){d.removeEventListener("keydown",a)}}}class Q{constructor(){this.drawer=null,this.backdrop=null,this.panel=null,this.isOpen=!1,this.isAnimating=!1,this.noteTimeout=null,this.boundHandlers={},this.unsubscribe=null,this.focusTrap=null}init(){this.drawer=document.getElementById("cart-drawer"),this.drawer&&(this.backdrop=this.drawer.querySelector(".drawer-backdrop"),this.panel=this.drawer.querySelector("[data-cart-drawer-panel]"),this.unsubscribe=u.subscribe((t,e)=>{this.onCartStateChange(t,e)}),this.bindEvents(),this.bindGlobalEvents())}onCartStateChange(t,e){this.drawer&&(e?(this.drawer.classList.add("is-loading"),this.drawer.setAttribute("aria-busy","true")):(this.drawer.classList.remove("is-loading"),this.drawer.setAttribute("aria-busy","false")),this.isOpen&&t&&this.render())}bindEvents(){this.boundHandlers.handleClose=this.handleClose.bind(this),this.drawer.querySelectorAll("[data-cart-drawer-close]").forEach(e=>{e.addEventListener("click",this.boundHandlers.handleClose)}),this.boundHandlers.handleClick=this.handleClick.bind(this),this.drawer.addEventListener("click",this.boundHandlers.handleClick),this.boundHandlers.handleChange=this.handleChange.bind(this),this.drawer.addEventListener("change",this.boundHandlers.handleChange),this.boundHandlers.handleNoteInput=this.handleNoteInput.bind(this);const t=this.drawer.querySelector("[data-cart-note]");t&&t.addEventListener("input",this.boundHandlers.handleNoteInput),this.boundHandlers.handleKeydown=this.handleKeydown.bind(this),document.addEventListener("keydown",this.boundHandlers.handleKeydown),this.boundHandlers.handleLinkClick=this.handleLinkClick.bind(this),this.drawer.addEventListener("click",this.boundHandlers.handleLinkClick)}handleLinkClick(t){const e=t.target.closest("a[href]");if(!e||e.hasAttribute("data-cart-drawer-close"))return;const i=e.getAttribute("href");!i||i.startsWith("#")||i.startsWith("http")||i.startsWith("//")||this.close()}bindGlobalEvents(){this.boundHandlers.open=this.open.bind(this),document.addEventListener("cart:open",this.boundHandlers.open),this.boundHandlers.toggle=this.toggle.bind(this),document.addEventListener("cart:toggle",this.boundHandlers.toggle),this.boundHandlers.closeOnNavigation=()=>{this.isOpen&&this.close()},window.addEventListener("swup:contentReplaced",this.boundHandlers.closeOnNavigation)}handleClose(t){t.target.closest("a")?setTimeout(()=>this.close(),100):this.close()}async handleClick(t){const e=t.target.closest("[data-quantity-minus]"),i=t.target.closest("[data-quantity-plus]"),n=t.target.closest("[data-remove-item]");if(e||i||n){t.preventDefault();const s=parseInt(e?.dataset.line||i?.dataset.line||n?.dataset.line),a=this.drawer.querySelector(`[data-quantity-input][data-line="${s}"]`);let r=parseInt(a?.value||0);e&&r>0&&r--,i&&r++,n&&(r=0),await u.updateLine(s,r)}}async handleChange(t){if(t.target.matches("[data-quantity-input]")){const e=parseInt(t.target.dataset.line),i=parseInt(t.target.value)||0;await u.updateLine(e,i)}}handleNoteInput(t){clearTimeout(this.noteTimeout),this.noteTimeout=setTimeout(()=>{u.updateNote(t.target.value)},500)}handleKeydown(t){t.key==="Escape"&&this.isOpen&&this.close()}async open(){this.isAnimating||this.isOpen||!this.drawer||(this.isAnimating=!0,this.previouslyFocused=document.activeElement,await u.fetch(),this.render(),c.set(this.backdrop,{opacity:0}),c.set(this.panel,{x:"100%"}),this.drawer.classList.add("is-open"),this.drawer.removeAttribute("inert"),this.drawer.removeAttribute("aria-hidden"),this.isOpen=!0,f.stop(),document.dispatchEvent(new CustomEvent("cart:opened")),c.timeline({onComplete:()=>{this.isAnimating=!1,this.focusTrap=K(this.panel)}}).to(this.backdrop,{opacity:1,duration:.3,ease:"power2.out"},0).to(this.panel,{x:"0%",duration:.4,ease:"power3.out"},0))}close(){this.isAnimating||!this.isOpen||!this.drawer||(this.isAnimating=!0,this.focusTrap&&(this.focusTrap.destroy(),this.focusTrap=null),document.dispatchEvent(new CustomEvent("cart:closed")),c.timeline({onComplete:()=>{this.drawer.classList.remove("is-open"),this.drawer.setAttribute("inert",""),this.isOpen=!1,this.isAnimating=!1,f.start(),this.previouslyFocused&&this.previouslyFocused.focus&&(this.previouslyFocused.focus(),this.previouslyFocused=null)}}).to(this.backdrop,{opacity:0,duration:.25,ease:"power2.in"},0).to(this.panel,{x:"100%",duration:.3,ease:"power3.in"},0))}toggle(){this.isOpen?this.close():this.open()}async render(){if(this.drawer)try{const t=await fetch("/?section_id=cart-drawer");if(t.ok){const e=await t.text(),n=new DOMParser().parseFromString(e,"text/html"),s=n.querySelector("[data-cart-drawer-content]"),a=n.querySelector("[data-cart-drawer-footer]"),r=this.drawer.querySelector("[data-cart-drawer-content]"),o=this.drawer.querySelector("[data-cart-drawer-footer]");s&&r&&r.replaceChildren(...s.cloneNode(!0).childNodes),a?o?o.outerHTML=a.outerHTML:this.panel.insertAdjacentHTML("beforeend",a.outerHTML):o&&o.remove()}}catch{this.renderFallback()}}renderFallback(){const t=u.get();if(!t||!this.drawer)return;const e=this.drawer.querySelector("[data-cart-drawer-content]"),i=this.drawer.querySelector("[data-cart-drawer-footer]");t.item_count===0?(e.innerHTML=this.renderEmptyCart(),i&&i.remove()):(e.innerHTML=this.renderCartItems(t),i?i.outerHTML=this.renderFooter(t):this.panel.insertAdjacentHTML("beforeend",this.renderFooter(t)))}renderEmptyCart(){const t=window.themeStrings?.cartEmpty||"Your cart is empty",e=window.themeStrings?.cartEmptyDescription||"Add some items to get started",i=window.themeStrings?.cartStartShopping||"Start shopping",n=window.routes?.allProductsCollectionUrl||"/collections/all";return`
      <div class="cart-drawer__empty">
        <h3 class="text-xl font-semibold text-[--color-text] font-heading">${t}</h3>
        <p>${e}</p>
        <a href="${n}" class="btn btn--primary btn--full" data-cart-drawer-close>
          <i class="ph ph-storefront"></i>
          <span>${i}</span>
        </a>
      </div>
    `}renderCartItems(t){return`
      <ul class="cart-drawer__items" role="list">
        ${t.items.map((e,i)=>this.renderCartItem(e,i+1)).join("")}
      </ul>
    `}renderCartItem(t,e){const i=t.variant_title&&t.variant_title!=="Default Title",n=t.original_line_price!==t.final_line_price,s=t.original_line_price;return`
      <li class="cart-drawer__item" data-cart-item data-line-index="${e}">
        <div class="cart-drawer__item-image">
          ${t.image?`
            <a href="${t.url}">
              <img
                src="${u.getSizedImageUrl(t.image,"200x")}"
                alt="${t.title}"
                class="w-full h-full object-cover"
                loading="lazy"
              >
            </a>
          `:""}
        </div>

        <div class="cart-drawer__item-details">
          <a href="${t.url}" class="cart-drawer__item-title">
            ${t.product_title}
          </a>
          ${i?`<p class="cart-drawer__item-variant">${t.variant_title}</p>`:""}

          <div class="cart-drawer__item-price">
            ${n?`<span class="cart-drawer__item-price--compare">${u.formatMoney(s)}</span>`:""}
            <span class="${n?"sale-price":""}">${u.formatMoney(t.final_line_price)}</span>
          </div>

          <div class="cart-drawer__item-actions">
            <div class="cart-drawer__quantity" data-quantity-wrapper>
              <button
                type="button"
                class="cart-drawer__quantity-btn"
                data-quantity-minus
                data-line="${e}"
                aria-label="${window.themeStrings?.decreaseQuantity||"Decrease quantity"}"
              >
                <i class="ph ph-minus"></i>
              </button>
              <div class="cart-drawer__quantity-value">
                <input
                  type="number"
                  class="cart-drawer__quantity-input"
                  value="${t.quantity}"
                  min="0"
                  data-quantity-input
                  data-line="${e}"
                  aria-label="${window.themeStrings?.quantity||"Quantity"}"
                >
              </div>
              <button
                type="button"
                class="cart-drawer__quantity-btn"
                data-quantity-plus
                data-line="${e}"
                aria-label="${window.themeStrings?.increaseQuantity||"Increase quantity"}"
              >
                <i class="ph ph-plus"></i>
              </button>
            </div>
            <button
              type="button"
              class="cart-drawer__remove"
              data-remove-item
              data-line="${e}"
              aria-label="${(window.themeStrings?.removeItem||"Remove {{ title }}").replace("{{ title }}",t.product_title)}"
            >
              <i class="ph ph-trash"></i>
            </button>
          </div>
        </div>
      </li>
    `}renderFooter(t){const e=window.themeStrings?.cartAddNote||"Add a note",i=window.themeStrings?.cartNotePlaceholder||"Add special instructions...",n=window.themeStrings?.cartSubtotal||"Subtotal",s=window.themeStrings?.cartTaxesNote||"Taxes and shipping calculated at checkout",a=window.themeStrings?.cartViewCart||"View cart",r=window.themeStrings?.cartCheckout||"Checkout",o=window.routes?.cartUrl||"/cart";return`
      <div class="p-6 border-t border-[--color-border] bg-[--color-background]" data-cart-drawer-footer>
        <details class="mb-4 group/note">
          <summary class="flex items-center justify-between w-full py-3 text-xs font-semibold tracking-wide uppercase text-[--color-text-secondary] cursor-pointer transition-colors hover:text-[--color-text]">
            <span>${e}</span>
            <i class="ph ph-caret-down text-base transition-transform group-open/note:rotate-180"></i>
          </summary>
          <div class="pb-4">
            <textarea
              name="note"
              class="w-full min-h-[80px] p-3 text-sm bg-transparent border border-[--color-border] text-[--color-text] resize-y focus:outline-2 focus:outline-[--color-primary] focus:-outline-offset-2"
              placeholder="${i}"
              data-cart-note
            >${t.note||""}</textarea>
          </div>
        </details>

        <div class="flex justify-between items-center text-base font-semibold mb-2">
          <span>${n}</span>
          <span data-cart-subtotal>${u.formatMoney(t.total_price)}</span>
        </div>
        <p class="text-xs text-[--color-text-secondary] m-0 mb-4">${s}</p>

        <div class="flex flex-col gap-3">
          <a href="${o}" class="btn btn--secondary btn--full" data-cart-drawer-close>
            <span>${a}</span>
          </a>
          <form action="${o}" method="post" class="m-0">
            <button type="submit" name="checkout" class="btn btn--primary btn--full">
              <i class="ph ph-lock-simple"></i>
              <span>${r}</span>
            </button>
          </form>
        </div>
      </div>
    `}async refresh(){await u.fetch(),this.render()}reinit(){this.destroy(),this.init()}destroy(){if(!this.drawer)return;this.unsubscribe&&(this.unsubscribe(),this.unsubscribe=null),this.drawer.querySelectorAll("[data-cart-drawer-close]").forEach(e=>{e.removeEventListener("click",this.boundHandlers.handleClose)}),this.drawer.removeEventListener("click",this.boundHandlers.handleClick),this.drawer.removeEventListener("click",this.boundHandlers.handleLinkClick),this.drawer.removeEventListener("change",this.boundHandlers.handleChange);const t=this.drawer.querySelector("[data-cart-note]");t&&t.removeEventListener("input",this.boundHandlers.handleNoteInput),document.removeEventListener("keydown",this.boundHandlers.handleKeydown),document.removeEventListener("cart:open",this.boundHandlers.open),document.removeEventListener("cart:toggle",this.boundHandlers.toggle),window.removeEventListener("swup:contentReplaced",this.boundHandlers.closeOnNavigation),clearTimeout(this.noteTimeout),this.focusTrap&&(this.focusTrap.destroy(),this.focusTrap=null),this.drawer=null,this.backdrop=null,this.panel=null,this.isOpen=!1,this.isAnimating=!1}}const E=new Q;class X{constructor(){this.wrapper=null,this.noteTimeout=null,this.isInitialized=!1,this.isReady=!1,this.unsubscribe=null}init(){this.wrapper=document.querySelector("[data-cart-wrapper]"),this.wrapper&&(this.wrapper.dataset.cartPageInitialized||(this.wrapper.dataset.cartPageInitialized="true",this.unsubscribe=u.subscribe((t,e)=>{this.onCartStateChange(t,e)}),this.bindEvents(),this.initAnimations(),this.isInitialized=!0))}onCartStateChange(t,e){this.wrapper&&(e?this.wrapper.classList.add("is-updating"):(this.wrapper.classList.remove("is-updating"),t&&this.isReady&&this.render()))}bindEvents(){this.wrapper.addEventListener("click",async e=>{const i=e.target.closest("[data-quantity-minus]"),n=e.target.closest("[data-quantity-plus]"),s=e.target.closest("[data-remove-item]");if(i||n||s){e.preventDefault();const a=e.target.closest("[data-cart-item]"),r=parseInt(a?.dataset.line),o=a?.querySelector("[data-quantity-input]");let l=parseInt(o?.value||0);i&&l>0&&l--,n&&l++,s&&(l=0),await u.updateLine(r,l)}}),this.wrapper.addEventListener("change",async e=>{if(e.target.matches("[data-quantity-input]")){const i=parseInt(e.target.dataset.line),n=parseInt(e.target.value)||0;await u.updateLine(i,n)}});const t=this.wrapper.querySelector("[data-cart-note]");t&&t.addEventListener("input",e=>{clearTimeout(this.noteTimeout),this.noteTimeout=setTimeout(()=>{u.updateNote(e.target.value)},500)})}initAnimations(){if(typeof window.shouldAnimate=="function"&&!window.shouldAnimate()){this.wrapper.classList.remove("is-loading"),this.wrapper.classList.add("is-ready"),this.isReady=!0;return}const t=window.gsap||window.pieces&&window.pieces.gsap;if(!t){setTimeout(()=>this.initAnimations(),50);return}const e=this.wrapper.querySelectorAll("[data-cart-item]"),i=this.wrapper.querySelector(".cart-summary"),n=this.wrapper.querySelector(".cart-empty"),s=t.timeline({onComplete:()=>{this.wrapper.classList.add("is-ready"),this.isReady=!0}}),a=this.wrapper.querySelectorAll(".cart-page-title-line > span");a.length&&s.fromTo(a,{yPercent:120},{yPercent:0,duration:1.2,ease:"power4.out",stagger:.1,immediateRender:!0},0);const r=this.wrapper.querySelector("[data-subtitle-line]"),o=this.wrapper.querySelector("[data-subtitle-text]");r&&s.fromTo(r,{scaleX:0},{scaleX:1,duration:.8,ease:"power3.out",immediateRender:!0},.4),o&&s.fromTo(o,{yPercent:120},{yPercent:0,duration:.8,ease:"power4.out",immediateRender:!0},.6),e.length&&e.forEach((l,h)=>{const p=l.querySelector(".cart-item-image");s.fromTo(l,{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.5+h*.1),p&&s.fromTo(p,{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:1,ease:"expo.inOut"},.5+h*.1)}),i&&s.fromTo(i,{opacity:0,y:30},{opacity:1,y:0,duration:.8,ease:"power3.out"},.7),n&&s.fromTo(n,{opacity:0},{opacity:1,duration:.8,ease:"power3.out"},.5),this.wrapper.classList.remove("is-loading")}render(){const t=u.get();if(!t||!this.wrapper)return;const e=this.wrapper.querySelector("[data-subtitle-text]");if(e){const i=t.item_count===1?"Item":"Items";e.textContent=`${t.item_count} ${i}`}t.item_count===0?this.renderEmptyState():this.renderCartContent(t)}renderEmptyState(){const t=this.wrapper.querySelector(".lg\\:grid")||this.wrapper.querySelector("[data-cart-form]")?.parentElement?.parentElement,e=window.themeStrings?.cartEmpty||"Your cart is empty",i=window.themeStrings?.cartEmptyDescription||"Looks like you haven't added anything yet.",n=window.themeStrings?.cartStartShopping||"Start Shopping",s=window.themeStrings?.backHome||"Back to Home",a=window.routes?.allProductsCollectionUrl||"/collections/all",r=window.routes?.rootUrl||"/",o=this.wrapper.querySelector('[class*="page-container"]')?"page-container":"page-full";t&&(t.outerHTML=`
        <div class="cart-empty ${o} pb-[--page-vertical-padding]" style="opacity: 1;">
          <h2 class="text-2xl md:text-3xl font-semibold text-[--color-text] font-heading">${e}</h2>
          <p class="mt-4 text-[--color-text-secondary] max-w-sm">${i}</p>

          <div class="mt-10 flex flex-col sm:flex-row gap-4 max-w-xs sm:max-w-none">
            <a href="${a}" class="btn btn--primary w-full sm:w-auto">
              <i class="ph ph-storefront"></i>
              <span>${n}</span>
            </a>
            <a href="${r}" class="btn btn--secondary w-full sm:w-auto">
              <i class="ph ph-house"></i>
              <span>${s}</span>
            </a>
          </div>
        </div>
      `)}renderCartContent(t){const e=this.wrapper.querySelector("[data-cart-form] ul");e&&(e.innerHTML=t.items.map((i,n)=>this.renderCartItem(i,n+1)).join("")),this.updateSummary(t)}renderCartItem(t,e){const i=t.variant_title&&t.variant_title!=="Default Title",n=t.original_line_price!==t.final_line_price,s=t.selling_plan_allocation,a=window.themeStrings?.cartRemove||"Remove";return`
      <li class="cart-item py-8 first:pt-0" data-cart-item data-line="${e}" style="opacity: 1; transform: translateY(0);">
        <div class="flex gap-6">
          <div class="cart-item-image w-28 h-36 flex-shrink-0 overflow-hidden bg-[--color-background-secondary]" style="clip-path: inset(0 0% 0 0);">
            ${t.image?`
              <a href="${t.url}">
                <img
                  src="${u.getSizedImageUrl(t.image,"300x")}"
                  alt="${t.title}"
                  class="w-full h-full object-cover"
                  loading="lazy"
                >
              </a>
            `:""}
          </div>

          <div class="flex flex-1 flex-col justify-between">
            <div>
              <div class="flex justify-between">
                <div>
                  <h3 class="text-base font-medium text-[--color-text]">
                    <a href="${t.url}" class="hover:text-[--color-primary] transition-colors">
                      ${t.product_title}
                    </a>
                  </h3>
                  ${i?`<p class="mt-1 text-sm text-[--color-text-secondary]">${t.variant_title}</p>`:""}
                  ${s?`<p class="mt-1 text-xs text-[--color-text-secondary]">${t.selling_plan_allocation.selling_plan.name}</p>`:""}
                </div>
                <div class="text-right">
                  <p class="text-base font-medium text-[--color-text]">${u.formatMoney(t.final_line_price)}</p>
                  ${n?`<p class="text-sm text-[--color-text-secondary] line-through">${u.formatMoney(t.original_line_price)}</p>`:""}
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between mt-4">
              <div class="cart-quantity" data-quantity-wrapper>
                <button type="button" class="cart-quantity-btn" data-quantity-minus aria-label="${window.themeStrings?.decreaseQuantity||"Decrease quantity"}">
                  <i class="ph ph-minus"></i>
                </button>
                <div class="cart-quantity-value">
                  <input
                    type="number"
                    name="updates[]"
                    value="${t.quantity}"
                    min="0"
                    class="cart-quantity-input"
                    data-quantity-input
                    data-line="${e}"
                    aria-label="${window.themeStrings?.quantity||"Quantity"}"
                  >
                </div>
                <button type="button" class="cart-quantity-btn" data-quantity-plus aria-label="${window.themeStrings?.increaseQuantity||"Increase quantity"}">
                  <i class="ph ph-plus"></i>
                </button>
              </div>

              <button
                type="button"
                class="text-xs uppercase tracking-wider font-medium text-[--color-text-secondary] hover:text-[--color-text] transition-colors"
                data-remove-item
                data-line="${e}"
              >
                ${a}
              </button>
            </div>
          </div>
        </div>
      </li>
    `}updateSummary(t){const e=this.wrapper.querySelector("[data-cart-subtotal]");e&&(e.textContent=u.formatMoney(t.total_price));const i=this.wrapper.querySelector("[data-cart-total]");i&&(i.textContent=u.formatMoney(t.total_price));const n=this.wrapper.querySelector("[data-cart-note]");n&&t.note!==n.value&&(n.value=t.note||"")}reinit(){this.destroy(),this.init()}destroy(){this.unsubscribe&&(this.unsubscribe(),this.unsubscribe=null),clearTimeout(this.noteTimeout),this.wrapper=null,this.isInitialized=!1,this.isReady=!1}}const _=new X;function H(d,t){try{return t!==void 0?(localStorage.setItem(d,t),!0):localStorage.getItem(d)}catch{return t!==void 0?!1:null}}function G(d,t){let e;return function(...i){clearTimeout(e),e=setTimeout(()=>d.apply(this,i),t)}}class v extends HTMLElement{constructor(){super(),this.boundHandlers={}}connectedCallback(){this.sectionId=this.dataset.sectionId,this.form=this.querySelector("[data-facets-form]"),this.drawer=this.querySelector("#FacetsDrawer"),this.loading=this.querySelector("[data-facets-loading]"),this.drawer&&document.body.appendChild(this.drawer),this.boundHandlers.onFormChange=G(this.onFormChange.bind(this),500),this.boundHandlers.onActiveFilterClick=this.onActiveFilterClick.bind(this),this.boundHandlers.onKeydown=this.onKeydown.bind(this),this.boundHandlers.onPopState=this.onPopState.bind(this),this.bindEvents(),this.setupHistoryListener()}disconnectedCallback(){document.removeEventListener("keydown",this.boundHandlers.onKeydown),window.removeEventListener("popstate",this.boundHandlers.onPopState),this.drawer&&this.drawer.parentNode===document.body&&this.drawer.remove()}bindEvents(){this.form&&this.form.addEventListener("input",this.boundHandlers.onFormChange);const t=this.querySelector("[data-facets-open]");t&&t.addEventListener("click",()=>this.openDrawer()),this.drawer&&this.drawer.addEventListener("click",n=>{(n.target.closest("[data-facets-close]")||n.target.closest("[data-facets-apply]"))&&this.closeDrawer();const s=n.target.closest("[data-facet-clear-all]");if(s){n.preventDefault();const a=s.href,r=a.includes("?")?a.slice(a.indexOf("?")+1):"";this.renderPage(r),this.closeDrawer()}}),this.querySelectorAll("[data-facet-remove], [data-facet-clear-all]").forEach(n=>{n.addEventListener("click",this.boundHandlers.onActiveFilterClick)});const e=this.querySelector("#SortBy");e&&e.addEventListener("change",this.boundHandlers.onFormChange);const i=this.querySelector("#SortByMobile");i&&i.addEventListener("change",n=>{e&&(e.value=n.target.value)}),document.addEventListener("keydown",this.boundHandlers.onKeydown),this.setupViewToggle()}setupViewToggle(){const t=this.querySelectorAll("[data-view-toggle]"),e=document.querySelector("[data-collection-wrapper]");if(!t.length||!e)return;const i=H("collection-view")||"grid";e.dataset.view=i,t.forEach(n=>{const s=n.dataset.viewToggle===i;n.classList.toggle("is-active",s),n.setAttribute("aria-pressed",s)}),t.forEach(n=>{n.addEventListener("click",()=>{const s=n.dataset.viewToggle,a=e.dataset.view;if(s===a)return;const r=e.querySelector("[data-collection-content]"),o=typeof window.shouldAnimate=="function"&&window.shouldAnimate(),l=window.gsap||window.pieces?.gsap;if(t.forEach(h=>{const p=h.dataset.viewToggle===s;h.classList.toggle("is-active",p),h.setAttribute("aria-pressed",p)}),o&&l&&r){const h=r.offsetHeight;l.to(r,{opacity:0,duration:.2,ease:"power2.in",onComplete:()=>{r.style.height=`${h}px`,r.style.overflow="hidden",e.dataset.view=s,r.style.height="auto";const p=r.offsetHeight;r.style.height=`${h}px`,l.to(r,{height:p,duration:.4,ease:"power3.inOut"}),l.to(r,{opacity:1,duration:.3,delay:.2,ease:"power2.out",onComplete:()=>{r.style.height="",r.style.overflow="",window.pieces?.lenis&&window.pieces.lenis.resize()}})}})}else e.dataset.view=s,window.pieces?.lenis&&window.pieces.lenis.resize();H("collection-view",s)})})}setupHistoryListener(){v.searchParamsInitial=window.location.search.slice(1),v.searchParamsPrev=window.location.search.slice(1),window.addEventListener("popstate",this.boundHandlers.onPopState)}onKeydown(t){t.key==="Escape"&&this.isDrawerOpen()&&this.closeDrawer()}onPopState(t){const e=t.state?.searchParams??v.searchParamsInitial;e!==v.searchParamsPrev&&this.renderPage(e,!1)}isDrawerOpen(){return this.drawer&&!this.drawer.hasAttribute("inert")}openDrawer(){if(!this.drawer)return;this.scrollPosition=window.scrollY,document.body.style.top=`-${this.scrollPosition}px`,document.documentElement.classList.add("scroll-locked"),window.pieces?.lenis&&window.pieces.lenis.stop(),this.drawer.removeAttribute("inert"),this.drawer.classList.add("is-open");const t=this.querySelector("[data-facets-open]");t&&t.setAttribute("aria-expanded","true"),requestAnimationFrame(()=>{const e=this.drawer.querySelector("[data-facets-close]");e&&e.focus()})}closeDrawer(){if(!this.drawer)return;this.drawer.classList.remove("is-open"),setTimeout(()=>{this.drawer.setAttribute("inert",""),document.documentElement.classList.remove("scroll-locked"),document.body.style.top="",window.scrollTo(0,this.scrollPosition||0),window.pieces?.lenis&&window.pieces.lenis.start()},300);const t=this.querySelector("[data-facets-open]");t&&(t.setAttribute("aria-expanded","false"),t.focus())}onFormChange(t){const e=new FormData(this.form),i=document.querySelector("#SortBy");i&&i.value&&e.set("sort_by",i.value);const n=new URLSearchParams(e).toString();this.renderPage(n)}onActiveFilterClick(t){t.preventDefault();const e=t.currentTarget.href,i=e.includes("?")?e.slice(e.indexOf("?")+1):"";this.renderPage(i)}async renderPage(t,e=!0){v.searchParamsPrev=t,this.showLoading();try{const i=`${window.location.pathname}?section_id=${this.sectionId}&${t}`,s=await(await fetch(i)).text(),r=new DOMParser().parseFromString(s,"text/html");this.updateProductGrid(r),this.updateFilters(r),this.updateActiveFacets(r),this.updateProductCount(r),this.updatePagination(r),e&&this.updateURL(t),window.pieces?.lenis&&window.pieces.lenis.resize()}catch{}finally{this.hideLoading()}}updateProductGrid(t){const e=t.querySelector("[data-collection-content]"),i=document.querySelector("[data-collection-content]");if(e&&i){const n=document.querySelector("[data-collection-wrapper]");n&&n.classList.add("is-transitioning"),i.replaceChildren(...e.cloneNode(!0).childNodes),requestAnimationFrame(()=>{n&&(n.classList.remove("is-transitioning"),this.animateNewItems(i)),document.dispatchEvent(new CustomEvent("facets:updated"))})}}animateNewItems(t){const e=t.querySelectorAll("[data-collection-item], [data-product-card]");e.forEach(i=>{i.hasAttribute("data-intro")&&i.classList.add("intro-visible"),i.querySelectorAll("[data-intro]").forEach(n=>{n.classList.add("intro-visible")})}),typeof gsap<"u"&&e.forEach((i,n)=>{const s=i.querySelector(".product-card-image"),a=i.querySelectorAll(".product-card-title .overflow-hidden span"),r=i.querySelectorAll(".product-card-price .overflow-hidden span");s&&gsap.set(s,{clipPath:"inset(0 100% 0 0)"}),a.length&&gsap.set(a,{yPercent:100}),r.length&&gsap.set(r,{yPercent:100});const o=n%4*.1;gsap.delayedCall(o,()=>{const l=gsap.timeline();s&&l.to(s,{clipPath:"inset(0 0% 0 0)",duration:1.2,ease:"expo.inOut"},0),a.length&&l.to(a,{yPercent:0,duration:.8,ease:"power4.out",stagger:.05},.2),r.length&&l.to(r,{yPercent:0,duration:.6,ease:"power4.out",stagger:.05},.3)})})}updateFilters(t){const e=t.querySelector(".facets-drawer__filters"),i=this.querySelector(".facets-drawer__filters");if(e&&i){const n=[...i.querySelectorAll("details[open]")].map(s=>s.id);i.replaceChildren(...e.cloneNode(!0).childNodes),n.forEach(s=>{const a=i.querySelector(`#${s}`);a&&(a.open=!0)}),i.querySelectorAll(".facets-disclosure").forEach(s=>{s.addEventListener("toggle",()=>{const a=s.querySelector(".ph-caret-down");a&&(a.style.transform=s.open?"rotate(180deg)":"")})})}}updateActiveFacets(t){const e=t.querySelector("#ActiveFacets"),i=this.querySelector("#ActiveFacets");e&&i&&(i.outerHTML=e.outerHTML,this.querySelectorAll("[data-facet-remove], [data-facet-clear-all]").forEach(s=>{s.addEventListener("click",this.boundHandlers.onActiveFilterClick)}));const n=this.querySelector("[data-facets-open]");if(n){const s=t.querySelector("[data-facets-open]");s&&n.replaceChildren(...s.cloneNode(!0).childNodes)}}updateProductCount(t){const e=t.querySelector("#ProductCount"),i=this.querySelector("#ProductCount");e&&i&&i.replaceChildren(...e.cloneNode(!0).childNodes)}updatePagination(t){const e=t.querySelector("[data-pagination-load-more]"),i=document.querySelector("[data-pagination-load-more]");i&&(e?i.replaceChildren(...e.cloneNode(!0).childNodes):i.replaceChildren());const n=t.querySelector(".collection-wrapper nav"),s=document.querySelector(".collection-wrapper nav");s&&n?s.replaceChildren(...n.cloneNode(!0).childNodes):s&&!n&&s.remove()}updateURL(t){const e=new URLSearchParams(t);e.delete("section_id");const i=e.toString(),n=i?`${window.location.pathname}?${i}`:window.location.pathname;history.pushState({searchParams:i},"",n)}showLoading(){this.loading&&(this.loading.style.opacity="1",this.loading.style.pointerEvents="auto")}hideLoading(){this.loading&&(this.loading.style.opacity="0",this.loading.style.pointerEvents="none")}}customElements.get("facet-filters-form")||customElements.define("facet-filters-form",v);c.registerPlugin(m,P,x);window.gsap=c;window.Flip=P;window.SplitText=x;window.Lenis=$;function C(){w.initRevealAnimations(),w.initStaggerAnimations(),w.initParallax(),w.initImageReveals(),w.initIntroAnimations(),w.initSplitTextAnimations()}function D(){window._articleProgressCleanup&&(window._articleProgressCleanup(),window._articleProgressCleanup=null);const d=document.getElementById("article-progress"),t=document.getElementById("article-progress-bar"),e=document.querySelector("[data-article-wrapper]");if(!d||!t)return;if(!e){d.style.display="none",t.style.width="0%";return}d.style.display="block",t.style.width="0%";let i=!1;function n(){return window.pieces&&window.pieces.lenis&&window.pieces.lenis.lenis?window.pieces.lenis.lenis.scroll:window.scrollY}function s(){if(i)return;const p=n(),g=e.getBoundingClientRect(),b=p+g.top,S=e.offsetHeight,M=window.innerHeight,T=b,A=b+S-M,q=p;let L=0;q>=T&&q<=A?L=(q-T)/(A-T)*100:q>A&&(L=100),t.style.width=`${Math.min(100,Math.max(0,L))}%`}let a=null;function r(){if(window.pieces&&window.pieces.lenis&&window.pieces.lenis.lenis){const p=window.pieces.lenis.lenis;return a=()=>s(),p.on("scroll",a),!0}return!1}if(!r()){let b=function(){if(!i){if(r()){s();return}p++,p<g&&setTimeout(b,100)}},p=0;const g=50;b()}let o=!1;function l(){o||(requestAnimationFrame(()=>{s(),o=!1}),o=!0)}window.addEventListener("scroll",l,{passive:!0}),s();function h(){i=!0,window.removeEventListener("scroll",l),a&&window.pieces&&window.pieces.lenis&&window.pieces.lenis.lenis&&window.pieces.lenis.lenis.off("scroll",a),d&&(d.style.display="none"),t&&(t.style.width="0%")}window._articleProgressCleanup=h}function J(){const d=()=>{requestAnimationFrame(()=>{typeof window.shouldAnimate=="function"&&window.shouldAnimate()&&(w.refresh(),C(),m.refresh()),E.reinit(),_.reinit()})};document.fonts&&document.fonts.ready?document.fonts.ready.then(d):d()}function Z(){setTimeout(()=>{D()},100)}function tt(){document.addEventListener("menu:open",()=>{f.stop()}),document.addEventListener("menu:close",()=>{f.start()})}function I(){const d=window.matchMedia("(prefers-reduced-motion: reduce)").matches,t=window.themeSettings?.enableSmoothScroll!==!1;!d&&t&&f.init();const e=window.themeSettings?.enablePageTransitions!==!1;!d&&e&&(k.init(),window.addEventListener("swup:contentReplaced",J),window.addEventListener("swup:transitionEnd",Z));const i=window.themeSettings?.enableAnimations!==!1;!d&&i&&(document.fonts&&document.fonts.ready?document.fonts.ready.then(()=>{requestAnimationFrame(()=>{C(),m.refresh()})}):requestAnimationFrame(()=>{C()})),requestAnimationFrame(()=>{D()}),tt(),u.init(),u.subscribe(n=>{n&&document.querySelectorAll("[data-cart-count]").forEach(s=>{s.textContent=n.item_count,n.item_count>0?s.removeAttribute("hidden"):s.setAttribute("hidden","")})}),E.init(),_.init(),document.addEventListener("cart:updated",()=>{k.clearCache("/cart")}),document.addEventListener("click",n=>{const s=n.target.closest('a[href^="#"]');if(s&&s.getAttribute("href").length>1){n.preventDefault();const a=document.querySelector(s.getAttribute("href"));a&&f.scrollTo(a,{offset:-100})}}),window.pieces={lenis:f,swup:k,animation:w,cartState:u,cartDrawer:E,cartPage:_,gsap:c,ScrollTrigger:m,Flip:P,SplitText:x,Lenis:$},window.openCartDrawer=()=>E.open(),window.closeCartDrawer=()=>E.close(),window.refreshCartDrawer=()=>E.refresh()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",I):I();window.Shopify&&window.Shopify.designMode&&(document.addEventListener("shopify:section:load",()=>{typeof window.shouldAnimate=="function"&&window.shouldAnimate()&&(w.refresh(),C())}),document.addEventListener("shopify:section:unload",()=>{w.destroy()}),document.addEventListener("shopify:section:reorder",()=>{typeof window.shouldAnimate=="function"&&window.shouldAnimate()&&w.refresh()}));
//# sourceMappingURL=pieces-app.js.map
