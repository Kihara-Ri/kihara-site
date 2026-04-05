export interface BookEntry {
  cover: string;
  title: string;
  author: string;
  translator?: string;
  tags: string[];
  language: string;
  publisher: string;
  isbn?: string;
  rating?: string;
  doubanSubjectId?: string;
  intro: string;
  link: string;
  judgement: string;
  review: string;
  edition?: number;
}
