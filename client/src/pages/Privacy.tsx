import { Link } from "wouter";
import logoPath from "@assets/logo.png";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { label: "HOME", href: "/" },
  { label: "PROJECTEN", href: "/projecten" },
  { label: "OVER", href: "/#over" },
  { label: "NIEUWS", href: "/nieuws" },
  { label: "CONTACT", href: "/#contact" },
];

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur shadow-md" : "bg-white shadow-sm"
      }`}
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link href="/" className="flex-shrink-0" data-testid="link-logo">
          <img src={logoPath} alt="Van Heerikhuize Architectuur" className="h-14 w-auto" />
        </Link>
        <nav className="hidden md:flex items-center gap-1" data-testid="nav-desktop">
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} href={item.href} className="px-4 py-2 text-sm font-medium text-[#333] tracking-wide hover:text-[#96AB50] transition-colors font-heading" data-testid={`link-nav-${item.label.toLowerCase()}`}>{item.label}</Link>
          ))}
        </nav>
        <button className="md:hidden p-2 text-[#333]" onClick={() => setMobileOpen(!mobileOpen)} data-testid="button-mobile-menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg" data-testid="nav-mobile">
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} href={item.href} className="block px-6 py-3 text-sm font-medium text-[#333] hover:bg-[#F7FAEE] hover:text-[#96AB50] transition-colors" onClick={() => setMobileOpen(false)} data-testid={`link-mobile-${item.label.toLowerCase()}`}>{item.label}</Link>
          ))}
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#333] text-white py-8" data-testid="footer">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">Van Heerikhuize Architectuur - Architecten & Bouwadviseurs</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-[#96AB50] transition-colors" data-testid="link-footer-privacy">Privacyverklaring</Link>
            <Link href="/algemene-voorwaarden" className="text-sm text-gray-400 hover:text-[#96AB50] transition-colors" data-testid="link-footer-av">Algemene Voorwaarden</Link>
          </div>
          <p className="text-sm text-gray-500">© 2025 Alle rechten voorbehouden</p>
        </div>
      </div>
    </footer>
  );
}

export default function PrivacyPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7FAEE] flex flex-col" data-testid="page-privacy">
      <Header />
      <div className="pt-20" />

      <section className="bg-[#96AB50] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white font-heading" data-testid="text-privacy-heading">
            Privacyverklaring
          </h1>
        </div>
      </section>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-white p-6 md:p-10 shadow-sm space-y-8" data-testid="section-privacy-content">

          <section>
            <h2 className="text-xl font-bold text-[#333] font-heading mb-3">Hoe wij persoonsgegevens beveiligen</h2>
            <p className="text-[#555] text-sm leading-relaxed">
              Van Heerikhuize Architectuur neemt de bescherming van uw gegevens serieus en neemt passende maatregelen om misbruik, verlies, onbevoegde toegang, ongewenste openbaarmaking en ongeoorloofde wijziging tegen te gaan. Als u de indruk heeft dat uw gegevens niet goed beveiligd zijn of er aanwijzingen zijn van misbruik, neem dan contact op met onze klantenservice of via{" "}
              <a href="mailto:info@heerikhuize.nl" className="text-[#96AB50] hover:underline">info@heerikhuize.nl</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#333] font-heading mb-3">Persoonsgegevens die wij verwerken</h2>
            <p className="text-[#555] text-sm leading-relaxed mb-3">
              Van Heerikhuize Architectuur kan uw persoonsgegevens verwerken doordat u gebruik maakt van onze diensten en/of omdat u deze zelf aan ons verstrekt. Hieronder vindt u een overzicht van de persoonsgegevens die wij kunnen verwerken:
            </p>
            <ul className="list-disc list-inside text-[#555] text-sm leading-relaxed space-y-1 ml-2">
              <li>Voor- en achternaam</li>
              <li>Geslacht (in verband met aanhef correspondentie)</li>
              <li>Adresgegevens</li>
              <li>Telefoonnummer</li>
              <li>E-mailadres</li>
              <li>IP-adres</li>
              <li>Overige persoonsgegevens die u actief verstrekt bijvoorbeeld door een profiel op deze website aan te maken, in correspondentie en telefonisch</li>
              <li>Gegevens over uw activiteiten op onze website</li>
              <li>Gegevens over uw surfgedrag over verschillende websites heen (bijvoorbeeld omdat dit bedrijf onderdeel is van een advertentienetwerk)</li>
              <li>Internetbrowser en apparaat type</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#333] font-heading mb-3">Bijzondere en/of gevoelige persoonsgegevens die wij verwerken</h2>
            <p className="text-[#555] text-sm leading-relaxed mb-3">
              Van Heerikhuize Architectuur verwerkt de volgende bijzondere en/of gevoelige persoonsgegevens van u:
            </p>
            <ul className="list-disc list-inside text-[#555] text-sm leading-relaxed space-y-1 ml-2">
              <li>Burgerservicenummer (BSN)</li>
            </ul>
            <p className="text-[#555] text-sm leading-relaxed mt-3">
              Het Burgerservicenummer (BSN) wordt slechts eenmalig gebruikt en op uw verzoek als wij via het Omgevingsloket online een vergunningsaanvraag indienen. Dit BSN nummer wordt niet in ons systeem verwerkt.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#333] font-heading mb-3">Met welk doel en op basis van welke grondslag wij persoonsgegevens verwerken</h2>
            <p className="text-[#555] text-sm leading-relaxed mb-3">
              Van Heerikhuize Architectuur verwerkt uw persoonsgegevens voor de volgende doelen:
            </p>
            <ul className="list-disc list-inside text-[#555] text-sm leading-relaxed space-y-1 ml-2">
              <li>U te kunnen bellen of e-mailen indien dit nodig is om onze dienstverlening uit te kunnen voeren</li>
              <li>Om goederen en diensten bij u af te leveren</li>
              <li>Van Heerikhuize Architectuur analyseert uw gedrag op de website om daarmee de website te verbeteren en het aanbod van diensten af te stemmen op uw voorkeuren.</li>
              <li>Van Heerikhuize Architectuur verwerkt ook persoonsgegevens als wij hier wettelijk toe verplicht zijn, zoals gegevens die wij nodig hebben voor onze belastingaangifte.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#333] font-heading mb-3">Hoe lang we persoonsgegevens bewaren</h2>
            <p className="text-[#555] text-sm leading-relaxed">
              Van Heerikhuize Architectuur bewaart uw persoonsgegevens niet langer dan strikt nodig is om de doelen te realiseren waarvoor uw gegevens worden verzameld. Uw gegevens worden niet langer dan een jaar bewaard indien er geen overeenkomst met u tot stand komt. Mogen wij wel werkzaamheden voor u verrichten dan bewaren wij persoonsgegevens tijdens en na afloop van het project. De gearchiveerde stukken (tekeningen, rapporten en vergunningen) kunnen voorzien zijn van NAW gegevens en/of bouwlocatie en worden conform geldende wet- en regelgeving minimaal 20 jaar bewaard.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#333] font-heading mb-3">Delen van persoonsgegevens met derden</h2>
            <p className="text-[#555] text-sm leading-relaxed">
              Van Heerikhuize Architectuur verkoopt uw gegevens niet aan derden en verstrekt uw persoonsgegevens alléén aan derden indien dit nodig is voor de uitvoering van een overeenkomst met u, of om te voldoen aan een wettelijke verplichting.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#333] font-heading mb-3">Cookies, of vergelijkbare technieken, die wij gebruiken</h2>
            <p className="text-[#555] text-sm leading-relaxed">
              Van Heerikhuize Architectuur gebruikt alleen technische en functionele cookies. En analytische cookies die geen inbreuk maken op uw privacy. Een cookie is een klein tekstbestand dat bij het eerste bezoek aan deze website wordt opgeslagen op uw computer, tablet of smartphone. De cookies die wij gebruiken zijn noodzakelijk voor de technische werking van de website en uw gebruiksgemak. Ze zorgen ervoor dat de website naar behoren werkt en onthouden bijvoorbeeld uw voorkeursinstellingen. Ook kunnen wij hiermee onze website optimaliseren. U kunt zich afmelden voor cookies door uw internetbrowser zo in te stellen dat deze geen cookies meer opslaat. Daarnaast kunt u ook alle informatie die eerder is opgeslagen via de instellingen van uw browser verwijderen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#333] font-heading mb-3">Gegevens inzien, aanpassen of verwijderen</h2>
            <p className="text-[#555] text-sm leading-relaxed">
              U heeft het recht om uw persoonsgegevens in te zien, te corrigeren of te verwijderen. Daarnaast heeft u het recht om uw eventuele toestemming voor de gegevensverwerking in te trekken of bezwaar te maken tegen de verwerking van uw persoonsgegevens door Van Heerikhuize Architectuur en heeft u het recht op gegevensoverdraagbaarheid. Dat betekent dat u bij ons een verzoek kunt indienen om de persoonsgegevens die wij van u beschikken in een computerbestand naar u of een ander, door u genoemde organisatie, te sturen. U kunt een verzoek tot inzage, correctie, verwijdering, gegevensoverdraging van uw persoonsgegevens of verzoek tot intrekking van uw toestemming of bezwaar op de verwerking van uw persoonsgegevens sturen naar{" "}
              <a href="mailto:info@heerikhuize.nl" className="text-[#96AB50] hover:underline">info@heerikhuize.nl</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#333] font-heading mb-3">Contactgegevens</h2>
            <div className="text-[#555] text-sm leading-relaxed space-y-1">
              <p><a href="https://heerikhuize.nl" className="text-[#96AB50] hover:underline">https://heerikhuize.nl</a></p>
              <p>Kolkakkerweg 76 in Ede</p>
              <p><a href="tel:0617676013" className="text-[#96AB50] hover:underline">06 1767 6013</a></p>
              <p className="mt-3">
                M. van Heerikhuize is de Functionaris Gegevensbescherming van Van Heerikhuize Architectuur. Hij is te bereiken via{" "}
                <a href="mailto:info@heerikhuize.nl" className="text-[#96AB50] hover:underline">info@heerikhuize.nl</a>.
              </p>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
