import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL;

export default function CollegeSelect({ value, onChange }) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState([]);

  // debounce effect
  useEffect(() => {
    const delay = setTimeout(async () => {
      if (query.length < 2) return;

      try {
        const res = await fetch(`${API}/api/colleges?search=${query}`);

        //IMPORTANT CHECK
        if (!res.ok) {
          console.error("API error:", res.status);
          return;
        }

        const text = await res.text();

        //Prevent crash if HTML comes
        if (text.startsWith("<")) {
          console.error("Got HTML instead of JSON:", text);
          return;
        }

        const data = JSON.parse(text);
        setOptions(data);

      } catch (err) {
        console.error("Fetch failed:", err);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search your college..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-3 py-2 rounded-lg 
bg-background border border-border 
text-foreground 
placeholder:text-muted-foreground
focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {options.length > 0 && (
        <div className="absolute bg-popover border border-border 
text-foreground w-full mt-1 max-h-60 overflow-y-auto 
z-10 rounded-lg shadow-lg">
          {options.map((college) => (
            <div
              key={college.id}
              onClick={() => {
                onChange(college);
                setQuery(college.name);
                setOptions([]);
              }}
              className="p-2 hover:bg-accent cursor-pointer"
            >
              <div className="font-medium">
                {college.name}
              </div>
              <div className="text-sm text-gray-500">
                {college.country}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}