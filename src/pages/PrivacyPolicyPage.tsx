import ScrollAnimation from "@/components/ScrollAnimation";

const PrivacyPolicyPage = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <ScrollAnimation>
          <h1 className="section-heading text-4xl md:text-5xl mb-2">Polityka prywatności</h1>
          <div className="section-heading-accent mb-10" />
        </ScrollAnimation>

        <ScrollAnimation>
          <div className="prose prose-sm max-w-none text-muted-foreground space-y-6">
            <section>
              <h2 className="font-heading text-xl font-bold text-foreground">1. Administrator danych</h2>
              <p>
                Administratorem danych osobowych jest Ludowy Klub Sportowy Liszczanka Liszki z siedzibą
                przy ul. Księdza Bascika 24, 32-060 Liszki (dalej: „Klub"). Kontakt z administratorem
                możliwy jest pod adresem e-mail:{" "}
                <a href="mailto:liszczanka.liszki@gmail.com" className="text-primary hover:underline">
                  liszczanka.liszki@gmail.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-foreground">2. Cele i podstawy przetwarzania</h2>
              <p>Dane osobowe przetwarzane są w następujących celach:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Odpowiedź na wiadomości przesłane za pośrednictwem formularza kontaktowego — na podstawie art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes administratora).</li>
                <li>Rejestracja dzieci na zajęcia sportowe — na podstawie art. 6 ust. 1 lit. b RODO (podjęcie działań na żądanie osoby, której dane dotyczą, przed zawarciem umowy).</li>
                <li>Prowadzenie strony internetowej i zapewnienie jej prawidłowego działania — na podstawie art. 6 ust. 1 lit. f RODO.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-foreground">3. Zakres przetwarzanych danych</h2>
              <p>W zależności od formularza przetwarzamy następujące dane:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Formularz kontaktowy:</strong> imię i nazwisko, adres e-mail, temat i treść wiadomości.</li>
                <li><strong>Formularz zapisu na treningi:</strong> imię i nazwisko dziecka, wiek, imię i nazwisko rodzica/opiekuna, numer telefonu, adres e-mail, preferowana grupa treningowa.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-foreground">4. Odbiorcy danych</h2>
              <p>
                Dane osobowe mogą być udostępniane podmiotom świadczącym usługi na rzecz Klubu, w tym
                dostawcom usług hostingowych, poczty elektronicznej oraz narzędzi analitycznych — wyłącznie
                w zakresie niezbędnym do realizacji ww. celów.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-foreground">5. Okres przechowywania danych</h2>
              <p>
                Dane osobowe przechowywane są przez okres niezbędny do realizacji celu, w jakim zostały
                zebrane, a po jego zakończeniu — przez okres wymagany przepisami prawa lub do czasu
                wycofania zgody bądź wniesienia skutecznego sprzeciwu.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-foreground">6. Prawa osób, których dane dotyczą</h2>
              <p>Każda osoba, której dane dotyczą, ma prawo do:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>dostępu do swoich danych osobowych,</li>
                <li>sprostowania danych,</li>
                <li>usunięcia danych („prawo do bycia zapomnianym"),</li>
                <li>ograniczenia przetwarzania,</li>
                <li>przenoszenia danych,</li>
                <li>wniesienia sprzeciwu wobec przetwarzania,</li>
                <li>wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).</li>
              </ul>
              <p>
                W celu realizacji powyższych praw prosimy o kontakt na adres:{" "}
                <a href="mailto:liszczanka.liszki@gmail.com" className="text-primary hover:underline">
                  liszczanka.liszki@gmail.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-foreground">7. Pliki cookies</h2>
              <p>
                Strona internetowa Klubu wykorzystuje pliki cookies w celu zapewnienia prawidłowego
                działania serwisu oraz analizy ruchu na stronie. Użytkownik może zarządzać ustawieniami
                plików cookies w swojej przeglądarce internetowej. Szczegółowe informacje na temat plików
                cookies dostępne są w ustawieniach przeglądarki.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-xl font-bold text-foreground">8. Zmiany polityki prywatności</h2>
              <p>
                Klub zastrzega sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności.
                O wszelkich zmianach użytkownicy zostaną poinformowani poprzez publikację zaktualizowanej
                wersji na stronie internetowej.
              </p>
            </section>

            <p className="text-xs text-muted-foreground/70 pt-4 border-t border-border">
              Ostatnia aktualizacja: {new Date().toLocaleDateString("pl-PL", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
