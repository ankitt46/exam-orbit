import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Constant type definitions
  type ExamType = {
    #jee;
    #neet;
  };

  type TestType = {
    #full;
    #chapter;
  };

  type Subject = {
    #physics;
    #chemistry;
    #maths;
    #biology;
  };

  type ContentType = {
    #notes;
    #formula;
  };

  // Data model de clarations
  type Question = {
    id : Nat;
    examType : ExamType;
    subject : Subject;
    chapter : Text;
    year : Nat;
    questionText : Text;
    options : [Text];
    correctAnswer : Nat;
    solution : Text;
    difficulty : Nat;
  };

  type Test = {
    id : Nat;
    title : Text;
    examType : ExamType;
    testType : TestType;
    subject : ?Subject;
    chapter : ?Text;
    durationMinutes : Nat;
    questionIds : [Nat];
  };

  type TestSubmission = {
    id : Nat;
    userId : Principal;
    testId : Nat;
    answers : [Nat];
    score : Nat;
    totalQuestions : Nat;
    submittedAt : Int;
  };

  type StudyMaterial = {
    id : Nat;
    subject : Subject;
    chapter : Text;
    title : Text;
    contentType : ContentType;
    content : Text;
  };

  type Bookmark = {
    id : Nat;
    userId : Principal;
    questionId : Nat;
  };

  type DailyQuestion = {
    id : Nat;
    date : Int;
    questionId : Nat;
  };

  type LeaderboardEntry = {
    id : Nat;
    userId : Principal;
    userName : Text;
    totalScore : Nat;
    testsCompleted : Nat;
    examType : ExamType;
  };

  type UserProfile = {
    id : Nat;
    name : Text;
  };

  type QuestionCreation = {
    examType : ExamType;
    subject : Subject;
    chapter : Text;
    year : Nat;
    questionText : Text;
    options : [Text];
    correctAnswer : Nat;
    solution : Text;
    difficulty : Nat;
  };

  // Compare modules for persistent data
  module Test {
    public type Item = Test;

    public func compare(a : Test, b : Test) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module LeaderboardEntry {
    public func compare(a : LeaderboardEntry, b : LeaderboardEntry) : Order.Order {
      Nat.compare(b.totalScore, a.totalScore);
    };
  };

  // State management
  let seed = Map.empty<Principal, Nat>();
  func getSeed(caller : Principal) : Nat {
    switch (seed.get(caller)) {
      case (null) { Runtime.trap("User seed not found") };
      case (?s) { s };
    };
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Persistent storage maps
  var nextPersistentId = 0;
  func getNextPersistentId() : Nat {
    nextPersistentId += 1;
    nextPersistentId;
  };
  let questions = Map.empty<Nat, Question>();
  let tests = Map.empty<Nat, Test>();
  let testSubmissions = Map.empty<Nat, TestSubmission>();
  let studyMaterials = Map.empty<Nat, StudyMaterial>();
  let bookmarks = Map.empty<Nat, Bookmark>();
  let dailyQuestions = Map.empty<Nat, DailyQuestion>();
  let leaderboard = Map.empty<Nat, LeaderboardEntry>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Helper functions
  func getQuestionIfExists(id : Nat) : Question {
    switch (questions.get(id)) {
      case (null) { Runtime.trap("Question does not exist") };
      case (?question) { question };
    };
  };

  func getTestIfExists(id : Nat) : Test {
    switch (tests.get(id)) {
      case (null) { Runtime.trap("Test does not exist") };
      case (?test) { test };
    };
  };

  // CRUD operations for questions (Admins only for create, users for read)
  public shared ({ caller }) func addQuestion(question : QuestionCreation) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add questions");
    };
    let id = getNextPersistentId();
    let newQuestion : Question = {
      question with id;
    };
    questions.add(id, newQuestion);
    id;
  };

  public query ({ caller }) func getQuestion(id : Nat) : async Question {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view questions");
    };
    getQuestionIfExists(id);
  };

  public query ({ caller }) func getAllQuestions() : async [Question] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view questions");
    };
    questions.values().toArray();
  };

  // CRUD operations for tests (Admins only for create, users for read)
  public shared ({ caller }) func createTest(test : Test) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create tests");
    };
    let id = getNextPersistentId();
    let newTest : Test = {
      test with id;
    };
    tests.add(id, newTest);
    id;
  };

  public query ({ caller }) func getTest(id : Nat) : async Test {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tests");
    };
    getTestIfExists(id);
  };

  public query ({ caller }) func getAllTests() : async [Test] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tests");
    };
    tests.values().toArray();
  };

  // Test submission (Students only)
  public shared ({ caller }) func submitTest(testId : Nat, answers : [Nat]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit tests");
    };
    let test = getTestIfExists(testId);
    var score = 0;

    for (i in Nat.range(0, answers.size())) {
      if (answers[i] < test.questionIds.size()) {
        let questionId = test.questionIds[answers[i]];
        switch (questions.get(questionId)) {
          case (null) {};
          case (?question) {
            if (question.correctAnswer == answers[i]) {
              score += 1;
            };
          };
        };
      };
    };

    let id = getNextPersistentId();
    let submission : TestSubmission = {
      id;
      userId = caller;
      testId;
      answers;
      score;
      totalQuestions = test.questionIds.size();
      submittedAt = Time.now();
    };

    testSubmissions.add(id, submission);
    id;
  };

  // Study materials (Admin creates, users read)
  public shared ({ caller }) func addStudyMaterial(material : StudyMaterial) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add study materials");
    };
    let id = getNextPersistentId();
    studyMaterials.add(id, material);
    id;
  };

  public query ({ caller }) func getStudyMaterial(id : Nat) : async StudyMaterial {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view study materials");
    };
    switch (studyMaterials.get(id)) {
      case (null) { Runtime.trap("Study material does not exist") };
      case (?material) { material };
    };
  };

  public query ({ caller }) func getAllStudyMaterials() : async [StudyMaterial] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view study materials");
    };
    studyMaterials.values().toArray();
  };

  // Daily questions (Admins set, users read)
  public shared ({ caller }) func setDailyQuestion(questionId : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set daily questions");
    };
    let id = getNextPersistentId();
    let dailyQuestion : DailyQuestion = {
      id;
      date = Time.now();
      questionId;
    };
    dailyQuestions.add(id, dailyQuestion);
    id;
  };

  public query ({ caller }) func getTodayDailyQuestion() : async ?DailyQuestion {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view daily questions");
    };
    let oneDayNanos = 24 * 60 * 60 * 1_000_000_000;
    let now = Time.now();

    let todayQuestions : [(Nat, DailyQuestion)] = dailyQuestions.toArray().filter(
      func((_, dq)) {
        let diff = now - dq.date;
        let diffAbs = if (diff < 0) { -diff } else { diff };
        diffAbs < oneDayNanos;
      }
    );

    if (todayQuestions.size() > 0) {
      ?todayQuestions[0].1;
    } else {
      null;
    };
  };

  // Bookmark questions (Students only)
  public shared ({ caller }) func addBookmark(questionId : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add bookmarks");
    };
    let id = getNextPersistentId();
    let bookmark : Bookmark = {
      id;
      userId = caller;
      questionId;
    };
    bookmarks.add(id, bookmark);
    id;
  };

  public shared ({ caller }) func removeBookmark(bookmarkId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove bookmarks");
    };
    switch (bookmarks.get(bookmarkId)) {
      case (null) { Runtime.trap("Bookmark does not exist") };
      case (?bookmark) {
        if (bookmark.userId != caller) {
          Runtime.trap("Unauthorized: Only bookmark owner can remove");
        };
        bookmarks.remove(bookmarkId);
      };
    };
  };

  public query ({ caller }) func getBookmarks() : async [Bookmark] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get bookmarks");
    };
    // Filter to return only caller's bookmarks
    bookmarks.values().toArray().filter(
      func(bookmark) {
        bookmark.userId == caller;
      }
    );
  };

  // Leaderboard (Users only)
  public query ({ caller }) func getLeaderboard() : async [LeaderboardEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view leaderboard");
    };
    let entries = leaderboard.values().toArray();
    entries.sort();
  };

  // User profile (Authenticated users only)
  public query ({ caller }) func getCallerUserProfile() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile does not exist") };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getUserProfile(userId : Principal) : async ?UserProfile {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view other user profiles");
    };
    userProfiles.get(userId);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Persistent ID generator for persistent data
  public query ({ caller }) func getUserPersistentId() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate IDs");
    };
    getNextPersistentId();
  };

  // Seed with sample questions, tests, study materials, and leaderboard entries (Admins only)
  public shared ({ caller }) func seedData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can seed data");
    };
    questions.clear();
    tests.clear();
    studyMaterials.clear();
    leaderboard.clear();

    let physicsQuestions = [
      {
        id = getNextPersistentId();
        examType = #jee;
        subject = #physics;
        chapter = "Kinematics";
        year = 2020;
        questionText = "What is the displacement of an object moving with constant velocity?";
        options = ["Distance", "Speed", "Velocity", "Acceleration"];
        correctAnswer = 2;
        solution = "Displacement is a vector quantity representing the change in position.";
        difficulty = 2;
      },
      {
        id = getNextPersistentId();
        examType = #jee;
        subject = #physics;
        chapter = "Thermodynamics";
        year = 2021;
        questionText = "What is the unit of specific heat capacity?";
        options = ["J/kg K", "N/m", "W/s", "K/m"];
        correctAnswer = 0;
        solution = "Specific heat capacity is measured in Joules per kilogram per Kelvin.";
        difficulty = 3;
      },
      {
        id = getNextPersistentId();
        examType = #jee;
        subject = #physics;
        chapter = "Optics";
        year = 2022;
        questionText = "What is the focal length of a convex lens with a power of +2D?";
        options = ["0.5m", "1m", "2m", "5m"];
        correctAnswer = 0;
        solution = "Power (in diopters) is the reciprocal of focal length (in meters).";
        difficulty = 2;
      },
      {
        id = getNextPersistentId();
        examType = #jee;
        subject = #physics;
        chapter = "Electrostatics";
        year = 2023;
        questionText = "What is the charge of an electron?";
        options = ["+1.6 x 10^-19 C", "-1.6 x 10^-19 C", "+1.6 x 10^-19 C^2", "-1.6 x 10^-19 C^2"];
        correctAnswer = 1;
        solution = "Electron has a negative charge of 1.6 x 10^-19 coulombs.";
        difficulty = 3;
      },
    ];

    let chemistryQuestions = [
      {
        id = getNextPersistentId();
        examType = #jee;
        subject = #chemistry;
        chapter = "Chemical Bonding";
        year = 2020;
        questionText = "What is the shape of methane (CH4) molecule?";
        options = ["Linear", "Trigonal planar", "Tetrahedral", "Octahedral"];
        correctAnswer = 2;
        solution = "Methane has a tetrahedral geometry with bond angles of 109.5°.";
        difficulty = 2;
      },
      {
        id = getNextPersistentId();
        examType = #jee;
        subject = #chemistry;
        chapter = "Periodic Table";
        year = 2021;
        questionText = "Which element has the highest electronegativity?";
        options = ["Oxygen", "Nitrogen", "Fluorine", "Chlorine"];
        correctAnswer = 2;
        solution = "Fluorine is the most electronegative element.";
        difficulty = 3;
      },
      {
        id = getNextPersistentId();
        examType = #jee;
        subject = #chemistry;
        chapter = "Acids and Bases";
        year = 2022;
        questionText = "What is the pH of a neutral solution at 25°C?";
        options = ["0", "7", "14", "4"];
        correctAnswer = 1;
        solution = "A neutral solution has a pH of 7.";
        difficulty = 2;
      },
      {
        id = getNextPersistentId();
        examType = #jee;
        subject = #chemistry;
        chapter = "Organic Chemistry";
        year = 2023;
        questionText = "What is the functional group in ethanol?";
        options = ["Aldehyde", "Carboxylic acid", "Alcohol", "Ketone"];
        correctAnswer = 2;
        solution = "Ethanol contains an alcohol (-OH) functional group.";
        difficulty = 3;
      },
    ];

    let mathsQuestions = [
      {
        id = getNextPersistentId();
        examType = #jee;
        subject = #maths;
        chapter = "Calculus";
        year = 2020;
        questionText = "What is the derivative of sin(x)?";
        options = ["cos(x)", "-cos(x)", "-sin(x)", "tan(x)"];
        correctAnswer = 0;
        solution = "The derivative of sin(x) is cos(x).";
        difficulty = 2;
      },
      {
        id = getNextPersistentId();
        examType = #jee;
        subject = #maths;
        chapter = "Algebra";
        year = 2021;
        questionText = "What is the sum of the roots of the equation x^2 - 5x + 6 = 0?";
        options = ["5", "6", "-5", "-6"];
        correctAnswer = 0;
        solution = "Sum of roots is given by -b/a, which is 5.";
        difficulty = 3;
      },
      {
        id = getNextPersistentId();
        examType = #jee;
        subject = #maths;
        chapter = "Geometry";
        year = 2022;
        questionText = "What is the area of a circle with radius r?";
        options = ["2πr", "πr^2", "πr", "2πr^2"];
        correctAnswer = 1;
        solution = "Area of a circle is πr^2.";
        difficulty = 2;
      },
      {
        id = getNextPersistentId();
        examType = #jee;
        subject = #maths;
        chapter = "Trigonometry";
        year = 2023;
        questionText = "What is the value of sin(90°)?";
        options = ["0", "1", "0.5", "2"];
        correctAnswer = 1;
        solution = "sin(90°) equals 1.";
        difficulty = 3;
      },
    ];

    let biologyQuestions = [
      {
        id = getNextPersistentId();
        examType = #neet;
        subject = #biology;
        chapter = "Cell Structure";
        year = 2020;
        questionText = "What is the powerhouse of the cell?";
        options = ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"];
        correctAnswer = 1;
        solution = "Mitochondria generate energy for the cell.";
        difficulty = 2;
      },
      {
        id = getNextPersistentId();
        examType = #neet;
        subject = #biology;
        chapter = "Evolution";
        year = 2021;
        questionText = "Who proposed the theory of natural selection?";
        options = ["Gregor Mendel", "Charles Darwin", "Louis Pasteur", "James Watson"];
        correctAnswer = 1;
        solution = "Charles Darwin proposed the theory of natural selection.";
        difficulty = 3;
      },
      {
        id = getNextPersistentId();
        examType = #neet;
        subject = #biology;
        chapter = "Genetics";
        year = 2022;
        questionText = "What is the basic unit of heredity?";
        options = ["Gene", "Chromosome", "Allele", "Trait"];
        correctAnswer = 0;
        solution = "Gene is the basic unit of heredity.";
        difficulty = 2;
      },
      {
        id = getNextPersistentId();
        examType = #neet;
        subject = #biology;
        chapter = "Human Physiology";
        year = 2023;
        questionText = "What is the function of hemoglobin?";
        options = ["Transporting oxygen", "Digesting food", "Producing hormones", "Storing energy"];
        correctAnswer = 0;
        solution = "Hemoglobin transports oxygen in the blood.";
        difficulty = 3;
      },
    ];

    let allQuestions = physicsQuestions.concat(chemistryQuestions).concat(mathsQuestions).concat(biologyQuestions);

    allQuestions.forEach(
      func(question) {
        questions.add(question.id, question);
      }
    );

    let jeeFullTestPhysics = getNextPersistentId();
    let jeeFullTestChemistry = getNextPersistentId();
    let jeeFullTestMaths = getNextPersistentId();
    let neetFullTestBiology = getNextPersistentId();
    func getQuestionId(question : Question) : Nat { question.id };
    let jeeFullTestPhysicsIds = physicsQuestions.map(getQuestionId);
    let jeeFullTestChemistryIds = chemistryQuestions.map(getQuestionId);
    let jeeFullTestMathsIds = mathsQuestions.map(getQuestionId);
    let neetFullTestBiologyIds = biologyQuestions.map(getQuestionId);

    let testIds = [
      getNextPersistentId(),
      getNextPersistentId(),
      getNextPersistentId(),
      getNextPersistentId(),
    ];
    let testsArray = [
      {
        id = testIds[0];
        title = "JEE Physics Test";
        examType = #jee;
        testType = #chapter;
        subject = ?#physics;
        chapter = ?"Kinematics";
        durationMinutes = 180;
        questionIds = jeeFullTestPhysicsIds;
      },
      {
        id = testIds[1];
        title = "JEE Chemistry Test";
        examType = #jee;
        testType = #chapter;
        subject = ?#chemistry;
        chapter = ?"Chemical Bonding";
        durationMinutes = 180;
        questionIds = jeeFullTestChemistryIds;
      },
      {
        id = testIds[2];
        title = "JEE Maths Test";
        examType = #jee;
        testType = #chapter;
        subject = ?#maths;
        chapter = ?"Calculus";
        durationMinutes = 180;
        questionIds = jeeFullTestMathsIds;
      },
      {
        id = testIds[3];
        title = "NEET Biology Test";
        examType = #neet;
        testType = #chapter;
        subject = ?#biology;
        chapter = ?"Cell Structure";
        durationMinutes = 180;
        questionIds = neetFullTestBiologyIds;
      },
    ];

    testsArray.forEach(
      func(test) {
        tests.add(test.id, test);
      }
    );

    let studyMaterialIds = [
      getNextPersistentId(),
      getNextPersistentId(),
      getNextPersistentId(),
      getNextPersistentId(),
      getNextPersistentId(),
      getNextPersistentId(),
      getNextPersistentId(),
      getNextPersistentId(),
    ];

    let studyMaterialsArray = [
      {
        id = studyMaterialIds[0];
        subject = #physics;
        chapter = "Kinematics";
        title = "Kinematics Notes";
        contentType = #notes;
        content = "Kinematics is the branch of physics that deals with the motion of objects.";
      },
      {
        id = studyMaterialIds[1];
        subject = #physics;
        chapter = "Thermodynamics";
        title = "Thermodynamics Formula Sheet";
        contentType = #formula;
        content = "Q = mcΔT";
      },
      {
        id = studyMaterialIds[2];
        subject = #chemistry;
        chapter = "Chemical Bonding";
        title = "Chemical Bonding Notes";
        contentType = #notes;
        content = "Chemical bonding involves the attraction between atoms to form molecules.";
      },
      {
        id = studyMaterialIds[3];
        subject = #chemistry;
        chapter = "Organic Chemistry";
        title = "Organic Chemistry Formula Sheet";
        contentType = #formula;
        content = "Alkanes: CnH2n+2";
      },
      {
        id = studyMaterialIds[4];
        subject = #maths;
        chapter = "Calculus";
        title = "Calculus Notes";
        contentType = #notes;
        content = "Calculus is the mathematical study of continuous change.";
      },
      {
        id = studyMaterialIds[5];
        subject = #maths;
        chapter = "Trigonometry";
        title = "Trigonometry Formula Sheet";
        contentType = #formula;
        content = "sin^2(x) + cos^2(x) = 1";
      },
      {
        id = studyMaterialIds[6];
        subject = #biology;
        chapter = "Cell Structure";
        title = "Cell Structure Notes";
        contentType = #notes;
        content = "Cells are the basic units of life.";
      },
      {
        id = studyMaterialIds[7];
        subject = #biology;
        chapter = "Genetics";
        title = "Genetics Formula Sheet";
        contentType = #formula;
        content = "Mendel's Laws of Inheritance";
      },
    ];

    studyMaterialsArray.forEach(
      func(material) {
        studyMaterials.add(material.id, material);
      }
    );

    let leaderboardEntriesArray = [
      {
        id = getNextPersistentId();
        userId = caller;
        userName = "User1";
        totalScore = 1000;
        testsCompleted = 10;
        examType = #jee;
      },
      {
        id = getNextPersistentId();
        userId = caller;
        userName = "User2";
        totalScore = 800;
        testsCompleted = 8;
        examType = #neet;
      },
      {
        id = getNextPersistentId();
        userId = caller;
        userName = "User3";
        totalScore = 600;
        testsCompleted = 6;
        examType = #jee;
      },
    ];

    leaderboardEntriesArray.forEach(
      func(entry) {
        leaderboard.add(entry.id, entry);
      }
    );
  };

  // Search questions by subject and chapter (Authenticated users only)
  public query ({ caller }) func searchQuestionsBySubjectAndChapter(subject : Subject, chapter : Text) : async [Question] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search questions");
    };
    questions.values().toArray().filter(
      func(question) {
        question.subject == subject and question.chapter == chapter;
      }
    );
  };

  // Persistent Id generation for persistent data
  public query ({ caller }) func getExamPersistentId() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can generate IDs");
    };
    getNextPersistentId();
  };
};
