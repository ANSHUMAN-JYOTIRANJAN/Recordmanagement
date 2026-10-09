(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (value) =>
    String(value == null ? "" : value).replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return entities[character];
    });
  const query = (values) =>
    new URLSearchParams(
      Object.entries(values).filter(
        ([, value]) => value !== "" && value != null,
      ),
    ).toString();
  const currentAcademicYear = () => {
    const now = new Date();
    const startYear =
      now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
    return `${startYear}-${String(startYear + 1).slice(-2)}`;
  };
  const json = (value) => JSON.stringify(value);
  const api = (path, options) => window.apiRequest(path, options);
  const get = (path) => api(path);
  const post = (path, body) => api(path, { method: "POST", body: json(body) });
  const put = (path, body) => api(path, { method: "PUT", body: json(body) });
  const del = (path) => api(path, { method: "DELETE" });

  let students = [];
  let courses = [];
  let registration = null;
  let selectedStudent = null;

  function showMessage(id, message, isError) {
    const element = $(id);
    if (!element) {
      window.alert(message);
      return;
    }
    element.textContent = message;
    element.style.display = "block";
    element.classList.toggle("error", Boolean(isError));
    element.classList.toggle("success", !isError);
  }

  function handleError(error, id) {
    console.error(error);
    showMessage(id || "message", error.message || "The request failed.", true);
  }

  function canManageStudents() {
    const user = window.getCurrentUser();
    return Boolean(
      user && ["Academic Office", "Course Administrator"].includes(user.role),
    );
  }

  function canDeleteStudents() {
    const user = window.getCurrentUser();
    return Boolean(user && user.role === "Academic Office");
  }

  function canManageCourses() {
    const user = window.getCurrentUser();
    return Boolean(
      user && ["Academic Office", "Course Administrator"].includes(user.role),
    );
  }

  function renderStudents(list) {
    const body = $("studentTableBody") || $("studentsTableBody");
    if (!body) return;

    const canManage = canManageStudents();
    const canDelete = canDeleteStudents();
    body.innerHTML = list.length
      ? list
          .map(
            (student) => `
              <tr>
                <td>${esc(student.rollNo)}</td>
                <td>${esc(student.name)}</td>
                <td>${esc(student.address)}</td>
                <td>${esc(student.semester)}</td>
                <td>Semester ${esc(student.semester)}</td>
                <td class="action-buttons">
                  <button class="action-btn view-btn" data-action="view" data-roll-no="${esc(student.rollNo)}">View</button>
                  ${canManage ? `<button class="action-btn edit-btn" data-action="edit" data-roll-no="${esc(student.rollNo)}">Edit</button>` : ""}
                  ${canDelete ? `<button class="action-btn delete-btn" data-action="delete" data-roll-no="${esc(student.rollNo)}">Delete</button>` : ""}
                </td>
              </tr>`,
          )
          .join("")
      : '<tr>      <td colspan="6">No students found.</td></tr>';
  }

  async function loadStudents() {
    const body = $("studentTableBody") || $("studentsTableBody");
    if (body)
      body.innerHTML = '<tr><td colspan="6">Loading students...</td></tr>';
    try {
      const data = await get("/students");
      students = data.students || [];
      renderStudents(students);
    } catch (error) {
      if (body)
        body.innerHTML =
          '<tr><td colspan="6">Unable to load students from the backend.</td></tr>';
      throw error;
    }
  }

  function closeStudentModal() {
    const modal = $("studentModal");
    if (modal) modal.style.display = "none";
    if ($("rollNo")) $("rollNo").readOnly = false;
    selectedStudent = null;
  }

  function openStudentModal() {
    if (!canManageStudents()) return;
    const modal = $("studentModal");
    if (modal) modal.style.display = "flex";
  }

  async function saveStudent(event) {
    event.preventDefault();
    if (!canManageStudents()) return;
    const student = {
      rollNo: $("rollNo").value.trim(),
      name: $("studentName").value.trim(),
      address: $("address").value.trim(),
      semester: Number($("semester").value),
    };

    try {
      if (selectedStudent) {
        await put(`/students/${encodeURIComponent(selectedStudent)}`, student);
        showMessage("message", "Student updated successfully.");
      } else {
        await post("/students", student);
        showMessage("message", "Student added successfully.");
      }
      closeStudentModal();
      $("studentForm").reset();
      await loadStudents();
    } catch (error) {
      if ($("availableCourses"))
        $("availableCourses").innerHTML =
          "<p>Unable to load registration data from the backend.</p>";
      handleError(error);
    }
  }

  async function editStudent(rollNo) {
    if (!canManageStudents()) return;
    const student = students.find((item) => item.rollNo === rollNo);
    if (!student) return;

    selectedStudent = student.rollNo;
    $("rollNo").value = student.rollNo;
    $("rollNo").readOnly = true;
    $("studentName").value = student.name;
    $("address").value = student.address;
    $("semester").value = student.semester;
    openStudentModal();
  }

  async function deleteStudent(rollNo) {
    if (!canDeleteStudents()) return;
    if (!window.confirm(`Delete student ${rollNo}?`)) return;
    try {
      await del(`/students/${encodeURIComponent(rollNo)}`);
      await loadStudents();
    } catch (error) {
      handleError(error);
    }
  }

  function viewStudent(rollNo) {
    window.location.href = `student-details.html?rollNo=${encodeURIComponent(rollNo)}`;
  }

  function filterStudents() {
    const value = ($("searchStudent") || $("studentSearch")).value
      .trim()
      .toLowerCase();
    renderStudents(
      students.filter((student) =>
        [student.rollNo, student.name, student.address].some((field) =>
          String(field).toLowerCase().includes(value),
        ),
      ),
    );
  }

  function renderCourses(list) {
    const body = $("courseTableBody");
    if (!body) return;

    const canManage = canManageCourses();
    body.innerHTML = list.length
      ? list
          .map(
            (course) => `
              <tr>
                <td>${esc(course.courseNo)}</td>
                <td>${esc(course.courseName)}</td>
                <td>${course.semester ? `Semester ${esc(course.semester)}` : "Unassigned"}</td>
                <td>${esc(course.credits)}</td>
                <td>${esc(course.syllabus)}</td>
                <td class="action-buttons">
                  <button class="action-btn view-btn" data-action="view" data-course-no="${esc(course.courseNo)}">View</button>
                  ${canManage ? `<button class="action-btn edit-btn" data-action="edit" data-course-no="${esc(course.courseNo)}">Edit</button>` : ""}
                  ${canManage ? `<button class="action-btn delete-btn" data-action="delete" data-course-no="${esc(course.courseNo)}">Delete</button>` : ""}
                </td>
              </tr>`,
          )
          .join("")
      : '<tr><td colspan="6">No courses found.</td></tr>';
  }

  async function loadCourses() {
    if ($("courseTableBody"))
      $("courseTableBody").innerHTML =
        '<tr><td colspan="6">Loading courses...</td></tr>';
    try {
      const data = await get("/courses");
      courses = data.courses || [];
      renderCourses(courses);
    } catch (error) {
      if ($("courseTableBody"))
        $("courseTableBody").innerHTML =
          '<tr><td colspan="6">Unable to load courses from the backend.</td></tr>';
      throw error;
    }
  }

  function filterCourses() {
    const value = $("searchCourse").value.trim().toLowerCase();
    renderCourses(
      courses.filter((course) =>
        [
          course.courseNo,
          course.courseName,
          course.courseType,
          course.semester,
        ].some((field) => String(field).toLowerCase().includes(value)),
      ),
    );
  }

  function viewCourse(courseNo) {
    const course = courses.find((item) => item.courseNo === courseNo);
    if (!course) return;
    if ($("infoCourseNo")) $("infoCourseNo").textContent = course.courseNo;
    if ($("infoCourseName"))
      $("infoCourseName").textContent = course.courseName;
    if ($("infoSemester"))
      $("infoSemester").textContent = course.semester
        ? `Semester ${course.semester}`
        : "Unassigned";
    if ($("infoCredits")) $("infoCredits").textContent = course.credits;
    if ($("infoSyllabus")) $("infoSyllabus").textContent = course.syllabus;
    if ($("courseInfo")) $("courseInfo").style.display = "block";
  }

  function goToAddCourse() {
    if (!canManageCourses()) return;
    window.location.href = "add-course.html";
  }

  function cancelForm() {
    window.location.href = "courses.html";
  }

  function generateStudentReport() {
    const rollNo = $("rollNo").textContent.trim();
    window.location.href = `reports.html?rollNo=${encodeURIComponent(rollNo)}`;
  }

  async function editCourse(courseNo) {
    if (!canManageCourses()) return;
    const course = courses.find((item) => item.courseNo === courseNo);
    if (!course) return;

    const courseName = window.prompt("Course name", course.courseName);
    if (courseName === null) return;
    const credits = window.prompt("Credits", String(course.credits));
    if (credits === null) return;
    const courseType = window.prompt(
      "Course type (Core, Elective, Laboratory, Project)",
      course.courseType,
    );
    if (courseType === null) return;
    const semester = window.prompt(
      "Semester (1-8)",
      String(course.semester || ""),
    );
    if (semester === null) return;
    const syllabus = window.prompt("Syllabus", course.syllabus);
    if (syllabus === null) return;

    try {
      await put(`/courses/${encodeURIComponent(courseNo)}`, {
        courseName: courseName.trim(),
        semester: Number(semester),
        credits: Number(credits),
        courseType: courseType.trim(),
        syllabus: syllabus.trim(),
      });
      await loadCourses();
    } catch (error) {
      handleError(error);
    }
  }

  async function deleteCourse(courseNo) {
    if (!canManageCourses()) return;
    if (!window.confirm(`Delete course ${courseNo}?`)) return;
    try {
      await del(`/courses/${encodeURIComponent(courseNo)}`);
      await loadCourses();
    } catch (error) {
      handleError(error);
    }
  }

  async function saveCourse(event) {
    event.preventDefault();
    if (!canManageCourses()) return;
    const body = {
      courseNo: $("courseNo").value.trim(),
      courseName: $("courseName").value.trim(),
      semester: Number($("courseSemester").value),
      credits: Number($("credits").value),
      courseType: $("courseType").value,
      syllabus: $("syllabus").value.trim(),
    };

    try {
      await post("/courses", body);
      showMessage("successMessage", "Course saved successfully.");
      $("previewCourseNo").textContent = body.courseNo;
      $("previewCourseName").textContent = body.courseName;
      $("previewSemester").textContent = `Semester ${body.semester}`;
      $("previewCredits").textContent = body.credits;
      $("previewCourseType").textContent = body.courseType;
      $("previewCard").style.display = "block";
      $("courseForm").reset();
    } catch (error) {
      handleError(error, "errorMessage");
    }
  }

  async function loadRegistration() {
    const rollNo = $("rollNumber").value
      ? $("rollNumber").value.trim()
      : $("rollNumber").textContent.trim();
    let semester = $("semester").value;
    const academicYear = $("academicYear")
      ? $("academicYear").value.trim()
      : currentAcademicYear();
    if (!rollNo || !semester || !academicYear) return;
    $("availableCourses").innerHTML = "<p>Loading courses...</p>";

    try {
      const studentData = await get(
        `/students/${encodeURIComponent(rollNo)}`,
      );
      const student = studentData.student;
      $("studentName").textContent = student.name;
      $("currentSemester").textContent = student.semester;
      const currentUser = window.getCurrentUser();
      if (currentUser && currentUser.role === "Student") {
        semester = String(student.semester);
        $("semester").value = semester;
      }
      const courseData = await get(`/courses?${query({ semester })}`);
      courses = courseData.courses || [];
      $("registrationStatus").textContent = "Open";

      const params = query({ rollNo, semester, academicYear });
      try {
        const registrationData = await get(`/registrations?${params}`);
        registration = registrationData.registration;
      } catch (error) {
        if (!error.message.includes("Registration record not found"))
          throw error;
        registration = null;
      }
      renderRegistrationCourses();
    } catch (error) {
      handleError(error);
    }
  }

  function renderRegistrationCourses() {
    const container = $("availableCourses");
    if (!container) return;
    const registered = new Set(
      ((registration && registration.courses) || []).map((item) =>
        String(item.course && item.course._id),
      ),
    );

    const semesterCourses = courses.filter(
      (course) => Number(course.semester) === Number($("semester").value),
    );
    container.innerHTML = semesterCourses.length
      ? semesterCourses
      .map((course) => {
        const alreadyRegistered = registered.has(String(course._id));
        return `
          <article class="course-card">
            <h3>${esc(course.courseNo)} — ${esc(course.courseName)}</h3>
            <p>${esc(course.credits)} credits · ${esc(course.courseType)}</p>
            <button class="register-course-btn" type="button" data-course-id="${esc(course._id)}" ${alreadyRegistered ? "disabled" : ""}>
              ${alreadyRegistered ? "Registered" : "Register"}
            </button>
          </article>`;
      })
      .join("")
      : "<p>No courses are assigned to this semester yet.</p>";

    const rows = ((registration && registration.courses) || []).map(
      (item, index) => {
        const course = item.course || {};
        return `<tr>
        <td>${esc(course.courseNo)}</td><td>${esc(course.courseName)}</td>
        <td>${esc(item.credits)}</td>
        <td><button class="remove-btn" type="button" data-remove-index="${index}">Remove</button></td>
      </tr>`;
      },
    );
    $("registeredCoursesBody").innerHTML = rows.length
      ? rows.join("")
      : '<tr><td colspan="4" class="empty-state">No courses registered yet.</td></tr>';
    $("registrationStatus").textContent = registration
      ? registration.status || "Open"
      : "Open";
    $("totalCredits").textContent =
      (registration && registration.totalCredits) || 0;
  }

  function selectedRegistrationCourseIds() {
    return ((registration && registration.courses) || [])
      .map((item) => item.course && item.course._id)
      .filter(Boolean);
  }

  async function saveRegistration(courseIds) {
    const rollNo = $("rollNumber").value
      ? $("rollNumber").value.trim()
      : $("rollNumber").textContent.trim();
    const semester = Number($("semester").value);
    const academicYear = $("academicYear")
      ? $("academicYear").value.trim()
      : currentAcademicYear();
    const body = {
      rollNo,
      semester,
      academicYear,
      courses: courseIds.map((course) => ({ course })),
    };
    const data = await post("/registrations", body);
    registration = data.registration;
    renderRegistrationCourses();
  }

  async function registerCourse(courseId) {
    try {
      await saveRegistration([...selectedRegistrationCourseIds(), courseId]);
    } catch (error) {
      handleError(error);
    }
  }

  async function removeCourse(index) {
    const courseIds = selectedRegistrationCourseIds();
    courseIds.splice(index, 1);
    try {
      await saveRegistration(courseIds);
    } catch (error) {
      handleError(error);
    }
  }

  async function confirmRegistration() {
    if (!registration) {
      showMessage("message", "Register at least one course first.", true);
      return;
    }
    try {
      await put(`/registrations/${registration._id}/confirm`, {});
      await loadRegistration();
    } catch (error) {
      handleError(error);
    }
  }

  function gradeFor(marks) {
    if (marks >= 85) return "A";
    if (marks >= 70) return "B";
    if (marks >= 50) return "C";
    return "F";
  }

  async function loadStudentMarks() {
    const rollNo = $("rollNumber").value.trim();
    const semester = $("semester").value;
    const academicYear = $("academicYear").value.trim();
    if (!rollNo || !semester || !academicYear) {
      showMessage(
        "message",
        "Enter a roll number, semester and academic year.",
        true,
      );
      return;
    }

    try {
      const params = query({ rollNo, semester, academicYear });
      const [courseData, marksData] = await Promise.all([
        get("/courses"),
        get(`/marks/student?${params}`),
      ]);
      courses = (courseData.courses || []).filter(
        (course) => Number(course.semester) === Number(semester),
      );
      renderMarksTable(courses, marksData.marks || []);
      $("studentName").textContent = marksData.student.name;
      $("displayRollNumber").textContent = marksData.student.rollNo;
      $("displaySemester").textContent = semester;
      $("studentInfo").style.display = "block";
      showMessage("message", "Marks loaded successfully.");
    } catch (error) {
      handleError(error);
    }
  }

  function renderMarksTable(courseList, marksList) {
    const byCourse = new Map(
      marksList.map((item) => [item.course.courseNo, item]),
    );
    $("marksTableBody").innerHTML = courseList
      .map((course) => {
        const record = byCourse.get(course.courseNo);
        const marks = record ? record.marks : "";
        return `<tr data-course-no="${esc(course.courseNo)}">
          <td>${esc(course.courseNo)}</td><td>${esc(course.courseName)}</td>
          <td>${esc(course.credits)}</td>
          <td><input type="number" class="marks-input" min="0" max="100" value="${esc(marks)}" aria-label="Marks for ${esc(course.courseNo)}"></td>
          <td class="grade-display">${marks === "" ? "-" : gradeFor(Number(marks))}</td>
        </tr>`;
      })
      .join("");
    updateMarks();
  }

  function updateMarks() {
    let total = 0;
    let credits = 0;
    let completed = 0;
    document.querySelectorAll("#marksTableBody tr").forEach((row) => {
      const input = row.querySelector("input");
      if (!input) return;
      const mark = input.value === "" ? null : Number(input.value);
      const grade = row.querySelector(".grade-display");
      if (mark === null || mark < 0 || mark > 100 || Number.isNaN(mark)) {
        if (grade) grade.textContent = "-";
        return;
      }
      if (grade) grade.textContent = gradeFor(mark);
      total += mark;
      credits += Number(row.children[2].textContent);
      completed++;
    });
    if ($("totalMarks")) $("totalMarks").textContent = total.toFixed(2);
    if ($("averageMarks"))
      $("averageMarks").textContent = completed
        ? (total / completed).toFixed(2)
        : "0";
    if ($("totalCredits")) $("totalCredits").textContent = credits;
  }

  async function saveMarks() {
    const rollNo = $("rollNumber").value.trim();
    const semester = Number($("semester").value);
    const academicYear = $("academicYear").value.trim();
    if (!rollNo || !semester || !academicYear) {
      showMessage(
        "message",
        "Enter a roll number, semester and academic year.",
        true,
      );
      return;
    }
    if (!courses.length) {
      showMessage(
        "message",
        "Load the student and courses before saving marks.",
        true,
      );
      return;
    }
    const rows = Array.from(document.querySelectorAll("#marksTableBody tr"));
    const records = rows
      .map((row) => ({
        courseNo: row.dataset.courseNo,
        marks: row.querySelector("input").value,
      }))
      .filter((item) => item.marks !== "");

    if (!records.length) {
      showMessage("message", "Enter marks for at least one course.", true);
      return;
    }
    try {
      await Promise.all(
        records.map((record) =>
          post("/marks", { ...record, rollNo, semester, academicYear }),
        ),
      );
      showMessage("message", "Marks saved successfully.");
      await loadStudentMarks();
    } catch (error) {
      handleError(error);
    }
  }

  async function calculateSWA() {
    const rollNo = $("rollNumber").value.trim();
    const semester = $("semester").value;
    const academicYear = $("academicYear").value.trim();
    if (!rollNo || !semester || !academicYear) {
      showMessage(
        "message",
        "Enter a roll number, semester and academic year.",
        true,
      );
      return;
    }

    $("swaValue").textContent = "—";
    $("standing").textContent = "Not calculated";
    $("weightedMarks").textContent = "—";
    $("totalCredits").textContent = "—";
    $("resultSemester").textContent = "—";
    $("swaTableBody").innerHTML =
      '<tr><td colspan="5">Loading marks...</td></tr>';

    try {
      const params = query({ rollNo, semester, academicYear });
      const data = await get(`/swa?${params}`);
      const result = data.result;
      $("swaValue").textContent = result.swa.toFixed(2);
      $("standing").textContent = result.standing;
      $("weightedMarks").textContent = result.weightedTotal.toFixed(2);
      $("totalCredits").textContent = result.totalCredits;
      $("resultSemester").textContent = semester;
      $("swaTableBody").innerHTML = (data.courses || [])
        .map(
          (item) =>
            `<tr><td>${esc(item.courseNo)}</td><td>${esc(item.courseName)}</td><td>${esc(item.credits)}</td><td>${esc(item.marks)}</td><td>${esc(item.weightedMarks)}</td></tr>`,
        )
        .join("");
      showMessage("message", "SWA calculated from marks for this semester.");
    } catch (error) {
      $("swaTableBody").innerHTML =
        '<tr><td colspan="5">Unable to load semester marks.</td></tr>';
      $("standing").textContent = "Not calculated";
      if (
        error.message ===
        "No marks found for the selected semester and academic year. SWA is not available until marks are entered."
      ) {
        $("swaTableBody").innerHTML =
          '<tr><td colspan="5">No marks available for this semester.</td></tr>';
        showMessage("message", error.message, true);
        return;
      }
      handleError(error);
    }
  }

  async function saveSWARecord() {
    const rollNo = $("rollNumber").value.trim();
    const semester = Number($("semester").value);
    const academicYear = $("academicYear").value.trim();
    if (!rollNo || !semester || !academicYear) {
      showMessage(
        "message",
        "Enter a roll number, semester and academic year.",
        true,
      );
      return;
    }
    try {
      const data = await post("/swa", { rollNo, semester, academicYear });
      showMessage("message", data.message || "SWA record saved successfully.");
    } catch (error) {
      handleError(error);
    }
  }

  async function checkStudentSWAProfile(user) {
    if (!user || user.role !== "Student") return;
    if (!user.rollNo) {
      showMessage(
        "swaProfileMessage",
        "Your account has no student roll number. Contact Academic Office to link one.",
        true,
      );
      return;
    }

    try {
      await get(`/students/${encodeURIComponent(user.rollNo)}`);
    } catch (error) {
      if (error.message === "Student not found.") {
        $("swaProfileForm").hidden = false;
        return;
      }
      handleError(error, "swaProfileMessage");
    }
  }

  let latestReport = null;

  async function generateReport() {
    const rollNo = $("rollNumber").value.trim();
    const semester = $("semester").value;
    const academicYear = $("academicYear").value.trim();
    if (!rollNo || !semester || !academicYear) {
      showMessage(
        "message",
        "Enter a roll number, semester and academic year.",
        true,
      );
      return;
    }
    try {
      const data = await get(
        `/reports/${encodeURIComponent(rollNo)}?${query({ semester, academicYear })}`,
      );
      const report = data.report;
      latestReport = report;
      $("reportStudentName").textContent = report.student.name;
      $("reportRollNumber").textContent = report.student.rollNo;
      $("reportSemester").textContent = report.semester;
      $("reportAcademicYear").textContent = report.academicYear;
      $("reportDate").textContent = new Date().toLocaleDateString();
      $("reportCredits").textContent = report.currentSemester.totalCredits;
      $("reportWeightedMarks").textContent =
        report.currentSemester.weightedTotal;
      $("reportSWA").textContent = report.currentSemester.swa;
      $("reportStanding").textContent = report.currentSemester.standing;
      $("reportCourses").innerHTML = report.courses
        .map(
          (item) =>
            `<tr><td>${esc(item.courseNo)}</td><td>${esc(item.courseName)}</td><td>${esc(item.credits)}</td><td>${esc(item.marks)}</td><td>${esc(item.grade)}</td><td>${esc(item.weightedMarks)}</td></tr>`,
        )
        .join("");
      $("previousRecords").innerHTML = report.previousSemesters
        .map(
          (item) =>
            `<tr><td>${esc(item.semester)}</td><td>${esc(item.academicYear)}</td><td>${esc(item.totalCredits)}</td><td>${esc(item.swa)}</td><td>${esc(item.standing)}</td></tr>`,
        )
        .join("");
      $("academicReport").style.display = "block";
      if ($("reportActions")) $("reportActions").style.display = "flex";
    } catch (error) {
      handleError(error);
    }
  }

  async function loadStudentDetails() {
    const rollNo =
      new URLSearchParams(window.location.search).get("rollNo") ||
      (window.getCurrentUser() && window.getCurrentUser().rollNo);
    if (!rollNo) {
      showMessage("message", "No student roll number was supplied.", true);
      return;
    }
    try {
      const data = await get(`/students/${encodeURIComponent(rollNo)}`);
      const student = data.student;
      $("studentAvatar").textContent = student.name.charAt(0).toUpperCase();
      $("studentName").textContent = student.name;
      $("name").textContent = student.name;
      $("studentRoll").textContent = `Roll Number: ${student.rollNo}`;
      $("rollNo").textContent = student.rollNo;
      $("name").textContent = student.name;
      $("address").textContent = student.address;
      $("semester").textContent = student.semester;
      $("courseTableBody").innerHTML = (student.registeredCourses || [])
        .map(
          (course) =>
            `<tr><td>${esc(course.courseNo)}</td><td>${esc(course.courseName)}</td><td>${esc(course.credits)}</td><td>${esc(course.courseType)}</td></tr>`,
        )
        .join("");

      const academicYear = currentAcademicYear();
      const markData = await get(
        `/marks/student?${query({ rollNo, semester: student.semester, academicYear })}`,
      );
      const markRows = markData.marks || [];
      $("marksTableBody").innerHTML = markRows
        .map(
          (item) =>
            `<tr><td>${esc(item.course.courseNo)}</td><td>${esc(item.course.courseName)}</td><td>${esc(item.marks)}</td><td>${esc(item.grade)}</td></tr>`,
        )
        .join("");
      const summary = await get(
        `/reports/${encodeURIComponent(rollNo)}/summary`,
      );
      $("swaValue").textContent = summary.currentSWA;
      $("cumulativeValue").textContent = summary.cumulativeAverage;
      $("standingTitle").textContent = summary.standing;
      $("creditValue").textContent = markRows.reduce(
        (sum, item) => sum + Number(item.credits),
        0,
      );
      $("standingDescription").textContent = summary.standing;
    } catch (error) {
      handleError(error);
    }
  }

  async function loadDashboard() {
    try {
      [
        "studentCount",
        "courseCount",
        "registrationCount",
        "reportCount",
      ].forEach((id) => {
        if ($(id)) $(id).textContent = "…";
      });
      if ($("recentStudents")) $("recentStudents").innerHTML = "";
      if ($("currentSWA")) $("currentSWA").textContent = "—";
      if ($("academicStanding"))
        $("academicStanding").textContent = "No academic result loaded";
      const user = window.getCurrentUser();
      if (user) {
        if ($("userName")) $("userName").textContent = user.name;
        if ($("userRole")) $("userRole").textContent = user.role;
        const manageStaffAction = $("manageStaffAction");
        if (manageStaffAction)
          manageStaffAction.style.display =
            user.role === "Academic Office" ? "" : "none";
      }
      const [studentData, courseData] = await Promise.all([
        get("/students"),
        get("/courses"),
      ]);
      if ($("studentCount")) $("studentCount").textContent = studentData.count;
      if ($("courseCount")) $("courseCount").textContent = courseData.count;
      const recent = (studentData.students || []).slice(0, 5);
      $("recentStudents").innerHTML = recent
        .map(
          (student) =>
            `<tr><td>${esc(student.rollNo)}</td><td>${esc(student.name)}</td><td>${esc(student.semester)}</td><td>Active</td></tr>`,
        )
        .join("");
      if ($("registrationCount")) {
        $("registrationCount").textContent = "0";
        const role = user && user.role;
        const canListRegistrations = [
          "Faculty",
          "Academic Office",
          "Course Administrator",
        ].includes(role);
        if (canListRegistrations) {
          const registrations = await get("/registrations/all");
          $("registrationCount").textContent = registrations.count;
        } else if (user && user.rollNo) {
          const student = (studentData.students || []).find(
            (item) => item.rollNo === user.rollNo,
          );
          if (!student || !student.semester) {
            $("registrationCount").textContent = "0";
          } else {
            try {
              const registrationData = await get(
                `/registrations?${query({
                  rollNo: user.rollNo,
                  semester: student.semester,
                  academicYear: currentAcademicYear(),
                })}`,
              );
              $("registrationCount").textContent = registrationData.registration
                ? 1
                : 0;
            } catch (error) {
              if (!error.message.includes("Registration record not found"))
                throw error;
              $("registrationCount").textContent = "0";
            }
          }
        }
      }
      const reportStats = await get("/reports/stats");
      if ($("reportCount")) $("reportCount").textContent = reportStats.count;
    } catch (error) {
      handleError(error);
    }
  }

  function installHandlers() {
    if ($("academicReport")) $("academicReport").style.display = "none";
    if ($("reportActions")) $("reportActions").style.display = "none";
    if (
      $("marksTableBody") &&
      window.location.pathname.endsWith("marks.html")
    ) {
      $("marksTableBody").innerHTML =
        '<tr><td colspan="5">Load a student to view marks.</td></tr>';
    }
    if ($("swaTableBody")) {
      $("swaTableBody").innerHTML =
        '<tr><td colspan="5">Calculate SWA to load marks.</td></tr>';
      $("swaValue").textContent = "—";
      $("weightedMarks").textContent = "—";
      $("totalCredits").textContent = "—";
      if ($("standing"))
        $("standing").textContent = "Calculate SWA to load standing";
    }
    if ($("studentAvatar")) {
      $("studentAvatar").textContent = "";
      $("studentName").textContent = "";
      $("name").textContent = "";
      $("studentRoll").textContent = "Roll Number:";
      ["rollNo", "name", "address", "semester"].forEach((id) => {
        if ($(id)) $(id).textContent = "";
      });
      if ($("courseTableBody")) $("courseTableBody").innerHTML = "";
      if ($("marksTableBody")) $("marksTableBody").innerHTML = "";
      if ($("swaValue")) $("swaValue").textContent = "—";
      if ($("cumulativeValue")) $("cumulativeValue").textContent = "—";
      if ($("creditValue")) $("creditValue").textContent = "—";
    }

    window.logout =
      window.logout || (() => (window.location.href = "login.html"));
    window.openStudentModal = openStudentModal;
    window.closeStudentModal = closeStudentModal;
    window.viewStudent = viewStudent;
    window.editStudent = editStudent;
    window.deleteStudent = deleteStudent;
    window.goToAddCourse = goToAddCourse;
    window.cancelForm = cancelForm;
    window.generateStudentReport = generateStudentReport;
    window.viewCourse = viewCourse;
    window.editCourse = editCourse;
    window.deleteCourse = deleteCourse;
    window.registerCourse = registerCourse;
    window.removeCourse = removeCourse;
    window.confirmRegistration = confirmRegistration;
    window.loadStudentMarks = loadStudentMarks;
    window.updateMarks = updateMarks;
    window.saveMarks = saveMarks;
    window.calculateSWA = calculateSWA;
    window.saveSWARecord = saveSWARecord;
    window.generateReport = generateReport;
    window.printReport = () => window.print();
    window.downloadReport = () => {
      if (!latestReport) {
        showMessage(
          "message",
          "Generate a report before downloading it.",
          true,
        );
        return;
      }
      const rows = [
        ["Roll Number", latestReport.student.rollNo],
        ["Student Name", latestReport.student.name],
        ["Semester", latestReport.semester],
        ["Academic Year", latestReport.academicYear],
        [],
        [
          "Course",
          "Course Name",
          "Credits",
          "Marks",
          "Grade",
          "Weighted Marks",
        ],
        ...latestReport.courses.map((item) => [
          item.courseNo,
          item.courseName,
          item.credits,
          item.marks,
          item.grade,
          item.weightedMarks,
        ]),
      ];
      const csv = rows
        .map((row) =>
          row
            .map(
              (value) =>
                `"${String(value == null ? "" : value).replace(/"/g, '""')}"`,
            )
            .join(","),
        )
        .join("\r\n");
      const link = document.createElement("a");
      link.href = URL.createObjectURL(
        new Blob([csv], { type: "text/csv;charset=utf-8" }),
      );
      link.download = `academic-report-${latestReport.student.rollNo}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    };

    if ($("searchStudent"))
      $("searchStudent").addEventListener("input", filterStudents);
    if ($("studentSearch"))
      $("studentSearch").addEventListener("input", filterStudents);
    if ($("courseForm")) $("courseForm").addEventListener("submit", saveCourse);
    if ($("searchCourse"))
      $("searchCourse").addEventListener("input", filterCourses);
    if ($("semester") && $("rollNumber") && $("availableCourses")) {
      $("semester").addEventListener("change", loadRegistration);
      $("rollNumber").addEventListener("change", loadRegistration);
      if ($("academicYear"))
        $("academicYear").addEventListener("change", loadRegistration);
    }
    if ($("marksTableBody"))
      $("marksTableBody").addEventListener("input", updateMarks);
    if (
      $("rollNumber") &&
      $("semester") &&
      $("academicYear") &&
      $("reportCourses")
    ) {
      const params = new URLSearchParams(window.location.search);
      if (params.has("rollNo")) $("rollNumber").value = params.get("rollNo");
    }

    if (window.location.pathname.endsWith("students.html")) {
      if (window.protectPage()) {
        const canManage = canManageStudents();
        const addButton = $("addStudentButton");
        const permissionNotice = $("studentPermissionNotice");
        if (addButton) addButton.style.display = canManage ? "" : "none";
        if (permissionNotice) permissionNotice.hidden = canManage;
        loadStudents().catch((error) => handleError(error));
      }
    } else if (window.location.pathname.endsWith("courses.html")) {
      if (window.protectPage()) {
        const canManage = canManageCourses();
        const addButton = $("addCourseButton");
        const permissionNotice = $("coursePermissionNotice");
        if (addButton) addButton.style.display = canManage ? "" : "none";
        if (permissionNotice) permissionNotice.hidden = canManage;
        loadCourses().catch((error) => handleError(error));
      }
    } else if (window.location.pathname.endsWith("add-course.html")) {
      if (window.protectPage()) {
        const canManage = canManageCourses();
        const courseForm = $("courseForm");
        const permissionNotice = $("coursePermissionNotice");
        if (courseForm) courseForm.hidden = !canManage;
        if (permissionNotice) permissionNotice.hidden = canManage;
      }
    } else if (window.location.pathname.endsWith("registration.html")) {
      if (window.protectPage()) {
        const user = window.getCurrentUser();
        if (user && user.role === "Student" && user.rollNo) {
          $("rollNumber").value = user.rollNo;
          $("rollNumber").readOnly = true;
        }
        loadRegistration();
      }
    } else if (window.location.pathname.endsWith("student-details.html")) {
      if (window.protectPage()) loadStudentDetails();
    } else if (window.location.pathname.endsWith("reports.html")) {
      if (window.protectPage()) {
        const rollNo = new URLSearchParams(window.location.search).get(
          "rollNo",
        );
        if (rollNo) $("rollNumber").value = rollNo;
      }
    } else if (window.location.pathname.endsWith("dashboard.html")) {
      if (window.protectPage()) loadDashboard();
    } else if (
      window.location.pathname.endsWith("marks.html") ||
      window.location.pathname.endsWith("swa.html")
    ) {
      if (window.protectPage()) {
        const user = window.getCurrentUser();
        const rollNo = new URLSearchParams(window.location.search).get(
          "rollNo",
        );
        if (window.location.pathname.endsWith("swa.html")) {
          const isStudent = user && user.role === "Student";
          const canSaveSWA =
            user && ["Faculty", "Academic Office"].includes(user.role);
          if (isStudent && user.rollNo) {
            $("rollNumber").value = user.rollNo;
            $("rollNumber").readOnly = true;
          } else if (rollNo) {
            $("rollNumber").value = rollNo;
          }
          const saveButton = $("saveSwaButton");
          const permissionNotice = $("swaPermissionNotice");
          if (saveButton) saveButton.style.display = canSaveSWA ? "" : "none";
          if (permissionNotice) permissionNotice.hidden = Boolean(canSaveSWA);
          if (isStudent) checkStudentSWAProfile(user);
        } else if (rollNo) {
          $("rollNumber").value = rollNo;
        }
      }
    }

    if ($("studentForm")) {
      $("studentForm").addEventListener("submit", saveStudent);
      if ($("rollNo"))
        $("rollNo").addEventListener("input", () => {
          if (!selectedStudent) $("rollNo").readOnly = false;
        });
    }
    if ($("swaProfileForm")) {
      $("swaProfileForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        try {
          const data = await post("/auth/student-profile", {
            address: $("swaProfileAddress").value.trim(),
            semester: Number($("swaProfileSemester").value),
          });
          $("swaProfileForm").hidden = true;
          $("semester").value = data.student.semester;
          showMessage(
            "swaProfileMessage",
            "Student profile created. Enter the academic year and calculate SWA.",
          );
        } catch (error) {
          handleError(error, "swaProfileMessage");
        }
      });
    }
    const studentBody = $("studentTableBody") || $("studentsTableBody");
    if (studentBody) {
      studentBody.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;
        const rollNo = button.dataset.rollNo;
        if (button.dataset.action === "view") viewStudent(rollNo);
        if (button.dataset.action === "edit") editStudent(rollNo);
        if (button.dataset.action === "delete") deleteStudent(rollNo);
      });
    }
    if ($("courseTableBody")) {
      $("courseTableBody").addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");
        if (!button) return;
        const courseNo = button.dataset.courseNo;
        if (button.dataset.action === "view") viewCourse(courseNo);
        if (button.dataset.action === "edit") editCourse(courseNo);
        if (button.dataset.action === "delete") deleteCourse(courseNo);
      });
    }
    if ($("availableCourses")) {
      $("availableCourses").addEventListener("click", (event) => {
        const button = event.target.closest("button[data-course-id]");
        if (button) registerCourse(button.dataset.courseId);
      });
    }
    if ($("registeredCoursesBody")) {
      $("registeredCoursesBody").addEventListener("click", (event) => {
        const button = event.target.closest("button[data-remove-index]");
        if (button) removeCourse(Number(button.dataset.removeIndex));
      });
    }
    if ($("studentModal")) {
      $("studentModal").addEventListener("click", (event) => {
        if (event.target === $("studentModal")) closeStudentModal();
      });
    }
  }

  window.addEventListener("DOMContentLoaded", installHandlers);
})();
