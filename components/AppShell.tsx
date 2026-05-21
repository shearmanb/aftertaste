import NavBar from "./NavBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20">
      <main className="max-w-lg mx-auto px-4 pt-4">{children}</main>
      <NavBar />
    </div>
  );
}
