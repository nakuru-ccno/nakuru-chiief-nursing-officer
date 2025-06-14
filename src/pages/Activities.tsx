
import React, { useState } from "react";
import MainNavbar from "@/components/MainNavbar";
import CountyHeader from "@/components/CountyHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Activity = {
  id: string;
  date: string;
  facility: string;
  title: string;
  type: string;
  duration: number;
  description: string;
};

const ACTIVITY_TYPES = [
  "Administrative",
  "Meetings",
  "Training",
  "Documentation",
  "Supervision",
  "Other",
];

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [form, setForm] = useState<Omit<Activity, "id">>({
    date: "",
    facility: "",
    title: "",
    type: ACTIVITY_TYPES[0],
    duration: 0,
    description: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("add");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((data) => ({
      ...data,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setActivities((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, ...form } : a))
      );
      setEditingId(null);
    } else {
      setActivities((prev) => [
        ...prev,
        { ...form, id: Date.now().toString() },
      ]);
    }
    setForm({
      date: "",
      facility: "",
      title: "",
      type: ACTIVITY_TYPES[0],
      duration: 0,
      description: "",
    });
    // On submit, switch to "Recent Activities" tab.
    setActiveTab("recent");
  };

  const handleEdit = (id: string) => {
    const a = activities.find((x) => x.id === id);
    if (a) {
      setEditingId(id);
      setForm({
        date: a.date,
        facility: a.facility,
        title: a.title,
        type: a.type,
        duration: a.duration,
        description: a.description,
      });
      setActiveTab("add");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CountyHeader />
      <MainNavbar />
      <div className="max-w-3xl mx-auto px-6 pt-6">
        <h2 className="text-2xl font-bold mb-2 text-[#be2251]">Daily Activities</h2>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 flex bg-[#f5e6ea]">
            <TabsTrigger
              value="add"
              className="flex-1 data-[state=active]:bg-[#fd3572] data-[state=active]:text-white"
            >
              Add Activity
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className="flex-1 data-[state=active]:bg-[#fd3572] data-[state=active]:text-white"
            >
              Recent Activities
            </TabsTrigger>
          </TabsList>
          <TabsContent value="add">
            <form
              onSubmit={handleSubmit}
              className="bg-white border rounded-lg shadow mb-8 p-6 flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Date
                    <input
                      name="date"
                      type="date"
                      required
                      value={form.date}
                      onChange={handleChange}
                      className="w-full border rounded px-2 py-1"
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Facility
                    <input
                      name="facility"
                      type="text"
                      required
                      value={form.facility}
                      onChange={handleChange}
                      className="w-full border rounded px-2 py-1"
                      placeholder="Enter facility name"
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Activity Title
                    <input
                      name="title"
                      type="text"
                      required
                      value={form.title}
                      onChange={handleChange}
                      className="w-full border rounded px-2 py-1"
                      placeholder="e.g. Monthly Review"
                    />
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Activity Type
                    <select
                      name="type"
                      required
                      value={form.type}
                      onChange={handleChange}
                      className="w-full border rounded px-2 py-1"
                    >
                      {ACTIVITY_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Duration (minutes)
                    <input
                      name="duration"
                      type="number"
                      min={1}
                      required
                      value={form.duration}
                      onChange={handleChange}
                      className="w-full border rounded px-2 py-1"
                    />
                  </label>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium mb-1">
                    Description
                    <textarea
                      name="description"
                      required
                      value={form.description}
                      onChange={handleChange}
                      className="w-full border rounded px-2 py-1"
                      rows={2}
                      placeholder="Add any details..."
                    />
                  </label>
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  className="bg-[#fd3572] text-white font-bold px-6 py-2 rounded hover:bg-[#be2251] transition"
                >
                  {editingId ? "Update Activity" : "Add Activity"}
                </button>
              </div>
            </form>
          </TabsContent>
          <TabsContent value="recent">
            <div>
              <h3 className="text-lg font-bold mb-2 text-[#fd3572]">
                Recent Activities
              </h3>
              {activities.length === 0 ? (
                <div className="text-gray-500 italic">No activities yet.</div>
              ) : (
                <table className="w-full table-auto border">
                  <thead>
                    <tr className="bg-[#fd3572] text-white text-sm">
                      <th className="px-2 py-2">Date</th>
                      <th className="px-2 py-2">Facility</th>
                      <th className="px-2 py-2">Title</th>
                      <th className="px-2 py-2">Type</th>
                      <th className="px-2 py-2">Duration</th>
                      <th className="px-2 py-2">Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((act) => (
                      <tr key={act.id} className="even:bg-gray-50 text-sm">
                        <td className="border px-2 py-2">{act.date}</td>
                        <td className="border px-2 py-2">{act.facility}</td>
                        <td className="border px-2 py-2">{act.title}</td>
                        <td className="border px-2 py-2">{act.type}</td>
                        <td className="border px-2 py-2">{act.duration}</td>
                        <td className="border px-2 py-2 text-center">
                          <button
                            onClick={() => handleEdit(act.id)}
                            className="text-[#fd3572] hover:underline"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
