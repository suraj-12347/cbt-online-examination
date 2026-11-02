
import mongoose from "mongoose";

import Exam from "../models/examModel.js";
import Section from "../models/sectionModel.js";
import Question from "../models/questionModel.js";

// =====================================================
// START: Parse Sections Helper
// =====================================================

const parseSections = (sections) => {
  if (
    sections === undefined ||
    sections === null ||
    sections === ""
  ) {
    return [];
  }

  if (typeof sections === "string") {
    try {
      return JSON.parse(sections);
    } catch (error) {
      throw new Error("Invalid sections format");
    }
  }

  return sections;
};

// =====================================================
// END: Parse Sections Helper
// =====================================================

// =====================================================
// START: ObjectId Helper
// =====================================================

const getId = (value) => {
  if (!value) return null;

  if (typeof value === "object" && value._id) {
    return value._id;
  }

  return value;
};

// =====================================================
// END: ObjectId Helper
// =====================================================

// =====================================================
// START: Format Sections
// IMPORTANT:
// Section duration will ALWAYS come from database.
// Frontend duration will not override actual Section duration.
// =====================================================

const formatSections = async (sections) => {
  if (!Array.isArray(sections)) {
    throw new Error("Sections must be an array");
  }

  // -------------------------------------------------
  // Duplicate Section Check
  // -------------------------------------------------

  const sectionIdList = sections
    .map((section) => getId(section.sectionId))
    .filter(Boolean)
    .map((id) => String(id));

  const uniqueSectionIds = new Set(sectionIdList);

  if (uniqueSectionIds.size !== sectionIdList.length) {
    throw new Error(
      "Duplicate section selected. Please select each section only once."
    );
  }

  // -------------------------------------------------
  // Format Sections
  // -------------------------------------------------

  const formattedSections = [];

  for (let index = 0; index < sections.length; index++) {
    const section = sections[index];

    const sectionId = getId(section.sectionId);

    if (!sectionId) {
      throw new Error(
        `Section ${index + 1} must have a sectionId`
      );
    }

    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
      throw new Error(
        `Invalid sectionId for section ${index + 1}`
      );
    }

    // -------------------------------------------------
    // Get Actual Section From Database
    // -------------------------------------------------

    const sourceSection = await Section.findById(sectionId)
      .select("duration")
      .lean();

    if (!sourceSection) {
      throw new Error(
        `Section not found: ${sectionId}`
      );
    }

    // -------------------------------------------------
    // Question IDs
    // -------------------------------------------------

    let questionIds = section.questionIds;

    if (
      questionIds !== undefined &&
      questionIds !== null &&
      !Array.isArray(questionIds)
    ) {
      throw new Error(
        `questionIds must be an array for section ${
          index + 1
        }`
      );
    }

    questionIds = Array.isArray(questionIds)
      ? questionIds
          .map((item) => getId(item))
          .filter(Boolean)
      : [];

    // -------------------------------------------------
    // Validate Question IDs
    // -------------------------------------------------

    const validQuestionIds = [];

    for (const questionId of questionIds) {
      if (!mongoose.Types.ObjectId.isValid(questionId)) {
        throw new Error(
          `Invalid questionId in section ${index + 1}`
        );
      }

      validQuestionIds.push(String(questionId));
    }

    // -------------------------------------------------
    // Duplicate Question Check Inside Same Section
    // -------------------------------------------------

    const uniqueQuestionIds = new Set(
      validQuestionIds
    );

    if (
      uniqueQuestionIds.size !==
      validQuestionIds.length
    ) {
      throw new Error(
        `Duplicate question selected in section ${
          index + 1
        }`
      );
    }

    // -------------------------------------------------
    // IMPORTANT:
    // Duration comes from Section database.
    //
    // Example:
    // Section DB duration = 140
    // Exam duration = 140
    //
    // Frontend section.duration is ignored.
    // -------------------------------------------------

    const duration = Number(
      sourceSection.duration
    );

    if (
      Number.isNaN(duration) ||
      duration < 1
    ) {
      throw new Error(
        `Invalid duration for section ${index + 1}`
      );
    }

    // -------------------------------------------------
    // Order
    // -------------------------------------------------

    let order = section.order;

    if (
      order === undefined ||
      order === null ||
      order === ""
    ) {
      order = index + 1;
    }

    order = Number(order);

    if (
      Number.isNaN(order) ||
      order < 1
    ) {
      throw new Error(
        `Invalid order for section ${index + 1}`
      );
    }

    formattedSections.push({
      sectionId,
      questionIds,
      duration,
      order,
    });
  }

  // -------------------------------------------------
  // Duplicate Question Check Across Sections
  // -------------------------------------------------

  const allQuestionIds = formattedSections.flatMap(
    (section) =>
      section.questionIds.map((id) => String(id))
  );

  const uniqueAllQuestionIds = new Set(
    allQuestionIds
  );

  if (
    uniqueAllQuestionIds.size !==
    allQuestionIds.length
  ) {
    throw new Error(
      "Duplicate question selected. A question cannot be selected more than once in the exam."
    );
  }

  return formattedSections;
};

// =====================================================
// END: Format Sections
// =====================================================

// =====================================================
// START: Clone Section For Exam
// =====================================================

const cloneSectionForExam = async ({
  sourceSectionId,
  requestedQuestionIds = [],
  examId,
  order,
  duration,
}) => {
  const sourceSection =
    await Section.findById(sourceSectionId).lean();

  if (!sourceSection) {
    throw new Error(
      `Section not found: ${sourceSectionId}`
    );
  }

  // -------------------------------------------------
  // Determine Questions
  // -------------------------------------------------

  let sourceQuestions = [];

  if (requestedQuestionIds.length > 0) {
    const validQuestionIds =
      requestedQuestionIds.filter((id) =>
        mongoose.Types.ObjectId.isValid(id)
      );

    sourceQuestions =
      await Question.find({
        _id: {
          $in: validQuestionIds,
        },
      })
        .sort({ order: 1 })
        .lean();
  } else {
    // If no questionIds were supplied,
    // copy all questions belonging to template section.
    sourceQuestions =
      await Question.find({
        sectionId: sourceSectionId,
      })
        .sort({ order: 1 })
        .lean();
  }

  // -------------------------------------------------
  // IMPORTANT:
  // Always use actual Section DB duration.
  // This prevents 140 becoming 1.
  // -------------------------------------------------

  const actualDuration = Number(
    sourceSection.duration
  );

  if (
    Number.isNaN(actualDuration) ||
    actualDuration < 1
  ) {
    throw new Error(
      `Invalid duration for section: ${sourceSectionId}`
    );
  }

  // -------------------------------------------------
  // Create New Section
  // -------------------------------------------------

  const newSection =
    await Section.create({
      name: sourceSection.name,

      shortName:
        sourceSection.shortName,

      description:
        sourceSection.description || "",

      isActive:
        sourceSection.isActive !== false,

      totalQuestions:
        sourceQuestions.length,

      // IMPORTANT:
      // Duration comes from source Section.
      duration: actualDuration,

      order:
        order !== undefined
          ? Number(order)
          : Number(sourceSection.order || 1),

      // IMPORTANT:
      // New section belongs to new exam.
      examId,
    });

  // -------------------------------------------------
  // Clone Questions
  // -------------------------------------------------

  const newQuestionIds = [];

  for (const sourceQuestion of sourceQuestions) {
    const newQuestion =
      await Question.create({
        examId,

        sectionId:
          newSection._id,

        topic:
          sourceQuestion.topic || "",

        question:
          sourceQuestion.question || "",

        type:
          sourceQuestion.type || "mcq",

        options:
          Array.isArray(
            sourceQuestion.options
          )
            ? sourceQuestion.options.map(
                (option) => ({
                  text:
                    option.text || "",

                  image:
                    option.image || null,
                })
              )
            : [],

        correctAnswer:
          sourceQuestion.correctAnswer ?? "",

        marks:
          Number(
            sourceQuestion.marks || 0
          ),

        negativeMarks:
          Number(
            sourceQuestion.negativeMarks || 0
          ),

        questionImage:
          sourceQuestion.questionImage || null,

        imageAlt:
          sourceQuestion.imageAlt || "",

        order:
          Number(
            sourceQuestion.order || 1
          ),
      });

    newQuestionIds.push(
      newQuestion._id
    );
  }

  // -------------------------------------------------
  // Return Exam Section Object
  // -------------------------------------------------

  return {
    sectionId:
      newSection._id,

    questionIds:
      newQuestionIds,

    // IMPORTANT:
    // This will be 140 if source Section has 140.
    duration:
      newSection.duration,

    order:
      newSection.order,
  };
};

// =====================================================
// END: Clone Section For Exam
// =====================================================

// =====================================================
// START: Create Exam
// =====================================================

export const createExam = async (
  req,
  res
) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      duration,
      totalMarks,
      negativeMarking,
      status,
      sections,
    } = req.body;

    // -------------------------------------------------
    // Basic Validation
    // -------------------------------------------------

    if (
      !title ||
      !title.trim()
    ) {
      return res.status(400).json({
        message:
          "Title is required",
      });
    }

    if (
      duration === undefined ||
      duration === null ||
      duration === ""
    ) {
      return res.status(400).json({
        message:
          "Exam duration is required",
      });
    }

    const parsedDuration =
      Number(duration);

    if (
      Number.isNaN(
        parsedDuration
      ) ||
      parsedDuration < 1
    ) {
      return res.status(400).json({
        message:
          "Invalid exam duration",
      });
    }

    // -------------------------------------------------
    // Parse Sections
    // -------------------------------------------------

    let parsedSections;

    try {
      parsedSections =
        parseSections(sections);
    } catch (error) {
      return res.status(400).json({
        message:
          error.message,
      });
    }

    // -------------------------------------------------
    // Format Sections
    // IMPORTANT:
    // formatSections is now async.
    // -------------------------------------------------

    let formattedSections;

    try {
      formattedSections =
        await formatSections(
          parsedSections
        );
    } catch (error) {
      return res.status(400).json({
        message:
          error.message,
      });
    }

    // -------------------------------------------------
    // Create Exam First
    // -------------------------------------------------

    const exam =
      await Exam.create({
        title:
          title.trim(),

        description:
          description?.trim() || "",

        startDate:
          startDate
            ? new Date(startDate)
            : null,

        endDate:
          endDate
            ? new Date(endDate)
            : null,

        duration:
          parsedDuration,

        totalMarks:
          totalMarks !== undefined &&
          totalMarks !== ""
            ? Number(totalMarks)
            : 0,

        negativeMarking:
          negativeMarking !== undefined
            ? negativeMarking === true ||
              negativeMarking === "true"
            : true,

        status:
          status || "draft",

        sections: [],
      });

    // -------------------------------------------------
    // Clone Sections + Questions
    // -------------------------------------------------

    const newExamSections = [];

    try {
      for (
        const section
        of formattedSections
      ) {
        const clonedSection =
          await cloneSectionForExam({
            sourceSectionId:
              section.sectionId,

            requestedQuestionIds:
              section.questionIds,

            examId:
              exam._id,

            order:
              section.order,

            // This is passed only for compatibility.
            // cloneSectionForExam itself uses
            // sourceSection.duration.
            duration:
              section.duration,
          });

        newExamSections.push(
          clonedSection
        );
      }
    } catch (
      cloneError
    ) {
      // Cleanup exam if cloning fails

      await Exam.findByIdAndDelete(
        exam._id
      );

      // Cleanup cloned sections

      const clonedSectionIds =
        newExamSections.map(
          (item) =>
            item.sectionId
        );

      if (
        clonedSectionIds.length > 0
      ) {
        await Question.deleteMany({
          sectionId: {
            $in:
              clonedSectionIds,
          },
        });

        await Section.deleteMany({
          _id: {
            $in:
              clonedSectionIds,
          },
        });
      }

      throw cloneError;
    }

    // -------------------------------------------------
    // Attach Cloned Sections To Exam
    // -------------------------------------------------

    exam.sections =
      newExamSections;

    await exam.save();

    // -------------------------------------------------
    // Populate
    // -------------------------------------------------

    const populatedExam =
      await Exam.findById(
        exam._id
      )
        .populate(
          "sections.sectionId"
        )
        .populate(
          "sections.questionIds"
        );

    return res.status(201).json({
      message:
        "Exam created successfully",

      exam:
        populatedExam,
    });
  } catch (error) {
    console.error(
      "CREATE EXAM ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create exam",

      error:
        error.message,
    });
  }
};

// =====================================================
// END: Create Exam
// =====================================================

// =====================================================
// START: Get All Exams
// =====================================================

export const getAllExams = async (
  req,
  res
) => {
  try {
    const exams =
      await Exam.find()
        .populate(
          "sections.sectionId"
        )
        .populate(
          "sections.questionIds"
        )
        .sort({
          createdAt: -1,
        });

    return res.json({
      count:
        exams.length,

      exams,
    });
  } catch (error) {
    console.error(
      "GET ALL EXAMS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to get exams",

      error:
        error.message,
    });
  }
};

// =====================================================
// END: Get All Exams
// =====================================================

// =====================================================
// START: Get Single Exam
// =====================================================

export const getExamById = async (
  req,
  res
) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message:
          "Invalid exam ID",
      });
    }

    const exam =
      await Exam.findById(
        req.params.id
      )
        .populate(
          "sections.sectionId"
        )
        .populate(
          "sections.questionIds"
        );

    if (!exam) {
      return res.status(404).json({
        message:
          "Exam not found",
      });
    }

    return res.json(
      exam
    );
  } catch (error) {
    console.error(
      "GET EXAM ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to get exam",

      error:
        error.message,
    });
  }
};

// =====================================================
// END: Get Single Exam
// =====================================================

// =====================================================
// START: Update Exam
// =====================================================

export const updateExam = async (
  req,
  res
) => {
  try {
    const exam =
      await Exam.findById(
        req.params.id
      );

    if (!exam) {
      return res.status(404).json({
        message:
          "Exam not found",
      });
    }

    const {
      title,
      description,
      startDate,
      endDate,
      duration,
      totalMarks,
      negativeMarking,
      status,
      sections,
    } = req.body;

    // -------------------------------------------------
    // Basic Fields
    // -------------------------------------------------

    if (
      title !== undefined
    ) {
      if (
        !title.trim()
      ) {
        return res.status(400).json({
          message:
            "Title cannot be empty",
        });
      }

      exam.title =
        title.trim();
    }

    if (
      description !== undefined
    ) {
      exam.description =
        description;
    }

    if (
      startDate !== undefined
    ) {
      exam.startDate =
        startDate
          ? new Date(startDate)
          : null;
    }

    if (
      endDate !== undefined
    ) {
      exam.endDate =
        endDate
          ? new Date(endDate)
          : null;
    }

    if (
      duration !== undefined
    ) {
      const parsedDuration =
        Number(duration);

      if (
        Number.isNaN(
          parsedDuration
        ) ||
        parsedDuration < 1
      ) {
        return res.status(400).json({
          message:
            "Invalid exam duration",
        });
      }

      exam.duration =
        parsedDuration;
    }

    if (
      totalMarks !== undefined
    ) {
      const parsedMarks =
        Number(totalMarks);

      if (
        Number.isNaN(
          parsedMarks
        ) ||
        parsedMarks < 0
      ) {
        return res.status(400).json({
          message:
            "Invalid total marks",
        });
      }

      exam.totalMarks =
        parsedMarks;
    }

    if (
      negativeMarking !==
      undefined
    ) {
      exam.negativeMarking =
        negativeMarking ===
          true ||
        negativeMarking ===
          "true";
    }

    if (
      status !== undefined
    ) {
      const allowedStatuses =
        [
          "draft",
          "active",
          "completed",
        ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid status. Use draft, active or completed",
        });
      }

      exam.status =
        status;
    }

    // -------------------------------------------------
    // Sections
    // -------------------------------------------------
    // Existing sections belonging to this exam
    // are kept.
    //
    // Reusable sections from another exam/template
    // are cloned instead of being reassigned.
    // -------------------------------------------------

    if (
      sections !== undefined
    ) {
      let parsedSections;

      try {
        parsedSections =
          parseSections(
            sections
          );
      } catch (error) {
        return res.status(400).json({
          message:
            error.message,
        });
      }

      let formattedSections;

      try {
        // IMPORTANT:
        // formatSections is async.
        formattedSections =
          await formatSections(
            parsedSections
          );
      } catch (error) {
        return res.status(400).json({
          message:
            error.message,
        });
      }

      const updatedSections =
        [];

      for (
        const section
        of formattedSections
      ) {
        const sourceSection =
          await Section.findById(
            section.sectionId
          );

        if (
          !sourceSection
        ) {
          return res.status(404).json({
            message:
              `Section not found: ${section.sectionId}`,
          });
        }

        // -------------------------------------------------
        // Existing section already belongs to this exam
        // -------------------------------------------------

        if (
          sourceSection.examId &&
          String(
            sourceSection.examId
          ) ===
            String(
              exam._id
            )
        ) {
          updatedSections.push({
            sectionId:
              sourceSection._id,

            questionIds:
              section
                .questionIds
                .length > 0
                ? section.questionIds
                : (
                    await Question.find({
                      sectionId:
                        sourceSection._id,
                    }).select(
                      "_id"
                    )
                  ).map(
                    (q) =>
                      q._id
                  ),

            // IMPORTANT:
            // Always use database Section duration.
            duration:
              Number(
                sourceSection.duration
              ),

            order:
              section.order,
          });

          continue;
        }

        // -------------------------------------------------
        // Reusable/template/other-exam section
        // Clone it.
        // -------------------------------------------------

        const clonedSection =
          await cloneSectionForExam({
            sourceSectionId:
              sourceSection._id,

            requestedQuestionIds:
              section.questionIds,

            examId:
              exam._id,

            order:
              section.order,

            duration:
              section.duration,
          });

        updatedSections.push(
          clonedSection
        );
      }

      exam.sections =
        updatedSections;
    }

    // -------------------------------------------------
    // Save
    // -------------------------------------------------

    await exam.save();

    // -------------------------------------------------
    // Populate
    // -------------------------------------------------

    const populatedExam =
      await Exam.findById(
        exam._id
      )
        .populate(
          "sections.sectionId"
        )
        .populate(
          "sections.questionIds"
        );

    return res.json({
      message:
        "Exam updated successfully",

      exam:
        populatedExam,
    });
  } catch (error) {
    console.error(
      "UPDATE EXAM ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to update exam",

      error:
        error.message,
    });
  }
};

// =====================================================
// END: Update Exam
// =====================================================

// =====================================================
// START: Delete Exam
// =====================================================

export const deleteExam = async (
  req,
  res
) => {
  try {
    const exam =
      await Exam.findById(
        req.params.id
      );

    if (!exam) {
      return res.status(404).json({
        message:
          "Exam not found",
      });
    }

    // -------------------------------------------------
    // Delete Questions belonging to this exam
    // -------------------------------------------------

    await Question.deleteMany({
      examId:
        exam._id,
    });

    // -------------------------------------------------
    // Delete Sections belonging to this exam
    // -------------------------------------------------

    await Section.deleteMany({
      examId:
        exam._id,
    });

    // -------------------------------------------------
    // Delete Exam
    // -------------------------------------------------

    await Exam.findByIdAndDelete(
      exam._id
    );

    return res.json({
      message:
        "Exam deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE EXAM ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to delete exam",

      error:
        error.message,
    });
  }
};

// =====================================================
// END: Delete Exam
// =====================================================
