import React from "react";

export const GeofenceSection = ({ latitude, longitude, handleChange }) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-slate-700 border-b border-slate-100 pb-2">4. Office Geolocation (Geofencing)</h4>
      <p className="text-xs text-slate-400 mt-1">
        Specify the office coordinates below. Employee check-ins will be restricted to a 50-meter radius around this location.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Latitude</label>
          <input
            name="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
            placeholder="e.g. 20.296059"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Longitude</label>
          <input
            name="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 text-sm text-slate-800 bg-white rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-colors"
            placeholder="e.g. 85.824539"
          />
        </div>
      </div>
    </div>
  );
};
