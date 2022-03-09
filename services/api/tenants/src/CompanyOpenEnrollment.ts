export type CompanyOpenEnrollment = {
    id: string;
    companyId: string;
    name: string;
    startDate: Date;
    endDate: Date;
    introduction?: string;
    currentlyOpen: boolean;
};
