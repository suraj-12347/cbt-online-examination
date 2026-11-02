
import { useEffect, useState } from "react";
import {
  Plus,
  Layers,
  Check,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Clock,
  ListChecks,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  getSections,
  createSection,
} from "../services/sectionApi";

const ExamSectionsSelector = ({
  initialSections = [],
  onBack,
  onNext,
}) => {
  const [sections, setSections] = useState([]);
  const [selectedSections, setSelectedSections] =
    useState(initialSections);

  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);

  const [sectionForm, setSectionForm] = useState({
    name: "",
    shortName: "",
    duration: 1,
    order: 1,
  });

  // START: Load Sections
  const loadSections = async () => {
    try {
      setLoading(true);

      const response = await getSections();

      const data = response?.data?.sections || [];

      setSections(data);
    } catch (error) {
      console.error("GET SECTIONS ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load sections"
      );
    } finally {
      setLoading(false);
    }
  };
  // END: Load Sections


  useEffect(() => {
    loadSections();
  }, []);


  // START: Add Section
  const openAddSection = () => {
    setSectionForm({
      name: "",
      shortName: "",
      duration: 1,
      order: sections.length + 1,
    });

    setShowAddModal(true);
  };
  // END: Add Section


  // START: Handle Section Form
  const handleSectionFormChange = (e) => {
    const { name, value } = e.target;

    setSectionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // END: Handle Section Form


  // START: Submit New Section
  const handleAddSection = async (e) => {
    e.preventDefault();

    if (!sectionForm.name.trim()) {
      toast.error("Section name is required");
      return;
    }

    if (!sectionForm.shortName.trim()) {
      toast.error("Short name is required");
      return;
    }

    if (!sectionForm.duration) {
      toast.error("Duration is required");
      return;
    }

    if (!sectionForm.order) {
      toast.error("Order is required");
      return;
    }

    try {
      setAdding(true);

      const data = {
        name: sectionForm.name.trim(),
        shortName: sectionForm.shortName.trim(),
        duration: Number(sectionForm.duration),
        order: Number(sectionForm.order),
      };

      const response = await createSection(data);

      const newSection =
        response?.data?.section;

      if (newSection) {
        setSections((prev) => [
          ...prev,
          newSection,
        ]);

        // Automatically select newly created section
        setSelectedSections((prev) => [
          ...prev,
          {
            sectionId: newSection._id,
            section: newSection,
            questionIds: [],
          },
        ]);
      }

      setShowAddModal(false);

      setSectionForm({
        name: "",
        shortName: "",
        duration: 1,
        order: sections.length + 2,
      });

      toast.success("Section added successfully");
    } catch (error) {
      console.error("CREATE SECTION ERROR:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to create section"
      );
    } finally {
      setAdding(false);
    }
  };
  // END: Submit New Section


  // START: Select Section
  const handleSelectSection = (section) => {
    const alreadySelected =
      selectedSections.some(
        (item) =>
          String(item.sectionId) ===
          String(section._id)
      );

    if (alreadySelected) {
      toast.info("Section is already selected");
      return;
    }

    setSelectedSections((prev) => [
      ...prev,
      {
        sectionId: section._id,
        section,
        questionIds: [],
      },
    ]);
  };
  // END: Select Section


  // START: Remove Section
  const handleRemoveSection = (sectionId) => {
    setSelectedSections((prev) =>
      prev.filter(
        (item) =>
          String(item.sectionId) !==
          String(sectionId)
      )
    );
  };
  // END: Remove Section


  // START: Next
  const handleNext = () => {
    if (selectedSections.length === 0) {
      toast.error(
        "Please select at least one section"
      );
      return;
    }

    onNext(selectedSections);
  };
  // END: Next


  return (
    <div className="space-y-6">

      {/* Available Sections */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Layers
                  size={20}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Select Sections
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Select existing sections for this exam
                </p>
              </div>

            </div>


            <button
              type="button"
              onClick={openAddSection}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition"
            >
              <Plus size={17} />
              Add New Section
            </button>

          </div>
        </div>


        {/* Available Section List */}
        <div className="p-6">

          {loading ? (
            <div className="py-12 text-center text-gray-500">
              Loading sections...
            </div>
          ) : sections.length === 0 ? (
            <div className="py-12 text-center">

              <Layers
                size={42}
                className="mx-auto text-gray-300 mb-3"
              />

              <p className="text-gray-600 font-medium">
                No sections available
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Create a new section to continue
              </p>

            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {sections.map((section) => {

                const isSelected =
                  selectedSections.some(
                    (item) =>
                      String(item.sectionId) ===
                      String(section._id)
                  );

                return (
                  <button
                    key={section._id}
                    type="button"
                    disabled={isSelected}
                    onClick={() =>
                      handleSelectSection(section)
                    }
                    className={`text-left border rounded-xl p-4 transition
                      ${
                        isSelected
                          ? "border-blue-300 bg-blue-50 cursor-default"
                          : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/40"
                      }`}
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {section.name}
                        </h3>

                        <p className="text-sm text-blue-600 font-medium mt-1">
                          {section.shortName}
                        </p>
                      </div>


                      {isSelected && (
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
                          <Check
                            size={16}
                            className="text-white"
                          />
                        </div>
                      )}

                    </div>


                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">

                      <span className="inline-flex items-center gap-1.5">
                        <Clock size={15} />
                        {section.duration} min
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <ListChecks size={15} />
                        Order {section.order}
                      </span>

                    </div>

                  </button>
                );
              })}

            </div>
          )}

        </div>

      </div>


      {/* Selected Sections */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

        <div className="px-6 py-5 border-b border-gray-200">

          <h2 className="text-lg font-semibold text-gray-800">
            Selected Sections
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            {selectedSections.length} section
            {selectedSections.length !== 1
              ? "s"
              : ""}{" "}
            selected
          </p>

        </div>


        <div className="p-6">

          {selectedSections.length === 0 ? (
            <div className="py-10 text-center border-2 border-dashed border-gray-200 rounded-xl">

              <Layers
                size={36}
                className="mx-auto text-gray-300 mb-3"
              />

              <p className="text-gray-600 font-medium">
                No sections selected
              </p>

              <p className="text-sm text-gray-400 mt-1">
                Select a section from above
              </p>

            </div>
          ) : (
            <div className="space-y-3">

              {selectedSections.map(
                (item, index) => {

                  const section =
                    item.section ||
                    sections.find(
                      (section) =>
                        String(section._id) ===
                        String(item.sectionId)
                    );

                  if (!section) {
                    return null;
                  }

                  return (
                    <div
                      key={item.sectionId}
                      className="flex items-center justify-between gap-4 border border-gray-200 rounded-xl p-4"
                    >

                      <div className="flex items-center gap-4">

                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-sm font-semibold text-blue-600">
                          {index + 1}
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {section.name}
                          </h3>

                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">

                            <span className="text-blue-600 font-medium">
                              {section.shortName}
                            </span>

                            <span className="inline-flex items-center gap-1">
                              <Clock size={14} />
                              {section.duration} min
                            </span>

                          </div>
                        </div>

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveSection(
                            item.sectionId
                          )
                        }
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                        title="Remove Section"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

      </div>


      {/* Navigation */}
      <div className="flex items-center justify-between">

        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-5 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition"
        >
          <ArrowLeft size={18} />
          Back
        </button>


        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition"
        >
          Next: Select Questions
          <ArrowRight size={18} />
        </button>

      </div>


      {/* Add Section Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">

              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Add New Section
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Create a section for this exam
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddModal(false)
                }
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
              >
                <X size={19} />
              </button>

            </div>


            {/* Modal Form */}
            <form
              onSubmit={handleAddSection}
              className="p-6 space-y-5"
            >

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={sectionForm.name}
                  onChange={handleSectionFormChange}
                  placeholder="e.g. Numerical Ability"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>


              {/* Short Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Name
                </label>

                <input
                  type="text"
                  name="shortName"
                  value={sectionForm.shortName}
                  onChange={handleSectionFormChange}
                  placeholder="e.g. Numerical"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>


              {/* Duration + Order */}
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (Minutes)
                  </label>

                  <input
                    type="number"
                    name="duration"
                    min="1"
                    value={sectionForm.duration}
                    onChange={handleSectionFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>

                  <input
                    type="number"
                    name="order"
                    min="1"
                    value={sectionForm.order}
                    onChange={handleSectionFormChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

              </div>


              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={adding}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-medium"
                >
                  {adding
                    ? "Adding..."
                    : "Add Section"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default ExamSectionsSelector;

