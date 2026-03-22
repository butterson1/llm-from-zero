// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded "><a href="intro.html"><strong aria-hidden="true">1.</strong> Giriş</a></li><li class="chapter-item expanded "><a href="day-01.html"><strong aria-hidden="true">2.</strong> Gün 1: Dil Modeli Nedir?</a></li><li class="chapter-item expanded "><a href="day-02.html"><strong aria-hidden="true">3.</strong> Gün 2: Kelime Gömmeleri — Anlamın Geometrisi</a></li><li class="chapter-item expanded "><a href="day-03.html"><strong aria-hidden="true">4.</strong> Gün 3: Dikkat Mekanizması — Modeller Neye Odaklanacağını Nasıl Öğrenir</a></li><li class="chapter-item expanded "><a href="day-04.html"><strong aria-hidden="true">5.</strong> Gün 4: Transformer Mimarisi — Kodlayıcı, Kod Çözücü ve Neden Her Şeyi Değiştirdi</a></li><li class="chapter-item expanded "><a href="day-05.html"><strong aria-hidden="true">6.</strong> Gün 5: Tokenizasyon — BPE, SentencePiece ve Neden "Token" ≠ "Kelime"</a></li><li class="chapter-item expanded "><a href="day-06.html"><strong aria-hidden="true">7.</strong> Gün 6: Ön Eğitim — Modeller Dili İnternetten Nasıl Öğrenir</a></li><li class="chapter-item expanded "><a href="day-07.html"><strong aria-hidden="true">8.</strong> Gün 7: Ölçekleme Yasaları — Neden Büyük Modeller Daha Akıllıdır</a></li><li class="chapter-item expanded "><a href="day-08.html"><strong aria-hidden="true">9.</strong> Gün 8: Eğitim Altyapısı — GPU&#39;lar, Kümeler, Veri Hatları ve 100 Milyon Dolara Ne Alırsınız</a></li><li class="chapter-item expanded "><a href="day-09.html"><strong aria-hidden="true">10.</strong> Gün 9: Veri — CommonCrawl, The Pile ve Eğitim Verisinin Kirli Sırrı</a></li><li class="chapter-item expanded "><a href="day-10.html"><strong aria-hidden="true">11.</strong> Gün 10: İnce Ayar ve Transfer Öğrenme — Temel Modeli Uyarlama</a></li><li class="chapter-item expanded "><a href="day-11.html"><strong aria-hidden="true">12.</strong> Gün 11: RLHF — Modellere Yardımcı Olmayı Öğretmek</a></li><li class="chapter-item expanded "><a href="day-12.html"><strong aria-hidden="true">13.</strong> Gün 12: Anayasal YZ ve Güvenlik — İnsan Etiketi Olmadan Hizalama</a></li><li class="chapter-item expanded "><a href="day-13.html"><strong aria-hidden="true">14.</strong> Gün 13: Prompt Mühendisliği ve Bağlam İçi Öğrenme — Neden Örnekler İşe Yarar</a></li><li class="chapter-item expanded "><a href="day-14.html"><strong aria-hidden="true">15.</strong> Gün 14: Ortaya Çıkan Yetenekler — Düşünce Zinciri, Araç Kullanımı ve Kimsenin Öngöremediği Şeyler</a></li><li class="chapter-item expanded "><a href="day-15.html"><strong aria-hidden="true">16.</strong> Gün 15: GPT Serisi — Karşılığını Veren Ölçekleme Bahsi</a></li><li class="chapter-item expanded "><a href="day-16.html"><strong aria-hidden="true">17.</strong> Gün 16: Claude, Gemini, Llama — Diğer Laboratuvarlar GPT&#39;den Nasıl Ayrıştı</a></li><li class="chapter-item expanded "><a href="day-17.html"><strong aria-hidden="true">18.</strong> Gün 17: Uzmanlar Karışımı — Seyrek Modeller Nasıl Hesaplama Maliyeti Olmadan Büyür</a></li><li class="chapter-item expanded "><a href="day-18.html"><strong aria-hidden="true">19.</strong> Gün 18: Bağlam Pencereleri — 512&#39;den 1M+ Token&#39;a</a></li><li class="chapter-item expanded "><a href="day-19.html"><strong aria-hidden="true">20.</strong> Gün 19: Çıkarım Optimizasyonu — KV Önbellek, Spekülatif Kod Çözme ve Niceleme</a></li><li class="chapter-item expanded "><a href="day-20.html"><strong aria-hidden="true">21.</strong> Gün 20: Ağırlığının Üstünde Yumruk Atan Küçük Modeller — Damıtma, Budama ve LoRA</a></li><li class="chapter-item expanded "><a href="day-21.html"><strong aria-hidden="true">22.</strong> Gün 21: Çok Modlu Modeller — Görüntü, Ses ve Birleşik Zekâya Giden Yol</a></li><li class="chapter-item expanded "><a href="day-22.html"><strong aria-hidden="true">23.</strong> Gün 22: Erişim-Artırılmış Üretim (RAG) — Modellere Harici Bellek Vermek</a></li><li class="chapter-item expanded "><a href="day-23.html"><strong aria-hidden="true">24.</strong> Gün 23: Ajanlar ve Araç Kullanımı — Sohbet Botundan Otonom Çalışana</a></li><li class="chapter-item expanded "><a href="day-24.html"><strong aria-hidden="true">25.</strong> Gün 24: Kod Üretimi — Copilot, Codex ve Neden Kod Katil Uygulamadır</a></li><li class="chapter-item expanded "><a href="day-25.html"><strong aria-hidden="true">26.</strong> Gün 25: Ekonomi — Çıkarım Maliyetleri, API Fiyatlandırması ve Kim Para Kazanıyor</a></li><li class="chapter-item expanded "><a href="day-26.html"><strong aria-hidden="true">27.</strong> Gün 26: Açık Kaynak vs Kapalı — Llama, Mistral ve Erişim Tartışması</a></li><li class="chapter-item expanded "><a href="day-27.html"><strong aria-hidden="true">28.</strong> Gün 27: Riskler — Halüsinasyon, Kötüye Kullanım, Deepfake&#39;ler ve Varoluşsal Kaygılar</a></li><li class="chapter-item expanded "><a href="day-28.html"><strong aria-hidden="true">29.</strong> Gün 28: Sırada Ne Var — Test Zamanı Hesaplama, Muhakeme Modelleri ve YGZ&#39;ye Giden Yol</a></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
