import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import './PdfUploader.css';

// PDF.js worker'ı ayarla - Vite dev server için
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface Transaction {
    date: string;
    description: string;
    category: string;
    amount: number;
    currency: string;
}

interface PdfUploaderProps {
    onTransactionsExtracted: (transactions: Transaction[]) => void;
}

function PdfUploader({ onTransactionsExtracted }: PdfUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const categorizeTransaction = (description: string): string => {
        const desc = description.toLowerCase();

        // Banking & Finance - Bankacılık ve Finans
        if (desc.includes('banka') || desc.includes('bank') || desc.includes('iş bankası') ||
            desc.includes('garanti') || desc.includes('bbva') || desc.includes('akbank') ||
            desc.includes('yapı kredi') || desc.includes('ykb') || desc.includes('ziraat') ||
            desc.includes('vakıfbank') || desc.includes('vakıf bank') || desc.includes('halkbank') ||
            desc.includes('qnb') || desc.includes('finansbank') || desc.includes('teb') ||
            desc.includes('denizbank') || desc.includes('papara') || desc.includes('iyzico') ||
            desc.includes('param') || desc.includes('pep ') || desc.includes('moka') ||
            desc.includes('figopara') || desc.includes('atm') || desc.includes('eft') ||
            desc.includes('havale') || desc.includes('kredi kartı') || desc.includes('bankamatik')) {
            return 'Banking & Finance';
        }

        // Insurance - Sigorta
        if (desc.includes('sigorta') || desc.includes('insurance') || desc.includes('anadolu sigorta') ||
            desc.includes('aksigorta') || desc.includes('türkiye sigorta') || desc.includes('allianz') ||
            desc.includes('ray sigorta') || desc.includes('axa') || desc.includes('mapfre') ||
            desc.includes('groupama') || desc.includes('güneş sigorta')) {
            return 'Insurance';
        }

        // Airlines -> Transportation (Birleştirildi)
        if (desc.includes('thy') || desc.includes('türk hava yolları') || desc.includes('turkish airlines') ||
            desc.includes('pegasus') || desc.includes('sunexpress') || desc.includes('ajet') ||
            desc.includes('uçak') || desc.includes('flight') || desc.includes('airline') ||
            desc.includes('havayolu') || desc.includes('boarding')) {
            return 'Transportation';
        }

        // Cargo & Logistics -> Shopping (Genelde alışveriş kargosu olduğu için Shopping veya Other olabilir, şimdilik ayrı kalsın veya Other yapalım)
        if (desc.includes('kargo') || desc.includes('cargo') || desc.includes('aras kargo') ||
            desc.includes('yurtiçi kargo') || desc.includes('mng') || desc.includes('sürat kargo') ||
            desc.includes('ptt kargo') || desc.includes('hepsijet') || desc.includes('trendyol express') ||
            desc.includes('reysaş') || desc.includes('netlog') || desc.includes('borusan lojistik') ||
            desc.includes('ekol') || desc.includes('mars logistics') || desc.includes('lojistik') ||
            desc.includes('kurye') || desc.includes('teslimat') || desc.includes('delivery')) {
            return 'Shopping';
        }

        // E-Commerce -> Shopping (Birleştirildi)
        if (desc.includes('trendyol') || desc.includes('hepsiburada') || desc.includes('n11') ||
            desc.includes('pazarama') || desc.includes('çiçeksepeti') || desc.includes('gittigidiyor') ||
            desc.includes('amazon') || desc.includes('aliexpress') || desc.includes('ebay') ||
            desc.includes('sahibinden') || desc.includes('letgo') || desc.includes('dolap') ||
            desc.includes('hepsipay')) {
            return 'Shopping';
        }

        // Software & Technology -> Bills & Utilities (Abonelikler genelde fatura gibidir) veya Shopping
        if (desc.includes('logo yazılım') || desc.includes('softtech') || desc.includes('cybersoft') ||
            desc.includes('havelsan') || desc.includes('stm ') || desc.includes('innova') ||
            desc.includes('medianova') || desc.includes('microsoft') || desc.includes('adobe') ||
            desc.includes('google cloud') || desc.includes('aws ') || desc.includes('azure') ||
            desc.includes('github') || desc.includes('domain') || desc.includes('hosting') ||
            desc.includes('yazılım') || desc.includes('software') || desc.includes('saas')) {
            return 'Bills & Utilities';
        }

        // Personal Care & Beauty -> Shopping (Birleştirildi)
        if (desc.includes('watsons') || desc.includes('gratis') || desc.includes('rossmann') ||
            desc.includes('sephora') || desc.includes('mac cosmetics') || desc.includes('the body shop') ||
            desc.includes('yves rocher') || desc.includes('l\'oreal') || desc.includes('loreal') ||
            desc.includes('flormar') || desc.includes('golden rose') || desc.includes('pastel') ||
            desc.includes('essence') || desc.includes('catrice') || desc.includes('nyx') ||
            desc.includes('maybelline') || desc.includes('kozmetik') || desc.includes('cosmetics') ||
            desc.includes('parfüm') || desc.includes('perfume') || desc.includes('makyaj') ||
            desc.includes('makeup') || desc.includes('beauty') || desc.includes('kişisel bakım')) {
            return 'Shopping';
        }

        // Groceries - Market alışverişleri (perakende)
        if (desc.includes('market') || desc.includes('migros') || desc.includes('carrefour') ||
            desc.includes('a101') || desc.includes('bim') || desc.includes('şok') ||
            desc.includes('a 101') || desc.includes('a-101') ||
            desc.includes('file') || desc.includes('makro') || desc.includes('metro market') ||
            desc.includes('kipa') || desc.includes('real') || desc.includes('bauhaus') ||
            desc.includes('praktiker') || desc.includes('koçtaş') || desc.includes('tekzen') ||
            desc.includes('hakmar') || desc.includes('onur market') || desc.includes('çağrı market') ||
            desc.includes('mopaş') || desc.includes('biçen') || desc.includes('happy center') ||
            desc.includes('kim market') || desc.includes('rammar') || desc.includes('snowy') ||
            desc.includes('altun market') || desc.includes('özkuruşlar') || desc.includes('sarıyer market') ||
            desc.includes('namlı') || desc.includes('gurme') || desc.includes('şarküteri') ||
            desc.includes('manav') || desc.includes('kasap') || desc.includes('bakkal') ||
            desc.includes('büfe') || desc.includes('tekel') ||
            desc.includes('moneypay') || desc.includes('migrosone') || desc.includes('getir perakende') ||
            desc.includes('getir büyük') || desc.includes('getir su') || desc.includes('getir market')) {
            return 'Groceries';
        }

        // Food & Beverage - Yemek ve içecek servisleri
        if (desc.includes('yemeksepeti') || desc.includes('getir yemek') || desc.includes('getir') ||
            desc.includes('sedat arslan') || desc.includes('trendyol yemek') ||
            desc.includes('migros yemek') || desc.includes('migros hemen') ||
            desc.includes('tıkla gelsin') || desc.includes('banabi') ||
            desc.includes('restaurant') || desc.includes('restoran') || desc.includes('lokanta') ||
            desc.includes('mcdonald') || desc.includes('burger king') || desc.includes('burger') ||
            desc.includes('pizza') || desc.includes('kfc') || desc.includes('popeyes') ||
            desc.includes('dominos') || desc.includes('pizza hut') || desc.includes('sbarro') ||
            desc.includes('arby') || desc.includes('subway') || desc.includes('tavuk dünyası') ||
            desc.includes('usta dönerci') || desc.includes('köfteci') || desc.includes('kebap') ||
            desc.includes('steakhouse') || desc.includes('nusret') || desc.includes('nusr-et') ||
            desc.includes('günaydın') || desc.includes('bigchefs') || desc.includes('happy moon') ||
            desc.includes('midpoint') || desc.includes('hd iskender') || desc.includes('d.ream') ||
            desc.includes('mangal') || desc.includes('balık') || desc.includes('fish') ||
            desc.includes('sushi') || desc.includes('chinese') || desc.includes('italian') ||
            desc.includes('mexican') || desc.includes('yemek') || desc.includes('dining') ||
            desc.includes('carl\'s jr') || desc.includes('shake shack') || desc.includes('midyeci ahmet') ||
            desc.includes('köfteci yusuf') || desc.includes('baydöner') || desc.includes('kasap döner') ||
            desc.includes('green salads') || desc.includes('cookshop') || desc.includes('huqqa') ||
            desc.includes('bigmann') || desc.includes('the hunger') || desc.includes('numnum') ||
            desc.includes('kırıntı') || desc.includes('sushico') || desc.includes('le pain quotidien') ||
            desc.includes('eataly') || desc.includes('zomato') || desc.includes('ocakbaşı') ||
            desc.includes('meyhane') || desc.includes('pide') || desc.includes('lahmacun') ||
            desc.includes('food') || desc.includes('delivery') || desc.includes('fuudy') ||
            desc.includes('sodexo') || desc.includes('multinet') || desc.includes('setcard') ||
            desc.includes('ticket restaurant') || desc.includes('metropol') || desc.includes('edenred') ||
            desc.includes('kantin') || desc.includes('kafeterya')) {
            return 'Food & Dining';
        }

        // Cafes -> Food & Dining (Birleştirildi)
        if (desc.includes('cafe') || desc.includes('kahve') || desc.includes('starbucks') ||
            desc.includes('kahve dünyası') || desc.includes('espresso lab') ||
            desc.includes('coffee') || desc.includes('caribou') || desc.includes('nero') ||
            desc.includes('gloria jeans') || desc.includes('tchibo') || desc.includes('mado') ||
            desc.includes('simit sarayı') || desc.includes('kahveci') || desc.includes('kahvaltı') ||
            desc.includes('arabica') || desc.includes('viyana kahvesi') || desc.includes('federal coffee') ||
            desc.includes('kronotrop') || desc.includes('petra') || desc.includes('moc ') ||
            desc.includes('ministry of coffee') || desc.includes('barns') || desc.includes('roastery') ||
            desc.includes('bakery') || desc.includes('fırın') || desc.includes('pastane') ||
            desc.includes('güllüoğlu') || desc.includes('hafız mustafa') || desc.includes('divan pastane') ||
            desc.includes('pelit') || desc.includes('saray muhallebicisi') || desc.includes('özsüt') ||
            desc.includes('starbuc') || desc.includes('bucks') || desc.includes('sütlü cup') ||
            desc.includes('yakomoz') || desc.includes('börek') || desc.includes('gözleme')) {
            return 'Food & Dining';
        }

        // Travel & Accommodation - Seyahat ve Konaklama
        if (desc.includes('hotel') || desc.includes('otel') || desc.includes('rixos') ||
            desc.includes('divan') || desc.includes('dedeman') || desc.includes('titanic hotel') ||
            desc.includes('barut') || desc.includes('maxx royal') || desc.includes('hilton') ||
            desc.includes('marriott') || desc.includes('sheraton') || desc.includes('radisson') ||
            desc.includes('hyatt') || desc.includes('swissotel') || desc.includes('intercontinental') ||
            desc.includes('kempinski') || desc.includes('ritz carlton') || desc.includes('four seasons') ||
            desc.includes('conrad') || desc.includes('doubletree') || desc.includes('crowne plaza') ||
            desc.includes('ramada') || desc.includes('novotel') || desc.includes('ibis') ||
            desc.includes('mercure') || desc.includes('holiday inn') || desc.includes('best western') ||
            desc.includes('hostel') || desc.includes('airbnb') || desc.includes('booking') ||
            desc.includes('hotels.com') || desc.includes('trivago') || desc.includes('expedia') ||
            desc.includes('agoda') || desc.includes('priceline') || desc.includes('kayak') ||
            desc.includes('konaklama') || desc.includes('accommodation') || desc.includes('resort') ||
            desc.includes('ets tur') || desc.includes('jolly tur') || desc.includes('setur') ||
            desc.includes('tatilsepeti') || desc.includes('tatilbudur') || desc.includes('coral travel') ||
            desc.includes('pronto') || desc.includes('anı tur') || desc.includes('fez travel') ||
            desc.includes('gezinomi') || desc.includes('odamax') || desc.includes('otelz') ||
            desc.includes('acente') || desc.includes('travel agency') ||
            desc.includes('tur ') || desc.includes('tour ') || desc.includes('turizm') ||
            desc.includes('obilet') || desc.includes('bilet.com') || desc.includes('enuygun') ||
            desc.includes('turna.com') || desc.includes('biletall') || desc.includes('aerobilet')) {
            return 'Travel & Accommodation';
        }

        // Transportation - Ulaşım (toplu taşıma + yakıt + araç kiralama + otobüs bileti)
        // DİKKAT: "taksi" kelimesi "taksit" içinde geçtiği için "taksi " veya ".taksi" şeklinde aranmalı
        if (desc.includes('uber') || desc.includes('taxi') || desc.includes('taksi ') || desc.includes('bi taksi') ||
            desc.includes('bitaksi') || desc.endsWith('taksi') ||
            desc.includes('metro') || desc.includes('bus') || desc.includes('otobüs') ||
            desc.includes('toplu taşıma') || desc.includes('istanbulkart') ||
            desc.includes('akbil') || desc.includes('ulaşım') || desc.includes('tramvay') ||
            desc.includes('metrobüs') || desc.includes('dolmuş') || desc.includes('minibüs') ||
            desc.includes('feribot') || desc.includes('vapur') || desc.includes('deniz otobüsü') ||
            desc.includes('ido') || desc.includes('iett') || desc.includes('marmaray') ||
            desc.includes('kamil koç') || desc.includes('metro turizm') || desc.includes('pamukkale') ||
            desc.includes('varan') || desc.includes('ulusoy') || desc.includes('otobüs bileti') ||
            desc.includes('bus ticket') || desc.includes('şehirlerarası') ||
            desc.includes('toplu tasima') || desc.includes('toplu tasıma') || desc.includes('ego ') ||
            desc.includes('benzin') || desc.includes('akaryakıt') || desc.includes('shell') ||
            desc.includes('opet') || desc.includes('petrol') || desc.includes('po ') ||
            desc.includes('bp ') || desc.includes('total') || desc.includes('aytemiz') ||
            desc.includes('alpet') || desc.includes('moil') || desc.includes('lukoil') ||
            desc.includes('petrol ofisi') || desc.includes('fuel') || desc.includes('gas station') ||
            desc.includes('starpet') || desc.includes('kadoil') || desc.includes('tpal') ||
            desc.includes('garenta') || desc.includes('avis') || desc.includes('budget') ||
            desc.includes('enterprise') || desc.includes('sixt') || desc.includes('europcar') ||
            desc.includes('moov') || desc.includes('tiktak') || desc.includes('zipcar') ||
            desc.includes('getir araç') || desc.includes('yolcu360') || desc.includes('obilet') ||
            desc.includes('hgs') || desc.includes('ogs') || desc.includes('otoyol') ||
            desc.includes('köprü') || desc.includes('gişe') || desc.includes('ispark') || desc.includes('bi taksi')) {
            return 'Transportation';
        }

        // Healthcare - Sağlık
        if (desc.includes('eczane') || desc.includes('pharmacy') || desc.includes('hospital') ||
            desc.includes('hastane') || desc.includes('doktor') || desc.includes('klinik') ||
            desc.includes('sağlık') || desc.includes('health') || desc.includes('tıp') ||
            desc.includes('diş') || desc.includes('dental') || desc.includes('göz') ||
            desc.includes('optik') || desc.includes('laboratuvar') || desc.includes('poliklinik') ||
            desc.includes('medical') || desc.includes('acıbadem') || desc.includes('memorial') ||
            desc.includes('medicana') || desc.includes('florence nightingale') || desc.includes('liv') ||
            desc.includes('medical park') || desc.includes('mlp care') || desc.includes('güven hastanesi') ||
            desc.includes('dünyagöz') || desc.includes('biruni laboratuvar') ||
            desc.includes('medipol') || desc.includes('kolan') || desc.includes('bezmialem') ||
            desc.includes('başkent') || desc.includes('yeditepe hastane') || desc.includes('koç hastane') ||
            desc.includes('amerikan hastanesi') || desc.includes('anadolu sağlık') || desc.includes('bayındır') ||
            desc.includes('medisis') || desc.includes('lokman hekim') || desc.includes('medline')) {
            return 'Healthcare';
        }

        // Education - Eğitim
        if (desc.includes('school') || desc.includes('okul') || desc.includes('university') ||
            desc.includes('üniversite') || desc.includes('course') || desc.includes('kurs') ||
            desc.includes('eğitim') || desc.includes('bahçeşehir') || desc.includes('doğa koleji') ||
            desc.includes('ted koleji') || desc.includes('bilfen') || desc.includes('koç üniversite') ||
            desc.includes('sabancı') || desc.includes('bilkent') || desc.includes('yeditepe') ||
            desc.includes('özyeğin') || desc.includes('boğaziçi') || desc.includes('metu') ||
            desc.includes('odtü') || desc.includes('istanbul üniversite') ||
            desc.includes('kunduz') || desc.includes('vitamin eğitim') || desc.includes('raunt') ||
            desc.includes('kırtasiye') || desc.includes('udemy') || desc.includes('coursera') ||
            desc.includes('skillshare') || desc.includes('masterclass') || desc.includes('linkedin learning') ||
            desc.includes('pluralsight') || desc.includes('dershane') || desc.includes('etüt') ||
            desc.includes('özel ders') || desc.includes('academy') || desc.includes('akademi')) {
            return 'Education';
        }

        // Culture & Arts -> Entertainment (Birleştirildi)
        if (desc.includes('kitap') || desc.includes('book') || desc.includes('d&r') ||
            desc.includes('idefix') || desc.includes('remzi') ||
            desc.includes('kitapyurdu') || desc.includes('hepsiburada kitap') || desc.includes('nadir kitap') ||
            desc.includes('konser') || desc.includes('concert') || desc.includes('biletix') ||
            desc.includes('passo') || desc.includes('bubilet') || desc.includes('mobilet') ||
            desc.includes('tiyatro') || desc.includes('theatre') || desc.includes('theater') ||
            desc.includes('müze') || desc.includes('museum') || desc.includes('galeri') ||
            desc.includes('gallery') || desc.includes('sergi') || desc.includes('exhibition') ||
            desc.includes('opera') || desc.includes('bale') || desc.includes('ballet') ||
            desc.includes('filarmoni') || desc.includes('philharmonic') || desc.includes('orkestra') ||
            desc.includes('sanat') || desc.includes(' art ') || desc.includes('kültür') ||
            desc.includes('culture') || desc.includes('festival') || desc.includes('etkinlik')) {
            return 'Entertainment';
        }

        // Media & Entertainment -> Entertainment
        if (desc.includes('cinema') || desc.includes('sinema') || desc.includes('cinemaximum') ||
            desc.includes('cinetech') || desc.includes('prestige') || desc.includes('afm') ||
            desc.includes('cgv') || desc.includes('cinepol') || desc.includes('netflix') ||
            desc.includes('spotify') || desc.includes('youtube premium') || desc.includes('youtube') ||
            desc.includes('apple music') || desc.includes('apple tv') || desc.includes('amazon prime') ||
            desc.includes('disney') || desc.includes('disney+') || desc.includes('hbo') ||
            desc.includes('blutv') || desc.includes('exxen') || desc.includes('gain') ||
            desc.includes('tv+') || desc.includes('tivibu') || desc.includes('bein connect') ||
            desc.includes('digiturk') || desc.includes('todtv') || desc.includes('tod tv') ||
            desc.includes('beinsports') || desc.includes('d-smart') || desc.includes('saran sport') ||
            desc.includes('acun medya') || desc.includes('ay yapım') || desc.includes('tims&b') ||
            desc.includes('demirören') || desc.includes('doğuş yayın') ||
            desc.includes('game') || desc.includes('oyun') || desc.includes('ps plus') ||
            desc.includes('playstation') || desc.includes('xbox') || desc.includes('xbox game pass') ||
            desc.includes('steam') || desc.includes('epic games') || desc.includes('origin') ||
            desc.includes('ubisoft') || desc.includes('ea play') || desc.includes('nintendo') ||
            desc.includes('twitch') || desc.includes('patreon')) {
            return 'Entertainment';
        }

        // Telecommunications -> Bills & Utilities (Birleştirildi)
        if (desc.includes('turkcell') || desc.includes('türk telekom') || desc.includes('vodafone') ||
            desc.includes('superonline') || desc.includes('turknet') || desc.includes('türknet') ||
            desc.includes('millenicom') || desc.includes('ttnet') || desc.includes('kablonet') ||
            desc.includes('telefon') || desc.includes('mobile') || desc.includes('gsm') ||
            desc.includes('hat ') || desc.includes('fatura') || desc.includes('internet')) {
            return 'Bills & Utilities';
        }

        // Utilities -> Bills & Utilities
        if (desc.includes('electric') || desc.includes('elektrik') || desc.includes('su ') ||
            desc.includes('doğalgaz') || desc.includes('fatura') || desc.includes('bill') ||
            desc.includes('digiturk') || desc.includes('dsmart') ||
            desc.includes('igdaş') || desc.includes('akedaş') || desc.includes('bedaş') ||
            desc.includes('ayedaş') || desc.includes('iski') || desc.includes('aski') ||
            desc.includes('utility') || desc.includes('water') || desc.includes('gas') ||
            desc.includes('enerjisa') || desc.includes('ck boğaziçi') || desc.includes('ck akdeniz') ||
            desc.includes('gediz') || desc.includes('uludağ') || desc.includes('başkent elektrik') ||
            desc.includes('toroslar') || desc.includes('aras elektrik') || desc.includes('dicle elektrik') ||
            desc.includes('vangölü') || desc.includes('çoruh') || desc.includes('fırat elektrik') ||
            desc.includes('çamlıbel') || desc.includes('meram') || desc.includes('osmangazi') ||
            desc.includes('sakarya elektrik') || desc.includes('yeşilırmak') || desc.includes('akdeniz elektrik') ||
            desc.includes('aydem') || desc.includes('kayseri elektrik') || desc.includes('izsu') ||
            desc.includes('buski') || desc.includes('teski') || desc.includes('deski') || desc.includes('meski')) {
            return 'Bills & Utilities';
        }

        // Jewelry & Accessories -> Shopping (Birleştirildi)
        if (desc.includes('pandora') || desc.includes('swarovski') || desc.includes('atasay') ||
            desc.includes('zen pırlanta') || desc.includes('zen diamond') || desc.includes('altınbaş') ||
            desc.includes('koçak') || desc.includes('blue diamond') || desc.includes('so chic') ||
            desc.includes('ariş') || desc.includes('gülaylar') || desc.includes('kuyumcu') ||
            desc.includes('mücevher') || desc.includes('gold') || desc.includes('pırlanta') ||
            desc.includes('gümüş') || desc.includes('silver') || desc.includes('takı') ||
            desc.includes('aksesuar') || desc.includes('saat') || desc.includes('watch') ||
            desc.includes('saat&saat') || desc.includes('welch') || desc.includes('assos') ||
            desc.includes('kaş') || desc.includes('baget')) {
            return 'Shopping';
        }

        // Shopping - Alışveriş (giyim ve genel)
        if (desc.includes('zara') || desc.includes('h&m') || desc.includes('mango') ||
            desc.includes('lcw') || desc.includes('koton') || desc.includes('defacto') ||
            desc.includes('waikiki') || desc.includes('mavi') || desc.includes('colin') ||
            desc.includes('boyner') || desc.includes('marks') || desc.includes('spencer') ||
            desc.includes('pull&bear') || desc.includes('bershka') || desc.includes('stradivarius') ||
            desc.includes('massimo dutti') || desc.includes('network') || desc.includes('vakko') ||
            desc.includes('beymen') || desc.includes('adidas') || desc.includes('nike') ||
            desc.includes('puma') || desc.includes('decathlon') || desc.includes('columbia') ||
            desc.includes('north face') || desc.includes('shopping') || desc.includes('alışveriş') ||
            desc.includes('mudo') || desc.includes('yargıcı') || desc.includes('ipekyol') ||
            desc.includes('twist') || desc.includes('desa') || desc.includes('derimod') ||
            desc.includes('kemal tanca') || desc.includes('flo') || desc.includes('instreet') ||
            desc.includes('skechers') || desc.includes('suwen') || desc.includes('penti') ||
            desc.includes('dagi') || desc.includes('teknosa') || desc.includes('mediamarkt') ||
            desc.includes('vatan bilgisayar') || desc.includes('apple store') || desc.includes('samsung') ||
            desc.includes('troy') || desc.includes('gürgençler') || desc.includes('huawei') ||
            desc.includes('xiaomi') || desc.includes('dyson') || desc.includes('tefal') ||
            desc.includes('karaca') || desc.includes('english home') || desc.includes('madame coco') ||
            desc.includes('ikea') || desc.includes('koçtaş') || desc.includes('vivense') ||
            desc.includes('eren perakende') || desc.includes('17 burda') || desc.includes('avm') ||
            desc.includes('mall') || desc.includes('center') || desc.includes('lc waikiki')) {
            return 'Shopping';
        }

        // ----------------------------------------------------------------------
        // ÖZEL EŞLEŞTİRMELER (USER SPECIFIC DATA)
        // ----------------------------------------------------------------------

        // 1. Foods & Restaurants -> Food & Dining
        if (desc.includes('pide') || desc.includes('çiğköfte') || desc.includes('cigkofte') || desc.includes('unlu mamul') ||
            desc.includes('simit') || desc.includes('restoran') || desc.includes('konakoğlu') || desc.includes('güre') ||
            desc.includes('sedat arslan') || desc.includes('şakir') || desc.includes('köfteci') || desc.includes('börekçi') ||
            desc.includes('hunger') || desc.includes('hektor') || desc.includes('balkon') || desc.includes('yakomoz') ||
            desc.includes('hamburger') || desc.includes('my joker') || desc.includes('standart cafe') || desc.includes('sarıyer börek')) {
            return 'Food & Dining';
        }

        // 2. Groceries (Özel Market/Büfe İsimleri)
        if (desc.includes('oğuzkağan') || desc.includes('kulkunoglu') || desc.includes('ekomini') ||
            desc.includes('tekel') || desc.includes('kuruyemi') || desc.includes('mıstık') ||
            desc.includes('özerler') || desc.includes('aslan group') || desc.includes('yıldırım market') ||
            desc.includes('düzey tüketim') || desc.includes('matik otomat')) {
            return 'Groceries';
        }

        // 3. Transportation (Özel Ulaşım İsimleri)
        if (desc.includes('toplu tasima') || desc.includes('kentkart') || desc.includes('obilet') || desc.includes('o-bilet') ||
            desc.includes('akarsu') || desc.includes('shell') || desc.includes('petrol') || desc.includes('taksi') ||
            desc.includes('ulasim') || desc.includes('s/obilet')) {
            return 'Transportation';
        }

        // 4. Shopping (Özel Mağaza İsimleri)
        if (desc.includes('lc waikiki') || desc.includes('magaz') || desc.includes('tobac') ||
            desc.includes('kampanya') || desc.includes('troy') || desc.includes('17 burda') || desc.includes('sevilen tobac')) {
            return 'Shopping';
        }

        // 5. Transfer / Personal (Kişi İsimleri)
        if (desc.includes('transfer') || desc.includes('havale') || desc.includes('eft') || desc.includes('fast') ||
            desc.includes('altunsoy') || desc.includes('bayguş') || desc.includes('akçalı') || desc.includes('kaptı') ||
            desc.includes('özel') || desc.includes('durmuş') || desc.includes('özgül') || desc.includes('bayat') ||
            desc.includes('ismail hakkı') || desc.includes('abdulkadir') || desc.includes('muhammed') || desc.includes('mustafa bayguş')) {
            return 'Transfer';
        }

        return 'Other';
    };

    const parseTransactionLine = (line: string): Transaction | null => {
        // Ziraat Bankası formatı: "DD/MM/YYYY AÇIKLAMA TUTAR"
        // Örnek: "01/01/2026 SEDAT ARSLAN ÇANAKKALE 80,00"

        // Tarih pattern - DD/MM/YYYY formatı
        const datePattern = /(\d{2})\/(\d{2})\/(\d{4})/;

        // Tutar pattern - Satır sonunda virgüllü sayı (Türk formatı)
        // Örnekler: 80,00 veya 3.588,00 veya 12.500,00
        const amountPatterns = [
            /(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/,  // Satır sonu: 3.588,00 veya 80,00
            /(\d+,\d{2})\s*$/,                   // Satır sonu: 80,00
            /(\d{1,3}(?:\.\d{3})*,\d{2})(?:\s|$)/, // Boşluk veya satır sonu
            /(\d+,\d{2})(?:\s|$)/                // Boşluk veya satır sonu
        ];

        let date: string | null = null;
        let amount: number | null = null;
        let description = '';

        // Tarih bul
        const dateMatch = line.match(datePattern);
        if (dateMatch) {
            // DD/MM/YYYY -> YYYY-MM-DD
            date = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
        }

        // Tutar bulma mantığı güncellendi - Taksitli işlemleri doğru yakalamak için
        // Tüm olası tutar formatlarını bul (Örn: 1.234,56 veya 123,45)
        const allAmountMatches = [...line.matchAll(/(\d{1,3}(?:\.\d{3})*,\d{2})/g)];

        if (allAmountMatches.length > 0) {
            // Bulunan tüm tutarları sayıya çevir
            const amounts = allAmountMatches.map(match => {
                const valStr = match[1].replace(/\./g, '').replace(',', '.');
                return parseFloat(valStr);
            });

            // Taksitli işlem kontrolü
            const isInstallment = /taksit|taksidi/i.test(line);

            if (isInstallment && amounts.length >= 2) {
                // Taksitli işlemlerde genelde format: "TOPLAM_BORÇ ... TAKSİT_TUTARI" şeklindedir.
                // Satırın en sonundaki tutarı (taksit tutarını) alıyoruz.
                // Örn: "7.180,45 TL İşlemin 5/6 Taksidi 1.196,74" -> 1.196,74 alınmalı
                amount = amounts[amounts.length - 1];
            } else {
                // Taksit değilse veya tek tutar varsa, yine satırın sonundakini tercih et
                // Çünkü bazen satır başında tarih veya başka sayılar karışabilir
                amount = amounts[amounts.length - 1];
            }

            // İade kontrolü
            if (amount !== null && /iade|İade/i.test(line)) {
                amount = amount * -1;
            }
        }

        // Açıklama bul (tarih ile tutar arasındaki kısım)
        if (date && amount !== null && amount !== 0) {
            // Tarihi kaldır
            let cleanLine = line.replace(datePattern, '').trim();

            // Tutarı kaldır
            for (const pattern of amountPatterns) {
                cleanLine = cleanLine.replace(pattern, '').trim();
            }

            // "İşlemin X/Y Taksiti" gibi ekstra bilgileri kaldır
            cleanLine = cleanLine.replace(/İşlemin\s+\d+\/\d+\s+Taksiti/gi, '').trim();

            description = cleanLine;

            // Ekstre özet bilgilerini ve başlıkları filtrele (İşlem olmayan satırlar)
            const lowerDesc = description.toLowerCase();
            if (lowerDesc.includes('nakit avans') ||
                lowerDesc.includes('dönem borcu') ||
                lowerDesc.includes('son ödeme tarihi') ||
                lowerDesc.includes('hesap kesim') ||
                lowerDesc.includes('kullanılabilir limit') ||
                lowerDesc.includes('toplam bankkart') ||
                lowerDesc.includes('asgari ödeme') ||
                lowerDesc.includes('devreden bakiye') ||
                lowerDesc.includes('toplam borç') ||
                lowerDesc.includes('limit artış') ||
                lowerDesc.includes('sayın müşteri') ||
                lowerDesc.includes('ekstre') ||
                lowerDesc.includes('toplam tutar') ||
                lowerDesc.includes('transferler') ||
                lowerDesc.includes('ödemeler') ||
                lowerDesc.includes('faiz ve ücretler') ||
                lowerDesc.includes('taksitli işlemler') ||
                lowerDesc.includes('ödeme-teşekkür ederiz') ||
                lowerDesc.includes('bankkart lira ile ödeme') ||
                lowerDesc.includes('bsmv') ||
                lowerDesc.includes('kkdf') ||
                // Sadece 'faiz' kelimesi geçiyorsa atla, AMA 'taksit' veya 'taksidi' geçiyorsa atlama (Taksitli Nakit Avans gibi)
                (lowerDesc.includes('faiz') && !lowerDesc.includes('taksit') && !lowerDesc.includes('taksidi'))) {
                return null;
            }

            // Eğer açıklama çok kısa veya boşsa, skip et
            if (description.length < 3) {
                return null;
            }

            // Çok uzun açıklamaları kısalt
            if (description.length > 100) {
                description = description.substring(0, 100).trim();
            }

            return {
                date,
                description,
                category: categorizeTransaction(description),
                amount,
                currency: 'TRY'
            };
        }

        return null;
    };

    const extractTextFromPdf = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
            fullText += pageText + '\n';
        }

        return fullText;
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file');
            return;
        }

        setUploading(true);
        setError(null);
        setFileName(file.name);

        try {
            console.log('📄 Starting PDF parsing...');
            console.log('📄 File name:', file.name);
            console.log('📄 File size:', file.size, 'bytes');

            // PDF'den text çıkar
            const text = await extractTextFromPdf(file);
            console.log('📝 Extracted text length:', text.length);
            console.log('📝 First 1000 characters:', text.substring(0, 1000));

            // Tarih pattern'ine göre böl (DD/MM/YYYY)
            // PDF'den gelen text genelde tek satır olarak geliyor, bu yüzden tarih pattern'ine göre ayırıyoruz
            const datePattern = /(\d{2}\/\d{2}\/\d{4})/g;
            const parts: string[] = [];
            let lastIndex = 0;
            let match;

            while ((match = datePattern.exec(text)) !== null) {
                if (lastIndex > 0) {
                    // Önceki tarihten bu tarihe kadar olan kısmı al
                    parts.push(text.substring(lastIndex, match.index));
                }
                lastIndex = match.index;
            }
            // Son kısmı ekle
            if (lastIndex > 0 && lastIndex < text.length) {
                parts.push(text.substring(lastIndex));
            }

            console.log('📊 Split by dates:', parts.length, 'parts');
            console.log('📊 First 10 parts:', parts.slice(0, 10).map(p => p.substring(0, 100)));

            // Her parçayı parse et
            const transactions: Transaction[] = [];
            let parsedCount = 0;
            let skippedCount = 0;

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i].trim();
                if (part.length < 10) continue; // Çok kısa parçaları atla

                const transaction = parseTransactionLine(part);
                if (transaction) {
                    transactions.push(transaction);
                    parsedCount++;
                    if (parsedCount <= 10) {
                        console.log(`✅ Part ${i}: "${part.substring(0, 100)}..." → `, transaction);
                    }
                } else {
                    skippedCount++;
                    if (skippedCount <= 10) {
                        console.log(`⏭️ Part ${i}: "${part.substring(0, 100)}..." (skipped)`);
                    }
                }
            }

            console.log(`\n📊 Summary:`);
            console.log(`✅ Parsed: ${parsedCount} transactions`);
            console.log(`⏭️ Skipped: ${skippedCount} parts`);
            console.log(`📦 All transactions:`, transactions);

            if (transactions.length === 0) {
                setError(`No transactions found. Checked ${parts.length} parts. Open browser console (F12) for details.`);
            } else {
                // Sort transactions by date (Newest first)
                transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                console.log(`🎉 Success! Found ${transactions.length} transactions`);
                onTransactionsExtracted(transactions);
                setError(null);
            }

        } catch (err: any) {
            console.error('❌ PDF parsing error:', err);
            console.error('❌ Error message:', err.message);
            console.error('❌ Error stack:', err.stack);
            setError(`Failed to parse PDF: ${err.message}. Open browser console (F12) for details.`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="pdf-uploader">
            <div className="upload-header">
                <h3>📄 Upload Bank Statement</h3>
            </div>

            <div className="uploader-row">
                {/* Sol: Upload Alanı (Kare) */}
                <div className="upload-area">
                    <input
                        type="file"
                        id="pdf-upload"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        style={{ display: 'none' }}
                    />
                    <label htmlFor="pdf-upload" className={`upload-label ${uploading ? 'uploading' : ''}`}>
                        {uploading ? (
                            <div className="upload-spinner"></div>
                        ) : (
                            <>
                                <div className="upload-icon">📤</div>
                                <span className="upload-text-small">
                                    {fileName ? 'Change PDF' : 'Select PDF'}
                                </span>
                            </>
                        )}
                    </label>
                    {fileName && <div className="file-name-display">{fileName}</div>}
                </div>

                {/* Sağ: Bilgi Alanı */}
                <div className="upload-info">
                    <h4>💡 Supported Formats</h4>
                    <ul>
                        <li>Garanti, İş, Akbank, etc.</li>
                        <li>Format: DD/MM/YYYY</li>
                        <li>Amount: 1.234,56 TL</li>
                    </ul>
                </div>
            </div>

            {error && (
                <div className="upload-error">
                    <span className="error-icon">⚠️</span>
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
}

export default PdfUploader;
