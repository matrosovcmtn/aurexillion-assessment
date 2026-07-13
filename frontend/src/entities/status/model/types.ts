export type Status = {
  id: number;
  name: string;
  color: string;
  position: number;
  isInitial: boolean;
  active: boolean;
};

export type StatusInput = {
  name: string;
  color: string;
  position: number;
  isInitial: boolean;
  active?: boolean;
};
