export interface ICreateShift {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  isPublish: string;
}

export interface IUpdateShift {
  name?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  weekId? : string;
  isPublish: string;
}