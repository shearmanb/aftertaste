import NavBar from "./NavBar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <main className="max-w-lg mx-auto px-[22px] pt-1 pb-[132px]">{children}</main>
      <NavBar />
    </div>
  );
}
