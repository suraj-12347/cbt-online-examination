export const examData = {
  examId: 1,

  title: "Campus Recruitment - Online Assessment",

  sections: [
    {
      id: 1,
      name: "Numerical Ability",
      shortName: "Numerical",
      totalQuestions: 10,
      duration: 1,
    },
    {
      id: 2,
      name: "Verbal Ability",
      shortName: "Verbal",
      totalQuestions: 10,
      duration: 1,
    },
    {
      id: 3,
      name: "Reasoning Ability",
      shortName: "Reasoning",
      totalQuestions: 10,
      duration: 1,
    },
    {
      id: 4,
      name: "Programming Logic",
      shortName: "Programming",
      totalQuestions: 10,
      duration: 1,
    },
    {
      id: 5,
      name: "Advanced Coding",
      shortName: "Coding",
      totalQuestions: 2,
      duration: 1,
    },
  ],

  questions: [

    // =====================================================
    // NUMERICAL ABILITY
    // =====================================================

    {
      id: 1,
      sectionId: 1,
      question:
        "Study the following graph and answer the question. What was the value shown in the graph for the year 2022?",

      questionImage: "/images/questions/q1.png",
      imageAlt: "Numerical graph",

      options: [
        "20",
        "30",
        "40",
        "50",
      ],

      correctAnswer: 2,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 2,
      sectionId: 1,
      question:
        "Observe the following figure and identify the correct value.",

      questionImage: "/images/questions/q2.png",
      imageAlt: "Mathematical diagram",

      options: [
        {
          text: "",
          image: "/images/questions/option-a.png",
        },
        {
          text: "",
          image: "/images/questions/option-b.png",
        },
        {
          text: "40",
          image: null,
        },
        {
          text: "50",
          image: null,
        },
      ],

      correctAnswer: 1,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 3,
      sectionId: 1,
      question:
        "A train covers a distance of 240 km in 4 hours. What is the speed of the train?",

      options: [
        "50 km/h",
        "60 km/h",
        "70 km/h",
        "80 km/h",
      ],

      correctAnswer: 1,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 4,
      sectionId: 1,
      question:
        "What is 25% of 240?",

      options: [
        "40",
        "50",
        "60",
        "70",
      ],

      correctAnswer: 2,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 5,
      sectionId: 1,
      question:
        "If the cost price of an article is ₹800 and the selling price is ₹960, what is the profit percentage?",

      options: [
        "10%",
        "15%",
        "20%",
        "25%",
      ],

      correctAnswer: 2,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 6,
      sectionId: 1,
      question:
        "The average of 10, 20, 30, 40 and 50 is:",

      options: [
        "20",
        "25",
        "30",
        "35",
      ],

      correctAnswer: 2,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 7,
      sectionId: 1,
      question:
        "A number is increased from 200 to 250. What is the percentage increase?",

      options: [
        "20%",
        "25%",
        "30%",
        "35%",
      ],

      correctAnswer: 1,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 8,
      sectionId: 1,
      question:
        "Find the simple interest on ₹5000 at 10% per annum for 2 years.",

      options: [
        "₹500",
        "₹750",
        "₹1000",
        "₹1500",
      ],

      correctAnswer: 2,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 9,
      sectionId: 1,
      question:
        "If 5 workers can complete a work in 12 days, how many days will 10 workers take to complete the same work?",

      options: [
        "4 days",
        "6 days",
        "8 days",
        "10 days",
      ],

      correctAnswer: 1,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 10,
      sectionId: 1,
      question:
        "What is the next number in the sequence 2, 4, 8, 16, ?",

      options: [
        "20",
        "24",
        "32",
        "36",
      ],

      correctAnswer: 2,
      marks: 1,
      negativeMarks: 0.25,
    },


    // =====================================================
    // VERBAL ABILITY
    // =====================================================

    {
      id: 11,
      sectionId: 2,
      question:
        "Choose the synonym of the word 'Rapid'.",

      options: [
        "Slow",
        "Fast",
        "Weak",
        "Late",
      ],

      correctAnswer: 1,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 12,
      sectionId: 2,
      question:
        "Choose the antonym of the word 'Ancient'.",

      options: [
        "Old",
        "Historic",
        "Modern",
        "Past",
      ],

      correctAnswer: 2,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 13,
      sectionId: 2,
      question:
        "Choose the correctly spelled word.",

      options: [
        "Recieve",
        "Receive",
        "Receeve",
        "Receve",
      ],

      correctAnswer: 1,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 14,
      sectionId: 2,
      question:
        "Fill in the blank: She _____ to school every day.",

      options: [
        "go",
        "going",
        "goes",
        "gone",
      ],

      correctAnswer: 2,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 15,
      sectionId: 2,
      question:
        "Choose the correct passive voice: 'He writes a letter.'",

      options: [
        "A letter is written by him.",
        "A letter was written by him.",
        "A letter has written by him.",
        "A letter writes by him.",
      ],

      correctAnswer: 0,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 16,
      sectionId: 2,
      question:
        "Choose the word which is closest in meaning to 'Happy'.",

      options: [
        "Sad",
        "Joyful",
        "Angry",
        "Tired",
      ],

      correctAnswer: 1,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 17,
      sectionId: 2,
      question:
        "Identify the noun in the following sentence: 'Rahul plays cricket.'",

      options: [
        "plays",
        "cricket",
        "Rahul",
        "the",
      ],

      correctAnswer: 2,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 18,
      sectionId: 2,
      question:
        "Choose the correct article: He is _____ honest man.",

      options: [
        "a",
        "an",
        "the",
        "no article",
      ],

      correctAnswer: 1,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 19,
      sectionId: 2,
      question:
        "Choose the correct preposition: The book is _____ the table.",

      options: [
        "in",
        "on",
        "at",
        "by",
      ],

      correctAnswer: 1,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 20,
      sectionId: 2,
      question:
        "Choose the correct meaning of the idiom 'Break the ice'.",

      options: [
        "To break something",
        "To start a conversation",
        "To become angry",
        "To stop talking",
      ],

      correctAnswer: 1,
      marks: 1,
      negativeMarks: 0.25,
    },


    // =====================================================
    // REASONING ABILITY
    // =====================================================

    {
      id: 21,
      sectionId: 3,
      question:
        "Find the next number: 3, 6, 12, 24, ?",

      options: [
        "36",
        "42",
        "48",
        "50",
      ],

      correctAnswer: 2,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 22,
      sectionId: 3,
      question:
        "If CAT is coded as DBU, how will DOG be coded?",

      options: [
        "EPH",
        "EOG",
        "FPH",
        "DOH",
      ],

      correctAnswer: 0,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 23,
      sectionId: 3,
      question:
        "Find the odd one out.",

      options: [
        "Apple",
        "Mango",
        "Potato",
        "Banana",
      ],

      correctAnswer: 2,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 24,
      sectionId: 3,
      question:
        "A is the brother of B. B is the sister of C. How is A related to C?",

      options: [
        "Father",
        "Brother",
        "Uncle",
        "Cousin",
      ],

      correctAnswer: 1,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 25,
      sectionId: 3,
      question:
        "If today is Monday, what day will it be after 10 days?",

      options: [
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],

      correctAnswer: 1,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 26,
      sectionId: 3,
      question:
        "Find the missing number: 5, 10, 20, 40, ?",

      options: [
        "60",
        "70",
        "80",
        "100",
      ],

      correctAnswer: 2,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 27,
      sectionId: 3,
      question:
        "Which word does not belong to the group?",

      options: [
        "Square",
        "Triangle",
        "Circle",
        "Table",
      ],

      correctAnswer: 3,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 28,
      sectionId: 3,
      question:
        "If NORTH is written as SOUTH, then EAST will be written as:",

      options: [
        "WEST",
        "NORTH",
        "SOUTH",
        "EAST",
      ],

      correctAnswer: 0,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 29,
      sectionId: 3,
      question:
        "Complete the analogy: Book : Reading :: Food : ?",

      options: [
        "Cooking",
        "Eating",
        "Buying",
        "Selling",
      ],

      correctAnswer: 1,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 30,
      sectionId: 3,
      question:
        "Find the next letter in the sequence: A, C, E, G, ?",

      options: [
        "H",
        "I",
        "J",
        "K",
      ],

      correctAnswer: 1,
      marks: 1,
      negativeMarks: 0.25,
    },


    // =====================================================
    // PROGRAMMING LOGIC
    // =====================================================

    {
      id: 31,
      sectionId: 4,
      question:
        "Which data structure follows the LIFO principle?",

      options: [
        "Queue",
        "Stack",
        "Array",
        "Linked List",
      ],

      correctAnswer: 1,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 32,
      sectionId: 4,
      question:
        "Which keyword is used to declare a constant in JavaScript?",

      options: [
        "var",
        "let",
        "const",
        "constant",
      ],

      correctAnswer: 2,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 33,
      sectionId: 4,
      question:
        "Which of the following is not a programming language?",

      options: [
        "Python",
        "Java",
        "HTML",
        "C++",
      ],

      correctAnswer: 2,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 34,
      sectionId: 4,
      question:
        "Which operator is used for strict equality in JavaScript?",

      options: [
        "=",
        "==",
        "===",
        "!=",
      ],

      correctAnswer: 2,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 35,
      sectionId: 4,
      question:
        "What is the output of 2 + 3 * 4?",

      options: [
        "20",
        "14",
        "24",
        "10",
      ],

      correctAnswer: 1,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 36,
      sectionId: 4,
      question:
        "Which loop is generally used when the number of iterations is known?",

      options: [
        "while",
        "do-while",
        "for",
        "switch",
      ],

      correctAnswer: 2,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 37,
      sectionId: 4,
      question:
        "Which of these is a relational database?",

      options: [
        "MongoDB",
        "MySQL",
        "Redis",
        "Cassandra",
      ],

      correctAnswer: 1,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 38,
      sectionId: 4,
      question:
        "Which HTML tag is used to create a hyperlink?",

      options: [
        "<p>",
        "<a>",
        "<link>",
        "<href>",
      ],

      correctAnswer: 1,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 39,
      sectionId: 4,
      question:
        "Which CSS property is used to change text color?",

      options: [
        "font-color",
        "text-color",
        "color",
        "background-color",
      ],

      correctAnswer: 2,
      marks: 1,
      negativeMarks: 0.25,
    },

    {
      id: 40,
      sectionId: 4,
      question:
        "Which method is used to add an item at the end of a JavaScript array?",

      options: [
        "push()",
        "pop()",
        "shift()",
        "unshift()",
      ],

      correctAnswer: 0,
      marks: 1,
      negativeMarks: 0.25,
    },


    // =====================================================
    // ADVANCED CODING
    // =====================================================

    {
      id: 41,
      sectionId: 5,
      type: "coding",

      question:
        "Write a program to find the largest element in an array.",

      options: [],

      correctAnswer: null,
      marks: 5,
      negativeMarks: 0.25,
    },

    {
      id: 42,
      sectionId: 5,
      type: "coding",

      question:
        "Write a program to check whether a given string is a palindrome.",

      options: [],

      correctAnswer: null,
      marks: 5,
      negativeMarks: 0.25,
    },
  ],
};