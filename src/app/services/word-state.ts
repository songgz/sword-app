export interface WordState {
  book_id?: string;
  unit_id?: string;
  word_id?: string;
  repeats: number;
  learns: number;
  reviews: number;
  erred?: boolean;
}
