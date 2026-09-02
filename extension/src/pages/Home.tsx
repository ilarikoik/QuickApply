import { useState } from "react";
import { Pencil } from "lucide-react";
import testData from "../testData.json";
import AddProfile from "../components/AddProfile";
import type { ProfileFormData } from "../interface/ProfileInterface";

export default function Home() {
  const [profiles, setProfiles] = useState<ProfileFormData[]>(testData);
  const [selectedProfileId, setSelectedProfileId] = useState<number>(1);
  const [isEditing, setIsEditing] = useState(false);

  const selectedProfile = profiles.find(
    (profile) => profile.id === selectedProfileId,
  );

  const profileLength = profiles.length;

  if (profileLength === 0) {
    return (
      <div className="flex font-mono bg-background text-text">
        <h1 className="flex w-full justify-center text-lg text-center">
          Please add a profile to continue.
        </h1>
      </div>
    );
  }

  const handleProfileChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(event.target.value, 10);
    setSelectedProfileId(selectedId);
    setIsEditing(false);
  };

  return (
    <div className="flex min-h-screen justify-center bg-background text-text font-mono p-8">
      {!isEditing ? (
        <section className="flex h-fit flex-col items-center gap-4 rounded-lg border border-text p-8">
          <h3 className="text-sm font-normal text-gray-500">
            {profileLength} profile{profileLength > 1 ? "s" : ""}
          </h3>

          <select
            className="rounded border border-gray-300 bg-background px-2 py-1 text-text"
            value={selectedProfileId}
            onChange={handleProfileChange}
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.profileName}
              </option>
            ))}
          </select>

          <div className="flex flex-row items-center gap-2">
            <p className="text-sm font-normal">
              Current profile: {selectedProfile?.profileName ?? ""}
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
    </div>
  );
}
