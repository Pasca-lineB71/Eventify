import React from 'react';

const EventCard = ({ title, date, imageUrl }) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden m-4 w-72">
      <img src={imageUrl} alt={title} className="w-full h-40 object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="text-gray-600">{date}</p>
        <button className="mt-2 bg-eventify-primary text-white px-4 py-2 rounded hover:bg-blue-600">
          Inscription
        </button>
      </div>
    </div>
  );
};

export default EventCard;
