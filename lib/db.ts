import Dexie, { Table } from "dexie";

export interface Lesson {
  id?: number;
  subject: string;
  title: string;
  content: string;
  summary?: string;
  mastered: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface QuizAttempt {
  id?: number;
  subject: string;
  lessonId?: number;
  questions: { q: string; options: string[]; correct: number }[];
  answers: number[];
  score: number;
  total: number;
  createdAt: number;
}

export interface Flashcard {
  id?: number;
  subject: string;
  front: string;
  back: string;
  ease: number;
  interval: number;
  repetitions: number;
  dueDate: number;
  createdAt: number;
}

export class HubDB extends Dexie {
  lessons!: Table<Lesson>;
  attempts!: Table<QuizAttempt>;
  flashcards!: Table<Flashcard>;

  constructor() {
    super("hub-3ac");
    this.version(1).stores({
      lessons: "++id, subject, mastered, updatedAt",
      attempts: "++id, subject, createdAt",
      flashcards: "++id, subject, dueDate",
    });
  }
}

export const db = new HubDB();
