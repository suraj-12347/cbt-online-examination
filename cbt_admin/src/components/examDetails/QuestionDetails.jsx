
import { useState } from "react";
import {
  Edit,
  Save,
  X,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  updateQuestion,
  deleteQuestion,
} from "../../services/questionApi";

export default function QuestionDetails({
  question,
  questionNumber,
  onUpdated,
}) {
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    question: question.question || "",
    type: question.type || "mcq",

    options:
      question.options?.length === 4
        ? question.options.map((option) => ({
            text: option.text || "",
            image: option.image || null,
          }))
        : [
            { text: "", image: null },
            { text: "", image: null },
            { text: "", image: null },
            { text: "", image: null },
          ],

    correctAnswer: question.correctAnswer ?? "",
    marks: question.marks ?? 1,
    negativeMarks: question.negativeMarks ?? 0,
    imageAlt: question.imageAlt || "",
    questionImage: question.questionImage || null,
  });


  // START: Handle Change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  // END: Handle Change


  // START: Option Change
  const handleOptionChange = (index, value) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map(
        (option, optionIndex) =>
          optionIndex === index
            ? {
                ...option,
                text: value,
              }
            : option
      ),
    }));
  };
  // END: Option Change


  // START: Option Image
  const handleOptionImage = (index, file) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map(
        (option, optionIndex) =>
          optionIndex === index
            ? {
                ...option,
                image: file,
              }
            : option
      ),
    }));
  };
  // END: Option Image


  // START: Question Image
  const handleQuestionImage = (file) => {
    setForm((prev) => ({
      ...prev,
      questionImage: file,
    }));
  };
  // END: Question Image


  // START: Save Question
  const handleSave = async () => {
    try {
      if (!form.question.trim()) {
        toast.error("Question is required");
        return;
      }

      const formData = new FormData();

      formData.append(
        "question",
        form.question
      );

      formData.append(
        "type",
        form.type
      );

      formData.append(
        "correctAnswer",
        form.correctAnswer
      );

      formData.append(
        "marks",
        Number(form.marks)
      );

      formData.append(
        "negativeMarks",
        Number(form.negativeMarks)
      );

      formData.append(
        "imageAlt",
        form.imageAlt
      );

      formData.append(
        "order",
        Number(question.order)
      );


      formData.append(
        "options",
        JSON.stringify(
          form.options.map((option) => ({
            text: option.text,
            image:
              typeof option.image === "string"
                ? option.image
                : null,
          }))
        )
      );


      // Question Image
      if (
        form.questionImage &&
        typeof form.questionImage !== "string"
      ) {
        formData.append(
          "questionImage",
          form.questionImage
        );
      }


      // Option Images
      form.options.forEach(
        (option, index) => {
          if (
            option.image &&
            typeof option.image !== "string"
          ) {
            formData.append(
              `optionImage_${index}`,
              option.image
            );
          }
        }
      );


      await updateQuestion(
        question._id,
        formData
      );

      setEditing(false);

      toast.success(
        "Question updated successfully"
      );

      if (onUpdated) {
        onUpdated();
      }

    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update question"
      );
    }
  };
  // END: Save Question


  // START: Delete Question
  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete Question ${questionNumber}?`
    );

    if (!confirmed) return;

    try {
      await deleteQuestion(question._id);

      toast.success(
        "Question deleted successfully"
      );

      if (onUpdated) {
        onUpdated();
      }

    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete question"
      );
    }
  };
  // END: Delete Question


  return (
    <div className="border rounded-xl overflow-hidden">

      {/* START: Header */}
      <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">

        <div>
          <span className="font-semibold text-gray-800">
            Question {questionNumber}
          </span>

          <span className="ml-3 text-xs text-gray-500">
            {question.type}
          </span>
        </div>


        <div className="flex items-center gap-2">

          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              <Edit size={15} />
              Edit
            </button>
          )}

          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
          >
            <Trash2 size={15} />
            Delete
          </button>

        </div>

      </div>
      {/* END: Header */}


      {/* START: View Mode */}
      {!editing ? (

        <div className="p-5">

          <p className="text-gray-800 leading-6">
            {question.question}
          </p>


          {/* Question Image */}
          {question.questionImage && (
            <img
              src={`http://localhost:4000${question.questionImage}`}
              alt={
                question.imageAlt ||
                "Question"
              }
              className="mt-4 max-w-[400px] max-h-[220px] object-contain rounded-lg border"
            />
          )}


          {/* MCQ Options */}
          {question.type === "mcq" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">

              {question.options?.map(
                (option, index) => {
                  const letter =
                    String.fromCharCode(
                      65 + index
                    );

                  const correct =
                    String(
                      question.correctAnswer
                    ) === String(index);

                  return (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg ${
                        correct
                          ? "border-green-400 bg-green-50"
                          : "border-gray-200"
                      }`}
                    >

                      <div className="flex gap-2">

                        <span className="font-semibold">
                          {letter}.
                        </span>

                        <span>
                          {option.text}
                        </span>

                      </div>


                      {option.image && (
                        <img
                          src={`http://localhost:4000${option.image}`}
                          alt={`Option ${letter}`}
                          className="mt-2 max-w-[180px] max-h-[120px] object-contain rounded border"
                        />
                      )}

                    </div>
                  );
                }
              )}

            </div>
          )}


          {/* Marks */}
          <div className="flex gap-5 mt-5 text-sm">

            <span className="text-green-600">
              +{question.marks} Marks
            </span>

            <span className="text-red-500">
              -{question.negativeMarks} Negative
            </span>

          </div>

        </div>

      ) : (
        /* END: View Mode */


        /* START: Edit Mode */
        <div className="p-5 space-y-5">

          {/* Question */}
          <div>

            <label className="block text-sm font-medium mb-1">
              Question
            </label>

            <textarea
              name="question"
              value={form.question}
              onChange={handleChange}
              rows="3"
              className="w-full border rounded-lg p-3 outline-none focus:border-blue-500"
            />

          </div>


          {/* Question Image */}
          <div>

            <label className="block text-sm font-medium mb-2">
              Question Image
            </label>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) =>
                handleQuestionImage(
                  e.target.files?.[0] || null
                )
              }
            />

            {form.questionImage && (
              <img
                src={
                  typeof form.questionImage ===
                  "string"
                    ? `http://localhost:4000${form.questionImage}`
                    : URL.createObjectURL(
                        form.questionImage
                      )
                }
                alt="Question"
                className="mt-3 max-w-[350px] max-h-[200px] object-contain border rounded-lg"
              />
            )}

          </div>


          {/* Options */}
          {form.type === "mcq" && (
            <div>

              <h4 className="font-semibold mb-3">
                Options
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {form.options.map(
                  (option, index) => {

                    const letter =
                      String.fromCharCode(
                        65 + index
                      );

                    return (
                      <div
                        key={index}
                        className="border rounded-lg p-4"
                      >

                        <label className="block text-sm font-medium mb-2">
                          Option {letter}
                        </label>

                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) =>
                            handleOptionChange(
                              index,
                              e.target.value
                            )
                          }
                          className="w-full border rounded-lg p-2 mb-3"
                          placeholder={`Option ${letter}`}
                        />


                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={(e) =>
                            handleOptionImage(
                              index,
                              e.target.files?.[0] ||
                                null
                            )
                          }
                        />


                        {option.image && (
                          <img
                            src={
                              typeof option.image ===
                              "string"
                                ? `http://localhost:4000${option.image}`
                                : URL.createObjectURL(
                                    option.image
                                  )
                            }
                            alt={`Option ${letter}`}
                            className="mt-3 max-w-[180px] max-h-[120px] object-contain border rounded"
                          />
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            </div>
          )}


          {/* Marks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {form.type === "mcq" && (
              <div>

                <label className="block text-sm font-medium mb-1">
                  Correct Answer
                </label>

                <select
                  name="correctAnswer"
                  value={form.correctAnswer}
                  onChange={handleChange}
                  className="w-full border rounded-lg p-2"
                >

                  <option value="">
                    Select Answer
                  </option>

                  <option value="0">A</option>
                  <option value="1">B</option>
                  <option value="2">C</option>
                  <option value="3">D</option>

                </select>

              </div>
            )}


            <div>

              <label className="block text-sm font-medium mb-1">
                Marks
              </label>

              <input
                type="number"
                step="0.25"
                name="marks"
                value={form.marks}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />

            </div>


            <div>

              <label className="block text-sm font-medium mb-1">
                Negative Marks
              </label>

              <input
                type="number"
                step="0.25"
                name="negativeMarks"
                value={form.negativeMarks}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              />

            </div>

          </div>


          {/* Buttons */}
          <div className="flex gap-2 pt-2">

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Save size={16} />
              Save Question
            </button>

            <button
              onClick={() => setEditing(false)}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <X size={16} />
              Cancel
            </button>

          </div>

        </div>
      )}
      {/* END: Edit Mode */}

    </div>
  );
}
