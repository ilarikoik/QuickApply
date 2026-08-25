export default function Home() {
  const profileLength: number = 0;

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
        Current profile: ----
      </h1>
    </div>
  );
}
