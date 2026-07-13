export type Assignee = {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string | null;
};

export type AssigneeInput = {
  name: string;
  email: string;
  department: string;
  position?: string | null;
};
