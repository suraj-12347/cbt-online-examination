
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, FileText, Layers, HelpCircle } from "lucide-react";
import { toast } from "react-toastify";

import { createExam } from "../services/examApi";

import ExamDetailsForm from "../components/ExamDetails";
import ExamSectionsSelector from "../components/ExamSectionSelector";
import ExamQuestionSelector from "../components/ExamQuestionSelector";

const CreateExam = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  const [examData, setExamData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    duration: "",
    totalMarks: "",
    negativeMarking: true,
    status: "draft",
  });

  const [selectedSections, setSelectedSections] =
    useState([]);

  const [submitting, setSubmitting] = useState(false);


  // START: Step 1
  const handleExamDetailsNext = (data) => {
    setExamData(data);
    setCurrentStep(2);
  };
  // END: Step 1


  // START: Step 2
  const handleSectionsNext = (sections) => {
    setSelectedSections(sections);
    setCurrentStep(3);
  };
  // END: Step 2


  // START: Back To Details
  const handleBackToDetails = () => {
    setCurrentStep(1);
  };
  // END: Back To Details


  // START: Back To Sections
  const handleBackToSections = () => {
    setCurrentStep(2);
  };
  // END: Back To Sections


  // START: Create Exam
  const handleCreateExam = async (examSections) => {
    try {
      setSubmitting(true);

      const data = {
        title: examData.title,
        description: examData.description,

        startDate: examData.startDate || null,
        endDate: examData.endDate || null,

        duration: Number(examData.duration),

        totalMarks: examData.totalMarks
          ? Number(examData.totalMarks)
          : 0,

        negativeMarking:
          Boolean(examData.negativeMarking),

        status: examData.status || "draft",

        sections: examSections.map(
          (section) => ({
            sectionId: section.sectionId,
            questionIds:
              section.questionIds || [],
          })
        ),
      };

      console.log(
        "CREATE EXAM DATA:",
        data
      );

      await createExam(data);

      toast.success(
        "Exam created successfully!"
      );

      setTimeout(() => {
        navigate("/exams");
      }, 800);
    } catch (error) {
      console.error(
        "CREATE EXAM ERROR:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Failed to create exam"
      );
    } finally {
      setSubmitting(false);
    }
  };
  // END: Create Exam


  const steps = [
    {
      id: 1,
      title: "Exam Details",
      icon: FileText,
    },
    {
      id: 2,
      title: "Sections",
      icon: Layers,
    },
    {
      id: 3,
      title: "Questions",
      icon: HelpCircle,
    },
  ];


  return (
    <div className="min-h-full bg-gray-50 p-4 md:p-6">

      {/* Page Header */}
      <div className="mb-6">

        <h1 className="text-2xl font-bold text-gray-800">
          Create Exam
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Create an exam by selecting sections
          and questions
        </p>

      </div>


      {/* Stepper */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-6">

        <div className="flex items-center justify-center max-w-3xl mx-auto">

          {steps.map((step, index) => {

            const Icon = step.icon;

            const completed =
              currentStep > step.id;

            const active =
              currentStep === step.id;

            return (
              <div
                key={step.id}
                className="flex items-center flex-1 last:flex-none"
              >

                {/* Step */}
                <div className="flex items-center gap-3">

                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition
                      ${
                        completed
                          ? "bg-green-600 text-white"
                          : active
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                  >
                    {completed ? (
                      <Check size={19} />
                    ) : (
                      <Icon size={18} />
                    )}
                  </div>


                  <div className="hidden sm:block">

                    <p
                      className={`text-xs ${
                        active
                          ? "text-blue-600"
                          : completed
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      Step {step.id}
                    </p>

                    <p
                      className={`text-sm font-medium ${
                        active ||
                        completed
                          ? "text-gray-800"
                          : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </p>

                  </div>

                </div>


                {/* Connector */}
                {index <
                  steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-4 transition
                      ${
                        currentStep >
                        step.id
                          ? "bg-green-500"
                          : "bg-gray-200"
                      }`}
                  />
                )}

              </div>
            );
          })}

        </div>

      </div>


      {/* Step 1 */}
      {currentStep === 1 && (
        <ExamDetailsForm
          initialData={examData}
          onNext={handleExamDetailsNext}
        />
      )}


      {/* Step 2 */}
      {currentStep === 2 && (
        <ExamSectionsSelector
          initialSections={
            selectedSections
          }
          onBack={
            handleBackToDetails
          }
          onNext={
            handleSectionsNext
          }
        />
      )}


      {/* Step 3 */}
      {currentStep === 3 && (
        <ExamQuestionSelector
          selectedSections={
            selectedSections
          }
          onBack={
            handleBackToSections
          }
          onSubmit={
            handleCreateExam
          }
          submitting={submitting}
        />
      )}

    </div>
  );
};

export default CreateExam;

