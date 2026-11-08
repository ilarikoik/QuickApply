import LoginForm from "../components/LoginForm";

export default function Login({
  onAuthenticated,
}: {
  onAuthenticated: (token: string) => void;
}) {
  return (
    <div className="flex min-h-100 flex-col items-center justify-center gap-4">
      <LoginForm onAuthenticated={onAuthenticated} />
    </div>
  );
}
