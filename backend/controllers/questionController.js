import mongoose from "mongoose";

import Question from "../models/questionModel.js";
import Section from "../models/sectionModel.js";
import Exam from "../models/examModel.js";

// =====================================================
// START: Parse Options
// =====================================================

const parseOptions = (options) => {
  if (
    options === undefined ||
    options === null ||
    options === ""
  ) {
    return [];
  }

  try {
    const parsed =
      typeof options === "string"
        ? JSON.parse(options)
        : options;

    if (!Array.isArray(parsed)) {
      throw new Error(
        "Options must be an array"
      );
    }

    return parsed;
  } catch (error) {
    throw new Error(
      "Invalid options JSON"
    );
  }
};

// =====================================================
// END: Parse Options
// =====================================================

// =====================================================
// START: Create Question
// =====================================================

export const createQuestion =
  async (
    req,
    res
  ) => {
    try {
      const {
        examId,
        sectionId,
        topic,
        question,
        type,
        options,
        correctAnswer,
        marks,
        negativeMarks,
        imageAlt,
        order,
      } = req.body;

      // -------------------------------------------------
      // Required
      // -------------------------------------------------

      if (
        !question ||
        order === undefined ||
        order === null
      ) {
        return res.status(400).json({
          message:
            "question and order are required",
        });
      }

      // -------------------------------------------------
      // Validate sectionId
      // -------------------------------------------------

      if (sectionId) {
        if (
          !mongoose.Types.ObjectId.isValid(
            sectionId
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid section ID",
          });
        }

        const section =
          await Section.findById(
            sectionId
          );

        if (!section) {
          return res.status(404).json({
            message:
              "Section not found",
          });
        }
      }

      // -------------------------------------------------
      // Validate examId if supplied
      // -------------------------------------------------

      if (examId) {
        if (
          !mongoose.Types.ObjectId.isValid(
            examId
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid exam ID",
          });
        }

        const exam =
          await Exam.findById(
            examId
          );

        if (!exam) {
          return res.status(404).json({
            message:
              "Exam not found",
          });
        }
      }

      // -------------------------------------------------
      // Parse Options
      // -------------------------------------------------

      let parsedOptions;

      try {
        parsedOptions =
          parseOptions(options);
      } catch (error) {
        return res.status(400).json({
          message:
            error.message,
        });
      }

      // -------------------------------------------------
      // Option Images
      // -------------------------------------------------

      parsedOptions =
        parsedOptions.map(
          (option, index) => {
            const uploadedImage =
              req.files?.[
                `optionImage_${index}`
              ]?.[0];

            return {
              text:
                option?.text || "",

              image:
                uploadedImage
                  ? `/api/uploads/questions/${uploadedImage.filename}`
                  : option?.image ||
                    null,
            };
          }
        );

      // -------------------------------------------------
      // Question Image
      // -------------------------------------------------

      const questionImage =
        req.files?.questionImage
          ? `/api/uploads/questions/${req.files.questionImage[0].filename}`
          : null;

      // -------------------------------------------------
      // Create Question
      // -------------------------------------------------

      const questionData = {
        topic:
          topic || "",

        question,

        type:
          type || "mcq",

        options:
          parsedOptions,

        correctAnswer:
          correctAnswer !==
          undefined
            ? correctAnswer
            : "",

        marks:
          marks !== undefined &&
          marks !== ""
            ? Number(marks)
            : 1,

        negativeMarks:
          negativeMarks !==
            undefined &&
          negativeMarks !== ""
            ? Number(
                negativeMarks
              )
            : 0,

        questionImage,

        imageAlt:
          imageAlt || "",

        order:
          Number(order),
      };

      // -------------------------------------------------
      // Reusable Question
      // -------------------------------------------------

      if (sectionId) {
        questionData.sectionId =
          sectionId;
      }

      // examId only if explicitly supplied.
      // For reusable template questions,
      // it remains null/undefined.

      if (examId) {
        questionData.examId =
          examId;
      }

      const newQuestion =
        await Question.create(
          questionData
        );

      return res.status(201).json({
        message:
          "Question created successfully",

        question:
          newQuestion,
      });
    } catch (error) {
      console.error(
        "CREATE QUESTION ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to create question",

        error:
          error.message,
      });
    }
  };

// =====================================================
// END: Create Question
// =====================================================

// =====================================================
// START: Get All Questions
// =====================================================

export const getAllQuestions =
  async (
    req,
    res
  ) => {
    try {
      const questions =
        await Question.find()
          .populate(
            "examId",
            "title"
          )
          .populate(
            "sectionId",
            "name shortName"
          )
          .sort({
            order: 1,
          });

      return res.json({
        count:
          questions.length,

        questions,
      });
    } catch (error) {
      console.error(
        "GET ALL QUESTIONS ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to get questions",

        error:
          error.message,
      });
    }
  };

// =====================================================
// END: Get All Questions
// =====================================================

// =====================================================
// START: Get Questions By Section
// =====================================================

export const getQuestionsBySection =
  async (
    req,
    res
  ) => {
    try {
      const {
        sectionId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          sectionId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid section ID",
        });
      }

      const questions =
        await Question.find({
          sectionId,
        }).sort({
          order: 1,
        });

      return res.json({
        count:
          questions.length,

        questions,
      });
    } catch (error) {
      console.error(
        "GET SECTION QUESTIONS ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to get section questions",

        error:
          error.message,
      });
    }
  };

// =====================================================
// END: Get Questions By Section
// =====================================================

// =====================================================
// START: Get Single Question
// =====================================================

export const getQuestionById =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid question ID",
        });
      }

      const question =
        await Question.findById(
          id
        );

      if (!question) {
        return res.status(404).json({
          message:
            "Question not found",
        });
      }

      return res.json(
        question
      );
    } catch (error) {
      console.error(
        "GET QUESTION ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to get question",

        error:
          error.message,
      });
    }
  };

// =====================================================
// END: Get Single Question
// =====================================================

// =====================================================
// START: Update Question
// =====================================================

export const updateQuestion =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid question ID",
        });
      }

      const question =
        await Question.findById(
          id
        );

      if (!question) {
        return res.status(404).json({
          message:
            "Question not found",
        });
      }

      const {
        examId,
        sectionId,
        topic,
        question: questionText,
        type,
        options,
        correctAnswer,
        marks,
        negativeMarks,
        imageAlt,
        order,
      } = req.body;

      // -------------------------------------------------
      // examId
      // -------------------------------------------------

      if (
        examId !== undefined
      ) {
        if (
          examId &&
          !mongoose.Types.ObjectId.isValid(
            examId
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid exam ID",
          });
        }

        if (examId) {
          const exam =
            await Exam.findById(
              examId
            );

          if (!exam) {
            return res.status(404).json({
              message:
                "Exam not found",
            });
          }

          question.examId =
            examId;
        } else {
          question.examId =
            null;
        }
      }

      // -------------------------------------------------
      // sectionId
      // -------------------------------------------------

      if (
        sectionId !== undefined
      ) {
        if (
          sectionId &&
          !mongoose.Types.ObjectId.isValid(
            sectionId
          )
        ) {
          return res.status(400).json({
            message:
              "Invalid section ID",
          });
        }

        if (sectionId) {
          const section =
            await Section.findById(
              sectionId
            );

          if (!section) {
            return res.status(404).json({
              message:
                "Section not found",
            });
          }

          question.sectionId =
            sectionId;
        } else {
          question.sectionId =
            null;
        }
      }

      // -------------------------------------------------
      // Topic
      // -------------------------------------------------

      if (
        topic !== undefined
      ) {
        question.topic =
          topic;
      }

      // -------------------------------------------------
      // Question
      // -------------------------------------------------

      if (
        questionText !==
        undefined
      ) {
        if (!questionText.trim()) {
          return res.status(400).json({
            message:
              "Question text cannot be empty",
          });
        }

        question.question =
          questionText;
      }

      // -------------------------------------------------
      // Type
      // -------------------------------------------------

      if (
        type !== undefined
      ) {
        question.type =
          type;
      }

      // -------------------------------------------------
      // Options
      // -------------------------------------------------

      if (
        options !== undefined
      ) {
        let parsedOptions;

        try {
          parsedOptions =
            parseOptions(
              options
            );
        } catch (error) {
          return res.status(400).json({
            message:
              error.message,
          });
        }

        parsedOptions =
          parsedOptions.map(
            (
              option,
              index
            ) => {
              const uploadedImage =
                req.files?.[
                  `optionImage_${index}`
                ]?.[0];

              return {
                text:
                  option?.text ||
                  "",

                image:
                  uploadedImage
                    ? `/api/uploads/questions/${uploadedImage.filename}`
                    : option?.image ||
                      null,
              };
            }
          );

        question.options =
          parsedOptions;
      }

      // -------------------------------------------------
      // Correct Answer
      // -------------------------------------------------

      if (
        correctAnswer !==
        undefined
      ) {
        question.correctAnswer =
          correctAnswer;
      }

      // -------------------------------------------------
      // Marks
      // -------------------------------------------------

      if (
        marks !== undefined &&
        marks !== ""
      ) {
        const value =
          Number(marks);

        if (
          Number.isNaN(value) ||
          value < 0
        ) {
          return res.status(400).json({
            message:
              "Invalid marks",
          });
        }

        question.marks =
          value;
      }

      // -------------------------------------------------
      // Negative Marks
      // -------------------------------------------------

      if (
        negativeMarks !==
          undefined &&
        negativeMarks !== ""
      ) {
        const value =
          Number(
            negativeMarks
          );

        if (
          Number.isNaN(value) ||
          value < 0
        ) {
          return res.status(400).json({
            message:
              "Invalid negative marks",
          });
        }

        question.negativeMarks =
          value;
      }

      // -------------------------------------------------
      // Image Alt
      // -------------------------------------------------

      if (
        imageAlt !== undefined
      ) {
        question.imageAlt =
          imageAlt;
      }

      // -------------------------------------------------
      // Order
      // -------------------------------------------------

      if (
        order !== undefined &&
        order !== ""
      ) {
        const value =
          Number(order);

        if (
          Number.isNaN(value) ||
          value < 1
        ) {
          return res.status(400).json({
            message:
              "Invalid order",
          });
        }

        question.order =
          value;
      }

      // -------------------------------------------------
      // Question Image
      // -------------------------------------------------

      if (
        req.files?.questionImage
      ) {
        question.questionImage =
          `/api/uploads/questions/${req.files.questionImage[0].filename}`;
      }

      // -------------------------------------------------
      // Save
      // -------------------------------------------------

      await question.save();

      return res.json({
        message:
          "Question updated successfully",

        question,
      });
    } catch (error) {
      console.error(
        "UPDATE QUESTION ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update question",

        error:
          error.message,
      });
    }
  };

// =====================================================
// END: Update Question
// =====================================================

// =====================================================
// START: Delete Question
// =====================================================

export const deleteQuestion =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid question ID",
        });
      }

      const question =
        await Question.findByIdAndDelete(
          id
        );

      if (!question) {
        return res.status(404).json({
          message:
            "Question not found",
        });
      }

      // -------------------------------------------------
      // Remove question from Exam.sections
      // -------------------------------------------------

      await Exam.updateMany(
        {
          "sections.questionIds":
            question._id,
        },
        {
          $pull: {
            "sections.$[].questionIds":
              question._id,
          },
        }
      );

      return res.json({
        message:
          "Question deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE QUESTION ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to delete question",

        error:
          error.message,
      });
    }
  };

// =====================================================
// END: Delete Question
// =====================================================