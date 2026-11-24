import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-950">
      <SignUp appearance={{ elements: { formButtonPrimary: 'bg-indigo-600 hover:bg-indigo-500' } }} />
    </div>
  );
}