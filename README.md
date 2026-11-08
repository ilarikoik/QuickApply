# QuickApply

QuickApply on Chrome-selainlaajennus ja Java-backend, jotka auttavat täyttämään työhakemuslomakkeita uudelleen käytettävän käyttäjäprofiilin avulla. Laajennus tunnistaa lomakkeiden kenttiä niiden nimien, otsikoiden, placeholder-tekstien ja muiden HTML-vihjeiden perusteella. Tunnistetut kentät täytetään profiilista, ja epävarmat kentät näytetään käyttäjälle tarkistettaviksi.

Tämä on kehitysvaiheessa oleva opinnäytetyöprojekti. Automaattitäytön tulos kannattaa aina tarkistaa ennen hakemuksen lähettämistä.

## Ominaisuudet

- Käyttäjätilin luonti ja kirjautuminen backendin JWT-tunnisteella.
- Käyttäjäkohtaiset profiilit backendissä.
- Profiilien luonti, valinta ja muokkaus laajennuksesta.
- Profiilin tietojen käyttäminen rekrytointisivujen lomakkeiden täyttämiseen.
- Epävarmojen kenttien näyttäminen ja kenttätyypin manuaalinen valinta.
- Suomen- ja englanninkieliset profiilitekstit sekä valinnainen DeepL-käännös.
- REST-rajapinta työhakemusten tallennukseen ja käyttäjäkohtaisen historian käsittelyyn.

## Teknologiat

| Osa | Teknologia |
|---|---|
| Selainlaajennus | Chrome Manifest V3, React, TypeScript, Vite, Tailwind CSS |
| Backend | Java 21, Spring Boot, Spring Security, Spring Data JPA |
| Tietokanta | H2 paikallisesti oletuksena; PostgreSQL ympäristömuuttujilla |
| Autentikointi | JWT |

## Projektin rakenne

```text
backend/     Spring Boot REST API ja tietokantamallit
extension/   Chrome-laajennuksen React-käyttöliittymä ja sisältöskripti
docs/        Projektin arkkitehtuurikuva
```

## Vaatimukset

- Java 21
- Node.js ja npm
- Google Chrome
- (Valinnainen) PostgreSQL
- (Valinnainen) DeepL API -avain automaattikäännöksille

## Käynnistä paikallisesti

### 1. Backend

Avaa terminaali projektin juuressa ja käynnistä backend:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend käynnistyy oletuksena osoitteeseen `http://localhost:8080`. Oletustietokanta on H2:n muistissa toimiva tietokanta; sen sisältö tyhjenee backendin pysäytyksen jälkeen.

### 2. Selainlaajennus

Avaa toinen terminaali projektin juuressa:

```powershell
cd extension
npm install
```

Luo tuotantoversio:

```powershell
npm run build
```

Lataa laajennus Chromeen:

1. Avaa `chrome://extensions`.
2. Kytke **Developer mode** päälle.
3. Valitse **Load unpacked**.
4. Valitse projektin `extension/dist`-kansio.
5. Avaa rekrytointisivu ja päivitä sivu laajennuksen asennuksen tai päivityksen jälkeen.

Kirjaudu QuickApplyn popupissa tai luo käyttäjätili. Sen jälkeen voit luoda tai valita profiilin. Chrome ei salli sisältöskriptien suorittamista kaikilla sivuilla (esimerkiksi `chrome://`-sivuilla).

Vite-kehityspalvelimen voi käynnistää komennolla `npm run dev`. Kehityspalvelimen URL:n käyttö edellyttää, että palvelin pysyy käynnissä. Tavalliseen laajennuskäyttöön rakenna `dist` ja lataa se unpacked-laajennuksena yllä olevien ohjeiden mukaan.

## DeepL-käännökset

Automaattikäännöstoiminto tarvitsee DeepL API -avaimen. Aseta avain `extension/.env`-tiedostoon ennen kehityspalvelimen tai tuotantobuildin käynnistämistä:

```dotenv
VITE_DEEPL_API_KEY=oma_deepl_api_avain
```

Rakenna laajennus uudelleen `.env`-arvon muuttamisen jälkeen. Älä tallenna API-avainta versionhallintaan. Ilman avainta englanninkieliset tekstit voi kirjoittaa profiilissa käsin.

## PostgreSQLin käyttö

PostgreSQL-ajuri sisältyy backendiin. Luo PostgreSQL-palvelimelle tietokanta, esimerkiksi `quickapply`, ja aseta backendin käynnistysterminaalissa yhteysmuuttujat:

```powershell
$env:DATABASE_URL = "jdbc:postgresql://localhost:5432/quickapply"
$env:DATABASE_USERNAME = "postgres"
$env:DATABASE_PASSWORD = "oma_salasanasi"
.\mvnw.cmd spring-boot:run
```

Ympäristömuuttujat koskevat vain kyseistä PowerShell-ikkunaa. Kun `DATABASE_URL` on asetettu, backend käyttää PostgreSQLia H2:n sijaan.

| Muuttuja | Oletus / tarkoitus |
|---|---|
| `DATABASE_URL` | H2-muistitietokanta; aseta PostgreSQLin JDBC-osoite käyttääksesi PostgreSQLia |
| `DATABASE_USERNAME` | H2-oletus `sa` |
| `DATABASE_PASSWORD` | H2-oletuksena tyhjä |
| `DDL_AUTO` | `update` paikalliseen kehitykseen |
| `JWT_SECRET` | Paikallisen kehityksen oletusarvo; aseta oma salaisuus muissa ympäristöissä |
| `JWT_EXPIRATION_MS` | Tokenin voimassaoloaika millisekunteina, oletuksena `86400000` |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,chrome-extension://*` |

Älä käytä kehityksen JWT-oletusarvoa tuotannossa. Tuotantokäytössä käytä vahvaa salaisuutta, tietokantamigraatioita ja turvallisia yhteysasetuksia `DDL_AUTO=update`-asetuksen sijaan.

## REST API

Rajapinnan perusosoite on `http://localhost:8080`, ja API-polut alkavat `/api/v1`-etuliitteellä. Rekisteröityminen ja kirjautuminen ovat julkisia; muut reitit vaativat otsakkeen `Authorization: Bearer <token>`.

| Metodi | Reitti | Kuvaus |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Luo käyttäjän (`username`, `password`) ja palauttaa JWT:n |
| `POST` | `/api/v1/auth/login` | Kirjaudu ja hae JWT |
| `GET` | `/api/v1/auth/me` | Hae kirjautunut käyttäjä |
| `GET`, `POST` | `/api/v1/profiles` | Hae tai luo profiileja |
| `GET`, `PUT`, `DELETE` | `/api/v1/profiles/{profileId}` | Hae, päivitä tai poista profiili |
| `GET`, `POST` | `/api/v1/applications` | Hae tai luo työhakemuksia |
| `GET`, `PUT`, `DELETE` | `/api/v1/applications/{applicationId}` | Hae, päivitä tai poista työhakemus |

Käyttäjänimen pituus on 3–80 merkkiä ja salasanan 8–72 merkkiä. Esimerkki rekisteröitymisestä PowerShellissä:

```powershell
$body = @{ username = "oma_kayttaja"; password = "vahva-salasana" } |
    ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:8080/api/v1/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

Profiilin luonti vaatii kirjautumisessa saadun JWT:n:

```powershell
$token = "kirjautumisessa_saatu_token"
$body = @{
    profileName = "Ohjelmistokehittäjä"
    firstName = "Etunimi"
    lastName = "Sukunimi"
    currentTitle = @{ fi = "Kehittäjä"; en = "Developer" }
    summary = @{ fi = "Osaamiseni"; en = "My experience" }
    coverLetter = @{ fi = "Hakemusteksti"; en = "Cover letter" }
    willingToRelocate = $false
} | ConvertTo-Json -Depth 5

Invoke-RestMethod `
    -Uri "http://localhost:8080/api/v1/profiles" `
    -Method Post `
    -Headers @{ Authorization = "Bearer $token" } `
    -ContentType "application/json" `
    -Body $body
```

## Testit ja tarkistukset

Backendin testit ajetaan Java 21:llä:

```powershell
cd backend
.\mvnw.cmd test
```

Laajennuksen TypeScript-tarkistus ja tuotantobuild:

```powershell
cd extension
npm run build
```

ESLint:

```powershell
npm run lint
```

## Tietosuoja ja käyttö

Profiilit tallennetaan backendin tietokantaan käyttäjäkohtaisesti. Laajennus käyttää kirjautumisen JWT-tunnistetta backend-pyynnöissä ja Chrome-tallennustilaan tallennettua aktiivisen profiilin tunnistetta. Automaattitäyttö ei lähetä hakemusta puolestasi; tarkista aina täytetyt kentät rekrytointisivulla ennen lähettämistä.
