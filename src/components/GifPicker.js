import React, { useState } from "react";

const GifPicker = ({ onSelect }) => {
  const [gifs, setGifs] = useState([]);
  const [search, setSearch] = useState("");

  // Function to fetch GIFs from Giphy
  const fetchGifs = async (query) => {
    const res = await fetch(
      `https://api.giphy.com/v1/stickers/search?api_key=hhwlTr8sE3NhSTCWSKVWuVL6fUXFFHJH&q=${query}&limit=10`
    );
    const data = await res.json();
    const urls = data.data.map(g => g.images.fixed_height.url);
    setGifs(urls);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim() !== "") fetchGifs(search);
  };

  return (
    <div>
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
        {gifs.map((url, index) => (
          <img
            key={index}
            src={url}
            width={100}
            style={{ cursor: "pointer" }}
            onClick={() => onSelect(url)}
          />
        ))}
      </div>
    </div>
  );
};

export default GifPicker;
