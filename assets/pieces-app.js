import{g as d,S as w,a as S,F as k}from"./pieces-gsap.js";import{L as P}from"./pieces-lenis.js";import{_ as M,s as N,i as O,l as z,o as R,r as B}from"./pieces-swup.js";d.registerPlugin(w);class U{constructor(){this.lenis=null,this.isInitialized=!1}init(){return this.isInitialized?this.lenis:(this.lenis=new P({duration:1.2,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),orientation:"vertical",gestureOrientation:"vertical",smoothWheel:!0,wheelMultiplier:1,touchMultiplier:2,infinite:!1,prevent:t=>t.closest(".cart-drawer__content")||t.closest(".mobile-nav__content")||t.closest("[data-lenis-prevent]")}),this.lenis.on("scroll",w.update),d.ticker.add(t=>{this.lenis.raf(t*1e3)}),d.ticker.lagSmoothing(0),document.documentElement.classList.add("lenis"),this.isInitialized=!0,this.lenis)}scrollTo(t,e={}){if(!this.lenis)return;const i={offset:0,duration:1.2,easing:n=>Math.min(1,1.001-Math.pow(2,-10*n)),immediate:!1,lock:!1,onComplete:null};this.lenis.scrollTo(t,{...i,...e})}stop(){this.lenis&&this.lenis.stop()}start(){this.lenis&&this.lenis.start()}resize(){this.lenis&&this.lenis.resize()}destroy(){this.lenis&&(this.lenis.destroy(),this.lenis=null,this.isInitialized=!1,document.documentElement.classList.remove("lenis"))}get scroll(){return this.lenis?.scroll||0}get progress(){return this.lenis?.progress||0}get isScrolling(){return this.lenis?.isScrolling||!1}}const m=new U;d.registerPlugin(w);class j{constructor(){this.swup=null,this.isInitialized=!1,this.pageTransitionDuration=.6,this.skipAnimation=!1,this.transitionStyle=window.themeSettings?.pageTransitionStyle||"slide",this.supportsViewTransitions=typeof document.startViewTransition=="function"}shouldUseViewTransitions(){return this.supportsViewTransitions&&window.themeSettings?.enableViewTransitions!==!1&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches}init(){if(this.isInitialized)return this.swup;if(window.Shopify&&window.Shopify.designMode)return null;window.addEventListener("error",e=>{if(e.message&&e.message.includes("Cannot assign to read only property 'protect'"))return e.preventDefault(),!0}),this.shouldUseViewTransitions()&&this.injectViewTransitionStyles();const t=[{from:"(.*)",to:"(.*)",out:async e=>{await this.animateOut(),e()},in:async e=>{await this.animateIn(),e()}}];return this.swup=new M({containers:["#swup-container"],cache:!0,animateHistoryBrowsing:!0,linkSelector:'a[href^="'+window.location.origin+'"]:not([data-no-swup]), a[href^="/"]:not([data-no-swup]):not([href^="//"]), a[href^="#"]:not([data-no-swup])',plugins:[new N(t),new O({persistAssets:!0,persistTags:'link[rel="stylesheet"], style, script[src]'}),new z({preloadVisibleLinks:!0}),new R,new B({head:!1,body:!0})]}),this.setupEventListeners(),this.isInitialized=!0,this.swup}setupEventListeners(){this.swup.hooks.on("visit:start",t=>{document.documentElement.classList.add("is-changing"),document.documentElement.classList.add("scroll-locked"),m.stop(),t.to.url.includes("/cart")&&this.swup.cache.delete(t.to.url)}),this.swup.hooks.on("content:replace",()=>{w.getAll().forEach(e=>e.kill()),this.reinitializeComponents();const t=document.querySelector("main");t&&(t.setAttribute("tabindex","-1"),t.focus({preventScroll:!0}),this.announcePageChange()),requestAnimationFrame(()=>{m.resize(),w.refresh()})}),this.swup.hooks.on("visit:end",()=>{document.documentElement.classList.remove("is-changing"),document.documentElement.classList.remove("scroll-locked"),m.start(),window.dispatchEvent(new CustomEvent("swup:transitionEnd"))}),this.swup.hooks.on("page:view",()=>{window.dispatchEvent(new CustomEvent("swup:pageview",{detail:{url:window.location.href}}))})}async animateOut(){if(this.skipAnimation||this.shouldUseViewTransitions()&&this._viewTransitionActive)return Promise.resolve();const t=document.querySelector("#swup-container"),e=document.querySelector(".page-transition-overlay"),i=d.timeline();switch(this.transitionStyle){case"fade":i.to(t,{opacity:0,duration:.4,ease:"power2.inOut"});break;case"slide":i.to(t,{y:-40,opacity:0,duration:.25,ease:"power2.in"});break;case"curtain":default:e&&(d.set(e,{transformOrigin:"bottom",scaleY:0}),i.to(e,{scaleY:1,duration:.4,ease:"power3.inOut"})),i.to(t,{y:-40,opacity:0,duration:.25,ease:"power2.in"},.1);break}return i}async animateIn(){m.scrollTo(0,{immediate:!0});const t=document.querySelector("#swup-container"),e=document.querySelector(".page-transition-overlay");if(this.skipAnimation)return this.skipAnimation=!1,d.set(t,{opacity:1,y:0,x:0}),e&&d.set(e,{scaleY:0,scaleX:0}),Promise.resolve();const i=d.timeline();switch(this.transitionStyle){case"fade":d.set(t,{opacity:0,x:0,y:0}),i.to(t,{opacity:1,duration:.4,ease:"power2.inOut"}),i.add(()=>{this.animateRevealElements()},.1);break;case"slide":d.set(t,{opacity:0,y:40,x:0}),i.to(t,{y:0,opacity:1,duration:.3,ease:"power2.out"}),i.add(()=>{this.animateRevealElements()},.1);break;case"curtain":default:d.set(t,{opacity:0,x:0,y:40}),e&&(d.set(e,{transformOrigin:"top",scaleY:1}),i.to(e,{scaleY:0,duration:.5,ease:"power3.inOut"})),i.to(t,{y:0,opacity:1,duration:.3,ease:"power2.out"},.2),i.add(()=>{this.animateRevealElements()},.3);break}return i}animateRevealElements(){document.querySelectorAll("[data-reveal]").forEach((e,i)=>{const n=e.dataset.revealDelay||i*.1;e.dataset.reveal,d.to(e,{opacity:1,x:0,y:0,scale:1,clipPath:"inset(0 0% 0 0)",duration:.8,delay:n,ease:"power2.out"})})}announcePageChange(){let t=document.getElementById("swup-announce");t||(t=document.createElement("div"),t.id="swup-announce",t.setAttribute("role","status"),t.setAttribute("aria-live","polite"),t.setAttribute("aria-atomic","true"),t.className="sr-only",document.body.appendChild(t));const e=document.title||"Page loaded";t.textContent="",setTimeout(()=>{t.textContent=e},100)}reinitializeComponents(){window.dispatchEvent(new CustomEvent("swup:contentReplaced")),window.Shopify&&window.Shopify.PaymentButton&&window.Shopify.PaymentButton.init(),document.querySelectorAll("details-disclosure, details-modal").forEach(t=>{t.connectedCallback&&t.connectedCallback()})}navigateTo(t,e=!1){this.swup?(this.skipAnimation=e,this.swup.navigate(t)):window.location.href=t}updateUrl(t,e=!1){e?window.history.replaceState({swupPreview:!0},"",t):window.history.pushState({swupPreview:!0},"",t)}goBack(){window.history.back()}clearCache(t){if(!this.swup||!this.swup.cache)return;const e=Array.isArray(t)?t:[t];this.swup.cache.all.forEach((i,n)=>{e.some(a=>n.includes(a))&&this.swup.cache.delete(n)})}clearAllCache(){this.swup&&this.swup.cache&&this.swup.cache.clear()}injectViewTransitionStyles(){if(document.getElementById("view-transition-styles"))return;const t=document.createElement("style");t.id="view-transition-styles",t.textContent=`
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
    `,document.head.appendChild(t)}async startViewTransition(t){if(!this.shouldUseViewTransitions())return await t(),null;this._viewTransitionActive=!0;try{await document.startViewTransition(async()=>{await t()}).finished}catch{await t()}finally{this._viewTransitionActive=!1}}destroy(){this.swup&&(this.swup.destroy(),this.swup=null,this.isInitialized=!1)}}const L=new j;d.registerPlugin(w,S);class V{constructor(){this.scrollTriggers=[],this.splitInstances=[],this.initialized=!1}getScrollStart(t="top 80%"){if(typeof window.getScrollStart=="function")return window.getScrollStart(t);const e=window.themeSettings?.animationTriggerOffset||"md",i={none:t,sm:"top 90%",md:"top 80%",lg:"top 70%"};return i[e]||i.md}shouldAnimate(){if(typeof window.shouldAnimate=="function")return window.shouldAnimate();const t=window.matchMedia("(prefers-reduced-motion: reduce)").matches,e=window.themeSettings?.enableAnimations!==!1;return!t&&e}getAnimationConfig(t){const e={fade:{initial:{opacity:0},animate:{opacity:1},duration:.6,ease:"power2.out"},"fade-up":{initial:{opacity:0,y:30},animate:{opacity:1,y:0},duration:.6,ease:"power2.out"},"fade-down":{initial:{opacity:0,y:-30},animate:{opacity:1,y:0},duration:.6,ease:"power2.out"},"fade-left":{initial:{opacity:0,x:30},animate:{opacity:1,x:0},duration:.6,ease:"power2.out"},"fade-right":{initial:{opacity:0,x:-30},animate:{opacity:1,x:0},duration:.6,ease:"power2.out"},"split-text":{duration:1.2,ease:"power4.out",stagger:.1},"clip-right":{initial:{clipPath:"inset(0 100% 0 0)"},animate:{clipPath:"inset(0 0% 0 0)"},duration:1.2,ease:"power3.out"},"clip-up":{initial:{clipPath:"inset(100% 0 0 0)"},animate:{clipPath:"inset(0% 0 0 0)"},duration:1.2,ease:"power3.out"},"clip-down":{initial:{clipPath:"inset(0 0 100% 0)"},animate:{clipPath:"inset(0 0 0% 0)"},duration:1.2,ease:"power3.out"},scale:{initial:{opacity:0,scale:.95},animate:{opacity:1,scale:1},duration:.8,ease:"power2.out"},"scale-up":{initial:{opacity:0,scale:.8},animate:{opacity:1,scale:1},duration:.8,ease:"back.out(1.7)"}};return e[t]||e["fade-up"]}initSplitText(t,e,i){const n=parseFloat(t.dataset.tweenDuration)||1.2,a=parseFloat(t.dataset.tweenStagger)||.1,r=t.dataset.tweenEase||"power4.out",s=new S(t,{type:"lines",linesClass:"tween-split-line"});return s.lines.forEach(o=>{const c=document.createElement("div");c.style.overflow="hidden",c.style.display="block",o.parentNode.insertBefore(c,o),c.appendChild(o)}),d.set(s.lines,{yPercent:120}),e.add(()=>{t.style.opacity="1"},i),e.to(s.lines,{yPercent:0,duration:n,ease:r,stagger:a},i),this.splitInstances.push(s),s}initTweenElement(t,e,i){const n=t.dataset.tweenType||"fade-up",a=this.getAnimationConfig(n),r=parseFloat(t.dataset.tweenDuration)||a.duration,s=t.dataset.tweenEase||a.ease;n==="split-text"?this.initSplitText(t,e,i):(d.set(t,a.initial),e.to(t,{...a.animate,duration:r,ease:s},i))}initTweenGroup(t){t.dataset.tweenGroup;const e=t.querySelectorAll("[data-tween]");if(e.length===0)return;const i=t.dataset.tweenStart||this.getScrollStart(),n=parseFloat(t.dataset.tweenStagger)||.15,a=d.timeline({scrollTrigger:{trigger:t,start:i,once:!0}});let r=0;e.forEach((s,o)=>{const c=s.dataset.tweenType||"fade-up",p=parseFloat(s.dataset.tweenDelay)||0;this.getAnimationConfig(c);const u=o===0?p:r+p;this.initTweenElement(s,a,u),r=u+(c==="split-text"?.5:n)}),this.scrollTriggers.push(a.scrollTrigger)}initStandaloneTweens(){const t=document.querySelectorAll("[data-tween]:not([data-tween-initialized])"),e=this.getScrollStart();t.forEach(i=>{if(i.closest("[data-tween-group]")||!i.isConnected)return;const n=window.getComputedStyle(i);if(n.display==="none"||n.visibility==="hidden")return;const a=i.dataset.tweenType||"fade-up",r=parseFloat(i.dataset.tweenDelay)||0,s=this.getAnimationConfig(a),o=parseFloat(i.dataset.tweenDuration)||s.duration,c=i.dataset.tweenEase||s.ease,p=i.dataset.tweenStart||e;if(i.dataset.tweenInitialized="true",a==="split-text"){const u=d.timeline({scrollTrigger:{trigger:i,start:p,once:!0}});this.initSplitText(i,u,r),u.scrollTrigger&&this.scrollTriggers.push(u.scrollTrigger)}else{d.set(i,s.initial);try{const u=w.create({trigger:i,start:p,once:!0,onEnter:()=>{d.to(i,{...s.animate,duration:o,ease:c,delay:r})}});u&&this.scrollTriggers.push(u)}catch(u){console.warn("TweenManager: Could not create ScrollTrigger for element",i,u)}}})}init(){if(!this.shouldAnimate()){this.showAllElements();return}document.querySelectorAll("[data-tween-group]:not([data-tween-group-initialized])").forEach(e=>{e.dataset.tweenGroupInitialized="true",this.initTweenGroup(e)}),this.initStandaloneTweens(),this.initialized=!0}showAllElements(){document.querySelectorAll("[data-tween]").forEach(e=>{e.style.opacity="1",e.style.transform="none",e.style.clipPath="none"})}refresh(){w.refresh()}destroy(){this.scrollTriggers.forEach(t=>{t&&t.kill&&t.kill()}),this.scrollTriggers=[],this.splitInstances.forEach(t=>{t&&t.revert&&t.revert()}),this.splitInstances=[],document.querySelectorAll("[data-tween-initialized]").forEach(t=>{delete t.dataset.tweenInitialized}),document.querySelectorAll("[data-tween-group-initialized]").forEach(t=>{delete t.dataset.tweenGroupInitialized}),this.initialized=!1}reinit(){this.destroy(),this.init()}}const v=new V;class W{constructor(){this.container=null,this.queue=[],this.current=null}ensureContainer(){this.container||(this.container=document.createElement("div"),this.container.className="toast-container",this.container.setAttribute("role","status"),this.container.setAttribute("aria-live","polite"),document.body.appendChild(this.container))}show(t,e={}){const{type:i="info",duration:n=4e3}=e;this.ensureContainer();const a=document.createElement("div");return a.className=`toast toast--${i}`,a.innerHTML=`
      <span class="toast__icon">
        <i class="ph ${this.getIcon(i)}"></i>
      </span>
      <span class="toast__message">${t}</span>
      <button class="toast__close" aria-label="Dismiss">
        <i class="ph ph-x"></i>
      </button>
    `,a.querySelector(".toast__close").addEventListener("click",()=>this.dismiss(a),{once:!0}),this.container.appendChild(a),requestAnimationFrame(()=>{a.classList.add("toast--visible")}),n>0&&setTimeout(()=>this.dismiss(a),n),a}getIcon(t){const e={success:"ph-check-circle",error:"ph-warning-circle",info:"ph-info"};return e[t]||e.info}dismiss(t){!t||!t.parentNode||(t.classList.remove("toast--visible"),t.classList.add("toast--leaving"),setTimeout(()=>{t.remove()},300))}success(t,e=4e3){return this.show(t,{type:"success",duration:e})}error(t,e=5e3){return this.show(t,{type:"error",duration:e})}info(t,e=4e3){return this.show(t,{type:"info",duration:e})}}const f=new W;class Y{constructor(){this.cart=null,this.listeners=new Set,this.isUpdating=!1,this.requestTimeout=8e3}async fetchWithTimeout(t,e={}){const i=new AbortController,n=setTimeout(()=>i.abort(),this.requestTimeout);try{const a=await fetch(t,{...e,signal:i.signal});return clearTimeout(n),a}catch(a){throw clearTimeout(n),a}}async handleErrorResponse(t,e){if(t.status===429)f.error("Too many requests. Please wait a moment and try again.");else if(t.status>=500)f.error("Server error. Please try again later.");else{const i=await t.json().catch(()=>({}));f.error(i.description||e)}}async init(){await this.fetch()}async fetch(){try{const t=await this.fetchWithTimeout("/cart.js");return t.ok?(this.cart=await t.json(),this.notify(),this.cart):null}catch(t){return t.name==="AbortError"&&console.warn("Cart fetch timed out"),null}}get(){return this.cart}getItemCount(){return this.cart?.item_count||0}getTotalPrice(){return this.cart?.total_price||0}async updateLine(t,e){this.isUpdating=!0,this.notify();const i=window.cartStrings?.error||"Could not update cart";try{const n=await this.fetchWithTimeout("/cart/change.js",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({line:t,quantity:e})});n.ok?(this.cart=await n.json(),document.dispatchEvent(new CustomEvent("cart:updated",{detail:{cart:this.cart}}))):await this.handleErrorResponse(n,i)}catch(n){n.name==="AbortError"?f.error("Request timed out. Please check your connection."):f.error(i+". Please try again.")}finally{this.isUpdating=!1,this.notify()}return this.cart}async addItem(t,e=1,i={}){this.isUpdating=!0,this.notify();const n=window.cartStrings?.error||"Could not add to cart";try{const a=await this.fetchWithTimeout("/cart/add.js",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:t,quantity:e,properties:i})});a.ok?(await this.fetch(),document.dispatchEvent(new CustomEvent("cart:updated",{detail:{cart:this.cart}}))):await this.handleErrorResponse(a,n)}catch(a){a.name==="AbortError"?f.error("Request timed out. Please check your connection."):f.error(n+". Please try again.")}finally{this.isUpdating=!1,this.notify()}return this.cart}async updateNote(t){try{await fetch("/cart/update.js",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({note:t})}),this.cart&&(this.cart.note=t)}catch{}}subscribe(t){return this.listeners.add(t),()=>this.listeners.delete(t)}notify(){this.listeners.forEach(t=>{try{t(this.cart,this.isUpdating)}catch{}})}formatMoney(t){typeof t=="string"&&(t=t.replace(/[^\d.-]/g,""),t.includes(".")?t=Math.round(parseFloat(t)*100):t=parseInt(t,10)),t=t||0;const e=window.themeSettings?.moneyFormat||"${{amount}}",i=t/100,n=Math.floor(i),a=i.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}),r=i.toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2}),s=n.toLocaleString("de-DE"),o=i.toLocaleString("de-CH",{minimumFractionDigits:2,maximumFractionDigits:2}),c=i.toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2}),p=n.toLocaleString("fr-FR");return e.replace("{{amount_with_comma_separator}}",r).replace("{{amount_no_decimals_with_comma_separator}}",s).replace("{{amount_with_apostrophe_separator}}",o).replace("{{amount_no_decimals_with_space_separator}}",p).replace("{{amount_with_space_separator}}",c).replace("{{amount_no_decimals}}",n.toLocaleString("en-US")).replace("{{amount}}",a)}getSizedImageUrl(t,e){if(!t)return"";const i=t.match(/^(.+?)(\.(jpg|jpeg|png|gif|webp))(\?.*)?$/i);return i?`${i[1]}_${e}${i[2]}${i[4]||""}`:t}}const h=new Y;function K(l){const t=['button:not([disabled]):not([tabindex="-1"])','[href]:not([tabindex="-1"])','input:not([disabled]):not([tabindex="-1"])','select:not([disabled]):not([tabindex="-1"])','textarea:not([disabled]):not([tabindex="-1"])','[tabindex]:not([tabindex="-1"])'].join(", ");let e=[],i=null,n=null;function a(){e=[...l.querySelectorAll(t)],i=e[0],n=e[e.length-1]}function r(s){s.key==="Tab"&&(a(),e.length&&(s.shiftKey?document.activeElement===i&&(s.preventDefault(),n.focus()):document.activeElement===n&&(s.preventDefault(),i.focus())))}return l.addEventListener("keydown",r),a(),i&&requestAnimationFrame(()=>i.focus()),{update:a,destroy(){l.removeEventListener("keydown",r)}}}class G{constructor(){this.drawer=null,this.backdrop=null,this.panel=null,this.isOpen=!1,this.isAnimating=!1,this.noteTimeout=null,this.boundHandlers={},this.unsubscribe=null,this.focusTrap=null}init(){this.drawer=document.getElementById("cart-drawer"),this.drawer&&(this.backdrop=this.drawer.querySelector(".drawer-backdrop"),this.panel=this.drawer.querySelector("[data-cart-drawer-panel]"),this.unsubscribe=h.subscribe((t,e)=>{this.onCartStateChange(t,e)}),this.bindEvents(),this.bindGlobalEvents())}onCartStateChange(t,e){this.drawer&&(e?(this.drawer.classList.add("is-loading"),this.drawer.setAttribute("aria-busy","true")):(this.drawer.classList.remove("is-loading"),this.drawer.setAttribute("aria-busy","false")),this.isOpen&&t&&this.render())}bindEvents(){this.boundHandlers.handleClose=this.handleClose.bind(this),this.drawer.querySelectorAll("[data-cart-drawer-close]").forEach(e=>{e.addEventListener("click",this.boundHandlers.handleClose)}),this.boundHandlers.handleClick=this.handleClick.bind(this),this.drawer.addEventListener("click",this.boundHandlers.handleClick),this.boundHandlers.handleChange=this.handleChange.bind(this),this.drawer.addEventListener("change",this.boundHandlers.handleChange),this.boundHandlers.handleNoteInput=this.handleNoteInput.bind(this);const t=this.drawer.querySelector("[data-cart-note]");t&&t.addEventListener("input",this.boundHandlers.handleNoteInput),this.boundHandlers.handleKeydown=this.handleKeydown.bind(this),document.addEventListener("keydown",this.boundHandlers.handleKeydown),this.boundHandlers.handleLinkClick=this.handleLinkClick.bind(this),this.drawer.addEventListener("click",this.boundHandlers.handleLinkClick)}handleLinkClick(t){const e=t.target.closest("a[href]");if(!e||e.hasAttribute("data-cart-drawer-close"))return;const i=e.getAttribute("href");!i||i.startsWith("#")||i.startsWith("http")||i.startsWith("//")||this.close()}bindGlobalEvents(){this.boundHandlers.open=this.open.bind(this),document.addEventListener("cart:open",this.boundHandlers.open),this.boundHandlers.toggle=this.toggle.bind(this),document.addEventListener("cart:toggle",this.boundHandlers.toggle),this.boundHandlers.closeOnNavigation=()=>{this.isOpen&&this.close()},window.addEventListener("swup:contentReplaced",this.boundHandlers.closeOnNavigation)}handleClose(t){t.target.closest("a")?setTimeout(()=>this.close(),100):this.close()}async handleClick(t){const e=t.target.closest("[data-quantity-minus]"),i=t.target.closest("[data-quantity-plus]"),n=t.target.closest("[data-remove-item]");if(e||i||n){t.preventDefault();const a=parseInt(e?.dataset.line||i?.dataset.line||n?.dataset.line),r=this.drawer.querySelector(`[data-quantity-input][data-line="${a}"]`);let s=parseInt(r?.value||0);e&&s>0&&s--,i&&s++,n&&(s=0),await h.updateLine(a,s)}}async handleChange(t){if(t.target.matches("[data-quantity-input]")){const e=parseInt(t.target.dataset.line),i=parseInt(t.target.value)||0;await h.updateLine(e,i)}}handleNoteInput(t){clearTimeout(this.noteTimeout),this.noteTimeout=setTimeout(()=>{h.updateNote(t.target.value)},500)}handleKeydown(t){t.key==="Escape"&&this.isOpen&&this.close()}async open(){this.isAnimating||this.isOpen||!this.drawer||(this.isAnimating=!0,this.previouslyFocused=document.activeElement,await h.fetch(),this.render(),d.set(this.backdrop,{opacity:0}),d.set(this.panel,{x:"100%"}),this.drawer.classList.add("is-open"),this.drawer.removeAttribute("inert"),this.drawer.removeAttribute("aria-hidden"),this.isOpen=!0,m.stop(),document.dispatchEvent(new CustomEvent("cart:opened")),d.timeline({onComplete:()=>{this.isAnimating=!1,this.focusTrap=K(this.panel)}}).to(this.backdrop,{opacity:1,duration:.3,ease:"power2.out"},0).to(this.panel,{x:"0%",duration:.4,ease:"power3.out"},0))}close(){this.isAnimating||!this.isOpen||!this.drawer||(this.isAnimating=!0,this.focusTrap&&(this.focusTrap.destroy(),this.focusTrap=null),document.dispatchEvent(new CustomEvent("cart:closed")),d.timeline({onComplete:()=>{this.drawer.classList.remove("is-open"),this.drawer.setAttribute("inert",""),this.isOpen=!1,this.isAnimating=!1,m.start(),this.previouslyFocused&&this.previouslyFocused.focus&&(this.previouslyFocused.focus(),this.previouslyFocused=null)}}).to(this.backdrop,{opacity:0,duration:.25,ease:"power2.in"},0).to(this.panel,{x:"100%",duration:.3,ease:"power3.in"},0))}toggle(){this.isOpen?this.close():this.open()}async render(){if(this.drawer)try{const t=await fetch("/?section_id=cart-drawer");if(t.ok){const e=await t.text(),n=new DOMParser().parseFromString(e,"text/html"),a=n.querySelector("[data-cart-drawer-content]"),r=n.querySelector("[data-cart-drawer-footer]"),s=this.drawer.querySelector("[data-cart-drawer-content]"),o=this.drawer.querySelector("[data-cart-drawer-footer]");a&&s&&s.replaceChildren(...a.cloneNode(!0).childNodes),r?o?o.outerHTML=r.outerHTML:this.panel.insertAdjacentHTML("beforeend",r.outerHTML):o&&o.remove()}}catch{this.renderFallback()}}renderFallback(){const t=h.get();if(!t||!this.drawer)return;const e=this.drawer.querySelector("[data-cart-drawer-content]"),i=this.drawer.querySelector("[data-cart-drawer-footer]");t.item_count===0?(e.innerHTML=this.renderEmptyCart(),i&&i.remove()):(e.innerHTML=this.renderCartItems(t),i?i.outerHTML=this.renderFooter(t):this.panel.insertAdjacentHTML("beforeend",this.renderFooter(t)))}renderEmptyCart(){const t=window.themeStrings?.cartEmpty||"Your cart is empty",e=window.themeStrings?.cartEmptyDescription||"Add some items to get started",i=window.themeStrings?.cartStartShopping||"Start shopping",n=window.routes?.allProductsCollectionUrl||"/collections/all";return`
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
    `}renderCartItem(t,e){const i=t.variant_title&&t.variant_title!=="Default Title",n=t.original_line_price!==t.final_line_price,a=t.original_line_price;return`
      <li class="cart-drawer__item" data-cart-item data-line-index="${e}">
        <div class="cart-drawer__item-image">
          ${t.image?`
            <a href="${t.url}">
              <img
                src="${h.getSizedImageUrl(t.image,"200x")}"
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
            ${n?`<span class="cart-drawer__item-price--compare">${h.formatMoney(a)}</span>`:""}
            <span class="${n?"sale-price":""}">${h.formatMoney(t.final_line_price)}</span>
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
    `}renderFooter(t){const e=window.themeStrings?.cartAddNote||"Add a note",i=window.themeStrings?.cartNotePlaceholder||"Add special instructions...",n=window.themeStrings?.cartSubtotal||"Subtotal",a=window.themeStrings?.cartTaxesNote||"Taxes and shipping calculated at checkout",r=window.themeStrings?.cartViewCart||"View cart",s=window.themeStrings?.cartCheckout||"Checkout",o=window.routes?.cartUrl||"/cart";return`
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
          <span data-cart-subtotal>${h.formatMoney(t.total_price)}</span>
        </div>
        <p class="text-xs text-[--color-text-secondary] m-0 mb-4">${a}</p>

        <div class="flex flex-col gap-3">
          <a href="${o}" class="btn btn--secondary btn--full" data-cart-drawer-close>
            <span>${r}</span>
          </a>
          <form action="${o}" method="post" class="m-0">
            <button type="submit" name="checkout" class="btn btn--primary btn--full">
              <i class="ph ph-lock-simple"></i>
              <span>${s}</span>
            </button>
          </form>
        </div>
      </div>
    `}async refresh(){await h.fetch(),this.render()}reinit(){this.destroy(),this.init()}destroy(){if(!this.drawer)return;this.unsubscribe&&(this.unsubscribe(),this.unsubscribe=null),this.drawer.querySelectorAll("[data-cart-drawer-close]").forEach(e=>{e.removeEventListener("click",this.boundHandlers.handleClose)}),this.drawer.removeEventListener("click",this.boundHandlers.handleClick),this.drawer.removeEventListener("click",this.boundHandlers.handleLinkClick),this.drawer.removeEventListener("change",this.boundHandlers.handleChange);const t=this.drawer.querySelector("[data-cart-note]");t&&t.removeEventListener("input",this.boundHandlers.handleNoteInput),document.removeEventListener("keydown",this.boundHandlers.handleKeydown),document.removeEventListener("cart:open",this.boundHandlers.open),document.removeEventListener("cart:toggle",this.boundHandlers.toggle),window.removeEventListener("swup:contentReplaced",this.boundHandlers.closeOnNavigation),clearTimeout(this.noteTimeout),this.focusTrap&&(this.focusTrap.destroy(),this.focusTrap=null),this.drawer=null,this.backdrop=null,this.panel=null,this.isOpen=!1,this.isAnimating=!1}}const g=new G;class Q{constructor(){this.wrapper=null,this.noteTimeout=null,this.isInitialized=!1,this.isReady=!1,this.unsubscribe=null}init(){this.wrapper=document.querySelector("[data-cart-wrapper]"),this.wrapper&&(this.wrapper.dataset.cartPageInitialized||(this.wrapper.dataset.cartPageInitialized="true",this.unsubscribe=h.subscribe((t,e)=>{this.onCartStateChange(t,e)}),this.bindEvents(),this.initAnimations(),this.isInitialized=!0))}onCartStateChange(t,e){this.wrapper&&(e?this.wrapper.classList.add("is-updating"):(this.wrapper.classList.remove("is-updating"),t&&this.isReady&&this.render()))}bindEvents(){this.wrapper.addEventListener("click",async e=>{const i=e.target.closest("[data-quantity-minus]"),n=e.target.closest("[data-quantity-plus]"),a=e.target.closest("[data-remove-item]");if(i||n||a){e.preventDefault();const r=e.target.closest("[data-cart-item]"),s=parseInt(r?.dataset.line),o=r?.querySelector("[data-quantity-input]");let c=parseInt(o?.value||0);i&&c>0&&c--,n&&c++,a&&(c=0),await h.updateLine(s,c)}}),this.wrapper.addEventListener("change",async e=>{if(e.target.matches("[data-quantity-input]")){const i=parseInt(e.target.dataset.line),n=parseInt(e.target.value)||0;await h.updateLine(i,n)}});const t=this.wrapper.querySelector("[data-cart-note]");t&&t.addEventListener("input",e=>{clearTimeout(this.noteTimeout),this.noteTimeout=setTimeout(()=>{h.updateNote(e.target.value)},500)})}initAnimations(){if(typeof window.shouldAnimate=="function"&&!window.shouldAnimate()){this.wrapper.classList.remove("is-loading"),this.wrapper.classList.add("is-ready"),this.isReady=!0;return}const t=window.gsap||window.pieces&&window.pieces.gsap;if(!t){setTimeout(()=>this.initAnimations(),50);return}const e=this.wrapper.querySelectorAll("[data-cart-item]"),i=this.wrapper.querySelector(".cart-summary"),n=this.wrapper.querySelector(".cart-empty"),a=t.timeline({onComplete:()=>{this.wrapper.classList.add("is-ready"),this.isReady=!0}}),r=this.wrapper.querySelectorAll(".cart-page-title-line > span");r.length&&a.fromTo(r,{yPercent:120},{yPercent:0,duration:1.2,ease:"power4.out",stagger:.1,immediateRender:!0},0);const s=this.wrapper.querySelector("[data-subtitle-line]"),o=this.wrapper.querySelector("[data-subtitle-text]");s&&a.fromTo(s,{scaleX:0},{scaleX:1,duration:.8,ease:"power3.out",immediateRender:!0},.4),o&&a.fromTo(o,{yPercent:120},{yPercent:0,duration:.8,ease:"power4.out",immediateRender:!0},.6),e.length&&e.forEach((c,p)=>{const u=c.querySelector(".cart-item-image");a.fromTo(c,{opacity:0,y:30},{opacity:1,y:0,duration:.6,ease:"power3.out"},.5+p*.1),u&&a.fromTo(u,{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0% 0 0)",duration:1,ease:"expo.inOut"},.5+p*.1)}),i&&a.fromTo(i,{opacity:0,y:30},{opacity:1,y:0,duration:.8,ease:"power3.out"},.7),n&&a.fromTo(n,{opacity:0},{opacity:1,duration:.8,ease:"power3.out"},.5),this.wrapper.classList.remove("is-loading")}render(){const t=h.get();if(!t||!this.wrapper)return;const e=this.wrapper.querySelector("[data-subtitle-text]");if(e){const i=t.item_count===1?"Item":"Items";e.textContent=`${t.item_count} ${i}`}t.item_count===0?this.renderEmptyState():this.renderCartContent(t)}renderEmptyState(){const t=this.wrapper.querySelector(".lg\\:grid")||this.wrapper.querySelector("[data-cart-form]")?.parentElement?.parentElement,e=window.themeStrings?.cartEmpty||"Your cart is empty",i=window.themeStrings?.cartEmptyDescription||"Looks like you haven't added anything yet.",n=window.themeStrings?.cartStartShopping||"Start Shopping",a=window.themeStrings?.backHome||"Back to Home",r=window.routes?.allProductsCollectionUrl||"/collections/all",s=window.routes?.rootUrl||"/",o=this.wrapper.querySelector('[class*="page-container"]')?"page-container":"page-full";t&&(t.outerHTML=`
        <div class="cart-empty ${o} pb-[--page-vertical-padding]" style="opacity: 1;">
          <h2 class="text-2xl md:text-3xl font-semibold text-[--color-text] font-heading">${e}</h2>
          <p class="mt-4 text-[--color-text-secondary] max-w-sm">${i}</p>

          <div class="mt-10 flex flex-col sm:flex-row gap-4 max-w-xs sm:max-w-none">
            <a href="${r}" class="btn btn--primary w-full sm:w-auto">
              <i class="ph ph-storefront"></i>
              <span>${n}</span>
            </a>
            <a href="${s}" class="btn btn--secondary w-full sm:w-auto">
              <i class="ph ph-house"></i>
              <span>${a}</span>
            </a>
          </div>
        </div>
      `)}renderCartContent(t){const e=this.wrapper.querySelector("[data-cart-form] ul");e&&(e.innerHTML=t.items.map((i,n)=>this.renderCartItem(i,n+1)).join("")),this.updateSummary(t)}renderCartItem(t,e){const i=t.variant_title&&t.variant_title!=="Default Title",n=t.original_line_price!==t.final_line_price,a=t.selling_plan_allocation,r=window.themeStrings?.cartRemove||"Remove";return`
      <li class="cart-item py-8 first:pt-0" data-cart-item data-line="${e}" style="opacity: 1; transform: translateY(0);">
        <div class="flex gap-6">
          <div class="cart-item-image w-28 h-36 flex-shrink-0 overflow-hidden bg-[--color-background-secondary]" style="clip-path: inset(0 0% 0 0);">
            ${t.image?`
              <a href="${t.url}">
                <img
                  src="${h.getSizedImageUrl(t.image,"300x")}"
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
                  ${a?`<p class="mt-1 text-xs text-[--color-text-secondary]">${t.selling_plan_allocation.selling_plan.name}</p>`:""}
                </div>
                <div class="text-right">
                  <p class="text-base font-medium text-[--color-text]">${h.formatMoney(t.final_line_price)}</p>
                  ${n?`<p class="text-sm text-[--color-text-secondary] line-through">${h.formatMoney(t.original_line_price)}</p>`:""}
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
                ${r}
              </button>
            </div>
          </div>
        </div>
      </li>
    `}updateSummary(t){const e=this.wrapper.querySelector("[data-cart-subtotal]");e&&(e.textContent=h.formatMoney(t.total_price));const i=this.wrapper.querySelector("[data-cart-total]");i&&(i.textContent=h.formatMoney(t.total_price));const n=this.wrapper.querySelector("[data-cart-note]");n&&t.note!==n.value&&(n.value=t.note||"")}reinit(){this.destroy(),this.init()}destroy(){this.unsubscribe&&(this.unsubscribe(),this.unsubscribe=null),clearTimeout(this.noteTimeout),this.wrapper=null,this.isInitialized=!1,this.isReady=!1}}const _=new Q;function $(l,t){try{return t!==void 0?(localStorage.setItem(l,t),!0):localStorage.getItem(l)}catch{return t!==void 0?!1:null}}function J(l,t){let e;return function(...i){clearTimeout(e),e=setTimeout(()=>l.apply(this,i),t)}}class y extends HTMLElement{constructor(){super(),this.boundHandlers={}}connectedCallback(){this.sectionId=this.dataset.sectionId,this.form=this.querySelector("[data-facets-form]"),this.drawer=this.querySelector("#FacetsDrawer"),this.loading=this.querySelector("[data-facets-loading]"),this.drawer&&document.body.appendChild(this.drawer),this.boundHandlers.onFormChange=J(this.onFormChange.bind(this),500),this.boundHandlers.onActiveFilterClick=this.onActiveFilterClick.bind(this),this.boundHandlers.onKeydown=this.onKeydown.bind(this),this.boundHandlers.onPopState=this.onPopState.bind(this),this.bindEvents(),this.setupHistoryListener()}disconnectedCallback(){document.removeEventListener("keydown",this.boundHandlers.onKeydown),window.removeEventListener("popstate",this.boundHandlers.onPopState),this.drawer&&this.drawer.parentNode===document.body&&this.drawer.remove()}bindEvents(){this.form&&this.form.addEventListener("input",this.boundHandlers.onFormChange);const t=this.querySelector("[data-facets-open]");t&&t.addEventListener("click",()=>this.openDrawer()),this.drawer&&this.drawer.addEventListener("click",n=>{(n.target.closest("[data-facets-close]")||n.target.closest("[data-facets-apply]"))&&this.closeDrawer();const a=n.target.closest("[data-facet-clear-all]");if(a){n.preventDefault();const r=a.href,s=r.includes("?")?r.slice(r.indexOf("?")+1):"";this.renderPage(s),this.closeDrawer()}}),this.querySelectorAll("[data-facet-remove], [data-facet-clear-all]").forEach(n=>{n.addEventListener("click",this.boundHandlers.onActiveFilterClick)});const e=this.querySelector("#SortBy");e&&e.addEventListener("change",this.boundHandlers.onFormChange);const i=this.querySelector("#SortByMobile");i&&i.addEventListener("change",n=>{e&&(e.value=n.target.value)}),document.addEventListener("keydown",this.boundHandlers.onKeydown),this.setupViewToggle()}setupViewToggle(){const t=this.querySelectorAll("[data-view-toggle]"),e=document.querySelector("[data-collection-wrapper]");if(!t.length||!e)return;const i=$("collection-view")||"grid";e.dataset.view=i,t.forEach(n=>{const a=n.dataset.viewToggle===i;n.classList.toggle("is-active",a),n.setAttribute("aria-pressed",a)}),t.forEach(n=>{n.addEventListener("click",()=>{const a=n.dataset.viewToggle,r=e.dataset.view;if(a===r)return;const s=e.querySelector("[data-collection-content]"),o=typeof window.shouldAnimate=="function"&&window.shouldAnimate(),c=window.gsap||window.pieces?.gsap;if(t.forEach(p=>{const u=p.dataset.viewToggle===a;p.classList.toggle("is-active",u),p.setAttribute("aria-pressed",u)}),o&&c&&s){const p=s.offsetHeight;c.to(s,{opacity:0,duration:.2,ease:"power2.in",onComplete:()=>{s.style.height=`${p}px`,s.style.overflow="hidden",e.dataset.view=a,s.style.height="auto";const u=s.offsetHeight;s.style.height=`${p}px`,c.to(s,{height:u,duration:.4,ease:"power3.inOut"}),c.to(s,{opacity:1,duration:.3,delay:.2,ease:"power2.out",onComplete:()=>{s.style.height="",s.style.overflow="",window.pieces?.lenis&&window.pieces.lenis.resize()}})}})}else e.dataset.view=a,window.pieces?.lenis&&window.pieces.lenis.resize();$("collection-view",a)})})}setupHistoryListener(){y.searchParamsInitial=window.location.search.slice(1),y.searchParamsPrev=window.location.search.slice(1),window.addEventListener("popstate",this.boundHandlers.onPopState)}onKeydown(t){t.key==="Escape"&&this.isDrawerOpen()&&this.closeDrawer()}onPopState(t){const e=t.state?.searchParams??y.searchParamsInitial;e!==y.searchParamsPrev&&this.renderPage(e,!1)}isDrawerOpen(){return this.drawer&&!this.drawer.hasAttribute("inert")}openDrawer(){if(!this.drawer)return;this.scrollPosition=window.scrollY,document.body.style.top=`-${this.scrollPosition}px`,document.documentElement.classList.add("scroll-locked"),window.pieces?.lenis&&window.pieces.lenis.stop(),this.drawer.removeAttribute("inert"),this.drawer.classList.add("is-open");const t=this.querySelector("[data-facets-open]");t&&t.setAttribute("aria-expanded","true"),requestAnimationFrame(()=>{const e=this.drawer.querySelector("[data-facets-close]");e&&e.focus()})}closeDrawer(){if(!this.drawer)return;this.drawer.classList.remove("is-open"),setTimeout(()=>{this.drawer.setAttribute("inert",""),document.documentElement.classList.remove("scroll-locked"),document.body.style.top="",window.scrollTo(0,this.scrollPosition||0),window.pieces?.lenis&&window.pieces.lenis.start()},300);const t=this.querySelector("[data-facets-open]");t&&(t.setAttribute("aria-expanded","false"),t.focus())}onFormChange(t){const e=new FormData(this.form),i=document.querySelector("#SortBy");i&&i.value&&e.set("sort_by",i.value);const n=new URLSearchParams(e).toString();this.renderPage(n)}onActiveFilterClick(t){t.preventDefault();const e=t.currentTarget.href,i=e.includes("?")?e.slice(e.indexOf("?")+1):"";this.renderPage(i)}async renderPage(t,e=!0){y.searchParamsPrev=t,this.showLoading();try{const i=`${window.location.pathname}?section_id=${this.sectionId}&${t}`,a=await(await fetch(i)).text(),s=new DOMParser().parseFromString(a,"text/html");this.updateProductGrid(s),this.updateFilters(s),this.updateActiveFacets(s),this.updateProductCount(s),this.updatePagination(s),e&&this.updateURL(t),window.pieces?.lenis&&window.pieces.lenis.resize()}catch{}finally{this.hideLoading()}}updateProductGrid(t){const e=t.querySelector("[data-collection-content]"),i=document.querySelector("[data-collection-content]");if(e&&i){const n=document.querySelector("[data-collection-wrapper]");n&&n.classList.add("is-transitioning"),i.replaceChildren(...e.cloneNode(!0).childNodes),requestAnimationFrame(()=>{n&&(n.classList.remove("is-transitioning"),this.animateNewItems(i)),document.dispatchEvent(new CustomEvent("facets:updated"))})}}animateNewItems(t){const e=t.querySelectorAll("[data-collection-item], [data-product-card]");e.forEach(i=>{i.hasAttribute("data-intro")&&i.classList.add("intro-visible"),i.querySelectorAll("[data-intro]").forEach(n=>{n.classList.add("intro-visible")})}),typeof gsap<"u"&&e.forEach((i,n)=>{const a=i.querySelector(".product-card-image"),r=i.querySelectorAll(".product-card-title .overflow-hidden span"),s=i.querySelectorAll(".product-card-price .overflow-hidden span");a&&gsap.set(a,{clipPath:"inset(0 100% 0 0)"}),r.length&&gsap.set(r,{yPercent:100}),s.length&&gsap.set(s,{yPercent:100});const o=n%4*.1;gsap.delayedCall(o,()=>{const c=gsap.timeline();a&&c.to(a,{clipPath:"inset(0 0% 0 0)",duration:1.2,ease:"expo.inOut"},0),r.length&&c.to(r,{yPercent:0,duration:.8,ease:"power4.out",stagger:.05},.2),s.length&&c.to(s,{yPercent:0,duration:.6,ease:"power4.out",stagger:.05},.3)})})}updateFilters(t){const e=t.querySelector(".facets-drawer__filters"),i=this.querySelector(".facets-drawer__filters");if(e&&i){const n=[...i.querySelectorAll("details[open]")].map(a=>a.id);i.replaceChildren(...e.cloneNode(!0).childNodes),n.forEach(a=>{const r=i.querySelector(`#${a}`);r&&(r.open=!0)}),i.querySelectorAll(".facets-disclosure").forEach(a=>{a.addEventListener("toggle",()=>{const r=a.querySelector(".ph-caret-down");r&&(r.style.transform=a.open?"rotate(180deg)":"")})})}}updateActiveFacets(t){const e=t.querySelector("#ActiveFacets"),i=this.querySelector("#ActiveFacets");e&&i&&(i.outerHTML=e.outerHTML,this.querySelectorAll("[data-facet-remove], [data-facet-clear-all]").forEach(a=>{a.addEventListener("click",this.boundHandlers.onActiveFilterClick)}));const n=this.querySelector("[data-facets-open]");if(n){const a=t.querySelector("[data-facets-open]");a&&n.replaceChildren(...a.cloneNode(!0).childNodes)}}updateProductCount(t){const e=t.querySelector("#ProductCount"),i=this.querySelector("#ProductCount");e&&i&&i.replaceChildren(...e.cloneNode(!0).childNodes)}updatePagination(t){const e=t.querySelector("[data-pagination-load-more]"),i=document.querySelector("[data-pagination-load-more]");i&&(e?i.replaceChildren(...e.cloneNode(!0).childNodes):i.replaceChildren());const n=t.querySelector(".collection-wrapper nav"),a=document.querySelector(".collection-wrapper nav");a&&n?a.replaceChildren(...n.cloneNode(!0).childNodes):a&&!n&&a.remove()}updateURL(t){const e=new URLSearchParams(t);e.delete("section_id");const i=e.toString(),n=i?`${window.location.pathname}?${i}`:window.location.pathname;history.pushState({searchParams:i},"",n)}showLoading(){this.loading&&(this.loading.style.opacity="1",this.loading.style.pointerEvents="auto")}hideLoading(){this.loading&&(this.loading.style.opacity="0",this.loading.style.pointerEvents="none")}}customElements.get("facet-filters-form")||customElements.define("facet-filters-form",y);d.registerPlugin(w,k,S);window.gsap=d;window.Flip=k;window.SplitText=S;window.Lenis=P;function C(){v.init()}function I(){window._articleProgressCleanup&&(window._articleProgressCleanup(),window._articleProgressCleanup=null);const l=document.getElementById("article-progress"),t=document.getElementById("article-progress-bar"),e=document.querySelector("[data-article-wrapper]");if(!l||!t)return;if(!e){l.style.display="none",t.style.width="0%";return}l.style.display="block",t.style.width="0%";let i=!1;function n(){return window.pieces&&window.pieces.lenis&&window.pieces.lenis.lenis?window.pieces.lenis.lenis.scroll:window.scrollY}function a(){if(i)return;const u=n(),E=e.getBoundingClientRect(),b=u+E.top,D=e.offsetHeight,F=window.innerHeight,q=b,x=b+D-F,T=u;let A=0;T>=q&&T<=x?A=(T-q)/(x-q)*100:T>x&&(A=100),t.style.width=`${Math.min(100,Math.max(0,A))}%`}let r=null;function s(){if(window.pieces&&window.pieces.lenis&&window.pieces.lenis.lenis){const u=window.pieces.lenis.lenis;return r=()=>a(),u.on("scroll",r),!0}return!1}if(!s()){let b=function(){if(!i){if(s()){a();return}u++,u<E&&setTimeout(b,100)}},u=0;const E=50;b()}let o=!1;function c(){o||(requestAnimationFrame(()=>{a(),o=!1}),o=!0)}window.addEventListener("scroll",c,{passive:!0}),a();function p(){i=!0,window.removeEventListener("scroll",c),r&&window.pieces&&window.pieces.lenis&&window.pieces.lenis.lenis&&window.pieces.lenis.lenis.off("scroll",r),l&&(l.style.display="none"),t&&(t.style.width="0%")}window._articleProgressCleanup=p}function X(){const l=()=>{requestAnimationFrame(()=>{typeof window.shouldAnimate=="function"&&window.shouldAnimate()&&(v.reinit(),C(),w.refresh()),g.reinit(),_.reinit()})};document.fonts&&document.fonts.ready?document.fonts.ready.then(l):l()}function Z(){setTimeout(()=>{I()},100)}function tt(){document.addEventListener("menu:open",()=>{m.stop()}),document.addEventListener("menu:close",()=>{m.start()})}function H(){const l=window.matchMedia("(prefers-reduced-motion: reduce)").matches,t=window.themeSettings?.enableSmoothScroll!==!1;!l&&t&&m.init();const e=window.themeSettings?.enablePageTransitions!==!1;!l&&e&&(L.init(),window.addEventListener("swup:contentReplaced",X),window.addEventListener("swup:transitionEnd",Z));const i=window.themeSettings?.enableAnimations!==!1;!l&&i&&(document.fonts&&document.fonts.ready?document.fonts.ready.then(()=>{requestAnimationFrame(()=>{C(),w.refresh()})}):requestAnimationFrame(()=>{C()})),requestAnimationFrame(()=>{I()}),tt(),h.init(),h.subscribe(n=>{n&&document.querySelectorAll("[data-cart-count]").forEach(a=>{a.textContent=n.item_count,n.item_count>0?a.removeAttribute("hidden"):a.setAttribute("hidden","")})}),g.init(),_.init(),document.addEventListener("cart:updated",()=>{L.clearCache("/cart")}),document.addEventListener("click",n=>{const a=n.target.closest('a[href^="#"]');if(a&&a.getAttribute("href").length>1){n.preventDefault();const r=document.querySelector(a.getAttribute("href"));r&&m.scrollTo(r,{offset:-100})}}),window.pieces={lenis:m,swup:L,tween:v,cartState:h,cartDrawer:g,cartPage:_,gsap:d,ScrollTrigger:w,Flip:k,SplitText:S,Lenis:P},window.openCartDrawer=()=>g.open(),window.closeCartDrawer=()=>g.close(),window.refreshCartDrawer=()=>g.refresh()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",H):H();window.Shopify&&window.Shopify.designMode&&(document.addEventListener("shopify:section:load",()=>{typeof window.shouldAnimate=="function"&&window.shouldAnimate()&&(v.reinit(),C())}),document.addEventListener("shopify:section:unload",()=>{v.destroy()}),document.addEventListener("shopify:section:reorder",()=>{typeof window.shouldAnimate=="function"&&window.shouldAnimate()&&v.refresh()}));
//# sourceMappingURL=pieces-app.js.map
