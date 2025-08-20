// components/ui/NotesList.tsx

import React from "react";

const notes = [
  {
    name: "Christan Bilney",
    time: "2 days ago",
    priority: "Low Priority",
    version: "V 3.20",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    name: "Hady Vanetti",
    time: "4 days ago",
    priority: "Critical",
    version: "V 3.13",
    text: "Aliquam vel nibh iaculis, ornare purus sit amet, euismod dui. Cras sed tristique neque. Cras ornare dui lorem, vel rhoncus elit venenatis sit amet. Suspendisse varius massa in gravida commodo.",
  },
];

const getPriorityClass = (priority: string) => {
  if (priority === "Critical") return "bg-red-600 text-white";
  return "bg-gray-200 text-gray-800";
};

const NoteItem = ({ note }: { note: (typeof notes)[0] }) => (
  <div className="py-4">
    <div className="flex justify-between items-center mb-2">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-300"></div>{" "}
        {/* Avatar placeholder */}
        <div>
          <p className="font-semibold text-gray-800">{note.name}</p>
          <p className="text-xs text-gray-500">{note.time}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${getPriorityClass(
            note.priority
          )}`}
        >
          {note.priority}
        </span>
        <span className="text-xs font-semibold text-gray-600 bg-gray-200 px-3 py-1 rounded-md">
          {note.version}
        </span>
      </div>
    </div>
    <p className="text-gray-600 text-sm">
      {note.text}{" "}
      <a href="#" className="text-blue-600 font-semibold">
        More...
      </a>
    </p>
  </div>
);

const NotesList = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <div className="divide-y divide-gray-200">
        {notes.map((note, index) => (
          <NoteItem key={index} note={note} />
        ))}
      </div>
    </div>
  );
};

export default NotesList;
