import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950">
      <SignIn appearance={{ elements: { formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-500' } }} />
    </div>
  );
}