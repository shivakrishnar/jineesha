export interface ICompany {
    companyId: number;
    companyName: string;
    evoClientId?: string;
    evoCompanyId?: string;
    evoCompanyCode?: string;
    logoUrl?: string;
}

export type CompanyDetail = {
    clientId: string;
    name: string;
    domain?: string;
    id?: number;
};
