export interface Presenter {
  id: number;
  name: string;
}

export interface WeeklyPresenter {
  presenter: Presenter;
  week: number;
  date: Date;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Settings {
  presentationDay: DayOfWeek;
}