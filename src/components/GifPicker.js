import React, { useState } from "react";

export default function GifPicker({ onSelect }) {
  const [search, setSearch] = useState("");
  const [gifs, setGifs] = useState([]);

  const fetchGifs = async (queryStr) => {
    const res = await fetch(
      `https://api.giphy.com/v1/stickers/search?api_key=hhwlTr8sE3NhSTCWSKVWuVL6fUXFFHJH&q=${queryStr}&limit=10`
    );
    const data = await res.json();
    setGifs(data.data.map((g) => g.images.fixed_height.url));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim() !== "") fetchGifs(search);
  };

  return (
    <div style={{ margin: "10px 0" }}>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search GIFs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
        {gifs.map((url, i) => (
          <img
            key={i}
            src={url}
            width={100}
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(url)}
          />
        ))}
      </div>
    </div>
  );
}
