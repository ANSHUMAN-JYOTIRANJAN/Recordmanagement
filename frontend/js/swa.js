/* =========================================
   STUDENT ACADEMIC RECORD MANAGEMENT SYSTEM
   SWA Calculation JavaScript
   ========================================= */

const SWA_API_URL = "http://localhost:5000/api/swa";

/* =========================================
   COURSE DATA
   ========================================= */

let swaCourses = [
  {
    courseNumber: "CS301",
    courseName: "Database Management Systems",
    credits: 4,
    marks: 85,
  },
  {
    courseNumber: "CS302",
    courseName: "Operating Systems",
    credits: 4,
    marks: 78,
  },
  {
    courseNumber: "CS303",
    courseName: "Computer Networks",
    credits: 3,
    marks: 82,
  },
  {
    courseNumber: "CS304",
    courseName: "Software Engineering",
    credits: 4,
    marks: 90,
  },
];

/* =========================================
   CALCULATE SWA
   Formula:
   SWA = Σ(Marks × Credits) / Σ Credits
   ========================================= */

function calculateSWA() {
  let weightedTotal = 0;
  let totalCredits = 0;

  swaCourses.forEach(function (course) {
    const marks = Number(course.marks);

    const credits = Number(course.credits);

    if (Number.isNaN(marks) || Number.isNaN(credits)) {
      return;
    }

    const weightedMarks = marks * credits;

    weightedTotal += weightedMarks;

    totalCredits += credits;
  });

  const swa = totalCredits > 0 ? weightedTotal / totalCredits : 0;

  return {
    weightedTotal: weightedTotal,
    totalCredits: totalCredits,
    swa: swa,
  };
}

/* =========================================
   DISPLAY SWA TABLE
   ========================================= */

function displaySWATable() {
  const tableBody = document.getElementById("swaTableBody");

  if (!tableBody) {
    return;
  }

  tableBody.innerHTML = "";

  swaCourses.forEach(function (course) {
    const weightedMarks = Number(course.marks) * Number(course.credits);

    const row = document.createElement("tr");

    row.innerHTML = `

                <td>
                    ${escapeHTML(course.courseNumber)}
                </td>

                <td>
                    ${escapeHTML(course.courseName)}
                </td>

                <td class="text-center">
                    ${course.credits}
                </td>

                <td class="text-center">
                    ${course.marks}
                </td>

                <td class="text-right">
                    ${weightedMarks.toFixed(2)}
                </td>

            `;

    tableBody.appendChild(row);
  });
}

/* =========================================
   DISPLAY SWA RESULT
   ========================================= */

function displaySWAResult() {
  const result = calculateSWA();

  setElementText("weightedTotal", result.weightedTotal.toFixed(2));

  setElementText("totalCredits", result.totalCredits);

  setElementText("swaValue", result.swa.toFixed(2));

  displayStanding(result.swa);
}

/* =========================================
   ACADEMIC STANDING
   ========================================= */

function getAcademicStanding(swa) {
  if (swa >= 85) {
    return {
      title: "Vice-Chancellor's List",

      description: "The student has achieved an SWA of 85 or above.",

      className: "standing-vc",
    };
  }

  if (swa >= 50) {
    return {
      title: "Normal Academic Standing",

      description: "The student has an SWA between 50 and 84.99.",

      className: "standing-normal",
    };
  }

  return {
    title: "Conditional Standing",

    description: "The student has an SWA below 50.",

    className: "standing-conditional",
  };
}

/* =========================================
   DISPLAY STANDING
   ========================================= */

function displayStanding(swa) {
  const standing = getAcademicStanding(swa);

  const standingBox = document.getElementById("standing");

  if (!standingBox) {
    return;
  }

  standingBox.className = `standing-box ${standing.className}`;

  standingBox.innerHTML = `

        <h3>
            ${standing.title}
        </h3>

        <p>
            ${standing.description}
        </p>

    `;
}

/* =========================================
   LOAD MARKS FROM LOCAL STORAGE
   ========================================= */

function loadSWAFromMarks() {
  const rollNo = getElementValue("rollNo");

  const semester = getElementValue("semester");

  if (!rollNo || !semester) {
    return false;
  }

  const storageKey = `marks_${rollNo}_${semester}`;

  const storedMarks = localStorage.getItem(storageKey);

  if (!storedMarks) {
    return false;
  }

  try {
    const data = JSON.parse(storedMarks);

    if (!data.marks || data.marks.length === 0) {
      return false;
    }

    swaCourses = data.marks.map(function (course) {
      return {
        courseNumber: course.courseNumber,

        courseName: course.courseName,

        credits: Number(course.credits),

        marks: Number(course.marks),
      };
    });

    displaySWATable();

    displaySWAResult();

    showSWAMessage("Marks loaded successfully.", "success");

    return true;
  } catch (error) {
    console.error("Error loading marks:", error);

    showSWAMessage("Unable to load marks.", "error");

    return false;
  }
}

/* =========================================
   SAVE SWA RECORD
   ========================================= */

function saveSWARecord() {
  const rollNo = getElementValue("rollNo");

  const semester = getElementValue("semester");

  const academicYear = getElementValue("academicYear");

  if (!rollNo || !semester) {
    showSWAMessage("Please enter roll number and semester.", "error");

    return;
  }

  const result = calculateSWA();

  const standing = getAcademicStanding(result.swa);

  const swaRecord = {
    rollNo: rollNo,

    semester: Number(semester),

    academicYear: academicYear,

    weightedTotal: result.weightedTotal,

    totalCredits: result.totalCredits,

    swa: Number(result.swa.toFixed(2)),

    standing: standing.title,

    courses: swaCourses,

    calculatedAt: new Date().toISOString(),
  };

  localStorage.setItem(`swa_${rollNo}_${semester}`, JSON.stringify(swaRecord));

  showSWAMessage("SWA record saved successfully.", "success");
}

/* =========================================
   LOAD SAVED SWA
   ========================================= */

function loadSavedSWA() {
  const rollNo = getElementValue("rollNo");

  const semester = getElementValue("semester");

  if (!rollNo || !semester) {
    showSWAMessage("Please enter roll number and semester.", "error");

    return;
  }

  const stored = localStorage.getItem(`swa_${rollNo}_${semester}`);

  if (!stored) {
    showSWAMessage("No saved SWA record found.", "error");

    return;
  }

  try {
    const data = JSON.parse(stored);

    swaCourses = data.courses || [];

    displaySWATable();

    displaySWAResult();

    showSWAMessage("SWA record loaded successfully.", "success");
  } catch (error) {
    console.error("Error loading SWA:", error);

    showSWAMessage("Unable to load SWA record.", "error");
  }
}

/* =========================================
   RESET SWA
   ========================================= */

function resetSWA() {
  swaCourses = [];

  const tableBody = document.getElementById("swaTableBody");

  if (tableBody) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="5"
                    class="empty-state">
                    No marks available.
                </td>
            </tr>
        `;
  }

  setElementText("weightedTotal", "0.00");

  setElementText("totalCredits", "0");

  setElementText("swaValue", "0.00");

  const standing = document.getElementById("standing");

  if (standing) {
    standing.className = "standing-box";

    standing.innerHTML = `
            <h3>
                Not Calculated
            </h3>

            <p>
                Enter or load student marks
                to calculate SWA.
            </p>
        `;
  }
}

/* =========================================
   SHOW MESSAGE
   ========================================= */

function showSWAMessage(message, type) {
  let messageBox = document.getElementById("swaMessage");

  if (!messageBox) {
    messageBox = document.createElement("div");

    messageBox.id = "swaMessage";

    const pageContent = document.querySelector(".page-content");

    if (pageContent) {
      pageContent.prepend(messageBox);
    } else {
      document.body.prepend(messageBox);
    }
  }

  messageBox.textContent = message;

  messageBox.className =
    type === "success" ? "alert alert-success" : "alert alert-danger";

  messageBox.style.display = "block";

  setTimeout(function () {
    messageBox.style.display = "none";
  }, 3000);
}

/* =========================================
   HELPER FUNCTIONS
   ========================================= */

function getElementValue(id) {
  const element = document.getElementById(id);

  if (!element) {
    return "";
  }

  return element.value.trim();
}

function setElementText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function escapeHTML(value) {
  const div = document.createElement("div");

  div.textContent = value ?? "";

  return div.innerHTML;
}

/* =========================================
   PAGE INITIALIZATION
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
  /*
   * Display default/example data.
   */

  if (document.getElementById("swaTableBody")) {
    displaySWATable();

    displaySWAResult();
  }

  /*
   * Load Marks button
   */

  const loadButton = document.getElementById("loadSWA");

  if (loadButton) {
    loadButton.addEventListener("click", loadSWAFromMarks);
  }

  /*
   * Save SWA button
   */

  const saveButton = document.getElementById("saveSWA");

  if (saveButton) {
    saveButton.addEventListener("click", saveSWARecord);
  }

  /*
   * Load saved SWA button
   */

  const savedButton = document.getElementById("loadSavedSWA");

  if (savedButton) {
    savedButton.addEventListener("click", loadSavedSWA);
  }

  /*
   * Reset button
   */

  const resetButton = document.getElementById("resetSWA");

  if (resetButton) {
    resetButton.addEventListener("click", resetSWA);
  }
});
