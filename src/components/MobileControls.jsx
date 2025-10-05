export default function MobileControls() {
  return (
    <div className="md:hidden bg-gray-800 p-3 border-t border-gray-700">
      <div className="flex justify-around">
        <button className="px-3 py-2 rounded bg-gray-700">Layers</button>
        <button className="px-3 py-2 rounded bg-gray-700">Time</button>
        <button className="px-3 py-2 rounded bg-gray-700">Annotations</button>
        <button className="px-3 py-2 rounded bg-gray-700">AI</button>
      </div>
    </div>
  );
}
