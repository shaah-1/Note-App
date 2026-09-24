import { useEffect, useState } from "react";

const COLORS = [
  { name: "white", class: "bg-white" },
  { name: "yellow", class: "bg-yellow-100" },
  { name: "green", class: "bg-green-100" },
  { name: "blue", class: "bg-blue-100" },
  { name: "pink", class: "bg-pink-100" },
  { name: "purple", class: "bg-purple-100" },
  
];

const emptyForm = {
  title: "",
  content: "",
  color: "white",
  tags: "",
};

function App() {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const [selected, setSelected] = useState([]);

  const [loading, setLoading] = useState(true);

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem("notes");

    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }

    setLoading(false);
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("notes", JSON.stringify(notes));
    }
  }, [notes, loading]);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  // Add / Update note
  const handleSubmit = (e) => {
    e.preventDefault();

    const title = form.title.trim();
    const content = form.content.trim();

    // Validation
    if (!content) {
      alert("Content cannot be empty");
      return;
    }

    if (title.length > 100) {
      alert("Title cannot exceed 100 characters");
      return;
    }

    if (content.length > 5000) {
      alert("Content cannot exceed 5000 characters");
      return;
    }

    if (form.tags.length > 100) {
      alert("Tags cannot exceed 100 characters");
      return;
    }

    // Duplicate validation
    const duplicate = notes.some(
      (note) =>
        note.id !== editingId &&
        note.title.toLowerCase() === title.toLowerCase() &&
        note.content.toLowerCase() === content.toLowerCase()
    );

    if (duplicate) {
      alert("Duplicate note is not allowed");
      return;
    }

    if (editingId) {
      // UPDATE
      setNotes(
        notes.map((note) =>
          note.id === editingId
            ? {
                ...note,
                title,
                content,
                color: form.color,
                tags: form.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean),
                updatedAt: new Date().toISOString(),
              }
            : note
        )
      );

      setEditingId(null);
    } else {
      // CREATE
      const newNote = {
        id: Date.now(),
        title,
        content,
        color: form.color,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        pinned: false,
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setNotes([newNote, ...notes]);
    }

    setForm(emptyForm);
  };

  // Edit note
  const editNote = (note) => {
    setForm({
      title: note.title,
      content: note.content,
      color: note.color,
      tags: note.tags.join(", "),
    });

    setEditingId(note.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // DELETE
  const deleteNote = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmDelete) return;

    setNotes(notes.filter((note) => note.id !== id));

    setSelected(selected.filter((item) => item !== id));
  };

  // PIN
  const togglePin = (id) => {
    setNotes(
      notes.map((note) =>
        note.id === id
          ? {
              ...note,
              pinned: !note.pinned,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    );
  };

  // ARCHIVE
  const toggleArchive = (id) => {
    setNotes(
      notes.map((note) =>
        note.id === id
          ? {
              ...note,
              archived: !note.archived,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    );
  };

  // Select note
  const toggleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  // BULK DELETE
  const deleteSelected = () => {
    if (selected.length === 0) return;

    const confirmDelete = window.confirm(
      `Delete ${selected.length} selected notes?`
    );

    if (!confirmDelete) return;

    setNotes(notes.filter((note) => !selected.includes(note.id)));

    setSelected([]);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  // Search + filter
  let filteredNotes = notes.filter((note) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      note.title.toLowerCase().includes(searchValue) ||
      note.content.toLowerCase().includes(searchValue) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchValue)
      );

    let matchesFilter = true;

    if (filter === "active") {
      matchesFilter = !note.archived;
    }

    if (filter === "archived") {
      matchesFilter = note.archived;
    }

    if (filter === "pinned") {
      matchesFilter = note.pinned;
    }

    return matchesSearch && matchesFilter;
  });

  // Sort
  filteredNotes.sort((a, b) => {
    if (sort === "newest") {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    }

    if (sort === "oldest") {
      return new Date(a.updatedAt) - new Date(b.updatedAt);
    }

    if (sort === "title") {
      return a.title.localeCompare(b.title);
    }

    if (sort === "color") {
      return a.color.localeCompare(b.color);
    }

    return 0;
  });

  // Put pinned notes first
  filteredNotes.sort((a, b) => {
    if (a.pinned === b.pinned) return 0;
    return a.pinned ? -1 : 1;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">
          Loading notes...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">

          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">

            <h1 className="text-2xl font-bold text-gray-800">
              📝 Notes App
            </h1>

            {/* Search */}
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-80 px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            />

          </div>

        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* Note Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-md p-5 mb-6"
        >

          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Note" : "Create Note"}
          </h2>

          {/* Title */}
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            maxLength={100}
            placeholder="Title (optional)"
            className="w-full border-b px-2 py-3 mb-3 outline-none text-lg"
          />

          <p className="text-xs text-gray-500 text-right">
            {form.title.length}/100
          </p>

          {/* Content */}
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            maxLength={5000}
            rows="5"
            placeholder="Write your note..."
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-400"
          />

          <p className="text-xs text-gray-500 text-right">
            {form.content.length}/5000
          </p>

          {/* Tags */}
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            maxLength={100}
            placeholder="Tags (example: work, personal)"
            className="w-full border rounded-lg px-3 py-2 mt-3 outline-none"
          />

          {/* Colors */}
          <div className="mt-4">

            <p className="font-medium mb-2">
              Color 
            </p>

            <div className="flex gap-2">

              {COLORS.map((color) => (
                <button
                  type="button"
                  key={color.name}
                  onClick={() =>
                    setForm({
                      ...form,
                      color: color.name,
                    })
                  }
                  className={`w-8 h-8 rounded-full border-2 ${
                    color.class
                  } ${
                    form.color === color.name
                      ? "border-black"
                      : "border-gray-300"
                  }`}
                  title={color.name}
                />

              ))}

            </div>

          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-5">

            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
            >
              {editingId ? "Update Note" : "Add Note"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-500 text-white px-5 py-2 rounded-lg"
              >
                Cancel
              </button>
            )}

          </div>

        </form>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">

          <div className="flex flex-col md:flex-row gap-3 justify-between">

            <div className="flex gap-2 flex-wrap">

              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                All
              </button>

              <button
                onClick={() => setFilter("active")}
                className={`px-4 py-2 rounded-lg ${
                  filter === "active"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                Active
              </button>

              <button
                onClick={() => setFilter("pinned")}
                className={`px-4 py-2 rounded-lg ${
                  filter === "pinned"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                📌 Pinned
              </button>

              <button
                onClick={() => setFilter("archived")}
                className={`px-4 py-2 rounded-lg ${
                  filter === "archived"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                📦 Archived
              </button>

            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="newest">
                Newest
              </option>

              <option value="oldest">
                Oldest
              </option>

              <option value="title">
                Title
              </option>

              <option value="color">
                Color
              </option>

            </select>

          </div>

        </div>

        {/* Bulk Delete */}
        {selected.length > 0 && (
          <div className="bg-red-100 p-4 rounded-lg mb-5 flex justify-between items-center">

            <span>
              {selected.length} note(s) selected
            </span>

            <button
              onClick={deleteSelected}
              className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Delete Selected
            </button>

          </div>
        )}

        {/* Notes */}
        {filteredNotes.length === 0 ? (

          <div className="bg-white rounded-xl p-12 text-center shadow-sm">

            <div className="text-5xl mb-4">
              📝
            </div>

            <h2 className="text-xl font-semibold">
              No notes found
            </h2>

            <p className="text-gray-500 mt-2">
              Create a note or try another search.
            </p>

          </div>

        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {filteredNotes.map((note) => (

              <NoteCard
                key={note.id}
                note={note}
                selected={selected.includes(note.id)}
                onSelect={toggleSelect}
                onEdit={editNote}
                onDelete={deleteNote}
                onPin={togglePin}
                onArchive={toggleArchive}
              />

            ))}

          </div>

        )}

      </main>

    </div>
  );
}


// Note Card Component
function NoteCard({
  note,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onPin,
  onArchive,
}) {
  const colorClass =
    COLORS.find((color) => color.name === note.color)?.class ||
    "bg-white";

  return (
    <div
      className={`${colorClass} rounded-xl p-5 shadow-md border hover:shadow-lg transition relative`}
    >

      {/* Top */}
      <div className="flex justify-between items-start gap-3">

        <div className="flex gap-2">

          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(note.id)}
            className="mt-1 w-4 h-4"
          />

          <h3 className="font-bold text-lg break words">
            {note.title || "Untitled"}
          </h3>

        </div>

        <button
          onClick={() => onPin(note.id)}
          className="text-xl"
          title="Pin"
        >
          {note.pinned ? "📌" : "📍"}
        </button>

      </div>

      {/* Content */}
      <p className="text-gray-700 whitespace-pre-wrap break words mt-4">
        {note.content}
      </p>

      {/* Tags */}
      {note.tags.length > 0 && (

        <div className="flex gap-2 flex-wrap mt-4">

          {note.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}

        </div>

      )}

      {/* Date */}
      <p className="text-xs text-gray-500 mt-4">
        Updated:{" "}
        {new Date(note.updatedAt).toLocaleString()}
      </p>

      {/* Actions */}
      <div className="flex gap-2 mt-5 pt-3 border-t">

        <button
          onClick={() => onEdit(note)}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm"
        >
          Edit
        </button>

        <button
          onClick={() => onArchive(note.id)}
          className="flex-1 bg-gray-700 text-white py-2 rounded-lg text-sm"
        >
          {note.archived ? "Unarchive" : "Archive"}
        </button>

        <button
          onClick={() => onDelete(note.id)}
          className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
        >
          🗑️
        </button>

      </div>

    </div>
  );
}

export default App;