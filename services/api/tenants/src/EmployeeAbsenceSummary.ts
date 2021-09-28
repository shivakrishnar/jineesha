export type EmployeeAbsenceSummary = {
  totalAvailableBalance: number;
  categories: EmployeeAbsenceSummaryCategory[];
}

export type EmployeeAbsenceSummaryCategory = {
  category: string;
  currentBalance: number;
  scheduledHours: number;
  pendingApprovalHours: number;
  availableBalance: number;
}