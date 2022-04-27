export type Company = {
    id: number;
    name: string;
    code: string;
    createDate: string;
};

export type Companies = {
    results: Company[];
};
