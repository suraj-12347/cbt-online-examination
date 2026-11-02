import mongoose from "mongoose";

import Section from "../models/sectionModel.js";
import Exam from "../models/examModel.js";
import Question from "../models/questionModel.js";

// =====================================================
// START: Create Section Template
// =====================================================

export const createSection = async (
  req,
  res
) => {
  try {
    const {
      name,
      shortName,
      totalQuestions,
      duration,
      order,
      description,
      isActive,
    } = req.body;

    if (
      !name ||
      !shortName ||
      duration === undefined ||
      order === undefined
    ) {
      return res.status(400).json({
        message:
          "name, shortName, duration and order are required",
      });
    }

    const parsedDuration =
      Number(duration);

    const parsedOrder =
      Number(order);

    if (
      Number.isNaN(parsedDuration) ||
      parsedDuration < 1
    ) {
      return res.status(400).json({
        message:
          "Invalid section duration",
      });
    }

    if (
      Number.isNaN(parsedOrder) ||
      parsedOrder < 1
    ) {
      return res.status(400).json({
        message:
          "Invalid section order",
      });
    }

    const section =
      await Section.create({
        // IMPORTANT:
        // No examId here.
        // This is a reusable template.

        examId: null,

        name:
          name.trim(),

        shortName:
          shortName.trim(),

        description:
          description?.trim() || "",

        isActive:
          isActive !== false,

        totalQuestions:
          totalQuestions !== undefined
            ? Number(totalQuestions)
            : 0,

        duration:
          parsedDuration,

        order:
          parsedOrder,
      });

    return res.status(201).json({
      message:
        "Section template created successfully",

      section,
    });
  } catch (error) {
    console.error(
      "CREATE SECTION ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create section",

      error:
        error.message,
    });
  }
};

// =====================================================
// END: Create Section Template
// =====================================================

// =====================================================
// START: Get All Sections
// =====================================================

export const getAllSections = async (
  req,
  res
) => {
  try {
    const sections =
      await Section.find()
        .sort({
          order: 1,
          name: 1,
        });

    return res.json({
      count:
        sections.length,

      sections,
    });
  } catch (error) {
    console.error(
      "GET ALL SECTIONS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to get sections",

      error:
        error.message,
    });
  }
};

// =====================================================
// END: Get All Sections
// =====================================================

// =====================================================
// START: Get Sections By Exam
// =====================================================

export const getSectionsByExam =
  async (
    req,
    res
  ) => {
    try {
      const {
        examId,
      } = req.params;

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

      // First try exam-specific sections.
      const examSections =
        await Section.find({
          examId,
        }).sort({
          order: 1,
        });

      if (
        examSections.length > 0
      ) {
        return res.json({
          count:
            examSections.length,

          sections:
            examSections,
        });
      }

      // -------------------------------------------------
      // Legacy fallback:
      // If old Exam has section references but sections
      // don't have examId yet.
      // -------------------------------------------------

      const sectionIds =
        (exam.sections || [])
          .map(
            (item) =>
              item.sectionId
          )
          .filter(Boolean);

      if (
        sectionIds.length === 0
      ) {
        return res.json({
          count: 0,
          sections: [],
        });
      }

      const sections =
        await Section.find({
          _id: {
            $in:
              sectionIds,
          },
        });

      const orderedSections =
        sectionIds
          .map((sectionId) =>
            sections.find(
              (section) =>
                String(
                  section._id
                ) ===
                String(
                  sectionId
                )
            )
          )
          .filter(Boolean);

      return res.json({
        count:
          orderedSections.length,

        sections:
          orderedSections,
      });
    } catch (error) {
      console.error(
        "GET SECTIONS BY EXAM ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to get exam sections",

        error:
          error.message,
      });
    }
  };

// =====================================================
// END: Get Sections By Exam
// =====================================================

// =====================================================
// START: Get Single Section
// =====================================================

export const getSectionById =
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
            "Invalid section ID",
        });
      }

      const section =
        await Section.findById(
          id
        );

      if (!section) {
        return res.status(404).json({
          message:
            "Section not found",
        });
      }

      return res.json({
        section,
      });
    } catch (error) {
      console.error(
        "GET SECTION ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to get section",

        error:
          error.message,
      });
    }
  };

// =====================================================
// END: Get Single Section
// =====================================================

// =====================================================
// START: Update Section
// =====================================================

export const updateSection =
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
            "Invalid section ID",
        });
      }

      const section =
        await Section.findById(
          id
        );

      if (!section) {
        return res.status(404).json({
          message:
            "Section not found",
        });
      }

      const {
        name,
        shortName,
        totalQuestions,
        duration,
        order,
        description,
        isActive,
      } = req.body;

      if (name !== undefined) {
        if (!name.trim()) {
          return res.status(400).json({
            message:
              "Section name cannot be empty",
          });
        }

        section.name =
          name.trim();
      }

      if (
        shortName !== undefined
      ) {
        if (!shortName.trim()) {
          return res.status(400).json({
            message:
              "Section short name cannot be empty",
          });
        }

        section.shortName =
          shortName.trim();
      }

      if (
        description !== undefined
      ) {
        section.description =
          description;
      }

      if (
        isActive !== undefined
      ) {
        section.isActive =
          isActive === true ||
          isActive === "true";
      }

      if (
        totalQuestions !==
        undefined
      ) {
        const value =
          Number(
            totalQuestions
          );

        if (
          Number.isNaN(value) ||
          value < 0
        ) {
          return res.status(400).json({
            message:
              "Invalid total questions",
          });
        }

        section.totalQuestions =
          value;
      }

      if (
        duration !== undefined
      ) {
        const value =
          Number(
            duration
          );

        if (
          Number.isNaN(value) ||
          value < 1
        ) {
          return res.status(400).json({
            message:
              "Invalid duration",
          });
        }

        section.duration =
          value;
      }

      if (
        order !== undefined
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

        section.order =
          value;
      }

      await section.save();

      return res.json({
        message:
          "Section updated successfully",

        section,
      });
    } catch (error) {
      console.error(
        "UPDATE SECTION ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to update section",

        error:
          error.message,
      });
    }
  };

// =====================================================
// END: Update Section
// =====================================================

// =====================================================
// START: Delete Section
// =====================================================

export const deleteSection =
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
            "Invalid section ID",
        });
      }

      const section =
        await Section.findById(
          id
        );

      if (!section) {
        return res.status(404).json({
          message:
            "Section not found",
        });
      }

      // -------------------------------------------------
      // Remove section from any Exam references
      // -------------------------------------------------

      await Exam.updateMany(
        {
          "sections.sectionId":
            section._id,
        },
        {
          $pull: {
            sections: {
              sectionId:
                section._id,
            },
          },
        }
      );

      // -------------------------------------------------
      // Delete Questions belonging to section
      // -------------------------------------------------

      await Question.deleteMany({
        sectionId:
          section._id,
      });

      // -------------------------------------------------
      // Delete Section
      // -------------------------------------------------

      await Section.findByIdAndDelete(
        section._id
      );

      return res.json({
        message:
          "Section deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE SECTION ERROR:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to delete section",

        error:
          error.message,
      });
    }
  };

// =====================================================
// END: Delete Section
// =====================================================