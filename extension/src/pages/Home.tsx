import { useState } from "react";
import { Pencil } from "lucide-react";
import testData from "../testData.json";
import type { ProfileFormData } from "../interface/ProfileInterface";

export default function Home() {
  const [profiles, setProfiles] = useState<ProfileFormData[]>(testData);
  const [selectedProfileId, setSelectedProfileId] = useState<number>(1);
  const profileLength: number = profiles.length;

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
    // muutetaa value numberiksi, koska selectin value on string
    const selectedId = parseInt(event.target.value, 10);
    setSelectedProfileId(selectedId);
  };

  const selectedProfile = profiles.find(
    (profile) => profile.id === selectedProfileId,
  );

  return (
    <div className="flex font-mono bg-background text-text justify-center h-min-screen ">
      <section className="flex flex-col justify-center text-lg font-bold border border-text h-fit p-8 rounded-lg items-center gap-4">
        <h3 className="text-sm font-normal text-gray-500">
          {profileLength} profile{profileLength > 1 ? "s" : ""}
        </h3>

        <select
          className="bg-background text-text border border-gray-300 rounded px-2 py-1"
          value={selectedProfileId ?? ""}
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
          <button className="p-2 rounded hover:bg-gray-200">
            <Pencil size={18} />
          </button>
        </div>
      </section>
    </div>
  );
}
