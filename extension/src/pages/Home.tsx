import testData from "../testData.json";

export default function Home() {
  const profileLength: number = 1;

  if (profileLength === 0) {
    return (
      <div className="flex font-mono bg-background text-text">
        <h1 className="flex w-full justify-center text-lg text-center">
          Please add a profile to continue.
        </h1>
      </div>
    );
  }

  return (
    <div className="flex font-mono bg-background text-text">
      <h1 className="flex w-full justify-center text-lg font-bold">
        Current profile: -{testData.firstName}
      </h1>
    </div>
  );
}
