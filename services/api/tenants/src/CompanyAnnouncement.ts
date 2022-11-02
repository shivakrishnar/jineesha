export type CompanyAnnouncement = {
    id: string;
    companyId: string;
    postDate: Date;
    postTitle: string;
    postDetail: string;
    expiresDate: Date;
    isOn: boolean;
    isHighPriority: boolean;
    imageIDs: string;
};
