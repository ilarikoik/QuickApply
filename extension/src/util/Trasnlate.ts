// Joo, tuo on hyvä lähestymistapa. Eli logiikka olisi:

// Käyttäjä täyttää ProfileFormData-lomakkeen aina suomeksi — se on ainoa totuus, jota tallennetaan/muokataan.
// Kun käyttäjä on esim. avoinna olevalla työpaikkasivulla, laajennus (content script) havaitsee sivun kielen — esim. document.documentElement.lang-attribuutista tai kirjaston avulla (franc) analysoimalla sivun tekstiä.
// Jos havaittu kieli on englanti, kutsutaan käännösfunktiota joka kääntää vain tarvittavat kentät (esim. summary, currentTitle, education) englanniksi juuri ennen kuin niitä käytetään lomakkeen täyttöön kyseisellä sivulla.
// tsx
// async function getProfileForPage(
//   profile: ProfileFormData
// ): Promise<ProfileFormData> {
//   const pageLang = document.documentElement.lang || "fi";

//   if (pageLang.startsWith("en")) {
//     return {
//       ...profile,
//       currentTitle: await translateIfFinnish(profile.currentTitle),
//       education: await translateIfFinnish(profile.education),
//       summary: await translateIfFinnish(profile.summary),
//       availability: await translateIfFinnish(profile.availability),
//     };
//   }

//   return profile; // sama suomeksi, ei käännetä
// }
