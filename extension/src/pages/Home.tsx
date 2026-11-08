import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import AddProfile from "../components/AddProfile";
import PopUpMessage from "../components/PopUpMessage";
import type { ProfileFormData } from "../interface/ProfileInterface";
import {
  ApiRequestError,
  getProfiles,
  toProfileFormData,
} from "../lib/api";

export default function Home({
  token,
  onUnauthorized,
}: {
  token: string;
  onUnauthorized: () => void;
}) {
  const [profiles, setProfiles] = useState<ProfileFormData[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number>();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const fetchProfiles = async () => {
      setLoading(true);
      setError("");
      try {
        const [responses, stored] = await Promise.all([
          getProfiles(token),
          chrome.storage.local.get("activeProfileId"),
        ]);
        if (!active) return;
        const loadedProfiles = responses.map(toProfileFormData);
        setProfiles(loadedProfiles);

        const storedId =
          typeof stored.activeProfileId === "number"
            ? stored.activeProfileId
            : undefined;
        const selected =
          loadedProfiles.find((profile) => profile.id === storedId) ??
          loadedProfiles[0];
        setSelectedProfileId(selected?.id);
        if (selected) {
          await chrome.storage.local.set({ activeProfileId: selected.id });
        }
      } catch (cause) {
        if (!active) return;
        console.error("Could not load profiles:", cause);
        if (cause instanceof ApiRequestError && cause.status === 401) {
          onUnauthorized();
        } else {
          setError(
            cause instanceof Error
              ? cause.message
              : "Profiileja ei voitu hakea backendistä.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchProfiles();
    return () => {
      active = false;
    };
  }, [token, onUnauthorized]);

  const selectedProfile = profiles.find(
    (profile) => profile.id === selectedProfileId,
  );

  const profileLength = profiles.length;

  const handleProfileChange = async (profileId: number) => {
    try {
      await chrome.storage.local.set({ activeProfileId: profileId });
      setSelectedProfileId(profileId);
      setIsEditing(false);
      setError("");
    } catch (cause) {
      console.error("Could not select profile:", cause);
      setError("Aktiivisen profiilin tallentaminen epäonnistui.");
    }
  };

  const handleSaved = async (profile: ProfileFormData) => {
    const updatedProfiles = [
      ...profiles.filter((existing) => existing.id !== profile.id),
      profile,
    ];
    try {
      await chrome.storage.local.set({ activeProfileId: profile.id });
      setProfiles(updatedProfiles);
      setSelectedProfileId(profile.id);
      setIsEditing(false);
      setError("");
    } catch (cause) {
      console.error("Could not save active profile:", cause);
      setError("Profiili tallentui, mutta sen valinta ei onnistunut.");
    }
  };

  return (
    <div className="flex min-h-screen min-w-lg flex-col items-center gap-6 bg-background p-8 font-mono text-text">
      {loading ? (
        <p role="status">Haetaan profiileja...</p>
      ) : error && profiles.length === 0 ? (
        <div className="text-center">
          <p role="alert">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-3 rounded bg-primary px-4 py-2 text-white"
          >
            Yritä uudelleen
          </button>
        </div>
      ) : isEditing ? (
        <AddProfile
          token={token}
          profile={selectedProfile}
          onSaved={handleSaved}
          onBack={() => setIsEditing(false)}
        />
      ) : profileLength === 0 ? (
        <section className="flex flex-col items-center gap-3">
          <h1 className="w-full text-center text-lg">
            Backendistä ei löytynyt profiileja.
          </h1>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded bg-primary px-4 py-2 text-white"
          >
            Luo profiili
          </button>
        </section>
      ) : !isEditing ? (
        <section className="flex h-fit flex-col items-center gap-4 rounded-lg border border-gray-300 p-8">
          <h3 className="text-sm text-black font-bold">
            {"("}
            {profileLength}
            {")"} Profile{profileLength > 1 ? "s" : ""}
          </h3>

          <div className="rounded border border-gray-300 bg-background px-5 py-2 text-text text-start">
            {profiles.map((profile) => (
              <ul key={profile.id}>
                <li
                  onClick={() => handleProfileChange(profile.id)}
                  className="cursor-pointer font-black uppercase hover:text-primary m-1"
                >
                  {profile.profileName}
                </li>
              </ul>
            ))}
          </div>

          <div className="flex flex-row items-center gap-2">
            <p className="text-sm font-bold">
              Nykyinen profiili: {selectedProfile?.profileName ?? ""}
            </p>

            <button
              onClick={() => setIsEditing(true)}
              type="button"
              aria-label="Muokkaa profiilia"
              className="rounded p-2 hover:bg-gray-200"
            >
              <Pencil size={18} />
            </button>
          </div>
        </section>
      ) : null}
      {error && profiles.length > 0 && <p role="alert">{error}</p>}
      <PopUpMessage />
    </div>
  );
}
