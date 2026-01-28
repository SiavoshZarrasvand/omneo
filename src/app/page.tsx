
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 sm:p-20 font-[family-name:var(--font-sans)] bg-background text-foreground relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500 blur-[100px]" />
      </div>

      <main className="flex flex-col gap-6 items-center text-center max-w-3xl z-10">
        <div className="space-y-4">
          <div className="inline-block px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium mb-2">
            v0.1.0 Beta
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent pb-2">
            Z-CRM
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            The premium customer relationship management solution.
            Engineered for growth, designed for simplicity.
          </p>
        </div>

        <div className="flex gap-4 items-center justify-center mt-4">
          <button className="rounded-full bg-primary text-primary-foreground px-8 py-3 font-semibold hover:opacity-90 transition-all shadow-lg shadow-primary/20 cursor-pointer">
            Get Started
          </button>
          <button className="rounded-full border border-border bg-background/50 backdrop-blur-sm px-8 py-3 font-semibold hover:bg-muted transition-all cursor-pointer">
            Documentation
          </button>
        </div>
      </main>

      <footer className="absolute bottom-8 text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Z-CRM. All rights reserved.
      </footer>
    </div>
  );
}
