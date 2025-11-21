export default function BackgroundGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
      <div className="absolute -bottom-20 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-fuchsia-500/25 blur-3xl" />
    </div>
  );
}