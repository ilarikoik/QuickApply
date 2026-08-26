import { useState } from "react";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;

  address: string;
  city: string;
  postalCode: string;
  country: string;

  currentTitle: string;
  yearsOfExperience: string;
  education: string;
  school: string;
  linkedin: string;
  github: string;
  portfolio: string;

  summary: string;
  salaryExpectation: string;
  availability: string;
  willingToRelocate: boolean;
}

const initialFormData: ProfileFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
  currentTitle: "",
  yearsOfExperience: "",
  education: "",
  school: "",
  linkedin: "",
  github: "",
  portfolio: "",
  summary: "",
  salaryExpectation: "",
  availability: "",
  willingToRelocate: false,
};

const steps = [
  { number: 1, label: "Perustiedot" },
  { number: 2, label: "Osoite" },
  { number: 3, label: "Ammatilliset tiedot" },
  { number: 4, label: "Lisätiedot" },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClasses =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200 transition";

export default function AddProfile() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);

  const handleChange = (
    field: keyof ProfileFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const goNext = () => setStep((s) => Math.min(s + 1, steps.length));
  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Profiilin tiedot:", formData);
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-xl bg-white p-6 shadow-md">
      <h1 className="mb-1 text-xl font-semibold text-slate-900">
        Täytä profiilitiedot
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Vaihe {step} / {steps.length}: {steps[step - 1].label}
      </p>

      <div className="mb-8 flex items-center">
        {steps.map((s, i) => (
          <div key={s.number} className="flex flex-1 items-center">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium transition ${
                s.number < step
                  ? "bg-slate-900 text-white"
                  : s.number === step
                    ? "bg-slate-900 text-white ring-4 ring-slate-200"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {s.number}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 flex-1 transition ${
                  s.number < step ? "bg-slate-900" : "bg-slate-100"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Etunimi">
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="Matti"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                />
              </Field>
              <Field label="Sukunimi">
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="Meikäläinen"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Sähköposti">
              <input
                type="email"
                className={inputClasses}
                placeholder="matti.meikalainen@esimerkki.fi"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </Field>
            <Field label="Puhelinnumero">
              <input
                type="tel"
                className={inputClasses}
                placeholder="+358 40 123 4567"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </Field>
            <Field label="Syntymäaika">
              <input
                type="date"
                className={inputClasses}
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              />
            </Field>
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Katuosoite">
              <input
                type="text"
                className={inputClasses}
                placeholder="Esimerkkikatu 1"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Kaupunki">
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="Helsinki"
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                />
              </Field>
              <Field label="Postinumero">
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="00100"
                  value={formData.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Maa">
              <input
                type="text"
                className={inputClasses}
                placeholder="Suomi"
                value={formData.country}
                onChange={(e) => handleChange("country", e.target.value)}
              />
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <Field label="Nykyinen titteli">
              <input
                type="text"
                className={inputClasses}
                placeholder="Ohjelmistokehittäjä"
                value={formData.currentTitle}
                onChange={(e) => handleChange("currentTitle", e.target.value)}
              />
            </Field>
            <Field label="Työkokemus (vuotta)">
              <input
                type="number"
                min="0"
                className={inputClasses}
                placeholder="3"
                value={formData.yearsOfExperience}
                onChange={(e) =>
                  handleChange("yearsOfExperience", e.target.value)
                }
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Koulutus">
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="Tradenomi"
                  value={formData.education}
                  onChange={(e) => handleChange("education", e.target.value)}
                />
              </Field>
              <Field label="Oppilaitos">
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="Haaga-Helia"
                  value={formData.school}
                  onChange={(e) => handleChange("school", e.target.value)}
                />
              </Field>
            </div>
            <Field label="LinkedIn">
              <input
                type="url"
                className={inputClasses}
                placeholder="https://linkedin.com/in/kayttajanimi"
                value={formData.linkedin}
                onChange={(e) => handleChange("linkedin", e.target.value)}
              />
            </Field>
            <Field label="GitHub">
              <input
                type="url"
                className={inputClasses}
                placeholder="https://github.com/kayttajanimi"
                value={formData.github}
                onChange={(e) => handleChange("github", e.target.value)}
              />
            </Field>
            <Field label="Portfolio">
              <input
                type="url"
                className={inputClasses}
                placeholder="https://oma-portfolio.fi"
                value={formData.portfolio}
                onChange={(e) => handleChange("portfolio", e.target.value)}
              />
            </Field>
          </>
        )}

        {step === 4 && (
          <>
            <Field label="Lyhyt esittely">
              <textarea
                className={`${inputClasses} min-h-[100px] resize-none`}
                placeholder="Kerro lyhyesti itsestäsi ja osaamisestasi..."
                value={formData.summary}
                onChange={(e) => handleChange("summary", e.target.value)}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Palkkatoive (€/kk)">
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="3500"
                  value={formData.salaryExpectation}
                  onChange={(e) =>
                    handleChange("salaryExpectation", e.target.value)
                  }
                />
              </Field>
              <Field label="Saatavuus">
                <input
                  type="text"
                  className={inputClasses}
                  placeholder="1 kuukauden kuluttua"
                  value={formData.availability}
                  onChange={(e) => handleChange("availability", e.target.value)}
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                checked={formData.willingToRelocate}
                onChange={(e) =>
                  handleChange("willingToRelocate", e.target.checked)
                }
              />
              <span className="text-sm text-slate-700">
                Olen valmis muuttamaan työn perässä
              </span>
            </label>
          </>
        )}

        {/* Navigointipainikkeet */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={goPrev}
            disabled={step === 1}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-0"
          >
            Edellinen
          </button>

          {step < steps.length ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Seuraava
            </button>
          ) : (
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Tallenna profiili
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
