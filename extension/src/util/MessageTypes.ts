export type Msg =
  | { type: "UNCERTAIN_COUNT"; count: number }
  | { type: "GET_UNCERTAIN" }
  | { type: "FILL_FIELD"; uid: string; fieldType: string }
  | { type: "HIGHLIGHT_FIELD"; uid: string };

export interface UncertainDTO {
  uid: string;
  guess: string;
  confidence: number;
  label: string;
}