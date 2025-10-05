export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 shadow-md relative z-20">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 text-gray-300">☰</div>
        <h1 className="text-xl font-bold font-roboto-slab">
          COSMOSCOPE
        </h1>
      </div>
    </header>
  );
}
