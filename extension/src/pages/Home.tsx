import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import testData from "../testData.json";
import AddProfile from "../components/AddProfile";
import PopUpMessage from "../components/PopUpMessage";
import type { ProfileFormData } from "../interface/ProfileInterface";

export default function Home() {
  const profiles: ProfileFormData[] = testData;

  const [selectedProfileId, setSelectedProfileId] = useState<number>(
    profiles[0]?.id,
  );

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchActiveProfileId = async () => {
      const result = await chrome.storage.local.get("activeProfileId");

      const activeId = result.activeProfileId as number | undefined;

      if (activeId !== undefined) {
        setSelectedProfileId(activeId);
      }
    };

    fetchActiveProfileId();
  }, []);

  const selectedProfile = profiles.find(
    (profile) => profile.id === selectedProfileId,
  );

  const profileLength = profiles.length;

  const handleProfileChange = (profileId: number) => {
    console.log("TÄÄLLÄ");
    chrome.storage.local.set({
      activeProfileId: profileId,
    });
    setSelectedProfileId(profileId);
    setIsEditing(false);
    console.log("Selected profile ID:", profileId);
  };

  return (
    <div className="flex min-h-screen min-w-lg flex-col items-center gap-6 bg-background p-8 font-mono text-text">
      {profileLength === 0 ? (
        <h1 className="w-full text-center text-lg">
          Please add a profile to continue.
        </h1>
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
              className="rounded p-2 hover:bg-gray-200"
            >
              <Pencil size={18} />
            </button>
          </div>
        </section>
      ) : (
        <AddProfile
          profile={selectedProfile}
          onBack={() => setIsEditing(false)}
        />
      )}
      <PopUpMessage />
    </div>
  );
}
