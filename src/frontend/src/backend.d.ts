import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface LeaderboardEntry {
    id: bigint;
    userName: string;
    userId: Principal;
    totalScore: bigint;
    examType: ExamType;
    testsCompleted: bigint;
}
export interface QuestionCreation {
    subject: Subject;
    difficulty: bigint;
    correctAnswer: bigint;
    year: bigint;
    questionText: string;
    solution: string;
    chapter: string;
    examType: ExamType;
    options: Array<string>;
}
export interface Bookmark {
    id: bigint;
    userId: Principal;
    questionId: bigint;
}
export interface StudyMaterial {
    id: bigint;
    title: string;
    content: string;
    subject: Subject;
    contentType: ContentType;
    chapter: string;
}
export interface Test {
    id: bigint;
    title: string;
    subject?: Subject;
    testType: TestType;
    durationMinutes: bigint;
    questionIds: Array<bigint>;
    chapter?: string;
    examType: ExamType;
}
export interface Question {
    id: bigint;
    subject: Subject;
    difficulty: bigint;
    correctAnswer: bigint;
    year: bigint;
    questionText: string;
    solution: string;
    chapter: string;
    examType: ExamType;
    options: Array<string>;
}
export interface DailyQuestion {
    id: bigint;
    date: bigint;
    questionId: bigint;
}
export interface UserProfile {
    id: bigint;
    name: string;
}
export enum ContentType {
    notes = "notes",
    formula = "formula"
}
export enum ExamType {
    jee = "jee",
    neet = "neet"
}
export enum Subject {
    maths = "maths",
    biology = "biology",
    chemistry = "chemistry",
    physics = "physics"
}
export enum TestType {
    full = "full",
    chapter = "chapter"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBookmark(questionId: bigint): Promise<bigint>;
    addQuestion(question: QuestionCreation): Promise<bigint>;
    addStudyMaterial(material: StudyMaterial): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createTest(test: Test): Promise<bigint>;
    getAllQuestions(): Promise<Array<Question>>;
    getAllStudyMaterials(): Promise<Array<StudyMaterial>>;
    getAllTests(): Promise<Array<Test>>;
    getBookmarks(): Promise<Array<Bookmark>>;
    getCallerUserProfile(): Promise<UserProfile>;
    getCallerUserRole(): Promise<UserRole>;
    getExamPersistentId(): Promise<bigint>;
    getLeaderboard(): Promise<Array<LeaderboardEntry>>;
    getQuestion(id: bigint): Promise<Question>;
    getStudyMaterial(id: bigint): Promise<StudyMaterial>;
    getTest(id: bigint): Promise<Test>;
    getTodayDailyQuestion(): Promise<DailyQuestion | null>;
    getUserPersistentId(): Promise<bigint>;
    getUserProfile(userId: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeBookmark(bookmarkId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchQuestionsBySubjectAndChapter(subject: Subject, chapter: string): Promise<Array<Question>>;
    seedData(): Promise<void>;
    setDailyQuestion(questionId: bigint): Promise<bigint>;
    submitTest(testId: bigint, answers: Array<bigint>): Promise<bigint>;
}
